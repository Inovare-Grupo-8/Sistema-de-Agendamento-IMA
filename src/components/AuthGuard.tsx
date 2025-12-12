import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, isPublicRoute } = useAuth();
  const hasRedirectedRef = React.useRef(false);

  useEffect(() => {
    // Se ainda está carregando, não faça nada
    if (loading) return;

    // Evitar redirecionamentos múltiplos
    if (hasRedirectedRef.current) return;

    const currentPath = location.pathname;

    // Se é uma rota pública, sempre permitir acesso
    if (isPublicRoute(currentPath)) {
      hasRedirectedRef.current = false;
      return;
    }

    // Se não está autenticado e não é uma rota pública, redirecionar para login
    if (!isAuthenticated) {
      hasRedirectedRef.current = true;
      navigate("/login", {
        state: { from: currentPath },
        replace: true,
      });
      return;
    }

    // Se está autenticado, verificar se precisa redirecionar baseado no tipo de usuário
    // Apenas redirecionar na rota raiz para evitar loops
    if (currentPath === "/") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const raw = JSON.parse(userData);
          const user = {
            ...raw,
            tipo: String(raw.tipo || "").toUpperCase(),
            funcao: String(raw.funcao || "").toUpperCase(),
          };

          hasRedirectedRef.current = true;

          // Redirecionamento baseado no tipo de usuário
          switch (user.tipo) {
            case "ADMINISTRADOR":
              navigate("/assistente-social", { replace: true });
              break;
            case "VOLUNTARIO":
              if (user.funcao === "ASSISTENCIA_SOCIAL") {
                navigate("/assistente-social", { replace: true });
              } else {
                // Outros tipos de voluntários vão para home do profissional
                navigate("/home", { replace: true });
              }
              break;
            case "USUARIO":
            case "GRATUIDADE":
            case "VALOR_SOCIAL":
              navigate("/home-user", { replace: true });
              break;
            default:
              // Tipo desconhecido, redirecionar para login
              navigate("/login", { replace: true });
              break;
          }
        } catch (error) {
          console.error("Erro ao processar dados do usuário:", error);
          // Se houver erro ao processar os dados, limpar e redirecionar para login
          localStorage.removeItem("userData");
          hasRedirectedRef.current = true;
          navigate("/login", { replace: true });
        }
      }
    } else {
      // Reset flag quando não estiver na rota raiz
      hasRedirectedRef.current = false;
    }
  }, [location.pathname, isAuthenticated, loading, navigate, isPublicRoute]);

  // Mostrar um carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
