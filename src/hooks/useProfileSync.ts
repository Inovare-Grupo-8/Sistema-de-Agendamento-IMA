import { useState, useEffect, useCallback } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { buildBackendUrl, parseJsonSafe } from "@/lib/utils";

interface UserProfileData {
  nome?: string;
  sobrenome?: string;
  email?: string;
  fotoUrl?: string;
  tipo?: string;
  especialidade?: string;
  funcao?: string;
}

export const useProfileSync = () => {
  const [profileData, setProfileData] = useState<UserProfileData>({});
  const [isLoading, setIsLoading] = useState(true);
  const { profileImage, setProfileImage } = useProfileImage();

  // Função para buscar dados do perfil baseado no tipo de usuário
  const fetchProfileData =
    useCallback(async (): Promise<UserProfileData | null> => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          throw new Error("Dados do usuário não encontrados no localStorage");
        }

        const user = JSON.parse(userData);
        const token = user.token;
        const usuarioId = user.idUsuario;
        const tipoUsuario = user.tipo;

        if (!token || !usuarioId) {
          throw new Error("Token ou ID do usuário não encontrados");
        }

        let endpoint = "";

        // Determinar o endpoint baseado no tipo de usuário
        switch (tipoUsuario) {
          case "ADMINISTRADOR":
            endpoint = buildBackendUrl(
              `/perfil/assistente-social?usuarioId=${usuarioId}`
            );
            break;
          case "VOLUNTARIO":
            endpoint = buildBackendUrl(
              `/perfil/voluntario?usuarioId=${usuarioId}`
            );
            break;
          case "USUARIO_ASSISTIDO":
            endpoint = buildBackendUrl(
              `/perfil/usuario-assistido?usuarioId=${usuarioId}`
            );
            break;
          default:
            throw new Error(`Tipo de usuário não suportado: ${tipoUsuario}`);
        }

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar dados do perfil");
        }

        const data = await parseJsonSafe(response);

        // Se houver uma foto, ajustar a URL
        if (data.fotoUrl && !data.fotoUrl.startsWith("http")) {
          data.fotoUrl = buildBackendUrl(data.fotoUrl);
        }

        return data;
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        return null;
      }
    }, []);

  // Função para sincronizar dados do perfil
  const syncProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProfileData();
      if (data) {
        setProfileData(data);

        // Atualizar imagem de perfil se existir
        if (data.fotoUrl) {
          setProfileImage(data.fotoUrl);
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar dados do perfil:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfileData, setProfileImage]);

  // Função para obter o nome completo
  const getFullName = (): string => {
    const nome = profileData.nome || "";
    const sobrenome = profileData.sobrenome || "";
    return `${nome} ${sobrenome}`.trim();
  };

  // Função para obter o nome para exibição (apenas primeiro nome)
  const getDisplayName = (): string => {
    return profileData.nome || "Usuário";
  };

  // Função para obter a função/especialidade do usuário
  const getUserRole = (): string => {
    if (profileData.especialidade) {
      return profileData.especialidade;
    }
    if (profileData.funcao) {
      return profileData.funcao;
    }
    if (profileData.tipo) {
      switch (profileData.tipo) {
        case "ADMINISTRADOR":
          return "Assistente Social";
        case "VOLUNTARIO":
          return "Voluntário";
        case "USUARIO_ASSISTIDO":
          return "Usuário Assistido";
        default:
          return "Usuário";
      }
    }
    return "Usuário";
  };

  // Sincronizar dados na inicialização
  useEffect(() => {
    syncProfileData();
  }, [syncProfileData]);

  return {
    profileData,
    profileImage,
    isLoading,
    getFullName,
    getDisplayName,
    getUserRole,
    syncProfileData,
    setProfileImage,
  };
};
