import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  User,
  Clock,
  Menu,
  History,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Home as HomeIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { userNavigationItems } from "@/utils/userNavigation";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserNavigationPath } from "@/utils/userNavigation";
import { useUserData } from "@/hooks/useUserData";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { VoluntarioApiService } from "@/services/voluntarioApi";
import {
  ConsultaApiService,
  type HorarioDisponivel,
} from "@/services/consultaApi";

const tiposConsulta = [
  { valor: "ONLINE", label: "Consulta Online" },
  { valor: "PRESENCIAL", label: "Consulta Presencial" },
];

const AgendarHorarioUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const { userData } = useUserData();
  const fullName = [userData?.nome, userData?.sobrenome]
    .filter(Boolean)
    .join(" ");
  const displayName = fullName || "Usuário";

  // Add state for logout dialog
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Dynamic data from API
  const [datasDisponiveis, setDatasDisponiveis] = useState<Date[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<
    Record<string, HorarioDisponivel[]>
  >({});
  const [loadingEspecialistas, setLoadingEspecialistas] = useState(false);
  const [loadingDisponibilidades, setLoadingDisponibilidades] = useState(false);

  // Handle logout function
  const handleLogout = () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("userData");
      localStorage.removeItem("savedProfile");
      localStorage.removeItem("profileData");
      localStorage.removeItem("userProfileData");
      localStorage.removeItem("selectedDates");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (
          key.startsWith("availabilityVoluntario:") ||
          key.startsWith("availabilityIds:")
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
    toast({
      title: "Sessão encerrada",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/login", { replace: true });
  };

  // Estado do formulário
  const [especialistaSelecionado, setEspecialistaSelecionado] = useState<
    number | null
  >(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null
  );
  const [tipoConsulta, setTipoConsulta] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState<string>("");
  const [step, setStep] = useState(1); // 1: Especialista, 2: Data, 3: Horário, 4: Tipo, 5: Observações, 6: Confirmação

  // Estado para paginação
  const [pagina, setPagina] = useState(0);
  const [size] = useState(3);
  const [especialistas, setEspecialistas] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Load specialists when component mounts
  const carregarEspecialistas = async (page = pagina) => {
    setLoadingEspecialistas(true);
    try {
      const data = await VoluntarioApiService.listarVoluntariosParaAgendamento(
        page,
        size
      );

      setEspecialistas(data.items);
      setHasNextPage(!data.last);
      setPagina(data.page);
    } catch (error) {
      toast({
        title: "Erro ao carregar especialistas",
        description: "Não foi possível carregar especialistas.",
        variant: "destructive",
      });
    } finally {
      setLoadingEspecialistas(false);
    }
  };

  useEffect(() => {
    carregarEspecialistas(0);
  }, []);

  const irParaProximaPagina = () => {
    if (hasNextPage) {
      carregarEspecialistas(pagina + 1);
    }
  };

  const irParaPaginaAnterior = () => {
    if (pagina > 0) {
      carregarEspecialistas(pagina - 1);
    }
  };

  // Carrega datas e horários reais do backend quando um especialista é escolhido
  useEffect(() => {
    const carregarDisponibilidades = async () => {
      setDatasDisponiveis([]);
      setDisponibilidades({});
      setDataSelecionada(null);
      setHorarioSelecionado(null);
      setHorariosDisponiveis([]);

      if (!especialistaSelecionado) {
        return;
      }

      setLoadingDisponibilidades(true);
      try {
        const mapa =
          await ConsultaApiService.listarDisponibilidadesPorVoluntario(
            especialistaSelecionado
          );
        setDisponibilidades(mapa);

        const datasOrdenadas = Object.keys(mapa).sort();
        const datas = datasOrdenadas.map((iso) => {
          const [anoStr = "", mesStr = "", diaStr = ""] = iso.split("-");
          const ano = Number(anoStr);
          const mes = Number(mesStr);
          const dia = Number(diaStr);

          return new Date(
            Number.isNaN(ano) ? new Date().getFullYear() : ano,
            Number.isNaN(mes) ? 0 : mes - 1,
            Number.isNaN(dia) ? 1 : dia
          );
        });

        setDatasDisponiveis(datas);
        setDataSelecionada(datas.length ? datas[0] : null);

        if (datas.length === 0) {
          toast({
            title: "Sem horários disponíveis",
            description:
              "Este especialista não possui horários abertos nos próximos dias.",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar disponibilidades:", error);
        toast({
          title: "Erro ao carregar disponibilidades",
          description:
            "Não foi possível carregar as datas disponíveis deste especialista.",
          variant: "destructive",
        });
      } finally {
        setLoadingDisponibilidades(false);
      }
    };

    carregarDisponibilidades();
  }, [especialistaSelecionado]);

  // Atualiza horários com base na data selecionada usando os dados carregados do backend
  useEffect(() => {
    if (!dataSelecionada) {
      setHorariosDisponiveis([]);
      return;
    }

    const dataIso = dataSelecionada.toISOString().split("T")[0];
    const horariosSet = new Set(
      (disponibilidades[dataIso] ?? []).map((item) => item.time)
    );
    const horariosOrdenados = Array.from(horariosSet).sort((a, b) =>
      a.localeCompare(b)
    );
    setHorariosDisponiveis(horariosOrdenados);

    if (horariosOrdenados.length === 0) {
      setHorarioSelecionado(null);
    }
  }, [dataSelecionada, disponibilidades]); // Função para avançar no formulário
  const handleNext = async () => {
    if (step === 1 && !especialistaSelecionado) {
      toast({
        title: "Escolha um especialista",
        description: "Selecione um especialista para continuar",
        variant: "destructive",
      });
      return;
    }

    if (step === 2 && !dataSelecionada) {
      toast({
        title: "Escolha uma data",
        description: "Selecione uma data para continuar",
        variant: "destructive",
      });
      return;
    }

    if (step === 3 && !horarioSelecionado) {
      toast({
        title: "Escolha um horário",
        description: "Selecione um horário para continuar",
        variant: "destructive",
      });
      return;
    }

    if (step === 4 && !tipoConsulta) {
      toast({
        title: "Escolha o tipo de consulta",
        description: "Selecione entre consulta online ou presencial",
        variant: "destructive",
      });
      return;
    }

    if (step < 6) {
      setStep(step + 1);
    } else {
      // Enviar formulário
      setLoading(true);

      try {
        const especialistaAtual = especialistas.find(
          (e) => e.id === especialistaSelecionado
        );

        const consultaData = {
          idVoluntario: especialistaSelecionado!,
          data: dataSelecionada!.toISOString().split("T")[0],
          horario: horarioSelecionado!,
          modalidade: tipoConsulta as "ONLINE" | "PRESENCIAL",
          observacoes: observacoes,
          especialidade: especialistaAtual?.especialidade,
        };

        await ConsultaApiService.criarConsulta(consultaData);

        setLoading(false);
        toast({
          title: "Consulta agendada com sucesso!",
          description:
            "Você receberá um e-mail com os detalhes da sua consulta.",
        });

        // Redirecionamento para a página de agenda do usuário
        setTimeout(() => {
          navigate("/agenda-user");
        }, 2000);
      } catch (error) {
        setLoading(false);
        toast({
          title: "Erro ao agendar consulta",
          description:
            "Ocorreu um erro ao agendar a consulta. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  // Função para retroceder no formulário
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Encontra o especialista selecionado pelo ID
  const especialistaAtual = especialistas.find(
    (e) => e.id === especialistaSelecionado
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans text-base">
        {" "}
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-[#23272F]/90 shadow-md backdrop-blur-md">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md"
              aria-label="Abrir menu lateral"
              tabIndex={0}
              title="Abrir menu lateral"
            >
              <Menu className="w-7 h-7" />
            </Button>
            <ProfileAvatar
              profileImage={profileImage}
              name={displayName}
              size="w-10 h-10"
              className="border-2 border-[#ED4231] shadow"
            />
            <span className="font-bold text-indigo-900 dark:text-gray-100">
              {displayName}
            </span>
          </div>
        )}
        <div
          className={`transition-all duration-500 ease-in-out
          ${
            sidebarOpen
              ? "opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72"
              : "opacity-0 -translate-x-full w-0"
          }
          bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base`}
        >
          <div className="w-full flex justify-start mb-6">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md"
            >
              <Menu className="w-7 h-7" />
            </Button>
          </div>{" "}
          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar
              profileImage={profileImage}
              name={displayName}
              size="w-16 h-16"
              className="border-4 border-[#EDF2FB] shadow"
            />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">
              {displayName}
            </span>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {/* Utilizando os itens de navegação do userNavigationItems */}
            {Object.values(userNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${
                        location.pathname === item.path
                          ? "bg-[#ED4231]/15 dark:bg-[#ED4231]/25 border-l-4 border-[#ED4231] text-[#ED4231] dark:text-white"
                          : ""
                      }`}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">{item.label}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}{" "}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9"
                      />
                    </svg>
                    <span>Sair</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Sair da conta</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
            <span>
              &copy; {new Date().getFullYear()} Desenvolvido por Inovare
            </span>
            <div className="flex gap-2">
              <a
                href="https://inovare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#ED4231]"
              >
                Site
              </a>
              <a
                href="mailto:contato@inovare.com"
                className="underline hover:text-[#ED4231]"
              >
                Contato
              </a>
            </div>
          </div>
        </div>
        <main
          id="main-content"
          role="main"
          aria-label="Conteúdo principal"
          className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${
            sidebarOpen ? "" : "ml-0"
          }`}
        >
          {" "}
          <header
            className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-[#23272F]/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md transition-colors duration-300 border-b border-[#EDF2FB] dark:border-[#23272F]"
            role="banner"
            aria-label="Cabeçalho"
          >
            <div className="flex items-center gap-3">
              <ProfileAvatar
                profileImage={profileImage}
                name={displayName}
                size="w-10 h-10"
                className="border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200"
              />
              <span className="font-bold text-indigo-900 dark:text-gray-100">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {" "}
              <Button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                aria-label={
                  theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
                }
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-800" />
                )}
              </Button>
            </div>
          </header>
          <div className="max-w-6xl mx-auto p-4 md:p-8 pt-24 md:pt-10">
            {/* Breadcrumb navigation */}
            {getUserNavigationPath(location.pathname)}

            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-2">
                Agendar Consulta
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
                Siga os passos abaixo para agendar uma nova consulta
              </p>
              {/* Indicador de progresso */}
              <div className="w-full flex items-center mb-8">
                {[1, 2, 3, 4, 5, 6].map((stepNum) => (
                  <div key={stepNum} className="flex-1 flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= stepNum
                          ? "bg-[#ED4231] text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 6 && (
                      <div
                        className={`h-1 flex-grow mx-2 ${
                          step > stepNum
                            ? "bg-[#ED4231]"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>

              <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                {" "}
                <CardHeader>
                  <CardTitle>
                    {step === 1 && "Escolha um especialista"}
                    {step === 2 && "Escolha uma data"}
                    {step === 3 && "Escolha um horário"}
                    {step === 4 && "Escolha o tipo de consulta"}
                    {step === 5 && "Observações (opcional)"}
                    {step === 6 && "Confirme sua consulta"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {" "}
                  {/* Passo 1: Escolher Especialista */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Selecione o especialista para a sua consulta:
                      </p>
                      {loadingEspecialistas ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED4231]"></div>
                          <span className="ml-2">
                            Carregando especialistas...
                          </span>
                        </div>
                      ) : especialistas.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhum especialista disponível no momento.</p>
                          <p className="text-sm">Tente novamente mais tarde.</p>
                        </div>
                      ) : (
                        <RadioGroup
                          value={especialistaSelecionado?.toString()}
                          onValueChange={(val) =>
                            setEspecialistaSelecionado(Number(val))
                          }
                        >
                          {especialistas.map((especialista) => (
                            <div
                              key={especialista.id}
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <RadioGroupItem
                                value={especialista.id.toString()}
                                id={`especialista-${especialista.id}`}
                              />
                              <Label
                                htmlFor={`especialista-${especialista.id}`}
                                className="flex flex-col"
                              >
                                <span className="font-medium">
                                  {especialista.nome}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {especialista.especialidade}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          onClick={irParaPaginaAnterior}
                          disabled={pagina === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Página anterior
                        </Button>

                        <Button
                          variant="outline"
                          onClick={irParaProximaPagina}
                          disabled={!hasNextPage}
                        >
                          Próxima página
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Passo 2: Escolher Data */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Selecione uma data para a consulta com{" "}
                        {
                          especialistas.find(
                            (e) => e.id === especialistaSelecionado
                          )?.nome
                        }
                        :
                      </p>
                      {loadingDisponibilidades ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED4231]"></div>
                          <span className="ml-2">Carregando datas...</span>
                        </div>
                      ) : datasDisponiveis.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhuma data disponível.</p>
                          <p className="text-sm">
                            Selecione outro especialista.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {datasDisponiveis.slice(0, 15).map((dia, index) => (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={
                                    dataSelecionada?.getTime() === dia.getTime()
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => setDataSelecionada(dia)}
                                  className={`flex flex-col p-4 h-auto ${
                                    dataSelecionada?.getTime() === dia.getTime()
                                      ? "bg-[#ED4231]"
                                      : ""
                                  }`}
                                >
                                  <span className="font-medium">
                                    {format(dia, "eeee", { locale: ptBR })}
                                  </span>
                                  <span>{format(dia, "dd/MM/yyyy")}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>
                                  Selecionar{" "}
                                  {format(dia, "eeee, dd 'de' MMMM", {
                                    locale: ptBR,
                                  })}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Passo 3: Escolher Horário */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Selecione um horário disponível para{" "}
                        {dataSelecionada &&
                          format(dataSelecionada, "dd 'de' MMMM", {
                            locale: ptBR,
                          })}
                        :
                      </p>
                      {loadingDisponibilidades ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED4231]"></div>
                          <span className="ml-2">Carregando horários...</span>
                        </div>
                      ) : horariosDisponiveis.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhum horário disponível para esta data.</p>
                          <p className="text-sm">
                            Tente selecionar outra data.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {horariosDisponiveis.map((horario, index) => (
                            <Button
                              key={index}
                              variant={
                                horarioSelecionado === horario
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setHorarioSelecionado(horario)}
                              className={
                                horarioSelecionado === horario
                                  ? "bg-[#ED4231]"
                                  : ""
                              }
                            >
                              {horario}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Passo 4: Tipo de Consulta */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Selecione o tipo de consulta:
                      </p>
                      <div className="flex flex-col gap-3">
                        {tiposConsulta.map((tipo, index) => (
                          <Button
                            key={index}
                            variant={
                              tipoConsulta === tipo.valor
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setTipoConsulta(tipo.valor)}
                            className={`flex items-center justify-start p-6 h-auto ${
                              tipoConsulta === tipo.valor ? "bg-[#ED4231]" : ""
                            }`}
                          >
                            {tipo.valor === "ONLINE" ? (
                              <svg
                                className="w-5 h-5 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 005.25 3h13.5A2.25 2.25 0 0021 5.25z"
                                />
                              </svg>
                            )}
                            {tipo.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Passo 5: Observações */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Adicione observações para a consulta (opcional):
                      </p>
                      <div className="space-y-2">
                        <label
                          htmlFor="observacoes"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Observações:
                        </label>
                        <textarea
                          id="observacoes"
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          placeholder="Digite aqui qualquer informação adicional que possa ser relevante para a consulta..."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#ED4231] focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                          rows={4}
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {observacoes.length}/500 caracteres
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Passo 6: Confirmação */}
                  {step === 6 && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Confira os dados da sua consulta:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Especialista:
                            </p>
                            <p className="font-medium">
                              {especialistaAtual?.nome}
                            </p>
                            <p className="text-sm text-gray-500">
                              {especialistaAtual?.especialidade}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Data e Horário:
                            </p>
                            <p className="font-medium">
                              {dataSelecionada &&
                                format(
                                  dataSelecionada,
                                  "dd 'de' MMMM 'de' yyyy",
                                  { locale: ptBR }
                                )}
                            </p>
                            <p className="text-sm">às {horarioSelecionado}</p>
                          </div>{" "}
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Tipo de Consulta:
                            </p>
                            <p className="font-medium">
                              {tipoConsulta === "ONLINE"
                                ? "Consulta Online"
                                : "Consulta Presencial"}
                            </p>
                          </div>{" "}
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Paciente:
                            </p>
                            <p className="font-medium">
                              {userData?.nome} {userData?.sobrenome}
                            </p>
                            <p className="text-sm">{userData?.email}</p>
                          </div>
                        </div>

                        {observacoes && (
                          <div className="mt-4 pt-4 border-t dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Observações:
                            </p>
                            <p className="text-sm mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                              {observacoes}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ao confirmar, você concorda com os termos de uso e
                            política de privacidade da clínica.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Botões de navegação */}
                  <div className="flex justify-between mt-6">
                    {step > 1 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex items-center"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Retornar ao passo anterior</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div></div>
                    )}{" "}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleNext}
                          disabled={loading}
                          className="bg-[#ED4231] hover:bg-[#d53a2a] ml-auto"
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processando...
                            </div>
                          ) : step === 6 ? (
                            "Confirmar Agendamento"
                          ) : (
                            <span className="flex items-center">
                              Avançar <ChevronRight className="w-4 h-4 ml-2" />
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>
                          {step === 6
                            ? "Finalizar e agendar a consulta"
                            : "Avançar para o próximo passo"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        {/* Logout dialog */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Deseja realmente sair?
              </DialogTitle>
              <DialogDescription>
                Você será desconectado da sua conta.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleLogout}
                className="bg-[#ED4231] hover:bg-[#D63A2A] text-white font-medium"
              >
                Sair
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AgendarHorarioUser;
