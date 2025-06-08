import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'profissional' | 'paciente';
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const PUBLIC_ROUTES = ['/login', '/cadastro', '/completar-cadastro-usuario', '/completar-cadastro-voluntario'];
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Função para verificar se uma rota é pública
  const isPublicRoute = useCallback((path: string) => {
    return PUBLIC_ROUTES.some(route => path.startsWith(route));
  }, []);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      const storedUser = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if ((storedUser && storedToken) || userData) {
        try {
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          }
        } catch (e) {
          console.error('Error loading user data:', e);
          // Clear invalid data
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      } else if (!isPublicRoute(location.pathname)) {
        // If not on a public route and no auth, redirect to login
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta página.",
          variant: "destructive",
        });
        navigate('/login', { state: { from: location.pathname }, replace: true });
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate, location.pathname, isPublicRoute]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular uma chamada de API
      const response = await new Promise<User>((resolve) => {
        setTimeout(() => {
          resolve({
            id: '123',
            nome: credentials.email.includes('prof') ? 'Dr. Profissional' : 'Paciente',
            email: credentials.email,
            tipo: credentials.email.includes('prof') ? 'profissional' : 'paciente',
            token: 'token-simulado-' + Math.random()
          });
        }, 1000);
      });
      
      // Salvar no localStorage
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response));
      
      setUser(response);
      
      // Redirecionar com base no tipo de usuário
      const targetPath = response.tipo === 'profissional' ? '/home' : '/home-user';
      navigate(targetPath, { replace: true });
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
      toast({
        title: "Erro de autenticação",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('userData'); // Clear new auth data too
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // Check if user is authenticated based on both old and new auth mechanisms
  const isAuthenticated = !!user || !!localStorage.getItem('userData');
  const userType = user?.tipo;

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    userType,
    isPublicRoute
  };
}
