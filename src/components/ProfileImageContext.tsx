import { createContext, useState, ReactNode, useEffect } from "react";

interface ProfileImageContextType {
  profileImage: string;
  setProfileImage: (img: string) => void;
  refreshImageFromStorage: () => void;
}

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(undefined);

export const ProfileImageProvider = ({ children }: { children: ReactNode }) => {
  const [profileImage, setProfileImage] = useState<string>(() => {
    // Verificar primeiro a chave "savedProfile" (usada pelo hook useUserProfile)
    const savedProfile = localStorage.getItem("savedProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.fotoUrl) {
          console.log('🔄 [ProfileImageContext] Init: Carregando foto do savedProfile:', profile.fotoUrl);
          return profile.fotoUrl;
        }
      } catch (e) {
        console.warn('Erro ao parsear savedProfile:', e);
      }
    }
    
    // Fallback para a chave "profileData" (compatibilidade)
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.profileImage) {
          console.log('🔄 [ProfileImageContext] Init: Carregando foto do profileData:', parsed.profileImage);
          return parsed.profileImage;
        }
      } catch (e) {
        console.warn('Erro ao parsear profileData:', e);
      }
    }
    
    return "";
  });  // Função para recarregar imagem do localStorage
  const refreshImageFromStorage = () => {
    const savedProfile = localStorage.getItem("savedProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.fotoUrl) {
          setProfileImage(profile.fotoUrl);
          console.log('🔄 [ProfileImageContext] Imagem recarregada do localStorage:', profile.fotoUrl);
          return;
        }
      } catch (e) {
        console.warn('Erro ao parsear savedProfile:', e);
      }
    }
    
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfileImage(parsed.profileImage || "");
        console.log('🔄 [ProfileImageContext] Imagem recarregada do profileData:', parsed.profileImage);
      } catch (e) {
        console.warn('Erro ao parsear profileData:', e);
      }
    }
  };  // Função para atualizar o contexto e sincronizar com localStorage
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
      
      console.log('📸 [ProfileImageContext] Foto sincronizada no localStorage:', img);
    } catch (error) {
      console.warn('Erro ao sincronizar foto no localStorage:', error);
    }
  };  // Função para buscar foto do perfil da API para todos os tipos de usuário
  const loadProfileImageFromAPI = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.log('🚫 [ProfileImageContext] Nenhum userData encontrado');
        setProfileImage('');
        return;
      }

      const user = JSON.parse(userData);
      const { token, idUsuario: usuarioId, tipo: tipoUsuario, funcao } = user;

      if (!usuarioId || !token) {
        console.log('🚫 [ProfileImageContext] Dados de auth incompletos');
        setProfileImage('');
        return;
      }

      console.log('🔄 [ProfileImageContext] Buscando foto do perfil da API para usuário:', usuarioId, 'tipo:', tipoUsuario, 'funcao:', funcao);
      
      // Mapear tipo do usuário para o endpoint correto
      let endpoint;
      if (tipoUsuario === 'USUARIO') {
        endpoint = `http://localhost:8080/perfil/assistido/dados-pessoais?usuarioId=${usuarioId}`;
      } else if (tipoUsuario === 'VOLUNTARIO' && funcao === 'ASSISTENCIA_SOCIAL') {
        endpoint = `http://localhost:8080/perfil/assistente-social/dados-pessoais?usuarioId=${usuarioId}`;
      } else if (tipoUsuario === 'ADMINISTRADOR') {
        endpoint = `http://localhost:8080/perfil/administrador/dados-pessoais?usuarioId=${usuarioId}`;
      } else if (tipoUsuario === 'VOLUNTARIO') {
        endpoint = `http://localhost:8080/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`;
      } else {
        // Fallback genérico
        endpoint = `http://localhost:8080/perfil/usuario/dados-pessoais?usuarioId=${usuarioId}`;
      }

      console.log('🌐 [ProfileImageContext] Endpoint da API:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 [ProfileImageContext] Dados recebidos da API:', data);
        
        if (data.fotoUrl) {
          const fullImageUrl = data.fotoUrl.startsWith('http') 
            ? data.fotoUrl 
            : `http://localhost:8080${data.fotoUrl}`;
          
          console.log('✅ [ProfileImageContext] Foto encontrada na API para usuário', usuarioId, ':', fullImageUrl);
          setProfileImage(fullImageUrl);
          
          // Salvar nos localStorage para cache
          const savedProfile = localStorage.getItem("savedProfile");
          const profile = savedProfile ? JSON.parse(savedProfile) : {};
          profile.fotoUrl = fullImageUrl;
          localStorage.setItem("savedProfile", JSON.stringify(profile));
        } else {
          console.log('ℹ️ [ProfileImageContext] Nenhuma foto encontrada na API para usuário', usuarioId);
          setProfileImage(''); // Limpar para usar LetterAvatar
        }
      } else {
        console.warn('⚠️ [ProfileImageContext] Erro ao buscar dados da API:', response.status);
        setProfileImage(''); // Limpar para usar LetterAvatar
      }
    } catch (error) {
      console.warn('⚠️ [ProfileImageContext] Erro ao buscar foto da API:', error);
      setProfileImage(''); // Limpar para usar LetterAvatar
    }
  };
  // Escutar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedProfile' || e.key === 'profileData') {
        console.log('👂 [ProfileImageContext] Detectada mudança no localStorage:', e.key);
        refreshImageFromStorage();
      } else if (e.key === 'userData') {
        // Quando userData muda (novo login), LIMPAR foto anterior IMEDIATAMENTE
        console.log('👂 [ProfileImageContext] Detectado novo login, limpando foto anterior...');
        setProfileImage(''); // Limpar foto anterior IMEDIATAMENTE
        
        // Depois buscar a nova foto da API
        setTimeout(() => {
          console.log('👂 [ProfileImageContext] Buscando nova foto da API...');
          loadProfileImageFromAPI();
        }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Carregar foto da API quando o componente for montado (caso userData já exista)
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      console.log('🔄 [ProfileImageContext] Componente montado com userData existente, buscando foto...');
      loadProfileImageFromAPI();
    } else {
      console.log('🔄 [ProfileImageContext] Componente montado sem userData, usando cache local...');
      refreshImageFromStorage();
    }
  }, []);

  return (
    <ProfileImageContext.Provider value={{ 
      profileImage, 
      setProfileImage: setProfileImageSync,
      refreshImageFromStorage 
    }}>
      {children}
    </ProfileImageContext.Provider>
  );
};

export { ProfileImageContext };
