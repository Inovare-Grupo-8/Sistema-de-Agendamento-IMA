import React, { createContext } from "react";
import { appUrls } from "@/utils/userNavigation";

// Define o tipo do contexto
interface UserNavigationContextType {
  navigateTo: (route: keyof typeof appUrls.user) => void;
  currentRoute: string;
  isActive: (route: string) => boolean;
}

// Cria o contexto com um valor padrão undefined
export const UserNavigationContext = createContext<UserNavigationContextType | undefined>(undefined);
