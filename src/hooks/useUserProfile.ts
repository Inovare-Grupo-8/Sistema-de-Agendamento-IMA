import { updateEmailInLocalStorage } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";
import { useProfileImage } from "@/components/useProfileImage";

export interface Endereco {
  rua: string;
  numero: string;
  complemento: string; // Changed from optional to required
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

// Define the return type for the hook
export interface UseUserProfileReturn {
  fetchPerfil: () => Promise<UserProfileOutput>;
  atualizarDadosPessoais: (dados: {
    nome: string;
    sobrenome: string;
    telefone: string;
    email: string;
    dataNascimento?: string;
    genero?: string;
  }) => Promise<{
    nome: string;
    sobrenome: string;
    telefone: string;
    email: string;
    dataNascimento?: string;
    genero?: string;
  }>;
  buscarEndereco: () => Promise<Endereco | null>;
  atualizarEndereco: (endereco: Endereco) => Promise<Endereco>;
  uploadFoto: (foto: File) => Promise<string>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const navigate = useNavigate();
  const { setProfileImage } = useProfileImage(); // Função utilitária para buscar dados de autenticação do localStorage

  interface StoredUserData {
    idUsuario?: number;
    id?: number;
    token?: string;
    tipo?: string;
    nome?: string;
    sobrenome?: string;
    telefone?: string;
    email?: string;
    [key: string]: unknown;
  }

  interface UserAuthData {
    user: StoredUserData;
    token?: string;
    usuarioId: number;
    tipoUsuario?: string;
  }

  const getUserAuthData = (): UserAuthData => {
    console.log("🔍 [useUserProfile] DEBUG: getUserAuthData iniciado");

    const userData = localStorage.getItem("userData");
    const userInfo = localStorage.getItem("userInfo");

    console.log("🔍 [useUserProfile] DEBUG: userData exists:", !!userData);
    console.log("🔍 [useUserProfile] DEBUG: userInfo exists:", !!userInfo);
    console.log(
      "🔍 [useUserProfile] DEBUG: localStorage keys:",
      Object.keys(localStorage)
    );

    let user: StoredUserData = {};
    let token: string | undefined;
    let usuarioId: number | undefined;
    let tipoUsuario: string | undefined;

    // Tentar buscar do userData primeiro
    if (userData) {
      user = JSON.parse(userData) as StoredUserData;
      token = user.token;
      usuarioId = user.idUsuario;
      tipoUsuario = user.tipo;
    }

    // Se não encontrou idUsuario no userData, buscar no userInfo
    if (!usuarioId && userInfo) {
      const info = JSON.parse(userInfo) as StoredUserData;
      usuarioId = info.id;
      tipoUsuario = info.tipo;
    }

    console.log(
      "🔍 [useUserProfile] DEBUG: Resultado final - usuarioId:",
      usuarioId,
      "token exists:",
      !!token
    );
    console.log(
      "🔍 [useUserProfile] DEBUG: Tipo de usuário original:",
      tipoUsuario
    );

    if (!usuarioId) {
      console.error("❌ [useUserProfile] DEBUG: ID do usuário não encontrado!");
      throw new Error("ID do usuário não encontrado");
    }

    // ✅ CORREÇÃO: Manter o tipo original do usuário para evitar conflitos
    console.log(
      "🔍 [useUserProfile] DEBUG: Usando tipo original do localStorage:",
      tipoUsuario
    );

    return { user, token, usuarioId, tipoUsuario };
  };

  // Função para criar dados de perfil offline (quando backend não estiver disponível)
  const createOfflineProfile = (
    userAuthData: UserAuthData
  ): UserProfileOutput => {
    const { user, usuarioId } = userAuthData;

    // Buscar dados salvos localmente
    const savedProfile = localStorage.getItem("savedProfile");
    const localProfile = savedProfile
      ? (JSON.parse(savedProfile) as Partial<UserProfileOutput>)
      : {};

    return {
      idUsuario: usuarioId,
      nome: localProfile.nome || user.nome || "",
      sobrenome: localProfile.sobrenome || user.sobrenome || "",
      telefone: localProfile.telefone || user.telefone || "",
      email: localProfile.email || user.email || "",
      dataNascimento: localProfile.dataNascimento || "",
      genero: localProfile.genero || "",
      fotoUrl: localProfile.fotoUrl || "",
    };
  };

