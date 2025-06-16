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
        return parsed.profileImage || "";
      } catch (e) {
        console.warn('Erro ao parsear profileData:', e);
      }
    }
    
    return "";
  });

  // Função para recarregar imagem do localStorage
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
  };

  // Função para atualizar o contexto e sincronizar com localStorage
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
  };

  // Escutar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedProfile' || e.key === 'profileData') {
        console.log('👂 [ProfileImageContext] Detectada mudança no localStorage:', e.key);
        refreshImageFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
