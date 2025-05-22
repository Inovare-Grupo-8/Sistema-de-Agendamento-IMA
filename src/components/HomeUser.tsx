import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, User, Clock, Menu, History, ChevronRight, Sun, Moon, Home as HomeIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import ErrorMessage from "./ErrorMessage";
import { STATUS_COLORS } from "../constants/ui";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { userNavigationItems } from "@/utils/userNavigation";

interface ConsultaSummary {
  total: number;
  proxima: Date | null;
  canceladas: number;
}

interface AtendimentoSummary {
  realizados: number;
  proximos: number;
  ultimaAvaliacao: number | null;
}

const HomeUser = () => {
  const { t } = useTranslation();
  const location = useLocation();  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const [userData, setUserData] = useState(() => {
    const savedData = localStorage.getItem("userData");
    return savedData ? JSON.parse(savedData) : {
      nome: "Maria",
      sobrenome: "Silva",
      email: "maria.silva@email.com"
    };
  });
    // Estado para o calendário
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const savedDate = localStorage.getItem("selectedDateForBooking");
    return savedDate ? new Date(savedDate) : undefined;
  });

  // Salvar a data selecionada no localStorage sempre que ela mudar
  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem("selectedDateForBooking", selectedDate.toISOString());
    }
  }, [selectedDate]);

  // Estado para o resumo dos dados
  const [consultasSummary, setConsultasSummary] = useState<ConsultaSummary>({
    total: 0,
    proxima: null,
    canceladas: 0
  });

  // Adicionando estado para o status da próxima consulta
  const [proximaConsultaData, setProximaConsultaData] = useState<{
    profissional: string;
    especialidade: string;
    tipo: string;
    status: string;
  } | null>(null);

  // Estado para o resumo dos dados
  const [atendimentosSummary, setAtendimentosSummary] = useState<AtendimentoSummary>({
    realizados: 0,
    proximos: 0,
    ultimaAvaliacao: null
  });

  // Dados de exemplo para as próximas consultas
  const [proximasConsultas, setProximasConsultas] = useState([
    {
      id: 1,
      profissional: "Dr. Ricardo Santos",
      especialidade: "Psicologia",
      data: new Date(2025, 4, 18, 10, 0), // 18 de maio de 2025, 10:00
      tipo: "Consulta Online",
      status: "agendada"
    },
    {
      id: 2,
      profissional: "Dra. Ana Costa",
      especialidade: "Nutrição",
      data: new Date(2025, 4, 20, 14, 30), // 20 de maio de 2025, 14:30
      tipo: "Consulta Presencial",
      status: "agendada"
    }
  ]);

  // Dados de exemplo para o histórico recente
  const [historicoRecente, setHistoricoRecente] = useState([
    {
      id: 1,
      profissional: "Dr. Carlos Pereira",
      especialidade: "Psicologia",
      data: new Date(2025, 4, 10, 11, 0), // 10 de maio de 2025, 11:00
      tipo: "Consulta Online",
      status: "realizada",
      avaliacao: 5
    },
    {
      id: 2,
      profissional: "Dra. Lucia Ferreira",
      especialidade: "Nutrição",
      data: new Date(2025, 4, 12, 15, 0), // 12 de maio de 2025, 15:00
      tipo: "Consulta Presencial",
      status: "realizada",
      avaliacao: 4
    },
    {
      id: 3,
      profissional: "Dr. Ricardo Santos",
      especialidade: "Psicologia",
      data: new Date(2025, 4, 8, 17, 30), // 8 de maio de 2025, 17:30
      tipo: "Consulta Online",
      status: "cancelada"
    }
  ]);

  // Simular o carregamento de dados
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        // Simulando dados de consultas
        const proximaData = new Date(2025, 4, 18, 10, 0); // 18 de maio de 2025, 10:00
        setConsultasSummary({
          total: 5,
          proxima: proximaData,
          canceladas: 1
        });
        
        // Preencher dados da próxima consulta
        if (proximasConsultas.length > 0) {
          const proximaConsulta = proximasConsultas.find(c => 
            c.data.toDateString() === proximaData.toDateString()
          );
          
          if (proximaConsulta) {
            setProximaConsultaData({
              profissional: proximaConsulta.profissional,
              especialidade: proximaConsulta.especialidade,
              tipo: proximaConsulta.tipo,
              status: proximaConsulta.status
            });
          }
        }
        
        // Simulando dados de atendimentos
        setAtendimentosSummary({
          realizados: 8,
          proximos: 2,
          ultimaAvaliacao: 5
        });
        
        setLoading(false);
      } catch (err) {
        setError("Erro ao carregar dados do dashboard");
        setLoading(false);
      }
    }, 1000);
  }, [proximasConsultas]);

  const statusColors: Record<string, string> = {
    agendada: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    realizada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    remarcada: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  };

  // Função para formatar a data
  const formatarData = (data: Date) => {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje às ${format(data, 'HH:mm')}`;
    } else if (data.toDateString() === amanha.toDateString()) {
      return `Amanhã às ${format(data, 'HH:mm')}`;
    } else {
      return `${format(data, "dd/MM", { locale: ptBR })} às ${format(data, 'HH:mm')}`;
    }
  };

  // Calcular estrelas para avaliação
  const renderEstrelas = (avaliacao: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill={i < Math.round(avaliacao) ? "#ED4231" : "none"} 
        stroke="#ED4231" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ));
  };
  
  // Renderizar ícone de status
  const renderStatusIcon = (status: string) => {
    switch(status) {
      case 'agendada':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
          </svg>
        );
      case 'realizada':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
          </svg>
        );
      case 'cancelada':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
          </svg>
        );
      case 'remarcada':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans text-base">
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-[#23272F]/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md" aria-label="Abrir menu lateral" tabIndex={0} title="Abrir menu lateral">
              <Menu className="w-7 h-7" />
            </Button>
            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
            <span className="font-bold text-indigo-900 dark:text-gray-100">{userData?.nome} {userData?.sobrenome}</span>
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
            <img src={profileImage} alt="Foto de perfil" className="w-16 h-16 rounded-full border-4 border-[#EDF2FB] shadow" />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">{userData?.nome} {userData?.sobrenome}</span>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {/* Substituir os items de menu por uma iteração do userNavigationItems */}
            {Object.values(userNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === item.path ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                      <Link to={item.path} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
            
            {/* Botão de Sair permanece o mesmo */}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 text-[#ED4231] flex items-center gap-3">
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

        <main id="main-content" role="main" aria-label="Conteúdo principal do dashboard" className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? '' : 'ml-0'}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-[#23272F]/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md transition-colors duration-300 border-b border-[#EDF2FB] dark:border-[#23272F]" role="banner" aria-label="Cabeçalho do dashboard">
            <div className="flex items-center gap-3">
              <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200" />
              <span className="font-bold text-indigo-900 dark:text-gray-100">{userData?.nome} {userData?.sobrenome}</span>
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

          <div className="max-w-6xl mx-auto p-4 md:p-8 pt-24 md:pt-10">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-2">Dashboard</h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
                Bem-vindo(a), {userData?.nome}! Aqui está o resumo das suas consultas.
              </p>
            
              {error && <ErrorMessage message={error} />}
              
              {/* Cards do dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Card de Consultas */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#ED4231]" />
                      Minhas Consultas
                    </CardTitle>
                    <CardDescription>Visão geral das suas consultas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md"
                          >
                            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{consultasSummary.total}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">Total</span>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-md"
                          >
                            <span className="text-lg font-bold text-green-700 dark:text-green-300">{atendimentosSummary.proximos}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">Próximas</span>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-md"
                          >
                            <span className="text-lg font-bold text-red-700 dark:text-red-300">{consultasSummary.canceladas}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">Canceladas</span>
                          </motion.div>
                        </div>
                        
                        {consultasSummary.proxima ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mt-3 border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:border-[#ED4231]/30 dark:hover:border-[#ED4231]/30 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Próxima consulta:</h3>
                              {proximaConsultaData && (
                                <div className="flex items-center gap-1">
                                  {renderStatusIcon(proximaConsultaData.status)}
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Status: {proximaConsultaData.status === 'agendada' ? 'Confirmada' : 
                                           proximaConsultaData.status === 'realizada' ? 'Realizada' : 
                                           proximaConsultaData.status === 'cancelada' ? 'Cancelada' : 'Remarcada'}
                                  </span>
                                </div>
                              )}
                            </div>
                            {proximaConsultaData ? (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{proximaConsultaData.profissional}</span>
                                  <Badge className={statusColors[proximaConsultaData.status]}>
                                    {proximaConsultaData.especialidade}
                                  </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">{proximaConsultaData.tipo}</span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {consultasSummary.proxima.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                  </span>
                                </div>                                <div className="flex items-center gap-2 mt-2 border-t border-dashed border-gray-200 dark:border-gray-700 pt-2">
                                  <Clock className="w-4 h-4 text-[#ED4231]" />
                                  <span className="text-sm font-medium text-[#ED4231]">
                                    {formatarData(consultasSummary.proxima)}
                                  </span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs flex gap-1 items-center flex-1 border-[#ED4231] text-[#ED4231] hover:bg-[#ED4231]/10"
                                    onClick={() => toast({
                                      title: "Ação em desenvolvimento",
                                      description: "A funcionalidade de cancelamento estará disponível em breve",
                                      variant: "destructive",
                                      duration: 3000,
                                    })}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12Z" /><path d="m10 11 4 4m0-4-4 4" /><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>
                                    Cancelar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs flex gap-1 items-center flex-1 border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                    onClick={() => toast({
                                      title: "Ação em desenvolvimento",
                                      description: "Os detalhes completos estarão disponíveis em breve",
                                      duration: 3000,
                                    })}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11h2v5" /><circle cx="12" cy="7" r="1" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    Detalhes
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2">
                                <span className="text-sm text-indigo-900 dark:text-indigo-300">
                                  {formatarData(consultasSummary.proxima)}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="mt-2 text-center py-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg"
                          >
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Você não tem consultas agendadas
                            </span>
                            <div className="mt-2">
                              <Link to="/agendar-horario-user">
                                <Button size="sm" variant="outline" className="text-xs border-[#ED4231] text-[#ED4231] hover:bg-[#ED4231]/10">
                                  Agendar Consulta
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Link to="/consultas-user" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Ver todas as consultas
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {!loading && consultasSummary.proxima && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1 text-xs p-0 h-auto text-gray-500 hover:text-[#ED4231]"
                        onClick={() => toast({
                          title: "Lembrete configurado",
                          description: "Você receberá um lembrete antes da consulta",
                          duration: 3000,
                        })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                        Lembrar-me
                      </Button>
                    )}
                  </CardFooter>
                </Card>

                {/* Card de Atendimentos */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#ED4231]" />
                      Meu Histórico
                    </CardTitle>
                    <CardDescription>Histórico de consultas realizadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-28" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Consultas realizadas:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{atendimentosSummary.realizados}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Próximas consultas:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{atendimentosSummary.proximos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Última avaliação:</span>
                          <span className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                            {atendimentosSummary.ultimaAvaliacao !== null ? (
                              <div className="flex">
                                {renderEstrelas(atendimentosSummary.ultimaAvaliacao)}
                              </div>
                            ) : "N/A"}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link to="/historico-user" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Ver histórico completo
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>                {/* Card de Calendário (substituindo Ações Rápidas) */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-[#ED4231]" />
                      Calendário
                    </CardTitle>
                    <CardDescription>Selecione uma data para agendar</CardDescription>
                  </CardHeader>
                  <CardContent>                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            // Verificar se há consultas nesta data
                            const consultasNaData = proximasConsultas.filter(
                              consulta => consulta.data.toDateString() === date.toDateString()
                            );
                            
                            if (consultasNaData.length > 0) {
                              toast({
                                title: `${consultasNaData.length} consulta${consultasNaData.length > 1 ? 's' : ''} nesta data`,
                                description: "Você já possui consultas agendadas para esta data.",
                                variant: "default",
                                duration: 3000,
                              });
                            } else {
                              toast({
                                title: "Data selecionada",
                                description: `Você selecionou ${format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
                                duration: 3000,
                              });
                            }
                          }
                        }}
                        className="rounded-md border border-[#EDF2FB] dark:border-[#444857]"
                        locale={ptBR}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        modifiers={{
                          booked: (date) => proximasConsultas.some(
                            consulta => consulta.data.toDateString() === date.toDateString()
                          ),
                        }}
                        modifiersStyles={{
                          booked: {
                            backgroundColor: "rgba(237, 66, 49, 0.1)",
                            borderColor: "rgba(237, 66, 49, 0.5)",
                            color: "#ED4231",
                            fontWeight: "bold",
                          }
                        }}
                      />
                    </div>{selectedDate && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md"
                      >
                        <div className="text-center">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Data selecionada: <span className="font-semibold">{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            {format(selectedDate, "EEEE", { locale: ptBR }).charAt(0).toUpperCase() + format(selectedDate, "EEEE", { locale: ptBR }).slice(1)}
                          </p>
                          {new Date().toDateString() === selectedDate.toDateString() && (
                            <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Hoje
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>                  <CardFooter>
                    {selectedDate ? (
                      <div className="w-full space-y-2">
                        <Button 
                          className="w-full bg-[#ED4231] hover:bg-[#d53a2a] dark:bg-[#ED4231] dark:hover:bg-[#d53a2a] text-white"
                          onClick={() => {
                            // Armazena a data selecionada para usar na tela de agendar
                            localStorage.setItem("selectedDateForBooking", selectedDate.toISOString());
                            // Navega para a tela de agendamento
                            window.location.href = "/agendar-horario-user";
                          }}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Agendar para esta data
                        </Button>
                        <div className="flex justify-between items-center text-xs">
                          <Link to="/agenda-user" className="text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                            Ver agenda completa
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 h-auto p-0"
                            onClick={() => {
                              setSelectedDate(undefined);
                              localStorage.removeItem("selectedDateForBooking");
                              toast({
                                title: "Seleção removida",
                                description: "A data selecionada foi removida.",
                                duration: 3000,
                              });
                            }}
                          >
                            Limpar seleção
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Selecione uma data para agendar uma consulta
                        </p>
                        <Link to="/agenda-user">
                          <Button variant="outline" size="sm" className="text-xs border-[#ED4231] text-[#ED4231] hover:bg-[#ED4231]/10">
                            Ver minha agenda
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </div>

              {/* Seções de Próximas Consultas e Histórico Recente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seção Próximas Consultas */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none">                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-[#ED4231]" />
                          Próximas Consultas
                        </CardTitle>
                        <CardDescription>Consultas agendadas para os próximos dias</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {atendimentosSummary.proximos} agendadas
                      </Badge>
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
                      </div>                    ) : proximasConsultas.length > 0 ? (
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
                                  {renderStatusIcon(consulta.status)}
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
                                </span>                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  <span className="inline-flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {consulta.tipo}
                                  </span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-[#ED4231]">
                                  <Clock className="w-3.5 h-3.5 mr-1" />
                                  <span className="text-sm font-medium">{formatarData(consulta.data)}</span>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={() => toast({
                                      title: "Funcionalidade em desenvolvimento",
                                      description: "Os detalhes da consulta estarão disponíveis em breve."
                                    })}
                                  >
                                    Detalhes
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => toast({
                                      title: "Funcionalidade em desenvolvimento",
                                      description: "O cancelamento de consultas estará disponível em breve."
                                    })}
                                  >
                                    Cancelar
                                  </Button>
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
                  </CardContent>                  <CardFooter className="flex justify-between items-center">
                    <Link to="/consultas-user" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Ver todas as consultas
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>

                {/* Seção Histórico Recente */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                          <History className="w-5 h-5 text-[#ED4231]" />
                          Histórico Recente
                        </CardTitle>
                        <CardDescription>Últimas consultas realizadas</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
                        {atendimentosSummary.realizados} realizadas
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
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
                    ) : historicoRecente.length > 0 ? (
                      <div className="space-y-3">
                        {historicoRecente.map((consulta) => (
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
                                  {renderStatusIcon(consulta.status)}
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
                                </span>                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  <span className="inline-flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {consulta.tipo}
                                  </span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3.5 h-3.5 mr-1" />
                                  <span className="text-sm">{formatarData(consulta.data)}</span>
                                </div>
                                {consulta.status === 'realizada' && consulta.avaliacao && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Avaliação:</span>
                                    <div className="flex">
                                      {renderEstrelas(consulta.avaliacao)}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {consulta.status === 'realizada' && (
                                <div className="flex justify-end mt-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={() => toast({
                                      title: "Funcionalidade em desenvolvimento",
                                      description: "Detalhes da consulta realizada estarão disponíveis em breve."
                                    })}
                                  >
                                    Ver detalhes
                                  </Button>
                                  {!consulta.avaliacao && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                      onClick={() => toast({
                                        title: "Funcionalidade em desenvolvimento",
                                        description: "A avaliação de consultas estará disponível em breve."
                                      })}
                                    >
                                      Avaliar
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <History className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                        <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-1">Sem histórico recente</div>
                        <div className="text-gray-400 dark:text-gray-500 text-sm">Você ainda não realizou nenhuma consulta.</div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Link to="/historico-user" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Ver histórico completo
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {!loading && historicoRecente.some(consulta => consulta.status === 'realizada' && !consulta.avaliacao) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs border-amber-500 text-amber-500 hover:bg-amber-500/10"
                        onClick={() => toast({
                          title: "Avaliação em desenvolvimento",
                          description: "A funcionalidade de avaliação estará disponível em breve.",
                          duration: 3000,
                        })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        Avaliar Consultas
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>              {/* Removido o calendário duplicado, pois foi movido para substituir o card de Ações Rápidas */}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default HomeUser;
