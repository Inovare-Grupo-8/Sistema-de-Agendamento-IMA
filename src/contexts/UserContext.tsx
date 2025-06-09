import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserData, UserContextType, defaultUserData } from '@/types/user';

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserDataState] = useState<UserData>(() => {
    // Usar uma chave diferente para evitar conflito com o sistema de auth
    const savedData = localStorage.getItem("userProfileData");
    return savedData ? { ...defaultUserData, ...JSON.parse(savedData) } : defaultUserData;
  });

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    // Salvar com chave diferente para evitar conflito
    localStorage.setItem("userProfileData", JSON.stringify(data));
  };

  const updateUserData = (updates: Partial<UserData>) => {
    const newData = { ...userData, ...updates };
    setUserData(newData);
  };

  useEffect(() => {
    // Salvar com chave diferente para evitar conflito
    localStorage.setItem("userProfileData", JSON.stringify(userData));
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};
