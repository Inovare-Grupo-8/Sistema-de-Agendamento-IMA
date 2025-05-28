import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserData, UserContextType, defaultUserData } from '@/types/user';

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserDataState] = useState<UserData>(() => {
    const savedData = localStorage.getItem("userData");
    return savedData ? { ...defaultUserData, ...JSON.parse(savedData) } : defaultUserData;
  });

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    localStorage.setItem("userData", JSON.stringify(data));
  };

  const updateUserData = (updates: Partial<UserData>) => {
    const newData = { ...userData, ...updates };
    setUserData(newData);
  };

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData));
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};
