import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Sun, Moon, User, Clock, Menu, History, Home as HomeIcon, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import ErrorMessage from "./ErrorMessage";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { motion } from "framer-motion";
import { useUserData } from "@/hooks/useUserData";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { ConsultaApiService } from "@/services/consultaApi";

// Interface para Consulta (compatível com HomeUser)
interface Consulta {
  id: number;
  profissional: string;
  especialidade: string;
  data: Date;
  tipo: string;
  status: string;
  avaliacao?: number;
}

const AgendaUser = () => {
  const [proximasConsultas, setProximasConsultas] = useState<Consulta[]>([]);
  const [consultaDetalhes, setConsultaDetalhes] = useState<Consulta | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [consultaCancelamento, setConsultaCancelamento] = useState<Consulta | null>(null);

  const { profileImage } = useProfileImage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Use the userData hook to get synchronized user data
  const { userData, fetchPerfil } = useUserData();
  const fullName = [userData?.nome, userData?.sobrenome].filter(Boolean).join(" ");
  const displayName = fullName || "Usuário";

  const location = useLocation();  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Let's add the navigate hook for page navigation
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    loadTodasConsultas();
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Synchronize user data with the backend
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfile = await fetchPerfil();
        console.log('User profile data:', userProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user data.');
  }
    };

    loadUserData();
  }, [fetchPerfil]);

  // Function to load all consultations and order them by date
  const loadTodasConsultas = async () => {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        throw new Error("Usuário não está logado");
      }

      const userDataParsed = JSON.parse(userDataStr);
      const userId = Number(userDataParsed.idUsuario || userDataParsed.id);

      if (!userId) {
        throw new Error("ID do usuário não encontrado");
      }

      const consultasData = await ConsultaApiService.getTodasConsultas();

      // Exibir apenas consultas do assistido logado
      const consultasDoUsuario = consultasData.filter(
        (consultaDto) => consultaDto.idAssistido === userId
      );

      // Convert ConsultaDto to Consulta format for compatibility
      const consultasConvertidas: Consulta[] = consultasDoUsuario.map(
        (consultaDto) => ({
          id: consultaDto.idConsulta,
          profissional:
            consultaDto.nomeVoluntario || "Profissional não informado",
          especialidade:
            consultaDto.nomeEspecialidade || "Especialidade não informada",
          data: new Date(consultaDto.horario),
          tipo:
            consultaDto.modalidade === "ONLINE"
              ? "Consulta Online"
              : "Consulta Presencial",
          status: consultaDto.status.toLowerCase(),
        })
      );

      // Filter upcoming consultations (future dates only) and sort by date (nearest first)
      const agora = new Date();
      const consultasFuturas = consultasConvertidas
        .filter((consulta) => consulta.data > agora)
        .sort((a, b) => a.data.getTime() - b.data.getTime());

      setProximasConsultas(consultasFuturas);

      toast({
        title: "Consultas carregadas",
        description: `${consultasFuturas.length} consultas futuras encontradas para sua conta`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao carregar todas as consultas:", error);
      const description =
        error instanceof Error ? error.message : "Não foi possível carregar as consultas";
      setError(description);
      toast({
        title: "Erro",
        description,
        variant: "destructive",
      });
    }
  };

  const statusColors: Record<string, string> = {
    agendada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    realizada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    remarcada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
  };

  const formatarData = (data: Date) => {
    return format(data, "dd/MM 'às' HH:mm", { locale: ptBR });
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'agendada':
        return <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'realizada':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
      case 'cancelada':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-9-9m0 0L3 3m9 9 9-9m-9 9-9 9"/></svg>;
      default:
        return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const abrirModalDetalhes = (consulta: Consulta) => {
    setConsultaDetalhes(consulta);
    setShowDetailsModal(true);
  };

  const abrirModalCancelamento = (consulta: Consulta) => {
    setConsultaCancelamento(consulta);
    setShowCancelModal(true);
  };

  // Handle logout function
  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('profileData');
    navigate('/');
    toast({
      title: "Sessão encerrada",
      description: "Você foi desconectado com sucesso.",
    });
    setShowLogoutDialog(false);
  };

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full flex flex-col md:flex-row text-base md:text-lg bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans`}>
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-[#23272F]/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md" aria-label="Abrir menu lateral" tabIndex={0} title="Abrir menu lateral">
              <Menu className="w-7 h-7" />
            </Button>
            <ProfileAvatar 
              profileImage={profileImage}
              name={displayName}
              size="w-10 h-10"
              className="border-2 border-[#ED4231] shadow"
            />
            {/* Update to use userData from hook */}
            <span className="font-bold text-indigo-900 dark:text-gray-100 text-sm md:text-lg">{displayName}</span>
          </div>
        )}
        <div className={`transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
          bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base`
        }>
          <div className="w-full flex justify-start mb-6">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
          </div>          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar 
              profileImage={profileImage}
              name={displayName}
              size="w-16 h-16"
              className="border-4 border-[#EDF2FB] shadow"
            />
            {/* Update to use userData from hook */}
            <span className="font-extrabold text-xl text-indigo-900 tracking-wide">{displayName}</span>
          </div>
          
          <SidebarMenu className="gap-4 text-sm md:text-base">
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/home-user' ? 'bg-[#ED4231]/15 dark:bg-[#ED4231]/25 border-l-4 border-[#ED4231] text-[#ED4231] dark:text-white' : ''}`}>
                    <Link to="/home-user" className="flex items-center gap-3">
                      <HomeIcon className="w-6 h-6" color="#ED4231" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Painel principal com resumo
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/agenda-user' ? 'bg-[#ED4231]/15 dark:bg-[#ED4231]/25 border-l-4 border-[#ED4231] text-[#ED4231] dark:text-white' : ''}`}>
                    <Link to="/agenda-user" className="flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6" color="#ED4231" />
                      <span>Minhas Consultas</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Veja sua agenda de consultas
                </TooltipContent>
              </Tooltip>            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/historico-user' ? 'bg-[#ED4231]/15 dark:bg-[#ED4231]/25 border-l-4 border-[#ED4231] text-[#ED4231] dark:text-white' : ''}`}>
                    <Link to="/historico-user" className="flex items-center gap-3">
                      <History className="w-6 h-6" color="#ED4231" />
                      <span>Histórico</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Veja seu histórico de consultas
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                   <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/agendar-horario-user' ? 'bg-[#ED4231]/15 dark:bg-[#ED4231]/25 border-l-4 border-[#ED4231] text-[#ED4231] dark:text-white' : ''}`}>
                    <Link to="/agendar-horario-user" className="flex items-center gap-3">
                      <Clock className="w-6 h-6" color="#ED4231" />
                      <span>Agendar Consulta</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Agende uma nova consulta com um profissional
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/profile-form-user' ? 'bg-[#ED4231]/15 dark:bg-[#ED4231]/25 border-l-4 border-[#ED4231] text-[#ED4231] dark:text-white' : ''}`}>
                    <Link to="/profile-form-user" className="flex items-center gap-3">
                      <User className="w-6 h-6" color="#ED4231" />
                      <span>Editar Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Edite seu perfil e foto
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 text-[#ED4231] flex items-center gap-3" onClick={() => setShowLogoutDialog(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ED4231" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" /></svg>
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
              <a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">Site</a>
              <a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a>
            </div>
          </div>
        </div>
        <main id="main-content" role="main" aria-label="Conteúdo principal da agenda" className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? '' : 'ml-0'}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-[#23272F]/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md transition-colors duration-300 border-b border-[#EDF2FB] dark:border-[#23272F]" role="banner" aria-label="Cabeçalho da agenda">            <div className="flex items-center gap-3">
              <ProfileAvatar 
                profileImage={profileImage}
                name={displayName}
                size="w-10 h-10"
                className="border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200"
              />
              {/* Update to use userData from hook */}
              <span className="font-bold text-indigo-900 dark:text-gray-100">{displayName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                    aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    tabIndex={0}
                    title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>          <div className="h-20" />
          <div className="max-w-5xl mx-auto p-2 md:p-6 bg-[#EDF2FB] dark:bg-[#181A20]">
            <h1 className="text-3xl md:text-4xl font-bold text-center animate-fade-in mb-4">Minhas Consultas</h1>

            {!userData.nome && (
              <div className="p-4">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            )}

            {error && (
              <div className="mb-6">
                <ErrorMessage message={error} />
              </div>
            )}

            {/* Card de Próximas Consultas (baseado no HomeUser) */}
            <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Clock className="w-5 h-5 text-[#ED4231] cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lista das suas próximas consultas agendadas</p>
                        </TooltipContent>
                      </Tooltip>
                      Próximas Consultas
                    </CardTitle>
                    <CardDescription>Consultas agendadas para os próximos dias</CardDescription>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800 cursor-help">
                        {proximasConsultas.length} agendadas
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Número total de consultas agendadas para os próximos dias</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-5 w-24" />
                          <div className="flex justify-between">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : proximasConsultas.length > 0 ? (
                  <div className="space-y-3">
                    {proximasConsultas.map((consulta) => (
                      <motion.div 
                        key={consulta.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: consulta.id * 0.1 }}
                        className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-[#ED4231]/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help">
                                    {renderStatusIcon(consulta.status)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Status: {consulta.status === 'agendada' ? 'Consulta confirmada e agendada' : 
                                           consulta.status === 'realizada' ? 'Consulta já foi realizada' : 
                                           consulta.status === 'cancelada' ? 'Consulta foi cancelada' : 'Consulta foi remarcada'}</p>
                                </TooltipContent>
                              </Tooltip>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{consulta.profissional}</span>
                            </div>
                            <Badge className={statusColors[consulta.status]}>
                              {consulta.status === 'agendada' ? 'Agendada' : 
                              consulta.status === 'realizada' ? 'Realizada' : 
                              consulta.status === 'cancelada' ? 'Cancelada' : 'Remarcada'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="m7 16 5 5 5-5" /></svg>
                                {consulta.especialidade}
                              </span>
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              <span className="inline-flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {consulta.tipo}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                            <div className="flex items-center text-[#ED4231]">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center cursor-help">
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    <span className="text-sm font-medium">{formatarData(consulta.data)}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Data e horário da consulta: {format(consulta.data, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={() => abrirModalDetalhes(consulta)}
                                  >
                                    Detalhes
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver informações detalhadas da consulta</p>
                                </TooltipContent>
                              </Tooltip>

                              {consulta.status === 'agendada' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      onClick={() => abrirModalCancelamento(consulta)}
                                    >
                                      Cancelar
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cancelar esta consulta (pode haver taxas)</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                    <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-1">Sem consultas agendadas</div>
                    <div className="text-gray-400 dark:text-gray-500 text-sm">Você não tem nenhuma consulta agendada para os próximos dias.</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Link to="/historico-user" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                  Ver histórico completo
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/agendar-horario-user">
                  <Button size="sm" className="bg-[#ED4231] hover:bg-[#d53a2a] text-white">
                    Agendar Nova Consulta
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
      <style>{`
        body.dark {
          background: linear-gradient(135deg, #181A20 0%, #23272F 60%, #181A20 100%) !important;
          color: #f3f4f6;
        }
        ::selection {
          background: #ED4231;
          color: #fff;
        }
        body.dark ::selection {
          background: #ED4231;
          color: #fff;
        }
        .dark .shadow-md, .dark .shadow-lg {
          box-shadow: none !important;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .drop-shadow-md {
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
        }
        .transition-transform {
          transition: transform 0.2s cubic-bezier(.4,0,.2,1);
        }
        .hover:scale-[1.01]:hover, .focus-within:scale-[1.01]:focus-within {
          transform: scale(1.01);
        }
        .text-green-700 {
          color: #15803d !important;
        }
        .dark .text-green-400 {
          color: #4ade80 !important;
        }
        .dark .text-gray-100, .dark .text-gray-200, .dark .text-gray-300, .dark .text-indigo-900 {
          color: #f3f4f6 !important;
        }
        .dark .text-gray-400, .dark .text-gray-500, .dark .text-gray-600 {
          color: #cbd5e1 !important;
        }
        .dark .text-indigo-900 {
          color: #a5b4fc !important;
        }
        @media (max-width: 640px) {
          .max-w-5xl {
            max-width: 100vw !important;
            padding: 0 !important;
          }
          .space-y-4 > * {
            margin-bottom: 1rem !important;
          }
          .overflow-hidden {
            overflow-x: auto !important;
          }
        }
        .badge-animate {
          animation: popBadge 0.4s cubic-bezier(.4,0,.2,1);
        }
        @keyframes popBadge {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>      {/* Modal de Detalhes da Consulta */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ED4231" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11h2v5" /><circle cx="12" cy="7" r="1" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              Detalhes da Consulta
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Informações completas sobre sua consulta agendada.
            </DialogDescription>
          </DialogHeader>

          {consultaDetalhes && (
            <div className="space-y-4 sm:space-y-6 px-1">
              {/* Informações principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Card do Profissional */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Profissional
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {consultaDetalhes.profissional}</p>
                    <p><strong>Especialidade:</strong> {consultaDetalhes.especialidade}</p>
                    <p><strong>CRM:</strong> 12345-SP</p>
                    <p><strong>Telefone:</strong> (11) 98888-8888</p>
                    <p><strong>Experiência:</strong> 15 anos</p>
                  </div>
                </div>

                {/* Card da Consulta */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
                    Consulta
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tipo:</strong> {consultaDetalhes.tipo}</p>
                    <p><strong>Data:</strong> {format(consultaDetalhes.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {format(consultaDetalhes.data, 'HH:mm')}</p>
                    <p><strong>Duração:</strong> 50 minutos</p>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <Badge className={`${statusColors[consultaDetalhes.status]} text-xs`}>
                        {consultaDetalhes.status === 'agendada' ? 'Confirmada' : 
                         consultaDetalhes.status === 'realizada' ? 'Realizada' : 
                         consultaDetalhes.status === 'cancelada' ? 'Cancelada' : 'Remarcada'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações específicas por tipo de consulta */}
              {consultaDetalhes.tipo === "Consulta Online" ? (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                    Consulta Online
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Plataforma:</strong> Google Meet</p>
                    <p><strong>Link da reunião:</strong> Será enviado 30 minutos antes da consulta</p>
                    <p><strong>Requisitos técnicos:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Conexão estável de internet</li>
                      <li>Câmera e microfone funcionando</li>
                      <li>Ambiente silencioso e privado</li>
                      <li>Navegador atualizado (Chrome, Firefox, Edge)</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    Consulta Presencial
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Local:</strong> Instituto Inovare</p>
                    <p><strong>Endereço:</strong> Rua das Flores, 123 - Centro, São Paulo/SP</p>
                    <p><strong>Sala:</strong> Consultório 2 - 2º Andar</p>
                    <p><strong>Telefone:</strong> (11) 3333-4444</p>
                    <p><strong>O que levar:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1 mb-3">
                      <li>Documento de identidade com foto</li>
                      <li>Carteirinha do convênio (se aplicável)</li>
                      <li>Exames anteriores relacionados ao problema</li>
                      <li>Lista de medicamentos em uso</li>
                      <li>Histórico médico familiar</li>
                    </ul>
                    <p><strong>Preparação necessária:</strong></p>
                    <p className="mt-1">Para esta consulta de {consultaDetalhes.especialidade}, não é necessária preparação especial. Venha com suas dúvidas anotadas para aproveitar melhor o tempo.</p>
                  </div>
                </div>
              )}

              {/* Histórico com o profissional (se houver) */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5M3 21v-5h5m13-13v5h-5m5 5v5h-5"/></svg>
                  Histórico
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Consultas com este profissional:</strong> {consultaDetalhes.status === 'realizada' ? '2 (incluindo esta)' : '1ª consulta'}</p>
                  {consultaDetalhes.status === 'realizada' && (
                    <p><strong>Última consulta:</strong> {format(new Date(2025, 3, 10), "dd/MM/yyyy")}</p>
                  )}
                  <p><strong>Total de consultas na plataforma:</strong> 8</p>
                  {consultaDetalhes.status === 'realizada' && consultaDetalhes.avaliacao && (
                    <div className="flex items-center gap-2">
                      <strong>Sua avaliação:</strong>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, index) => (
                          <svg
                            key={index}
                            className={`w-4 h-4 ${index < consultaDetalhes.avaliacao! ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span>({consultaDetalhes.avaliacao}/5)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lembrete para consulta agendada */}
              {consultaDetalhes.status === 'agendada' && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    Lembrete
                  </h4>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p>Você receberá lembretes desta consulta:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>24 horas antes - Email e SMS</li>
                      <li>2 horas antes - Notificação push</li>
                      <li>30 minutos antes - {consultaDetalhes.tipo === "Consulta Online" ? "Link da reunião" : "Lembrete final"}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Fechar
            </Button>
            {consultaDetalhes?.status === 'agendada' && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowDetailsModal(false);
                  abrirModalCancelamento(consultaDetalhes);
                }}
              >
                Cancelar Consulta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Cancelar Consulta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {consultaCancelamento && (
            <div className="py-4">
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Detalhes da Consulta</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Consulta que será cancelada</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                      {consultaCancelamento.tipo}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Profissional:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{consultaCancelamento.profissional}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Especialidade:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{consultaCancelamento.especialidade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Data/Hora:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{format(consultaCancelamento.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Política de Cancelamento</p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Cancelamentos com menos de 24 horas de antecedência podem estar sujeitos a taxas. 
                      Consulte os termos de uso para mais informações.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Manter Consulta
            </Button>            <Button 
              variant="destructive" 
              onClick={async () => {
                if (!consultaCancelamento) return;
                
                try {
                  await ConsultaApiService.cancelarConsulta(consultaCancelamento.id);
                  toast({
                    title: "Consulta cancelada",
                    description: "Sua consulta foi cancelada com sucesso.",
                    variant: "destructive"
                  });
                  setShowCancelModal(false);
                  setConsultaCancelamento(null);
                  loadTodasConsultas(); // Reload consultations to reflect the change
                } catch (error) {
                  console.error('Erro ao cancelar consulta:', error);
                  toast({
                    title: "Erro ao cancelar consulta",
                    description: "Ocorreu um erro ao cancelar sua consulta. Tente novamente.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Deseja realmente sair?</DialogTitle>
            <DialogDescription>Você será desconectado da sua conta.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancelar</Button>
            <Button variant="default" onClick={handleLogout} className="bg-[#ED4231] hover:bg-[#D63A2A] text-white font-medium">
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};
export default AgendaUser;
