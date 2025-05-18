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
import { useTheme } from "next-themes";
import { STATUS_COLORS } from "../constants/ui";
import { useTranslation } from "react-i18next";
import { AgendaCardSkeleton } from "./ui/custom-skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getUserNavigationPath, userNavigationItems } from "@/utils/userNavigation";

interface HistoricoConsulta {
  date: Date;
  time: string;
  name: string;
  type: string;
  serviceType: string;
  status: "realizada" | "cancelada" | "remarcada";
  feedback?: {
    rating: number;
    comment?: string;
  };
}

const HistoricoUser = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [historicoConsultas, setHistoricoConsultas] = useState<HistoricoConsulta[]>([
    { 
      date: new Date(2025, 1, 10), 
      time: "09:00", 
      name: "Dr. Ricardo Santos", 
      type: "Psicologia", 
      serviceType: "Atendimento Online", 
      status: "realizada", 
      feedback: { rating: 5, comment: "Excelente atendimento, muito atencioso." } 
    },
    { 
      date: new Date(2025, 1, 15), 
      time: "10:30", 
      name: "Dra. Carolina Mendes", 
      type: "Nutrição", 
      serviceType: "Consulta Presencial", 
      status: "realizada",
      feedback: { rating: 4 } 
    },
    { 
      date: new Date(2025, 2, 5), 
      time: "14:00", 
      name: "Dr. Marcelo Pereira", 
      type: "Fisioterapia", 
      serviceType: "Atendimento Online", 
      status: "cancelada" 
    },
    { 
      date: new Date(2025, 3, 1), 
      time: "15:30", 
      name: "Dra. Juliana Costa", 
      type: "Psicologia", 
      serviceType: "Consulta Presencial", 
      status: "remarcada" 
    },
    { 
      date: new Date(2025, 3, 20), 
      time: "19:00", 
      name: "Dr. Felipe Oliveira", 
      type: "Psicologia", 
      serviceType: "Atendimento Online", 
      status: "realizada",
      feedback: { rating: 5, comment: "Muito bom, estou me sentindo melhor." } 
    },
    { 
      date: new Date(2025, 4, 10), 
      time: "20:30", 
      name: "Dra. Isabela Martins", 
      type: "Nutrição", 
      serviceType: "Consulta Presencial", 
      status: "realizada",
      feedback: { rating: 3, comment: "Atendimento ok, mas esperava mais detalhes no plano alimentar." } 
    },
  ]);

  const { profileImage } = useProfileImage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("profileData");
    return savedData ? JSON.parse(savedData) : { nome: "", sobrenome: "" };
  });

  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const { theme = "light", setTheme = () => {} } = useTheme();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleAddFeedback = (consulta: HistoricoConsulta, rating: number, comment?: string) => {
    setHistoricoConsultas(prev => prev.map(c => {
      if (c.date.getTime() === consulta.date.getTime() && c.time === consulta.time) {
        return {
          ...c,
          feedback: { rating, comment }
        };
      }
      return c;
    }));
    toast({
      title: "Feedback enviado!",
      description: "Obrigado pela sua avaliação.",
      variant: "default"
    });
  };

  const filteredHistorico = historicoConsultas
    .filter(consulta => {
      // Filtro por status
      if (filterStatus && consulta.status !== filterStatus) return false;
      
      // Filtro por texto de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          consulta.name.toLowerCase().includes(searchLower) ||
          consulta.type.toLowerCase().includes(searchLower) ||
          consulta.serviceType.toLowerCase().includes(searchLower) ||
          format(consulta.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }).toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // Ordenar por data mais recente primeiro

  const statusColors = {
    realizada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    remarcada: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full flex flex-col md:flex-row text-base md:text-lg bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans`}>
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md" aria-label="Abrir menu lateral" tabIndex={0} title="Abrir menu lateral">
              <Menu className="w-7 h-7" />
            </Button>
            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
            <span className="font-bold text-indigo-900 text-sm md:text-lg">{formData?.nome} {formData?.sobrenome}</span>
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
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src={profileImage} alt="Logo" className="w-16 h-16 rounded-full border-4 border-[#EDF2FB] shadow" />
            <span className="font-extrabold text-xl text-indigo-900 tracking-wide">{formData?.nome} {formData?.sobrenome}</span>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {/* Uniform sidebar navigation using the items from userNavigationItems */}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === userNavigationItems.home.path ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to={userNavigationItems.home.path} className="flex items-center gap-3">
                      {userNavigationItems.home.icon}
                      <span>{userNavigationItems.home.label}</span>
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
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === userNavigationItems.agenda.path ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to={userNavigationItems.agenda.path} className="flex items-center gap-3">
                      {userNavigationItems.agenda.icon}
                      <span>{userNavigationItems.agenda.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">
                  Veja sua agenda de consultas
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === userNavigationItems.historico.path ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to={userNavigationItems.historico.path} className="flex items-center gap-3">
                      {userNavigationItems.historico.icon}
                      <span>{userNavigationItems.historico.label}</span>
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
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === userNavigationItems.agendar.path ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to={userNavigationItems.agendar.path} className="flex items-center gap-3">
                      {userNavigationItems.agendar.icon}
                      <span>{userNavigationItems.agendar.label}</span>
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
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === userNavigationItems.perfil.path ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to={userNavigationItems.perfil.path} className="flex items-center gap-3">
                      {userNavigationItems.perfil.icon}
                      <span>{userNavigationItems.perfil.label}</span>
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

        <main id="main-content" role="main" aria-label="Conteúdo principal do histórico" className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? '' : 'ml-0'}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-[#23272F]/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md transition-colors duration-300 border-b border-[#EDF2FB] dark:border-[#23272F]" role="banner" aria-label="Cabeçalho do histórico">
            <div className="flex items-center gap-3">
              <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200" />
              <span className="font-bold text-indigo-900 dark:text-gray-100">{t('name')} {formData?.nome} {formData?.sobrenome}</span>
            </div>
            <div className="flex items-center gap-3">              <Button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                tabIndex={0}
                title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </Button>
            </div>
          </header>
          <div className="h-20" />
          <div className="max-w-5xl mx-auto p-2 md:p-6 bg-[#EDF2FB] dark:bg-[#181A20]">
            <div className="max-w-6xl mx-auto p-4 md:p-8 pt-24 md:pt-10">
              {/* Add proper navigation breadcrumb */}
              {getUserNavigationPath(location.pathname)}
              
              {/* Rest of the component content */}
              <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-2">
                Histórico de Consultas
              </h1>
            </div>

            {!formData.nome && (
              <div className="p-4">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-full flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar consulta, profissional, especialidade..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23272F] focus:outline-none focus:ring-2 focus:ring-[#ED4231] transition-colors"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setFilterStatus(filterStatus === "realizada" ? null : "realizada")}
                      variant={filterStatus === "realizada" ? "default" : "outline"}
                      className={`flex items-center gap-2 ${filterStatus === "realizada" ? "bg-[#ED4231]" : ""}`}
                    >
                      <FileText size={16} />
                      <span>Realizadas</span>
                    </Button>
                    <Button
                      onClick={() => setFilterStatus(filterStatus === "cancelada" ? null : "cancelada")}
                      variant={filterStatus === "cancelada" ? "default" : "outline"}
                      className={`flex items-center gap-2 ${filterStatus === "cancelada" ? "bg-[#ED4231]" : ""}`}
                    >
                      <FileText size={16} />
                      <span>Canceladas</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-4" role="region" aria-label="Lista de consultas históricas" ref={listRef}>
                  {loading ? (
                    <div className="space-y-4" aria-busy="true" aria-live="polite">
                      {[...Array(3)].map((_, i) => <AgendaCardSkeleton key={i} />)}
                    </div>
                  ) : error ? (
                    <ErrorMessage message={error} />
                  ) : filteredHistorico.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                      <History className="w-20 h-20 mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                      <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-2">Nenhuma consulta encontrada</div>
                      <div className="text-gray-400 dark:text-gray-500 text-sm">Não há registros que correspondam à sua busca.</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredHistorico.map((consulta, index) => (
                        <motion.div
                          key={`${format(consulta.date, "yyyy-MM-dd")}-${consulta.time}`}
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
                                  {format(consulta.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {consulta.time}
                                </span>
                              </div>
                              <Badge className={`${statusColors[consulta.status]} px-3 py-1 rounded-full text-xs font-medium`}>
                                {consulta.status === "realizada" ? "Realizada" : 
                                 consulta.status === "cancelada" ? "Cancelada" : "Remarcada"}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{consulta.name}</span>
                              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{consulta.type}</span>
                                <span className="hidden md:inline text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{consulta.serviceType}</span>
                              </div>
                            </div>

                            {consulta.status === "realizada" && (
                              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                {consulta.feedback ? (
                                  <div>
                                    <div className="flex items-center gap-1 mb-2">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sua avaliação:</span>
                                      <div className="flex gap-1 ml-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star 
                                            key={star} 
                                            size={16} 
                                            fill={star <= (consulta.feedback?.rating || 0) ? "#ED4231" : "transparent"} 
                                            stroke={star <= (consulta.feedback?.rating || 0) ? "#ED4231" : "#94A3B8"} 
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    {consulta.feedback.comment && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                                        "{consulta.feedback.comment}"
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avalie esta consulta:</span>
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            onClick={() => handleAddFeedback(consulta, star)}
                                            className="focus:outline-none"
                                            title={`${star} estrelas`}
                                          >
                                            <Star 
                                              size={20} 
                                              className="text-gray-300 hover:text-[#ED4231] transition-colors" 
                                            />
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {filteredHistorico.length > 5 && (
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#ED4231] text-white shadow-lg hover:bg-[#c32d22] focus:outline-none focus:ring-2 focus:ring-[#ED4231] animate-fade-in transition-transform duration-200 hover:scale-110 active:scale-95"
                aria-label="Voltar ao topo"
              >
                ↑
              </Button>
            )}
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
      `}</style>
    </SidebarProvider>
  );
};

export default HistoricoUser;
