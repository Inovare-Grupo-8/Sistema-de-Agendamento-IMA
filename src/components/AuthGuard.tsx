import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

// Lista de rotas que não exigem autenticação
const PUBLIC_ROUTES = [
  '/login', 
  '/cadastro', 
  '/completar-cadastro-usuario', 
  '/completar-cadastro-voluntario'
];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isPublicRoute = (path: string) => {
    return PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
  };
    useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem('userData');
      const isProtectedRoute = !isPublicRoute(location.pathname);

      // Redirect to login if protected route and no auth
      if (isProtectedRoute && !userData) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta página.",
          variant: "destructive",
        });
        // Store the page they were trying to access
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true // Replace instead of push to avoid building history
        });
      }

      // Redirect to appropriate home page if logged in and on public route
      if (!isProtectedRoute && userData) {
        try {
          const user = JSON.parse(userData);
          // Redirect to appropriate dashboard if on login/register pages
          if (['/login', '/cadastro'].includes(location.pathname)) {
            const targetPath = user.tipo === 'profissional' ? '/home' : '/home-user';
            navigate(targetPath, { replace: true });
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    };
    
    checkAuth();
  }, [location.pathname, navigate]);
  
  return <>{children}</>;
};

export default AuthGuard;
