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
import { toast } from "@/components/ui/use-toast";
import {
  Calendar as CalendarIcon,
  User,
  Menu,
  Search,
  Filter,
  Sun,
  Moon,
  FileText,
  Calendar,
  History,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import ErrorMessage from "./ErrorMessage";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { useTranslation } from "react-i18next";
import { AgendaCardSkeleton } from "./ui/custom-skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useVoluntario, DadosPessoaisVoluntario, DadosProfissionaisVoluntario } from "@/hooks/useVoluntario";
import { professionalNavigationItems } from "@/utils/userNavigation";

interface HistoricoAtendimento {
  id: string;
  date: Date;
  time: string;
  patientName: string;
  type: string;
  serviceType: string;
  status: "realizada" | "cancelada" | "remarcada";
  feedback?: { rating: number; comment?: string; date?: Date };
  observation?: string;
}

const Historico = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [historico, setHistorico] = useState<HistoricoAtendimento[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage } = useProfileImage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const { buscarDadosPessoais, buscarDadosProfissionais, mapEnumToText } = useVoluntario();

  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoaisVoluntario>({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
  });
  const [dadosProfissionais, setDadosProfissionais] = useState<DadosProfissionaisVoluntario | null>(null);
  const [funcaoVoluntario, setFuncaoVoluntario] = useState<string>("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    toast({ title: "Sessão encerrada", description: "Você foi desconectado com sucesso." });
  };

  useEffect(() => {
    const loadDadosPessoais = async () => {
      try {
        const dados = await buscarDadosPessoais();
        if (dados) setDadosPessoais(dados);
      } catch (error) {
        console.error("Erro ao carregar dados pessoais:", error);
      }
    };
    loadDadosPessoais();
  }, [buscarDadosPessoais]);

  useEffect(() => {
    const loadDadosProfissionais = async () => {
      try {
        const dados = await buscarDadosProfissionais();
        if (dados) {
          setDadosProfissionais(dados);
          setFuncaoVoluntario(mapEnumToText(dados.funcao));
        }
      } catch (error) {
        console.error("Erro ao carregar dados profissionais:", error);
      }
    };
    loadDadosProfissionais();
  }, [buscarDadosProfissionais, mapEnumToText]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const filteredHistorico = historico
    .filter((item) => {
      if (filterStatus && item.status !== filterStatus) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(s) ||
          item.type.toLowerCase().includes(s) ||
          item.serviceType.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const statusColors: Record<string, string> = {
    realizada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    remarcada: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
        <div
          className={`transition-all duration-500 ease-in-out ${
            sidebarOpen ? "opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72" : "opacity-0 -translate-x-full w-0"
          } bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base`}
        >
          <div className="w-full flex justify-start mb-6">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar profileImage={profileImage} name={dadosPessoais ? `${dadosPessoais.nome} ${dadosPessoais.sobrenome}` : "Voluntário"} size="w-16 h-16" className="border-4 border-[#EDF2FB] shadow" />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">{dadosPessoais?.nome} {dadosPessoais?.sobrenome}</span>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">{funcaoVoluntario || "Profissional"}</Badge>
          </div>

          <SidebarMenu className="gap-4 text-sm md:text-base">
            {Object.values(professionalNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === item.path ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-[#ED4231]" : ""}`}>
                      <Link to={item.path} className="flex items-center gap-3">{item.icon}<span>{item.label}</span></Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">{item.label}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}

            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton onClick={handleLogout} className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-[#ED4231] flex items-center gap-3 cursor-pointer">
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
            <div className="flex gap-2"><a href="https://inovare.com" target="_blank" rel="noreferrer" className="underline hover:text-[#ED4231]">Site</a><a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a></div>
          </div>
        </div>

        <main id="main-content" role="main" aria-label="Conteúdo principal" className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? "" : "ml-0"}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              )}
              <ProfileAvatar profileImage={profileImage} name={dadosPessoais ? `${dadosPessoais.nome} ${dadosPessoais.sobrenome}` : "Profissional"} size="w-10 h-10" className="border-2 border-primary shadow" />
              <span className="font-extrabold text-foreground">Dr. {dadosPessoais?.nome} {dadosPessoais?.sobrenome}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none" aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}>
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </Button>
            </div>
          </header>

          <div className="pt-20 md:pt-24 min-h-screen">
            <div className="max-w-5xl mx-auto p-4 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100">Histórico de Atendimentos</h1>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <div className="relative flex-grow md:flex-grow-0 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input type="text" placeholder="Buscar por paciente, tipo..." className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none transition-all duration-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} aria-label="Buscar no histórico" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setFilterStatus(null)} variant="outline" className={`flex items-center gap-2 ${filterStatus === null ? 'bg-[#ED4231] text-white' : ''}`}><Filter size={16} /><span>Todos</span></Button>
                    <Button onClick={() => setFilterStatus('realizada')} variant="outline" className={`flex items-center gap-2 ${filterStatus === 'realizada' ? 'bg-[#ED4231] text-white' : ''}`}><Calendar size={16} /><span>Realizadas</span></Button>
                    <Button onClick={() => setFilterStatus('cancelada')} variant="outline" className={`flex items-center gap-2 ${filterStatus === 'cancelada' ? 'bg-[#ED4231] text-white' : ''}`}><FileText size={16} /><span>Canceladas</span></Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4" role="region" aria-label="Lista de atendimentos históricos" ref={listRef}>
                {loading ? (
                  <div className="space-y-4" aria-busy="true" aria-live="polite">{[...Array(3)].map((_, i) => <AgendaCardSkeleton key={i} />)}</div>
                ) : error ? (
                  <ErrorMessage message={error} />
                ) : filteredHistorico.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <History className="w-20 h-20 mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                    <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-2">Nenhum atendimento encontrado</div>
                    <div className="text-gray-400 dark:text-gray-500 text-sm">Não há registros que correspondam à sua busca.</div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredHistorico.map((atendimento, idx) => (
                      <motion.div key={atendimento.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="bg-white dark:bg-[#181A20] rounded-lg border border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.01] hover:shadow-md">
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CalendarIcon className="w-5 h-5 text-[#ED4231]" />
                              <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {format(atendimento.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {atendimento.time}
                              </span>
                              <Badge className={`${statusColors[atendimento.status]} px-3 py-1 rounded-full text-xs font-medium`}>
                                {atendimento.status === 'realizada' ? 'Realizada' : atendimento.status === 'cancelada' ? 'Cancelada' : 'Remarcada'}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-500" />
                              <span className="font-medium text-gray-800 dark:text-gray-200">{atendimento.patientName}</span>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-gray-600 dark:text-gray-400">
                              <span>{atendimento.serviceType}</span>
                              <span>{atendimento.type}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          <style>{`
            .animate-fade-in { animation: fadeIn 0.5s ease-in; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Historico;
