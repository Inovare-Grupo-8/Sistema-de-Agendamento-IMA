import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F6FA] dark:bg-[#181A20]">
      <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 dark:text-gray-100 mb-4 animate-fade-in">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2 animate-fade-in">Página não encontrada</h2>
      <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-6 animate-fade-in">A página que você procura não existe ou foi movida.</p>
      <a href="/" className="text-blue-500 hover:text-blue-700 underline">
        Return to Home
      </a>
    </div>
  );
};

export default NotFound;
