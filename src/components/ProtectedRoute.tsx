import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Simple check for user data
    const userData = localStorage.getItem('userData');
    setIsAuthenticated(!!userData);
    setIsLoading(false);
  }, []);

  if (isLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-[#ED4231] border-b-[#ED4231] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  // Render protected content if authenticated
  return isAuthenticated ? <>{children}</> : null;
};
