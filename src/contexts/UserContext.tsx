import { useState, useEffect, ReactNode } from "react";
import { UserData, defaultUserData } from "@/types/user";
import { UserContext } from "@/contexts/UserContextInstance";

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userData, setUserDataState] = useState<UserData>(() => {
    try {
      // Usar uma chave diferente para evitar conflito com o sistema de auth
      const savedData = localStorage.getItem("userProfileData");
      return savedData
        ? { ...defaultUserData, ...JSON.parse(savedData) }
        : defaultUserData;
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      return defaultUserData;
    }
  });

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    try {
      // Salvar com chave diferente para evitar conflito
      localStorage.setItem("userProfileData", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error);
    }
  };

  const updateUserData = (updates: Partial<UserData>) => {
    const newData = { ...userData, ...updates };
    setUserData(newData);
  };

  useEffect(() => {
    try {
      // Salvar com chave diferente para evitar conflito
      localStorage.setItem("userProfileData", JSON.stringify(userData));
    } catch (error) {
      console.error("Erro ao sincronizar dados do usuário:", error);
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};