  const fetchPerfil = async (): Promise<UserProfileOutput> => {
    try {
      const authData = getUserAuthData();
      const { token, usuarioId, tipoUsuario } = authData;

      const mapTipoBackend = (): string => {
        const raw = localStorage.getItem("userData");
        const parsed = raw ? JSON.parse(raw) : {};
        const tipo = String(tipoUsuario || parsed.tipo || "").toUpperCase();
        const funcao = String(parsed.funcao || "").toUpperCase();
        if (tipo === "USUARIO") return "assistido";
        if (tipo === "ADMINISTRADOR") return "administrador";
        if (tipo === "VOLUNTARIO") {
          return funcao === "ASSISTENCIA_SOCIAL"
            ? "assistente-social"
            : "voluntario";
        }
        return "assistido";
      };
      const tipoPath = mapTipoBackend();

      // Tentar buscar do backend
      const endpoint =
        tipoPath === "assistente-social"
          ? `${
              import.meta.env.VITE_URL_BACKEND
            }/perfil/assistente-social?usuarioId=${usuarioId}`
          : `${
              import.meta.env.VITE_URL_BACKEND
            }/perfil/${tipoPath}/dados-pessoais?usuarioId=${usuarioId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (!response.ok) {
        // Se for erro de autenticação, só redirecionar se estivermos em página protegida
        if (response.status === 401) {
          const currentPath = window.location.pathname;
          const publicRoutes = [
            "/login",
            "/cadastro",
            "/completar-cadastro-usuario",
            "/completar-cadastro-voluntario",
          ];

          if (!publicRoutes.some((route) => currentPath.startsWith(route))) {
            localStorage.removeItem("userData");
            navigate("/login");
          } else {
            console.log(
              "✅ [useUserProfile] DEBUG: Rota pública detectada, não redirecionando"
            );
          }
          throw new Error("Token inválido ou expirado");
        }

        // Para outros erros (500, etc), usar dados offline
        console.warn(
          `Erro ${response.status} no backend, usando dados offline`
        );
        return createOfflineProfile(authData);
      }
      console.log(
        "✅ [useUserProfile] DEBUG: Resposta OK, fazendo parse JSON..."
      );
      const data = await response.json();

      // Se houver uma foto, adicionar a URL base
      if (data.fotoUrl) {
        data.fotoUrl = `${import.meta.env.VITE_URL_BACKEND}${data.fotoUrl}`;
        console.log(
          "🖼️ [useUserProfile] DEBUG: URL da foto processada:",
          data.fotoUrl
        );

        // Atualizar contexto de imagem
        setProfileImage(data.fotoUrl);
      }

      // Salvar no localStorage para usar offline
      localStorage.setItem("savedProfile", JSON.stringify(data));

      // Também salvar no profileData para sincronização
      localStorage.setItem("profileData", JSON.stringify(data));

      return data;
    } catch (error) {
      // Se for erro de rede, usar dados offline
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn("Backend indisponível, usando dados offline");
        return createOfflineProfile(getUserAuthData());
      }

      throw error;
    }
  };

  const atualizarDadosPessoais = async (dados: {
    nome: string;
    sobrenome: string;
    telefone: string;
    email: string;
    dataNascimento?: string;
    genero?: string;
  }): Promise<{
    nome: string;
    sobrenome: string;
    telefone: string;
    email: string;
    dataNascimento?: string;
    genero?: string;
  }> => {
    try {
      const { token, usuarioId, tipoUsuario } = getUserAuthData();

      // Sempre salvar localmente primeiro
      const currentProfile = localStorage.getItem("savedProfile");
      const profile = currentProfile ? JSON.parse(currentProfile) : {};
      const {
        dataNascimento: _dn,
        nome: _n,
        sobrenome: _sn,
        ...permitidos
      } = dados;
      const updatedProfile = { ...profile, ...permitidos };
      localStorage.setItem("savedProfile", JSON.stringify(updatedProfile));

      // Tentar enviar para o backend
      try {
        const raw = localStorage.getItem("userData");
        const parsed = raw ? JSON.parse(raw) : {};
        const tipo = String(tipoUsuario || parsed.tipo || "").toUpperCase();
        const funcao = String(parsed.funcao || "").toUpperCase();
        const tipoPath =
          tipo === "USUARIO"
            ? "assistido"
            : tipo === "ADMINISTRADOR"
            ? "administrador"
            : tipo === "VOLUNTARIO"
            ? funcao === "ASSISTENCIA_SOCIAL"
              ? "assistente-social"
              : "voluntario"
            : "assistido";
        const endpoint = `${
          import.meta.env.VITE_URL_BACKEND
        }/perfil/${tipoPath}/dados-pessoais?usuarioId=${usuarioId}`;

        const response = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify(permitidos),
        });

        if (response.ok) {
          const result = await response.json();

          // Atualizar localStorage se o email foi alterado
          if (result.email) {
            updateEmailInLocalStorage(result.email);
          }

          // Salvar resultado do backend
          localStorage.setItem(
            "savedProfile",
            JSON.stringify({ ...updatedProfile, ...result })
          );

          return {
            nome: profile.nome,
            sobrenome: profile.sobrenome,
            telefone: result.telefone || permitidos.telefone,
            email: result.email || permitidos.email,
            dataNascimento: profile.dataNascimento,
            genero: result.genero || permitidos.genero,
          };
        } else {
          console.warn("Erro no backend, dados salvos localmente");
        }
      } catch (networkError) {
        console.warn("Backend indisponível, dados salvos localmente");
      }

      // Se chegou aqui, usar dados locais
      if (permitidos.email) {
        updateEmailInLocalStorage(permitidos.email);
      }
      
      return {
        nome: profile.nome,
        sobrenome: profile.sobrenome,
        telefone: permitidos.telefone,
        email: permitidos.email,
        dataNascimento: profile.dataNascimento,
        genero: permitidos.genero,
      };
    } catch (error) {
      console.error("Erro ao atualizar dados pessoais:", error);
      throw error;
    }
  };
  const buscarEndereco = async (): Promise<Endereco | null> => {
    try {
      console.log("🔄 [useUserProfile] DEBUG: buscarEndereco iniciado");
      const { token, usuarioId, tipoUsuario } = getUserAuthData();
      console.log(
        "🔍 [useUserProfile] DEBUG: buscarEndereco - tipoUsuario:",
        tipoUsuario
      );
      const url = `${
        import.meta.env.VITE_URL_BACKEND
      }/perfil/assistido/endereco?usuarioId=${usuarioId}`;
      console.log(
        "🔍 [useUserProfile] DEBUG: buscarEndereco URL completa:",
        url
      );

      console.log(
        "🌐 [useUserProfile] DEBUG: Fazendo requisição para buscar endereço..."
      );
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
      });

      console.log(
        "📡 [useUserProfile] DEBUG: buscarEndereco - status:",
        response.status
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log(
            "ℹ️ [useUserProfile] DEBUG: Endereço não encontrado (404)"
          );
          return null; // Endereço não encontrado
        }

        // Buscar endereço salvo localmente
        const savedProfile = localStorage.getItem("savedProfile");
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          return profile.endereco || null;
        }

        return null;
      }

      const enderecoOutput = await response.json();
      console.log(
        "✅ [useUserProfile] DEBUG: Endereço recebido:",
        enderecoOutput
      );
      // Converter EnderecoOutput para Endereco
      const endereco = {
        rua: enderecoOutput.logradouro || "",
        numero: enderecoOutput.numero || "",
        complemento: enderecoOutput.complemento || "",
        bairro: enderecoOutput.bairro || "",
        cidade: enderecoOutput.localidade || "", // ✅ CORREÇÃO: usar localidade do backend
        estado: enderecoOutput.uf || "",
        cep: enderecoOutput.cep || "",
      };

      // Salvar localmente
      const savedProfile = localStorage.getItem("savedProfile");
      const profile = savedProfile ? JSON.parse(savedProfile) : {};
      profile.endereco = endereco;
      localStorage.setItem("savedProfile", JSON.stringify(profile));

      return endereco;
    } catch (error) {
      console.warn("Erro ao buscar endereço do backend, usando dados locais");

      // Buscar endereço salvo localmente
      const savedProfile = localStorage.getItem("savedProfile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        return profile.endereco || null;
      }

      return null;
    }
  };
  const atualizarEndereco = async (endereco: Endereco): Promise<Endereco> => {
    try {
      console.log("🔄 [useUserProfile] DEBUG: atualizarEndereco iniciado");
      console.log("🔍 [useUserProfile] DEBUG: Dados recebidos:", endereco);

      const { token, usuarioId, tipoUsuario } = getUserAuthData();
      console.log("🔍 [useUserProfile] DEBUG: Auth data:", {
        usuarioId,
        tipoUsuario,
        hasToken: !!token,
      });

      // ✅ CORREÇÃO: Validar dados obrigatórios
      if (!endereco.cep?.trim() || !endereco.numero?.trim()) {
        throw new Error("CEP e número são obrigatórios para salvar o endereço");
      }

      // ✅ CORREÇÃO: Preparar dados exatamente como o backend espera
      const enderecoInput = {
        cep: endereco.cep.replace(/\D/g, ""), // Remove formatação: 03026-000 → 03026000
        numero: endereco.numero.toString().trim(),
        complemento: endereco.complemento?.trim() || "",
      };

      console.log(
        "🔍 [useUserProfile] DEBUG: Dados formatados:",
        enderecoInput
      );

      // ✅ CORREÇÃO: URL sempre para assistido
      const url = `${
        import.meta.env.VITE_URL_BACKEND
      }/perfil/assistido/endereco?usuarioId=${usuarioId}`;
      console.log("🌐 [useUserProfile] DEBUG: URL da requisição:", url);

      // ✅ CORREÇÃO: Headers completos
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log("🚀 [useUserProfile] DEBUG: Enviando requisição PUT...");

      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(enderecoInput),
      });

      console.log(
        "📡 [useUserProfile] DEBUG: Status da resposta:",
        response.status
      );
      console.log(
        "📡 [useUserProfile] DEBUG: Status text:",
        response.statusText
      );

      // ✅ CORREÇÃO: Verificar resposta correta (204 No Content é sucesso)
      if (response.status === 204) {
        console.log(
          "✅ [useUserProfile] DEBUG: Endereço atualizado com sucesso (204 No Content)"
        );
      } else if (response.ok) {
        console.log(
          "✅ [useUserProfile] DEBUG: Endereço atualizado com sucesso"
        );
      } else {
        let errorText = "";
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = "Erro desconhecido";
        }

        console.error(
          "❌ [useUserProfile] ERROR: Erro na resposta do backend:",
          {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          }
        );

        throw new Error(
          `Erro ${response.status}: ${errorText || response.statusText}`
        );
      } // ✅ SALVAR localmente APENAS após confirmação do backend
      const savedProfile = localStorage.getItem("savedProfile");
      const profile = savedProfile ? JSON.parse(savedProfile) : {};

      // Manter dados completos do endereço
      const enderecoCompleto = {
        ...profile.endereco,
        cep: endereco.cep,
        numero: endereco.numero,
        complemento: endereco.complemento || "",
        rua: endereco.rua || "",
        bairro: endereco.bairro || "",
        cidade: endereco.cidade || "",
        estado: endereco.estado || "",
      };

      profile.endereco = enderecoCompleto;
      localStorage.setItem("savedProfile", JSON.stringify(profile));

      console.log(
        "💾 [useUserProfile] DEBUG: Endereço salvo localmente após sucesso no backend"
      );

      return enderecoCompleto;
    } catch (error) {
      console.error(
        "❌ [useUserProfile] ERROR: Erro ao atualizar endereço:",
        error
      );

      // ✅ IMPORTANTE: NÃO salvar localmente se houve erro no backend
      // Isso evita que o frontend mostre sucesso quando o backend falhou
      throw error;
    }
  };
  const uploadFoto = async (foto: File): Promise<string> => {
    try {
      console.log("🔄 [uploadFoto] DEBUG: Iniciando upload de foto...");
      const { token, usuarioId, tipoUsuario } = getUserAuthData();

      console.log("🔍 [uploadFoto] DEBUG: Dados de auth:", {
        usuarioId,
        tipoUsuario,
        hasToken: !!token,
        tokenLength: token?.length || 0,
      });

      // Verificar se a foto não é muito grande (máximo 1MB, conforme backend)
      const maxSize = 1 * 1024 * 1024;
      if (foto.size > maxSize) {
        throw new Error("A foto é muito grande. Tamanho máximo permitido: 1MB");
      }

      console.log("🔍 [uploadFoto] DEBUG: Arquivo:", {
        name: foto.name,
        size: foto.size,
        type: foto.type,
      });

      const formData = new FormData();
      formData.append("file", foto);

      // Mapear tipo de usuário para o formato esperado pelo backend
      let tipoBackend = "assistido";
      if (tipoUsuario === "USUARIO") {
        tipoBackend = "assistido";
      } else if (tipoUsuario === "VOLUNTARIO") {
        try {
          const raw = localStorage.getItem("userData");
          const parsed = raw ? JSON.parse(raw) : {};
          const funcao = parsed?.funcao;
          tipoBackend =
            funcao === "ASSISTENCIA_SOCIAL"
              ? "assistente-social"
              : "voluntario";
        } catch {
          tipoBackend = "voluntario";
        }
      } else if (tipoUsuario === "ADMINISTRADOR") {
        tipoBackend = "administrador";
      }

      console.log("🔍 [uploadFoto] DEBUG: Tipo mapeado:", {
        original: tipoUsuario,
        mapeado: tipoBackend,
      });

      // Usar apenas o endpoint correto para o tipo de usuário
      const endpoint = `${
        import.meta.env.VITE_URL_BACKEND
      }/perfil/${tipoBackend}/foto?usuarioId=${usuarioId}`;
      console.log(`🌐 [uploadFoto] DEBUG: Endpoint de upload: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          // NÃO incluir Content-Type para FormData - o browser define automaticamente
        },
        body: formData,
      });

