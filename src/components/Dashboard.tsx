import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, User, Clock, Menu, History, Sun, Moon, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { useUserData } from "@/hooks/useUserData";

type VoluntarioProfile = {
  nome: string;
  sobrenome: string;
  funcao: string;
  profileImage: string | null;
};

const defaultVoluntarioProfile: VoluntarioProfile = {
  nome: "",
  sobrenome: "",
  funcao: "",
  profileImage: null,
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [voluntarioProfile, setVoluntarioProfile] = useState<VoluntarioProfile>(defaultVoluntarioProfile);
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const { fetchPerfil } = useUserData();

  useEffect(() => {
    const data = localStorage.getItem("voluntarioProfileData");
    if (!data) {
      return;
    }

    try {
      const parsed = JSON.parse(data) as Partial<VoluntarioProfile>;
      setVoluntarioProfile((prev) => ({
        nome: parsed.nome ?? prev.nome,
        sobrenome: parsed.sobrenome ?? prev.sobrenome,
        funcao: parsed.funcao ?? prev.funcao,
        profileImage: parsed.profileImage ?? prev.profileImage,
      }));
    } catch (error) {
      console.error("Erro ao analisar voluntarioProfileData armazenado", error);
    }
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfile = await fetchPerfil();
        const safeProfile = (userProfile ?? {}) as Partial<VoluntarioProfile> & { fotoUrl?: string };

        setVoluntarioProfile((prev) => {
          const nextProfile: VoluntarioProfile = {
            nome: safeProfile.nome ?? prev.nome,
            sobrenome: safeProfile.sobrenome ?? prev.sobrenome,
            funcao: safeProfile.funcao ?? prev.funcao,
            profileImage: safeProfile.profileImage ?? safeProfile.fotoUrl ?? prev.profileImage,
          };

          localStorage.setItem("voluntarioProfileData", JSON.stringify(nextProfile));
          return nextProfile;
        });
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário voluntário", error);
      }
    };

    loadUserData();
  }, [fetchPerfil]);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("profileData");
    localStorage.removeItem("voluntarioProfileData");
    setShowLogoutDialog(false);
    toast({
      title: "Sessão encerrada",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/");
  };

  const displayName = `${voluntarioProfile.nome} ${voluntarioProfile.sobrenome}`.trim() || "Voluntário";

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-gray-900/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-primary text-white focus:outline-none shadow-md" aria-label="Abrir menu lateral" title="Abrir menu lateral">
              <Menu className="w-7 h-7" />
            </Button>
            <ProfileAvatar
              profileImage={voluntarioProfile.profileImage}
              name={displayName}
              size="w-10 h-10"
              className="border-2 border-primary shadow"
            />
            <span className="font-extrabold text-foreground">{displayName}</span>
          </div>
        )}

        <div
          className={`transition-all duration-500 ease-in-out
          ${sidebarOpen ? "opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72" : "opacity-0 -translate-x-full w-0"}
          bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto`}
        >
          <div className="w-full flex justify-start mb-6">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-primary text-white focus:outline-none shadow-md" aria-label="Alternar menu lateral" title="Alternar menu lateral">
              <Menu className="w-7 h-7" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar
              profileImage={voluntarioProfile.profileImage}
              name={displayName}
              size="w-16 h-16"
              className="border-4 border-background shadow"
            />
            <span className="font-extrabold text-xl text-foreground tracking-wide">{displayName}</span>
            {voluntarioProfile.funcao && <span className="text-sm text-gray-500 dark:text-gray-300">{voluntarioProfile.funcao}</span>}
          </div>

          <SidebarMenu className="gap-4 text-sm md:text-base">
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === "/home" ? "bg-[#EDF2FB] border-l-4 border-[#ED4231]" : ""}`}
                  >
                    <Link to="/home" className="flex items-center gap-3">
                      <Home className="w-6 h-6" color="#ED4231" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Painel principal com resumo</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === "/agenda" ? "bg-[#EDF2FB] border-l-4 border-[#ED4231]" : ""}`}
                  >
                    <Link to="/agenda" className="flex items-center gap-3">
                      <Calendar className="w-6 h-6" color="#ED4231" />
                      <span>Agenda</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Veja sua agenda de consultas</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === "/historico" ? "bg-[#EDF2FB] border-l-4 border-[#ED4231]" : ""}`}
                  >
                    <Link to="/historico" className="flex items-center gap-3">
                      <History className="w-6 h-6" color="#ED4231" />
                      <span>Histórico</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Veja seu histórico de consultas</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === "/agendar-horario" ? "bg-[#EDF2FB] border-l-4 border-[#ED4231]" : ""}`}
                  >
                    <Link to="/agendar-horario" className="flex items-center gap-3">
                      <Clock className="w-6 h-6" color="#ED4231" />
                      <span>Agendar Horário</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Agende uma nova consulta com um profissional</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === "/perfil" ? "bg-[#EDF2FB] border-l-4 border-[#ED4231]" : ""}`}
                  >
                    <Link to="/perfil" className="flex items-center gap-3">
                      <User className="w-6 h-6" color="#ED4231" />
                      <span>Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Edite seu perfil e foto</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 text-[#ED4231] flex items-center gap-3"
                    onClick={() => setShowLogoutDialog(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#ED4231"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    <span>Sair</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Sair da conta</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
            <span>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</span>
            <div className="flex gap-2">
              <a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">
                Site
              </a>
              <a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">
                Contato
              </a>
            </div>
          </div>
        </div>

        <main className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out ${sidebarOpen ? "" : "ml-0"}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ProfileAvatar
                profileImage={voluntarioProfile.profileImage}
                name={displayName}
                size="w-10 h-10"
                className="border-2 border-primary shadow hover:scale-105 transition-transform duration-200"
              />
              <span className="font-extrabold text-foreground">{displayName}</span>
            </div>

            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                    aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
                    tabIndex={0}
                    title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
                  >
                    {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{theme === "dark" ? "Alternar para modo claro" : "Alternar para modo escuro"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Conteúdo principal do dashboard do voluntário vem aqui */}
        </main>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar saída</DialogTitle>
            <DialogDescription>Tem certeza que deseja sair da sua conta?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLogout}>Sair</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Dashboard;
