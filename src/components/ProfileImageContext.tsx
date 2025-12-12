import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  buildBackendUrl,
  getBackendBaseUrl,
  resolvePerfilPath,
} from "@/lib/utils";

interface ProfileImageContextType {
  profileImage: string;
  setProfileImage: (rawUrl: string) => void;
  refreshImageFromStorage: () => void;
}

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(
  undefined
);

const getAuthToken = (): string | undefined => {
  const userData = localStorage.getItem("userData");
  if (!userData) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(userData);
    return parsed.token as string | undefined;
  } catch (error) {
    console.warn("⚠️ [ProfileImageContext] Erro ao parsear userData:", error);
    return undefined;
  }
};

const extractSavedPhoto = (): string => {
  const savedProfile = localStorage.getItem("savedProfile");
  if (savedProfile) {
    try {
      const profile = JSON.parse(savedProfile);
      if (profile?.fotoUrl) {
        return profile.fotoUrl as string;
      }
    } catch (error) {
      console.warn(
        "⚠️ [ProfileImageContext] Erro ao parsear savedProfile:",
        error
      );
    }
  }

  const savedData = localStorage.getItem("profileData");
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed?.fotoUrl) {
        return parsed.fotoUrl as string;
      }
      if (parsed?.profileImage) {
        return parsed.profileImage as string;
      }
    } catch (error) {
      console.warn(
        "⚠️ [ProfileImageContext] Erro ao parsear profileData:",
        error
      );
    }
  }

  return "";
};

const isEphemeralSource = (rawUrl: string): boolean =>
  rawUrl.startsWith("data:") || rawUrl.startsWith("blob:");

const syncLocalPhoto = (rawUrl: string) => {
  try {
    const savedProfile = localStorage.getItem("savedProfile");
    const profile = savedProfile ? JSON.parse(savedProfile) : {};
    if (rawUrl) {
      profile.fotoUrl = rawUrl;
    } else {
      delete profile.fotoUrl;
    }
    localStorage.setItem("savedProfile", JSON.stringify(profile));

    const profileData = localStorage.getItem("profileData");
    const data = profileData ? JSON.parse(profileData) : {};
    if (rawUrl) {
      data.fotoUrl = rawUrl;
      data.profileImage = rawUrl;
    } else {
      delete data.fotoUrl;
      delete data.profileImage;
    }
    localStorage.setItem("profileData", JSON.stringify(data));

    console.log(
      "📸 [ProfileImageContext] Foto sincronizada no localStorage:",
      rawUrl
    );
  } catch (error) {
    console.warn("⚠️ [ProfileImageContext] Erro ao sincronizar foto:", error);
  }
};

