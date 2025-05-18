import React from "react";
import { Link } from "react-router-dom";
import { userNavigationItems } from "@/utils/userNavigation";
import { useUserNavigation } from "@/hooks/useUserNavigation"; // Atualizando o caminho de importação
import { cn } from "@/lib/utils";

export function HomeUserNavbar() {
  const { isActive } = useUserNavigation();
  
  return (
    <nav className="bg-white dark:bg-[#23272F] shadow-md border-b border-[#EDF2FB] dark:border-[#23272F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo */}
              <Link to="/home-user">
                <div className="w-10 h-10 rounded-full bg-[#ED4231] flex items-center justify-center text-white font-bold">
                  IP
                </div>
              </Link>
            </div>
            
            {/* Links de navegação desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {Object.values(userNavigationItems).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2",
                    isActive(item.path)
                      ? "border-[#ED4231] text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                  )}
                >
                  <span className="mr-2">{React.cloneElement(item.icon as React.ReactElement, { size: 18 })}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu móvel */}
      <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-5 pt-2">
          {Object.values(userNavigationItems).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center pb-2 text-xs font-medium",
                isActive(item.path)
                  ? "text-[#ED4231]"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {React.cloneElement(item.icon as React.ReactElement, { size: 22 })}
              <span className="mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
