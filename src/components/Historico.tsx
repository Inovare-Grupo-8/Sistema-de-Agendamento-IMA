import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, User, Clock, Menu, History, Calendar, Search, Star, Filter, FileText, Sun, Moon, Home as HomeIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import ErrorMessage from "./ErrorMessage";
import { STATUS_COLORS } from "../constants/ui";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { useTranslation } from "react-i18next";
import { AgendaCardSkeleton } from "./ui/custom-skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@/hooks/useUser";
import { useProfessional } from "@/hooks/useProfessional";

interface HistoricoAtendimento {
  date: Date;
  time: string;
  patientName: string;
  type: string;
  serviceType: string;
  status: "realizada" | "cancelada" | "remarcada";
  feedback?: {
    rating: number;
    comment?: string;
  };
  observation?: string;
}

const Historico = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [historicoAtendimentos, setHistoricoAtendimentos] = useState<HistoricoAtendimento[]>([
    { 
      date: new Date(2025, 1, 10), 
      time: "09:00", 
      patientName: "João Silva", 
      type: "Psicologia", 
      serviceType: "Atendimento Online", 
      status: "realizada", 
      feedback: { rating: 5, comment: "Excelente atendimento, muito atencioso." } 
    },
    { 
      date: new Date(2025, 1, 15), 
      time: "10:30", 
      patientName: "Maria Oliveira", 
      type: "Psicologia", 
      serviceType: "Consulta Presencial", 
      status: "realizada",
      feedback: { rating: 4 } 
    },
    { 
      date: new Date(2025, 2, 5), 
      time: "14:00", 
      patientName: "Pedro Santos", 
      type: "Psicologia", 
      serviceType: "Atendimento Online",
      status: "cancelada" 
    },
    { 
      date: new Date(2025, 2, 12), 
      time: "11:00", 
      patientName: "Ana Costa", 
      type: "Psicologia", 
      serviceType: "Atendimento Online",
      status: "remarcada" 
    },
    { 
      date: new Date(2025, 2, 20), 
      time: "15:30", 
      patientName: "Carlos Pereira", 
      type: "Psicologia", 
      serviceType: "Consulta Presencial", 
      status: "realizada", 
      observation: "Paciente relatou melhora dos sintomas de ansiedade."
    },
    { 
      date: new Date(2025, 3, 8), 
      time: "16:00", 
      patientName: "Lucia Ferreira", 
      type: "Psicologia", 
      serviceType: "Atendimento Online", 
      status: "realizada", 
      feedback: { rating: 5, comment: "Profissional muito competente e empático." } 
    }
  ]);

  const [formData, setFormData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileImage, setProfileImage] = useState("/image/perfilProfile.svg");  const [loading, setLoading] = useState(true);
  const [observationInput, setObservationInput] = useState<{[key: string]: string}>({});
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const { professionalData } = useProfessional();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleAddObservation = (atendimento: HistoricoAtendimento, observation: string) => {
    if (!observation.trim()) return;
    
    setHistoricoAtendimentos(prev => prev.map(a => {
      if (a.date.getTime() === atendimento.date.getTime() && a.time === atendimento.time && a.patientName === atendimento.patientName) {
        return {
          ...a,
          observation
        };
      }
      return a;
    }));
    
    setObservationInput({});
    toast({
      title: "Observação salva!",
      description: "Sua observação foi registrada com sucesso.",
      variant: "default"
    });
  };

  const filteredHistorico = historicoAtendimentos
    .filter(atendimento => {
      // Filtro por status
      if (filterStatus && atendimento.status !== filterStatus) return false;
      
      // Filtro por termo de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          atendimento.patientName.toLowerCase().includes(searchLower) ||
          atendimento.type.toLowerCase().includes(searchLower) ||
          atendimento.serviceType.toLowerCase().includes(searchLower) ||
          format(atendimento.date, "dd/MM/yyyy").includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // Ordenando do mais recente para o mais antigo

  const statusColors: Record<string, string> = {
    realizada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    remarcada: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-gray-900/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md" aria-label="Abrir menu lateral" tabIndex={0} title="Abrir menu lateral">
              <Menu className="w-7 h-7" />
            </Button>
            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
            <span className="font-bold text-foreground">Dr. {professionalData.nome} {professionalData.sobrenome}</span>
          </div>
        )}
        
        <div className={`transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
          bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto`}
        >
          <div className="w-full flex justify-start mb-6">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src={profileImage} alt="Foto de perfil" className="w-16 h-16 rounded-full border-4 border-background shadow" />
            <span className="font-extrabold text-xl text-foreground tracking-wide">Dr. {professionalData.nome} {professionalData.sobrenome}</span>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              {professionalData.especialidade}
            </Badge>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/home' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to="/home" className="flex items-center gap-3">
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
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/agenda' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to="/agenda" className="flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6" color="#ED4231" />
                      <span>Minha Agenda</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Veja sua agenda de atendimentos
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/historico' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to="/historico" className="flex items-center gap-3">
                      <History className="w-6 h-6" color="#ED4231" />
                      <span>Histórico</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Veja seu histórico de atendimentos
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/disponibilizar-horario' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to="/disponibilizar-horario" className="flex items-center gap-3">
                      <Clock className="w-6 h-6" color="#ED4231" />
                      <span>Disponibilizar Horário</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Disponibilize novos horários para atendimento
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/profile-form' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to="/profile-form" className="flex items-center gap-3">
                      <User className="w-6 h-6" color="#ED4231" />
                      <span>Editar Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Edite seu perfil e foto
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 text-[#ED4231] flex items-center gap-3" onClick={() => setShowLogoutDialog(true)}>
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ED4231" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" /></svg>
                      <span>Sair</span>
                    </span>
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

        <main id="main-content" role="main" aria-label="Conteúdo principal" className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? '' : 'ml-0'}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-primary shadow hover:scale-105 transition-transform duration-200" />
              <span className="font-bold text-foreground">Dr. {professionalData.nome} {professionalData.sobrenome}</span>
            </div>
            <div className="flex items-center gap-3">              <Button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </Button>
            </div>
          </header>

          <div className="max-w-5xl mx-auto p-4 md:p-8 pt-24 md:pt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100">Histórico de Atendimentos</h1>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente, tipo..."
                    className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Buscar no histórico"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setFilterStatus(null)}
                    variant="outline"
                    className={`flex items-center gap-2 ${filterStatus === null ? "bg-[#ED4231]" : ""}`}
                  >
                    <Filter size={16} />
                    <span>Todos</span>
                  </Button>
                  <Button 
                    onClick={() => setFilterStatus("realizada")}
                    variant="outline"
                    className={`flex items-center gap-2 ${filterStatus === "realizada" ? "bg-[#ED4231]" : ""}`}
                  >
                    <Calendar size={16} />
                    <span>Realizadas</span>
                  </Button>
                  <Button 
                    onClick={() => setFilterStatus("cancelada")}
                    variant="outline"
                    className={`flex items-center gap-2 ${filterStatus === "cancelada" ? "bg-[#ED4231]" : ""}`}
                  >
                    <FileText size={16} />
                    <span>Canceladas</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4" role="region" aria-label="Lista de atendimentos históricos" ref={listRef}>
              {loading ? (
                <div className="space-y-4" aria-busy="true" aria-live="polite">
                  {[...Array(3)].map((_, i) => <AgendaCardSkeleton key={i} />)}
                </div>
              ) : error ? (
                <ErrorMessage message={error} />
              ) : filteredHistorico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                  <History className="w-20 h-20 mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                  <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-2">Nenhum atendimento encontrado</div>
                  <div className="text-gray-400 dark:text-gray-500 text-sm">Não há registros que correspondam à sua busca.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistorico.map((atendimento, index) => (
                    <motion.div
                      key={`${format(atendimento.date, "yyyy-MM-dd")}-${atendimento.time}-${atendimento.patientName}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white dark:bg-[#181A20] rounded-lg border border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.01] hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-[#ED4231]" />
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {format(atendimento.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {atendimento.time}
                            </span>
                          </div>
                          <Badge className={`${statusColors[atendimento.status]} px-3 py-1 rounded-full text-xs font-medium`}>
                            {atendimento.status === "realizada" ? "Realizada" : 
                             atendimento.status === "cancelada" ? "Cancelada" : "Remarcada"}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-800 dark:text-gray-200">{atendimento.patientName}</span>
                          </div>
                          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <span>{atendimento.type}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{atendimento.serviceType}</span>
                          </div>
                        </div>

                        {atendimento.status === "realizada" && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            {atendimento.feedback && (
                              <div className="mb-4">
                                <div className="flex items-center gap-1 mb-2">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avaliação do paciente:</span>
                                  <div className="flex gap-1 ml-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star} 
                                        size={16} 
                                        fill={star <= (atendimento.feedback?.rating || 0) ? "#ED4231" : "transparent"} 
                                        stroke={star <= (atendimento.feedback?.rating || 0) ? "#ED4231" : "#94A3B8"} 
                                      />
                                    ))}
                                  </div>
                                </div>
                                {atendimento.feedback.comment && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800/50 p-2 rounded italic">
                                    "{atendimento.feedback.comment}"
                                  </p>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-3">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Observações clínicas:</span>
                              
                              {atendimento.observation ? (
                                <div className="relative">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800/50">
                                    {atendimento.observation}
                                  </p>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="absolute top-0 right-0 m-2"
                                    onClick={() => setObservationInput({
                                      ...observationInput,
                                      [`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`]: atendimento.observation
                                    })}
                                  >
                                    Editar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  <textarea
                                    value={observationInput[`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`] || ''}
                                    onChange={(e) => setObservationInput({
                                      ...observationInput,
                                      [`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`]: e.target.value
                                    })}
                                    placeholder="Adicione observações clínicas sobre este atendimento..."
                                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#23272F] text-sm resize-y min-h-[80px]"
                                  />
                                  <Button
                                    onClick={() => handleAddObservation(
                                      atendimento,
                                      observationInput[`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`] || ''
                                    )}
                                    size="sm"
                                    className="self-end"
                                  >
                                    Salvar Observações
                                  </Button>
                                </div>
                              )}
                              
                              {observationInput[`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`] !== undefined && 
                               atendimento.observation && (
                                <div className="flex flex-col gap-2 mt-3">
                                  <textarea
                                    value={observationInput[`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`]}
                                    onChange={(e) => setObservationInput({
                                      ...observationInput,
                                      [`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`]: e.target.value
                                    })}
                                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#23272F] text-sm resize-y min-h-[80px]"
                                  />
                                  <div className="flex gap-2 self-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newInputs = { ...observationInput };
                                        delete newInputs[`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`];
                                        setObservationInput(newInputs);
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      onClick={() => handleAddObservation(
                                        atendimento,
                                        observationInput[`${atendimento.date.getTime()}-${atendimento.time}-${atendimento.patientName}`] || ''
                                      )}
                                      size="sm"
                                    >
                                      Atualizar
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {filteredHistorico.length > 5 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Voltar ao topo</span>
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Historico;