export const ProfileImageProvider = ({ children }: { children: ReactNode }) => {
  const [profileImage, setProfileImageState] = useState<string>("");

  const lastRawUrlRef = useRef<string>("");
  const currentObjectUrlRef = useRef<string | null>(null);
  const mountedRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);

  const revokeObjectUrl = useCallback(() => {
    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
      currentObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    initializedRef.current = true;
    return () => {
      mountedRef.current = false;
      revokeObjectUrl();
    };
  }, [revokeObjectUrl]);

  const applyImageSource = useCallback((source: string) => {
    if (!mountedRef.current) {
      return;
    }
    setProfileImageState(source);
  }, []);

  const fetchProtectedImage = useCallback(
    async (rawUrl: string): Promise<string> => {
      const token = getAuthToken();
      const primaryUrl = buildBackendUrl(rawUrl);

      const normalizedPath = (() => {
        if (!rawUrl || /^https?:/i.test(rawUrl)) {
          return null;
        }
        return rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
      })();

      const baseUrl = getBackendBaseUrl();
      const baseWithoutApi = baseUrl.replace(/\/api\/?$/, "");

      const candidateUrls = new Set<string>([primaryUrl]);

      if (normalizedPath && baseWithoutApi !== baseUrl) {
        candidateUrls.add(`${baseWithoutApi}${normalizedPath}`);
      }

      const errors: unknown[] = [];

      for (const candidate of candidateUrls) {
        try {
          const response = await fetch(candidate, {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          });

          if (!response.ok) {
            errors.push(new Error(`HTTP ${response.status} @ ${candidate}`));
            if (response.status === 401 || response.status === 403) {
              break;
            }
            continue;
          }

          const blob = await response.blob();
          revokeObjectUrl();
          const objectUrl = URL.createObjectURL(blob);
          currentObjectUrlRef.current = objectUrl;
          return objectUrl;
        } catch (error) {
          errors.push(error);
        }
      }

      revokeObjectUrl();
      const lastError =
        errors.length > 0 ? errors[errors.length - 1] : undefined;
      if (lastError) {
        console.warn(
          "⚠️ [ProfileImageContext] Falha ao buscar imagem protegida:",
          lastError
        );
      }
      throw lastError instanceof Error
        ? lastError
        : new Error("Falha ao carregar imagem protegida");
    },
    [revokeObjectUrl]
  );

  const updateProfileImage = useCallback(
    async (rawUrl: string, persist: boolean) => {
      lastRawUrlRef.current = rawUrl;

      if (!rawUrl) {
        revokeObjectUrl();
        applyImageSource("");
        if (persist) {
          syncLocalPhoto("");
        }
        return;
      }

      if (rawUrl.startsWith("blob:") || rawUrl.startsWith("data:")) {
        revokeObjectUrl();
        applyImageSource(rawUrl);
        if (persist) {
          syncLocalPhoto(rawUrl);
        }
        return;
      }

      try {
        const resolvedSource = await fetchProtectedImage(rawUrl);

        if (lastRawUrlRef.current !== rawUrl) {
          if (
            resolvedSource.startsWith("blob:") &&
            resolvedSource !== currentObjectUrlRef.current
          ) {
            URL.revokeObjectURL(resolvedSource);
          }
          return;
        }

        applyImageSource(resolvedSource);
        if (persist && !isEphemeralSource(rawUrl)) {
          syncLocalPhoto(rawUrl);
        }
      } catch (error) {
        console.warn(
          "⚠️ [ProfileImageContext] Erro ao atualizar imagem protegida:",
          error
        );
        applyImageSource("");
        if (persist) {
          syncLocalPhoto("");
        }
      }
    },
    [applyImageSource, fetchProtectedImage, revokeObjectUrl]
  );

  const refreshImageFromStorage = useCallback(() => {
    const rawUrl = extractSavedPhoto();
    console.log(
      "🔄 [ProfileImageContext] Recarregando imagem do storage:",
      rawUrl
    );
    void updateProfileImage(rawUrl, false);
  }, [updateProfileImage]);

  const setProfileImage = useCallback(
    (rawUrl: string) => {
      const shouldPersist = !isEphemeralSource(rawUrl);
      void updateProfileImage(rawUrl, shouldPersist);
    },
    [updateProfileImage]
  );

  const loadProfileImageFromAPI = useCallback(async () => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        console.log("🚫 [ProfileImageContext] Nenhum userData encontrado");
        return;
      }

      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;
      const token = user.token;
      const tipoUsuario = user.tipo;
      const funcao = user.funcao;

      console.log("🔍 [ProfileImageContext] Debug userData:", {
        hasUsuarioId: !!usuarioId,
        hasToken: !!token,
        tipoUsuario,
        funcao,
      });

      if (!usuarioId || !token) {
        console.log(
          "🚫 [ProfileImageContext] Dados de auth incompletos - usuarioId:",
          !!usuarioId,
          "token:",
          !!token
        );
        return;
      }

      const endpoint = buildBackendUrl(
        `${resolvePerfilPath(tipoUsuario, funcao)}?usuarioId=${usuarioId}`
      );

      console.log("🌐 [ProfileImageContext] Endpoint da API:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(
          "⚠️ [ProfileImageContext] Erro ao buscar dados da API:",
          response.status,
          response.statusText
        );
        return;
      }

      const data = await response.json();
      console.log("📋 [ProfileImageContext] Dados recebidos da API:", data);

      const rawPhotoUrl = data.fotoUrl ?? data.urlFoto;
      if (rawPhotoUrl) {
        await updateProfileImage(rawPhotoUrl, true);
        console.log(
          "✅ [ProfileImageContext] Foto atualizada via API para usuário",
          usuarioId
        );
      } else {
        console.log(
          "ℹ️ [ProfileImageContext] Nenhuma foto encontrada para usuário",
          usuarioId
        );
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn(
          "⚠️ [ProfileImageContext] Backend offline, mantendo cache local"
        );
      } else {
        console.warn(
          "⚠️ [ProfileImageContext] Erro ao buscar foto da API:",
          error
        );
      }
    }
  }, [updateProfileImage]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "savedProfile" || event.key === "profileData") {
        console.log(
          "👂 [ProfileImageContext] Detectada mudança no localStorage:",
          event.key
        );
        refreshImageFromStorage();
      }

      if (event.key === "userData") {
        console.log(
          "👂 [ProfileImageContext] Novo login detectado, limpando cache anterior"
        );
        void updateProfileImage("", true);
        setTimeout(() => {
          void loadProfileImageFromAPI();
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadProfileImageFromAPI, refreshImageFromStorage, updateProfileImage]);

  useEffect(() => {
    // Garantir que só executa após montagem completa
    if (!mountedRef.current || !initializedRef.current) return;

    refreshImageFromStorage();

    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const usuarioId = user.idUsuario || user.id;
        const token = user.token;

        if (usuarioId && token) {
          console.log(
            "🔄 [ProfileImageContext] userData válido detectado, buscando foto..."
          );
          void loadProfileImageFromAPI();
        }
      } catch (error) {
        console.warn(
          "⚠️ [ProfileImageContext] Erro ao parsear userData, mantendo cache local"
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountedRef.current, initializedRef.current]);

  return (
    <ProfileImageContext.Provider
      value={{
        profileImage,
        setProfileImage,
        refreshImageFromStorage,
      }}
    >
      {children}
    </ProfileImageContext.Provider>
  );
};

export { ProfileImageContext };
