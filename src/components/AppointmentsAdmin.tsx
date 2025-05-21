import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { Calendar, User, Clock, Menu, History, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
// Import the useUserData hook
import { useUserData } from "@/hooks/useUserData";

const AppointmentsAdmin = () => {
  // ...existing state declarations...
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  // Use the userData hook instead of directly accessing localStorage
  const { userData } = useUserData();

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-gray-900/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-primary text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-primary shadow" />
            {/* Use userData instead of formData */}
            <span className="font-bold text-foreground">{userData.nome} {userData.sobrenome}</span>
          </div>
        )}
        
        <div className={`transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
          bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto`}
        >
          <div className="w-full flex justify-start mb-6">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-primary text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src={profileImage} alt="Logo" className="w-16 h-16 rounded-full border-4 border-background shadow" />
            {/* Use userData instead of formData */}
            <span className="font-extrabold text-xl text-foreground tracking-wide">{userData.nome} {userData.sobrenome}</span>
          </div>
          
          {/* ...existing sidebar menu... */}
        </div>

        <main className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out ${sidebarOpen ? '' : 'ml-0'}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-primary shadow hover:scale-105 transition-transform duration-200" />
              {/* Use userData instead of formData */}
              <span className="font-bold text-foreground">{userData.nome} {userData.sobrenome}</span>
            </div>
            
            {/* ...existing header content... */}
          </header>

          {/* ...existing main content... */}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppointmentsAdmin;