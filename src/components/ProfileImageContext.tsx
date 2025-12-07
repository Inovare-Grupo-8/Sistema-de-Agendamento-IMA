import { createContext, useState, ReactNode, useEffect } from "react";
import { buildBackendUrl, resolvePerfilPath } from "@/lib/utils";

interface ProfileImageContextType {
  profileImage: string;
  setProfileImage: (img: string) => void;
  refreshImageFromStorage: () => void;
}

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(
  undefined
);

export const ProfileImageProvider = ({ children }: { children: ReactNode }) => {
  const [profileImage, setProfileImage] = useState<string>(() => {
    // Verificar primeiro a chave "savedProfile" (usada pelo hook useUserProfile)
    const savedProfile = localStorage.getItem("savedProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.fotoUrl) {
          console.log(
            "🔄 [ProfileImageContext] Init: Carregando foto do savedProfile:",
            profile.fotoUrl
          );
          return profile.fotoUrl;
        }
      } catch (e) {
        console.warn("Erro ao parsear savedProfile:", e);
      }
    }

    // Fallback para a chave "profileData" (compatibilidade)
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.profileImage) {
          console.log(
            "🔄 [ProfileImageContext] Init: Carregando foto do profileData:",
            parsed.profileImage
          );
          return parsed.profileImage;
        }
      } catch (e) {
        console.warn("Erro ao parsear profileData:", e);
      }
    }

    return "";
  }); // Função para recarregar imagem do localStorage
  const refreshImageFromStorage = () => {
    const savedProfile = localStorage.getItem("savedProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.fotoUrl) {
          setProfileImage(profile.fotoUrl);
          console.log(
            "🔄 [ProfileImageContext] Imagem recarregada do localStorage:",
            profile.fotoUrl
          );
          return;
        }
      } catch (e) {
        console.warn("Erro ao parsear savedProfile:", e);
      }
    }

    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfileImage(parsed.profileImage || "");
        console.log(
          "🔄 [ProfileImageContext] Imagem recarregada do profileData:",
          parsed.profileImage
        );
      } catch (e) {
        console.warn("Erro ao parsear profileData:", e);
      }
    }
  }; // Função para atualizar o contexto e sincronizar com localStorage
  const setProfileImageSync = (img: string) => {
    setProfileImage(img);

    // Atualizar ambas as chaves no localStorage para garantir sincronização
    try {
      // Atualizar savedProfile (usado pelo hook useUserProfile)
      const savedProfile = localStorage.getItem("savedProfile");
      const profile = savedProfile ? JSON.parse(savedProfile) : {};
      profile.fotoUrl = img;
      localStorage.setItem("savedProfile", JSON.stringify(profile));

      // Atualizar profileData (compatibilidade)
      const profileData = localStorage.getItem("profileData");
      const data = profileData ? JSON.parse(profileData) : {};
      data.profileImage = img;
      localStorage.setItem("profileData", JSON.stringify(data));

      console.log(
        "📸 [ProfileImageContext] Foto sincronizada no localStorage:",
        img
      );
    } catch (error) {
      console.warn("Erro ao sincronizar foto no localStorage:", error);
    }
  }; // Função para buscar foto do perfil da API para todos os tipos de usuário
  const loadProfileImageFromAPI = async () => {
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
        // Não limpar a imagem, apenas retornar para usar cache local ou LetterAvatar
        return;
      }

      console.log(
        "🔄 [ProfileImageContext] Buscando foto do perfil da API para usuário:",
        usuarioId,
        "tipo:",
        tipoUsuario,
        "funcao:",
        funcao
      );

      // Mapear tipo do usuário para o endpoint correto
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

      if (response.ok) {
        const data = await response.json();
        console.log("📋 [ProfileImageContext] Dados recebidos da API:", data);

        if (data.fotoUrl) {
          const fullImageUrl = buildBackendUrl(data.fotoUrl);

          console.log(
            "✅ [ProfileImageContext] Foto encontrada na API para usuário",
            usuarioId,
            ":",
            fullImageUrl
          );
          setProfileImage(fullImageUrl);

          // Salvar nos localStorage para cache
          const savedProfile = localStorage.getItem("savedProfile");
          const profile = savedProfile ? JSON.parse(savedProfile) : {};
          profile.fotoUrl = fullImageUrl;
          localStorage.setItem("savedProfile", JSON.stringify(profile));
        } else {
          console.log(
            "ℹ️ [ProfileImageContext] Nenhuma foto encontrada na API para usuário",
            usuarioId
          );
          // Não limpar - manter cache ou LetterAvatar
        }
      } else {
        console.warn(
          "⚠️ [ProfileImageContext] Erro ao buscar dados da API:",
          response.status,
          response.statusText
        );
        // Não limpar - backend pode estar offline
      }
    } catch (error) {
      // Tratamento silencioso de erro de rede - backend pode estar offline
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn(
          "⚠️ [ProfileImageContext] Backend offline, usando cache local ou LetterAvatar"
        );
      } else {
        console.warn(
          "⚠️ [ProfileImageContext] Erro ao buscar foto da API:",
          error
        );
      }
      // Não limpar a imagem em caso de erro
    }
  };

  // Escutar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "savedProfile" || e.key === "profileData") {
        console.log(
          "👂 [ProfileImageContext] Detectada mudança no localStorage:",
          e.key
        );
        refreshImageFromStorage();
      } else if (e.key === "userData") {
        // Quando userData muda (novo login), LIMPAR foto anterior IMEDIATAMENTE
        console.log(
          "👂 [ProfileImageContext] Detectado novo login, limpando foto anterior..."
        );
        setProfileImage(""); // Limpar foto anterior IMEDIATAMENTE

        // Depois buscar a nova foto da API
        setTimeout(() => {
          console.log("👂 [ProfileImageContext] Buscando nova foto da API...");
          loadProfileImageFromAPI();
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Carregar foto da API quando o componente for montado (caso userData já exista)
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const usuarioId = user.idUsuario || user.id;
        const token = user.token;

        if (usuarioId && token) {
          console.log(
            "🔄 [ProfileImageContext] Componente montado com userData válido, buscando foto..."
          );
          loadProfileImageFromAPI();
        } else {
          console.log(
            "🔄 [ProfileImageContext] userData incompleto, usando cache local..."
          );
          refreshImageFromStorage();
        }
      } catch (error) {
        console.warn(
          "⚠️ [ProfileImageContext] Erro ao parsear userData, usando cache local..."
        );
        refreshImageFromStorage();
      }
    } else {
      console.log(
        "🔄 [ProfileImageContext] Componente montado sem userData, usando cache local..."
      );
      refreshImageFromStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProfileImageContext.Provider
      value={{
        profileImage,
        setProfileImage: setProfileImageSync,
        refreshImageFromStorage,
      }}
    >
      {children}
    </ProfileImageContext.Provider>
  );
};

export { ProfileImageContext };
