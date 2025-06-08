import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Log the 404 error
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Check authentication status
    const userData = localStorage.getItem('userData');
    setIsAuthenticated(!!userData);
  }, [location.pathname]);

  // Handle navigation based on auth status
  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/home-user'); // Or the appropriate home route based on user type
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F6FA] dark:bg-[#181A20]">
      <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 dark:text-gray-100 mb-4 animate-fade-in">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2 animate-fade-in">Página não encontrada</h2>
      <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-6 animate-fade-in">A página que você procura não existe ou foi movida.</p>
      <Button 
        onClick={handleGoHome}
        className="bg-[#ED4231] hover:bg-[#d53a2a] text-white"
      >
        {isAuthenticated ? 'Voltar para o início' : 'Ir para o login'}
      </Button>
    </div>
  );
};

export default NotFound;
