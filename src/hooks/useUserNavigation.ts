import { useContext } from 'react';
import { UserNavigationContext } from '../contexts/UserNavigationContextInstance';

export function useUserNavigation() {
  const context = useContext(UserNavigationContext);
  
  if (context === undefined) {
    throw new Error("useUserNavigation deve ser usado dentro de um UserNavigationProvider");
  }
  
  return context;
}
