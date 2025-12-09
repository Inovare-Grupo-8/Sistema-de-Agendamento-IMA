import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Menu, Home as HomeIcon, UserCheck, UserPlus, User, Sun, Moon } from "lucide-react";
import { useProfileImage } from "@/components/useProfileImage";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useAssistenteSocial } from "@/hooks/useAssistenteSocial";
import { ClassificacaoUsuarios } from "@/components/ClassificacaoUsuarios";

const assistenteSocialNavItems = [
  { path: "/assistente-social", label: "Home", icon: <HomeIcon className="w-6 h-6" color="#ED4231" /> },
  { path: "/classificacao-usuarios", label: "Classificar Usuários", icon: <UserCheck className="w-6 h-6" color="#ED4231" /> },
  { path: "/cadastro-assistente", label: "Cadastrar Assistente", icon: <UserPlus className="w-6 h-6" color="#ED4231" /> },
  { path: "/cadastro-voluntario", label: "Cadastrar Voluntário", icon: <UserPlus className="w-6 h-6" color="#ED4231" /> },
  { path: "/profile-form-assistente-social", label: "Editar Perfil", icon: <User className="w-6 h-6" color="#ED4231" /> },
];

const ClassificacaoUsuariosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const { fetchPerfil } = useAssistenteSocial();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nome, setNome] = useState<string>("");
  const [sobrenome, setSobrenome] = useState<string>("");
  const [especialidade, setEspecialidade] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const perfil = await fetchPerfil();
        setNome(perfil?.nome || "");
        setSobrenome(perfil?.sobrenome || "");
        setEspecialidade(perfil?.especialidade || "");
      } catch {}
    })();
  }, [fetchPerfil]);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EDF2FB] dark:bg-gray-900">
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-gray-900/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
            <ProfileAvatar profileImage={profileImage} name={`${nome} ${sobrenome}`.trim() || "Assistente Social"} size="w-10 h-10" className="border-2 border-[#ED4231] shadow" />
            <span className="font-bold text-indigo-900 dark:text-gray-100">{nome} {sobrenome}</span>
          </div>
        )}

        <div className={`transition-all duration-500 ease-in-out ${sidebarOpen ? "opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72" : "opacity-0 -translate-x-full w-0"} bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base`}>
          <div className="w-full flex justify-start mb-6">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar profileImage={profileImage} name={`${nome} ${sobrenome}`.trim() || "Assistente Social"} size="w-16 h-16" className="border-4 border-[#EDF2FB] shadow" />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">{nome} {sobrenome}</span>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">{especialidade || "Especialidade"}</Badge>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {assistenteSocialNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === item.path ? "bg-[#EDF2FB] border-l-4 border-[#ED4231]" : ""}`}>
                      <Link to={item.path} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">{item.label}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 text-[#ED4231] flex items-center gap-3" onClick={() => { localStorage.removeItem("userData"); localStorage.removeItem("profileData"); navigate("/"); }}>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ED4231" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" /></svg>
                      <span>Sair</span>
                    </div>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Sair da conta</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
            <span>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</span>
            <div className="flex gap-2"><a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">Site</a><a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a></div>
          </div>
        </div>

        <main className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? "" : "ml-0"}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ProfileAvatar profileImage={profileImage} name={`${nome} ${sobrenome}`.trim() || "Assistente Social"} size="w-10 h-10" className="border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200" />
              <span className="font-bold text-indigo-900 dark:text-gray-100">{nome} {sobrenome}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none" aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}>
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </Button>
            </div>
          </header>

          <div className="max-w-6xl mx-auto p-2 sm:p-4 md:p-8 pt-24 sm:pt-28 md:pt-24">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-6">Classificação de Usuários</h1>
            <ClassificacaoUsuarios />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ClassificacaoUsuariosPage;

