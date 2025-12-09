import { useNavigate } from "react-router-dom";
import { useProfileImage } from "@/components/useProfileImage";
import {
  buildBackendUrl,
  resolvePerfilPath,
  resolvePerfilSegment,
} from "@/lib/utils";
import { updateEmailInLocalStorage } from "../utils/localStorage";

export interface Endereco {
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface UserProfileInput {
  nome: string;
  sobrenome: string;
  telefone: string;
  email: string;
  dataNascimento?: string;
  genero?: string;
  endereco?: Endereco;
}

export interface UserProfileOutput {
  idUsuario: number;
  nome: string;
  sobrenome: string;
  telefone: string;
  email: string;
  dataNascimento?: string;
  genero?: string;
  fotoUrl?: string;
  endereco?: Endereco;
}

export interface UseUserProfileReturn {
  fetchPerfil: () => Promise<UserProfileOutput>;
  atualizarDadosPessoais: (
    dados: UserProfileInput
  ) => Promise<UserProfileInput>;
  buscarEndereco: () => Promise<Endereco | null>;
  atualizarEndereco: (endereco: Endereco) => Promise<Endereco>;
  uploadFoto: (foto: File) => Promise<string>;
}

interface StoredUserData {
  idUsuario?: number;
  id?: number;
  token?: string;
  tipo?: string;
  nome?: string;
  sobrenome?: string;
  telefone?: string;
  email?: string;
  funcao?: string;
  [key: string]: unknown;
}

interface UserAuthData {
  user: StoredUserData;
  token?: string;
  usuarioId: number;
  tipoUsuario?: string;
  funcao?: string;
}

const STORAGE_KEYS = {
  savedProfile: "savedProfile",
  profileData: "profileData",
};

const readJson = <T>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`⚠️ [useUserProfile] Falha ao parsear ${key}:`, error);
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`⚠️ [useUserProfile] Falha ao salvar ${key}:`, error);
  }
};

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return String(value);
  }
  return undefined;
};

const normalizeEndereco = (value: unknown): Endereco | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;

  const rua =
    toOptionalString(source.rua) ??
    toOptionalString(source.logradouro) ??
    "";
  const numero =
    toOptionalString(source.numero) ??
    toOptionalString(source.num) ??
    "";
  const complemento = toOptionalString(source.complemento) ?? "";
  const bairro = toOptionalString(source.bairro) ?? "";
  const cidade =
    toOptionalString(source.cidade) ??
    toOptionalString(source.localidade) ??
    "";
  const estado =
    toOptionalString(source.estado) ??
    toOptionalString(source.uf) ??
    "";
  const cep = toOptionalString(source.cep) ?? "";

  if (
    !rua &&
    !numero &&
    !complemento &&
    !bairro &&
    !cidade &&
    !estado &&
    !cep
  ) {
    return undefined;
  }

  return {
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
  };
};

const createOfflineProfile = (
  authData: UserAuthData
): UserProfileOutput => {
  const saved =
    readJson<Partial<UserProfileOutput>>(STORAGE_KEYS.savedProfile) ?? {};
  const { user, usuarioId } = authData;

  return {
    idUsuario: usuarioId,
    nome: saved.nome ?? user.nome ?? "",
    sobrenome: saved.sobrenome ?? user.sobrenome ?? "",
    telefone: saved.telefone ?? user.telefone ?? "",
    email: saved.email ?? user.email ?? "",
    dataNascimento: saved.dataNascimento,
    genero: saved.genero,
    fotoUrl: saved.fotoUrl,
    endereco: saved.endereco,
  };
};

