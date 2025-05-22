import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
      }
    }
    
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular uma chamada de API
      // Na implementação real, isso seria uma chamada fetch ou axios
      const response = await new Promise<User>((resolve) => {
        setTimeout(() => {
          // Mock user
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
      if (response.tipo === 'profissional') {
        navigate('/home');
      } else {
        navigate('/home-user');
      }
      
      return response;
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = !!user;
  const userType = user?.tipo;

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    userType
  };
}
