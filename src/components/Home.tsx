import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, User, Clock, Menu, History, Calendar, ChevronRight, BarChart3, Users, Activity, Sun, Moon, Home as HomeIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import ErrorMessage from "./ErrorMessage";
import { STATUS_COLORS } from "../constants/ui";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";

interface ConsultaSummary {
  total: number;
  hoje: number;
  proximaSemana: number;
}

interface AtendimentoSummary {
  realizados: number;
  cancelados: number;
  remarcados: number;
  avaliacaoMedia: number;
}

interface HorarioSummary {
  disponiveis: number;
  ocupados: number;
  proximoDisponivel: Date | null;
}

const Home = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("profileData");
    return savedData ? JSON.parse(savedData) : {
      nome: "Ricardo",
      sobrenome: "Santos",
      especialidade: "Psicologia"
    };
  });

  // Estado para o resumo dos dados
  const [consultasSummary, setConsultasSummary] = useState<ConsultaSummary>({
    total: 0,
    hoje: 0,
    proximaSemana: 0
  });

  const [atendimentosSummary, setAtendimentosSummary] = useState<AtendimentoSummary>({
    realizados: 0,
    cancelados: 0,
    remarcados: 0,
    avaliacaoMedia: 0
  });

  const [horariosSummary, setHorariosSummary] = useState<HorarioSummary>({
    disponiveis: 0,
    ocupados: 0,
    proximoDisponivel: null
  });

  // Dados de exemplo para as próximas consultas
  const [proximasConsultas, setProximasConsultas] = useState([
    {
      id: 1,
      paciente: "João Silva",
      data: new Date(2025, 4, 18, 10, 0), // 18 de maio de 2025, 10:00
      tipo: "Consulta Online",
      status: "agendada"
    },
    {
      id: 2,
      paciente: "Maria Oliveira",
      data: new Date(2025, 4, 18, 14, 30), // 18 de maio de 2025, 14:30
      tipo: "Consulta Presencial",
      status: "agendada"
    },
    {
      id: 3,
      paciente: "Pedro Santos",
      data: new Date(2025, 4, 19, 9, 0), // 19 de maio de 2025, 09:00
      tipo: "Consulta Online",
      status: "agendada"
    }
  ]);

  // Dados de exemplo para o histórico recente
  const [historicoRecente, setHistoricoRecente] = useState([
    {
      id: 1,
      paciente: "Ana Costa",
      data: new Date(2025, 4, 15, 11, 0), // 15 de maio de 2025, 11:00
      tipo: "Consulta Online",
      status: "realizada",
      avaliacao: 5
    },
    {
      id: 2,
      paciente: "Carlos Pereira",
      data: new Date(2025, 4, 16, 15, 0), // 16 de maio de 2025, 15:00
      tipo: "Consulta Presencial",
      status: "realizada",
      avaliacao: 4
    },
    {
      id: 3,
      paciente: "Lucia Ferreira",
      data: new Date(2025, 4, 16, 17, 30), // 16 de maio de 2025, 17:30
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
        setConsultasSummary({
          total: 15,
          hoje: 2,
          proximaSemana: 8
        });
        
        // Simulando dados de atendimentos
        setAtendimentosSummary({
          realizados: 42,
          cancelados: 5,
          remarcados: 3,
          avaliacaoMedia: 4.7
        });
        
        // Simulando dados de horários disponíveis
        setHorariosSummary({
          disponiveis: 12,
          ocupados: 6,
          proximoDisponivel: new Date(2025, 4, 18, 10, 0) // 18 de maio de 2025, 10:00
        });
        
        setLoading(false);
      } catch (err) {
        setError("Erro ao carregar dados do dashboard");
        setLoading(false);
      }
    }, 1000);
  }, []);

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

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans text-base">
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-[#23272F]/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md" aria-label="Abrir menu lateral" tabIndex={0} title="Abrir menu lateral">
              <Menu className="w-7 h-7" />
            </Button>
            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
            <span className="font-bold text-indigo-900 dark:text-gray-100">Dr. {formData?.nome} {formData?.sobrenome}</span>
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
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">Dr. {formData?.nome} {formData?.sobrenome}</span>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              {formData?.especialidade}
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
                      <span>Agenda</span>
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
              <span className="font-bold text-indigo-900 dark:text-gray-100">Dr. {formData?.nome} {formData?.sobrenome}</span>
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
                Bem-vindo, Dr. {formData?.nome}! Aqui está o resumo das suas atividades.
              </p>
            
              {error && <ErrorMessage message={error} />}
              
              {/* Cards do dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {/* Card de Consultas */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#ED4231]" />
                      Consultas
                    </CardTitle>
                    <CardDescription>Visão geral das suas consultas</CardDescription>
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total de consultas:</span>
                          <span className="font-semibold text-indigo-900 dark:text-indigo-300">{consultasSummary.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Hoje:</span>
                          <span className="font-semibold text-indigo-900 dark:text-indigo-300">{consultasSummary.hoje}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Próxima semana:</span>
                          <span className="font-semibold text-indigo-900 dark:text-indigo-300">{consultasSummary.proximaSemana}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link to="/agenda" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Ver agenda completa
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>

                {/* Card de Atendimentos */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#ED4231]" />
                      Atendimentos
                    </CardTitle>
                    <CardDescription>Histórico de atendimentos realizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-6 w-36" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Realizados:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{atendimentosSummary.realizados}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Cancelados:</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">{atendimentosSummary.cancelados}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Remarcados:</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{atendimentosSummary.remarcados}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Avaliação média:</span>
                          <span className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                            {atendimentosSummary.avaliacaoMedia}
                            <div className="flex">
                              {renderEstrelas(atendimentosSummary.avaliacaoMedia)}
                            </div>
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link to="/historico" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Ver histórico completo
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>

                {/* Card de Horários */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#ED4231]" />
                      Horários
                    </CardTitle>
                    <CardDescription>Disponibilidade de horários</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Disponíveis:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{horariosSummary.disponiveis}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Ocupados:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{horariosSummary.ocupados}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Próximo disponível:</span>
                          <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                            {horariosSummary.proximoDisponivel 
                              ? formatarData(horariosSummary.proximoDisponivel)
                              : "Nenhum"}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link to="/disponibilizar-horario" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Disponibilizar horários
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>
              </div>

              {/* Seções de Próximas Consultas e Histórico Recente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seção Próximas Consultas */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#ED4231]" />
                      Próximas Consultas
                    </CardTitle>
                    <CardDescription>Consultas agendadas para os próximos dias</CardDescription>
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
                    ) : proximasConsultas.length > 0 ? (
                      <div className="space-y-3">
                        {proximasConsultas.map((consulta) => (
                          <motion.div 
                            key={consulta.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-800 dark:text-gray-200">{consulta.paciente}</span>
                                <Badge className={statusColors[consulta.status]}>
                                  {consulta.status === 'agendada' ? 'Agendada' : 
                                   consulta.status === 'realizada' ? 'Realizada' : 
                                   consulta.status === 'cancelada' ? 'Cancelada' : 'Remarcada'}
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{consulta.tipo}</span>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-500 dark:text-gray-500">{formatarData(consulta.data)}</span>
                                <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 p-0 h-auto" onClick={() => toast({
                                  title: "Funcionalidade em desenvolvimento",
                                  description: "Os detalhes da consulta estarão disponíveis em breve."
                                })}>
                                  Ver detalhes
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                        <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-1">Sem consultas agendadas</div>
                        <div className="text-gray-400 dark:text-gray-500 text-sm">Você não tem nenhuma consulta agendada para os próximos dias.</div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link to="/agenda" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Ver todas as consultas
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>

                {/* Seção Histórico Recente */}
                <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                      <History className="w-5 h-5 text-[#ED4231]" />
                      Histórico Recente
                    </CardTitle>
                    <CardDescription>Últimos atendimentos realizados</CardDescription>
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
                            transition={{ duration: 0.3 }}
                            className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-800 dark:text-gray-200">{consulta.paciente}</span>
                                <Badge className={statusColors[consulta.status]}>
                                  {consulta.status === 'agendada' ? 'Agendada' : 
                                   consulta.status === 'realizada' ? 'Realizada' : 
                                   consulta.status === 'cancelada' ? 'Cancelada' : 'Remarcada'}
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{consulta.tipo}</span>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-500 dark:text-gray-500">{formatarData(consulta.data)}</span>
                                {consulta.status === 'realizada' && consulta.avaliacao && (
                                  <div className="flex items-center gap-1">
                                    {renderEstrelas(consulta.avaliacao)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <History className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                        <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-1">Sem histórico recente</div>
                        <div className="text-gray-400 dark:text-gray-500 text-sm">Você ainda não realizou nenhum atendimento.</div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link to="/historico" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                      Ver histórico completo
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                <Link to="/disponibilizar-horario">
                  <Button className="bg-indigo-900 dark:bg-indigo-700 hover:bg-indigo-800 dark:hover:bg-indigo-800 text-white shadow-md dark:shadow-none">
                    <Clock className="w-4 h-4 mr-2" />
                    Disponibilizar Horário
                  </Button>
                </Link>
                <Link to="/agenda">
                  <Button variant="outline" className="border-indigo-900 dark:border-indigo-700 text-indigo-900 dark:text-indigo-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Agenda
                  </Button>
                </Link>
                <Link to="/profile-form">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <User className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Home;