      console.log(
        "📡 [uploadFoto] DEBUG: Status da resposta:",
        response.status
      );
      console.log(
        "📡 [uploadFoto] DEBUG: Headers da resposta:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [uploadFoto] DEBUG: Upload bem-sucedido:", result);

        // Construir URL da foto
        let photoUrl;
        if (result.url) {
          photoUrl = result.url.startsWith("http")
            ? result.url
            : `${import.meta.env.VITE_URL_BACKEND}${result.url}`;
        } else if (result.fotoUrl) {
          photoUrl = result.fotoUrl.startsWith("http")
            ? result.fotoUrl
            : `${import.meta.env.VITE_URL_BACKEND}${result.fotoUrl}`;
        } else {
          throw new Error("Resposta do upload não retornou URL da foto");
        }

        // Salvar localmente
        const savedProfile = localStorage.getItem("savedProfile");
        const profile = savedProfile ? JSON.parse(savedProfile) : {};
        profile.fotoUrl = photoUrl;
        localStorage.setItem("savedProfile", JSON.stringify(profile));

        // Também salvar no profileData para sincronização
        const profileData = localStorage.getItem("profileData");
        const profileObj = profileData ? JSON.parse(profileData) : {};
        profileObj.fotoUrl = photoUrl;
        localStorage.setItem("profileData", JSON.stringify(profileObj));

        console.log("💾 [uploadFoto] DEBUG: Foto salva localmente:", photoUrl);

        // 🔄 CORREÇÃO: Atualizar o contexto de imagem para sincronizar com a sidebar
        setProfileImage(photoUrl);
        console.log(
          "🔄 [uploadFoto] DEBUG: Contexto de imagem atualizado:",
          photoUrl
        );

        return photoUrl;
      } else {
        const errorText = await response.text();
        console.warn(
          `⚠️ [uploadFoto] DEBUG: Falha no endpoint ${endpoint}:`,
          response.status,
          errorText
        );
        throw new Error(
          `Erro ${response.status}: ${errorText || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
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