export const useUserProfile = (): UseUserProfileReturn => {
  const navigate = useNavigate();
  const { setProfileImage } = useProfileImage();

  const getUserAuthData = (): UserAuthData => {
    const userDataRaw = localStorage.getItem("userData");
    const userInfoRaw = localStorage.getItem("userInfo");

    let user: StoredUserData = {};
    let token: string | undefined;
    let usuarioId: number | undefined;
    let tipoUsuario: string | undefined;
    let funcao: string | undefined;

    if (userDataRaw) {
      const parsed = JSON.parse(userDataRaw) as StoredUserData;
      user = parsed;
      token = parsed.token;
      usuarioId = parsed.idUsuario ?? parsed.id;
      tipoUsuario = parsed.tipo;
      funcao = toOptionalString(parsed.funcao);
    }

    if ((!usuarioId || !tipoUsuario) && userInfoRaw) {
      const info = JSON.parse(userInfoRaw) as StoredUserData;
      usuarioId = usuarioId ?? info.idUsuario ?? info.id;
      tipoUsuario = tipoUsuario ?? info.tipo;
      funcao = funcao ?? toOptionalString(info.funcao);
      user = { ...info, ...user };
    }

    if (!usuarioId) {
      throw new Error("ID do usuário não encontrado");
    }

    return { user, token, usuarioId, tipoUsuario, funcao };
  };

  const fetchPerfil = async (): Promise<UserProfileOutput> => {
    const authData = getUserAuthData();
    const { token, usuarioId, tipoUsuario, funcao } = authData;

    const endpoint = buildBackendUrl(
      `${resolvePerfilPath(tipoUsuario, funcao)}?usuarioId=${usuarioId}`
    );

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const publicRoutes = [
            "/login",
            "/cadastro",
            "/completar-cadastro-usuario",
            "/completar-cadastro-voluntario",
          ];
          const currentPath = window.location.pathname;
          if (!publicRoutes.some((route) => currentPath.startsWith(route))) {
            localStorage.removeItem("userData");
            navigate("/login");
          }
          throw new Error("Token inválido ou expirado");
        }

        console.warn(
          `[useUserProfile] Erro ${response.status} ao buscar perfil, usando dados offline`
        );
        return createOfflineProfile(authData);
      }

      const data = (await response.json()) as Record<string, unknown>;

      const rawPhotoUrl =
        toOptionalString(data.fotoUrl) ??
        toOptionalString(data.urlFoto) ??
        toOptionalString(data.url);

      if (rawPhotoUrl) {
        data.fotoUrl = rawPhotoUrl;
        setProfileImage(rawPhotoUrl);
      }

      const normalizedEndereco = normalizeEndereco(data.endereco);

      const normalized: UserProfileOutput = {
        idUsuario:
          typeof data.idUsuario === "number"
            ? data.idUsuario
            : authData.usuarioId,
        nome: toOptionalString(data.nome) ?? authData.user.nome ?? "",
        sobrenome:
          toOptionalString(data.sobrenome) ?? authData.user.sobrenome ?? "",
        telefone:
          toOptionalString(data.telefone) ?? authData.user.telefone ?? "",
        email: toOptionalString(data.email) ?? authData.user.email ?? "",
        dataNascimento: toOptionalString(data.dataNascimento),
        genero: toOptionalString(data.genero),
        fotoUrl: rawPhotoUrl ?? undefined,
        endereco: normalizedEndereco ?? undefined,
      };

      writeJson(STORAGE_KEYS.savedProfile, normalized);
      writeJson(STORAGE_KEYS.profileData, {
        ...normalized,
        profileImage: normalized.fotoUrl,
      });

      return normalized;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn("[useUserProfile] Backend indisponível, usando offline");
        return createOfflineProfile(authData);
      }
      throw error;
    }
  };

  const atualizarDadosPessoais = async (
    dados: UserProfileInput
  ): Promise<UserProfileInput> => {
    const authData = getUserAuthData();
    const { token, usuarioId, tipoUsuario, funcao } = authData;

    const saved =
      readJson<Partial<UserProfileOutput>>(STORAGE_KEYS.savedProfile) ?? {};
    const localChanges = { ...saved, ...dados };
    writeJson(STORAGE_KEYS.savedProfile, localChanges);

    try {
      const endpoint = buildBackendUrl(
        `${resolvePerfilPath(tipoUsuario, funcao)}?usuarioId=${usuarioId}`
      );

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        console.warn(
          `[useUserProfile] Erro ${response.status} ao atualizar dados, mantendo alterações locais`
        );
      } else {
        const result = (await response.json()) as Record<string, unknown>;

        const resolved: UserProfileInput = {
          nome: toOptionalString(result.nome) ?? dados.nome,
          sobrenome: toOptionalString(result.sobrenome) ?? dados.sobrenome,
          telefone: toOptionalString(result.telefone) ?? dados.telefone,
          email: toOptionalString(result.email) ?? dados.email,
          dataNascimento:
            toOptionalString(result.dataNascimento) ?? dados.dataNascimento,
          genero: toOptionalString(result.genero) ?? dados.genero,
        };

        writeJson(STORAGE_KEYS.savedProfile, {
          ...localChanges,
          ...resolved,
        });
        writeJson(STORAGE_KEYS.profileData, {
          ...readJson<Record<string, unknown>>(STORAGE_KEYS.profileData),
          ...resolved,
        });

        if (resolved.email) {
          updateEmailInLocalStorage(resolved.email);
        }

        return resolved;
      }
    } catch (error) {
      console.warn(
        "[useUserProfile] Erro ao enviar dados pessoais, mantendo offline",
        error
      );
    }

    if (dados.email) {
      updateEmailInLocalStorage(dados.email);
    }

    return {
      nome: localChanges.nome ?? dados.nome,
      sobrenome: localChanges.sobrenome ?? dados.sobrenome,
      telefone: localChanges.telefone ?? dados.telefone,
      email: localChanges.email ?? dados.email,
      dataNascimento:
        toOptionalString(localChanges.dataNascimento) ?? dados.dataNascimento,
      genero: toOptionalString(localChanges.genero) ?? dados.genero,
    };
  };

  const buscarEndereco = async (): Promise<Endereco | null> => {
    const authData = getUserAuthData();
    const { token, usuarioId, tipoUsuario, funcao } = authData;

    const endpoint = buildBackendUrl(
      `${resolvePerfilPath(tipoUsuario, funcao, "endereco")}?usuarioId=${usuarioId}`
    );

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        console.warn(
          `[useUserProfile] Erro ${response.status} ao buscar endereço, usando cache`
        );
        const saved = readJson<Partial<UserProfileOutput>>(
          STORAGE_KEYS.savedProfile
        );
        return saved?.endereco ?? null;
      }

      const data = await response.json();
      const endereco = normalizeEndereco(data) ?? null;

      const saved =
        readJson<Partial<UserProfileOutput>>(STORAGE_KEYS.savedProfile) ?? {};
      writeJson(STORAGE_KEYS.savedProfile, {
        ...saved,
        endereco: endereco ?? undefined,
      });

      return endereco;
    } catch (error) {
      console.warn("[useUserProfile] Falha ao buscar endereço, usando cache");
      const saved = readJson<Partial<UserProfileOutput>>(STORAGE_KEYS.savedProfile);
      return saved?.endereco ?? null;
    }
  };

  const atualizarEndereco = async (
    endereco: Endereco
  ): Promise<Endereco> => {
    if (!endereco.cep?.trim() || !endereco.numero?.trim()) {
      throw new Error("CEP e número são obrigatórios para salvar o endereço");
    }

    const authData = getUserAuthData();
    const { token, usuarioId, tipoUsuario, funcao } = authData;

    const endpoint = buildBackendUrl(
      `${resolvePerfilPath(tipoUsuario, funcao, "endereco")}?usuarioId=${usuarioId}`
    );

    const payload = {
      cep: endereco.cep.replace(/\D/g, ""),
      numero: endereco.numero.toString().trim(),
      complemento: endereco.complemento?.trim() ?? "",
    };

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(
          `Erro ${response.status}: ${errorText || response.statusText}`
        );
      }

      const saved =
        readJson<Partial<UserProfileOutput>>(STORAGE_KEYS.savedProfile) ?? {};
      writeJson(STORAGE_KEYS.savedProfile, {
        ...saved,
        endereco,
      });

      return endereco;
    } catch (error) {
      console.error("[useUserProfile] Erro ao atualizar endereço", error);
      throw error;
    }
  };

  const uploadFoto = async (foto: File): Promise<string> => {
    const authData = getUserAuthData();
    const { token, usuarioId, tipoUsuario, funcao } = authData;

    const maxSize = 5 * 1024 * 1024;
    if (foto.size > maxSize) {
      throw new Error("A foto é muito grande. Tamanho máximo permitido: 5MB");
    }

    const endpoint = buildBackendUrl(
      `${resolvePerfilPath(tipoUsuario, funcao, "foto")}?usuarioId=${usuarioId}`
    );

    const formData = new FormData();
    formData.append("file", foto);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro ${response.status}: ${errorText || response.statusText}`
        );
      }

      const result = (await response.json()) as Record<string, unknown>;

      const rawPhotoPath =
        toOptionalString(result.url) ??
        toOptionalString(result.fotoUrl) ??
        toOptionalString(result.urlFoto) ??
        toOptionalString(result?.data as Record<string, unknown>) ??
        undefined;

      const fallback = `/uploads/${resolvePerfilSegment(
        tipoUsuario,
        funcao
      )}_user_${usuarioId}.jpg`;

      const storedPath = rawPhotoPath ?? fallback;

      const saved =
        readJson<Partial<UserProfileOutput>>(STORAGE_KEYS.savedProfile) ?? {};
      writeJson(STORAGE_KEYS.savedProfile, {
        ...saved,
        fotoUrl: storedPath,
      });
      writeJson(STORAGE_KEYS.profileData, {
        ...readJson<Record<string, unknown>>(STORAGE_KEYS.profileData),
        fotoUrl: storedPath,
        profileImage: storedPath,
      });

      setProfileImage(storedPath);

      return storedPath;
    } catch (error) {
      console.error("[useUserProfile] Erro ao fazer upload da foto", error);
      throw error;
    }
  };

  return {
    fetchPerfil,
    atualizarDadosPessoais,
    buscarEndereco,
    atualizarEndereco,
    uploadFoto,
  };
};
