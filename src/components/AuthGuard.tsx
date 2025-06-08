import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, isPublicRoute } = useAuth();

  useEffect(() => {
    // Se ainda está carregando, não faça nada
    if (loading) return;

    const currentPath = location.pathname;
    
    // Se é uma rota pública, sempre permitir acesso
    if (isPublicRoute(currentPath)) {
      return;
    }

    // Se não está autenticado e não é uma rota pública, redirecionar para login
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: currentPath }, 
        replace: true 
      });
      return;
    }

    // Se está autenticado, verificar se precisa redirecionar baseado no tipo de usuário
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Redirecionamento baseado no tipo de usuário
        switch (user.tipo) {
          case 'ADMINISTRADOR':
            if (currentPath === '/' || currentPath === '/login') {
              navigate('/home-admin', { replace: true });
            }
            break;
          case 'VOLUNTARIO':
            if (user.funcao === 'ASSISTENCIA_SOCIAL') {
              if (currentPath === '/' || currentPath === '/login') {
                navigate('/assistente-social', { replace: true });
              }
            } else {
              // Outros tipos de voluntários vão para home do profissional
              if (currentPath === '/' || currentPath === '/login') {
                navigate('/home', { replace: true });
              }
            }
            break;
          case 'USUARIO':
            if (currentPath === '/' || currentPath === '/login') {
              navigate('/home-user', { replace: true });
            }
            break;
          default:
            // Tipo desconhecido, redirecionar para login
            if (currentPath === '/' || currentPath === '/login') {
              navigate('/login', { replace: true });
            }
            break;
        }
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
        // Se houver erro ao processar os dados, limpar e redirecionar para login
        localStorage.removeItem('userData');
        navigate('/login', { replace: true });
      }
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