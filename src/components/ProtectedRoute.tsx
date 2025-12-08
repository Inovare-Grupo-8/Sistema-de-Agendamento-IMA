import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allow?: (user: any) => boolean;
}

export const ProtectedRoute = ({ children, allow }: ProtectedRouteProps) => {
  const { loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigateTo = (tipo?: string, funcao?: string) => {
    if (tipo === "ADMINISTRADOR") {
      window.location.replace("/assistente-social");
      return;
    }
    if (tipo === "VOLUNTARIO") {
      if (funcao === "ASSISTENCIA_SOCIAL") {
        window.location.replace("/assistente-social");
      } else {
        window.location.replace("/home");
      }
      return;
    }
    if (
      tipo === "GRATUIDADE" ||
      tipo === "VALOR_SOCIAL" ||
      tipo === "USUARIO"
    ) {
      window.location.replace("/home-user");
      return;
    }
    window.location.replace("/login");
  };

  useEffect(() => {
    // Simple check for user data
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  if (isLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-[#ED4231] border-b-[#ED4231] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  // Render protected content if authenticated and allowed
  if (!isAuthenticated) return null;
  if (allow && user) {
    const ok = allow(user);
    if (!ok) {
      navigateTo(user?.tipo, user?.funcao);
      return null;
    }
  }
  return <>{children}</>;
};
