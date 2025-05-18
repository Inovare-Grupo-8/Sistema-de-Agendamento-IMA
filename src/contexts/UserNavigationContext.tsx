import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { appUrls } from "@/utils/userNavigation";

// Define o tipo do contexto diretamente neste arquivo
interface UserNavigationContextType {
  navigateTo: (route: keyof typeof appUrls.user) => void;
  currentRoute: string;
  isActive: (route: string) => boolean;
}

// Cria o contexto aqui em vez de importá-lo
const UserNavigationContext = createContext<UserNavigationContextType | undefined>(undefined);

export function UserNavigationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);

  const navigateTo = (route: keyof typeof appUrls.user) => {
    const path = appUrls.user[route];
    navigate(path);
    setCurrentRoute(path);
  };

  const isActive = (route: string) => {
    return currentRoute === route;
  };

  return (
    <UserNavigationContext.Provider value={{ navigateTo, currentRoute, isActive }}>
      {children}
    </UserNavigationContext.Provider>
  );
}

// Removido o hook useUserNavigation deste arquivo para evitar conflitos com Fast Refresh.
