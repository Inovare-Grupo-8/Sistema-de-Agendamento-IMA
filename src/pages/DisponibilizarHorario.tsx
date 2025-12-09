import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sun,
  CloudMoon,
  Moon,
  Calendar as CalendarIcon,
  Clock,
  Menu,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Video,
  MapPin,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import {
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfileImage } from "@/components/useProfileImage";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import ErrorMessage from "@/components/ErrorMessage";
import { Badge } from "@/components/ui/badge";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { useTranslation } from "react-i18next";
import { professionalNavigationItems } from "@/utils/userNavigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  useVoluntario,
  DadosPessoaisVoluntario,
  DadosProfissionaisVoluntario,
} from "@/hooks/useVoluntario";
import VoluntarioApiService from "@/services/voluntarioApi";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
// removed useAuth to avoid hook misuse in non-component contexts

const DisponibilizarHorario = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { profileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const { buscarDadosPessoais, buscarDadosProfissionais, mapEnumToText } =
    useVoluntario();
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
    navigate("/login", { replace: true });
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoaisVoluntario>({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
  });
  const [funcaoVoluntario, setFuncaoVoluntario] = useState<string>("");
  const summaryRef = useRef<HTMLDivElement>(null);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [activeDate, setActiveDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [modalidade, setModalidade] = useState<"ONLINE" | "PRESENCIAL">(
    "ONLINE"
  );
  const [localPresencial, setLocalPresencial] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const displayName = (() => {
    const parts = [
      dadosPessoais?.nome?.trim(),
      dadosPessoais?.sobrenome?.trim(),
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : "Voluntário";
  })();

  useEffect(() => {
    const loadDados = async () => {
      try {
        const p = await buscarDadosPessoais();
        if (p) setDadosPessoais(p);
        const prof = await buscarDadosProfissionais();
        if (prof) setFuncaoVoluntario(mapEnumToText(prof.funcao));
      } catch (e) {
        console.error("Erro ao carregar dados do voluntário", e);
      }
    };
    loadDados();
  }, [buscarDadosPessoais, buscarDadosProfissionais, mapEnumToText]);

  const availabilityKey = (volId: string | number) =>
    `availabilityVoluntario:${volId}`;
  const userId = (() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.idUsuario ?? "default";
      } catch (e) {
        console.warn("userData inválido no localStorage", e);
      }
    }
    return "default";
  })();
  const loadAvailability = (): Record<
    string,
    { times: string[]; modalidade: "ONLINE" | "PRESENCIAL"; local?: string }
  > => {
    const raw = localStorage.getItem(availabilityKey(userId));
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };
  const saveAvailability = (
    data: Record<
      string,
      { times: string[]; modalidade: "ONLINE" | "PRESENCIAL"; local?: string }
    >
  ) => {
    localStorage.setItem(availabilityKey(userId), JSON.stringify(data));
  };

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const removeDate = (d: Date) => {
    setSelectedDates((prev) => {
      const next = prev.filter((p) => !sameDay(p, d));
      const first = next[0];
      setActiveDate(first);
      if (first)
        setCurrentMonth(new Date(first.getFullYear(), first.getMonth(), 1));
      localStorage.setItem(
        "selectedDates",
        JSON.stringify(next.map((x) => x.toISOString()))
      );
      return next;
    });
  };

  const handleToggleTime = (time: string) => {
    setSelectedTimes((prev) => {
      const exists = prev.includes(time);
      const next = exists ? prev.filter((t) => t !== time) : [...prev, time];
      return next.sort((a, b) => a.localeCompare(b));
    });
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const selectAllTimes = (list: string[]) => {
    setSelectedTimes(
      Array.from(new Set([...selectedTimes, ...list])).sort((a, b) =>
        a.localeCompare(b)
      )
    );
  };
  const clearTimes = (list?: string[]) => {
    setSelectedTimes((prev) =>
      list ? prev.filter((t) => !list.includes(t)) : []
    );
  };

  const formatTimeRange = (t: string) => {
    const [hh, mm] = t.split(":");
    const endH = String(parseInt(hh) + 1).padStart(2, "0");
    return `${hh}:${mm} - ${endH}:${mm}`;
  };

  const handleConfirm = async () => {
    if (selectedDates.length === 0 || selectedTimes.length === 0) {
      setValidationMessage("Selecione ao menos um dia e um horário.");
      setIsModalOpen(true);
      return;
    }
    if (modalidade === "PRESENCIAL" && !localPresencial.trim()) {
      setValidationMessage("Informe o local para atendimento presencial.");
      setIsModalOpen(true);
      return;
    }
    try {
      setIsLoading(true);
      const uid = typeof userId === "number" ? userId : Number(userId);
      const savedCount =
        await VoluntarioApiService.criarDisponibilidadesParaUsuario(
          uid,
          selectedDates,
          selectedTimes
        );
      const map = loadAvailability();
      selectedDates.forEach((d) => {
        const key = format(d, "yyyy-MM-dd");
        const already = map[key]?.times || [];
        const merged = Array.from(new Set([...already, ...selectedTimes])).sort(
          (a, b) => a.localeCompare(b)
        );
        map[key] = {
          times: merged,
          modalidade,
          local: modalidade === "PRESENCIAL" ? localPresencial : undefined,
        };
      });
      saveAvailability(map);
      setValidationMessage("");
      setIsSuccessModalOpen(true);
      toast({
        title: "Disponibilidade salva",
        description: `${savedCount} horário(s) criados`,
      });
    } catch (e) {
      setValidationMessage("Erro ao salvar disponibilidade. Tente novamente.");
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const periods = [
    {
      title: "Manhã",
      Icon: Sun,
      timeSlots: ["08:00", "09:00", "10:00", "11:00"],
    },
    {
      title: "Tarde",
      Icon: CloudMoon,
      timeSlots: ["13:00", "14:00", "15:00", "16:00"],
    },
    {
      title: "Noite",
      Icon: Moon,
      timeSlots: ["18:00", "19:00", "20:00", "21:00"],
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
        <div
          className={`transition-all duration-500 ease-in-out ${
            sidebarOpen
              ? "opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72"
              : "opacity-0 -translate-x-full w-0"
          } bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base`}
        >
          <div className="w-full flex justify-start mb-6">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md"
            >
              <Menu className="w-7 h-7" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar
              profileImage={profileImage}
              name={
                `${dadosPessoais?.nome} ${dadosPessoais?.sobrenome}`.trim() ||
                "Voluntário"
              }
              size="w-16 h-16"
              className="border-4 border-[#EDF2FB] shadow"
            />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">
              {dadosPessoais?.nome} {dadosPessoais?.sobrenome}
            </span>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              {funcaoVoluntario || "Profissional"}
            </Badge>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {Object.values(professionalNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${
                        location.pathname === item.path
                          ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-[#ED4231]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">{item.label}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-[#ED4231] flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
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
                rel="noreferrer"
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
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md"
                aria-label="Abrir menu lateral"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <ProfileAvatar
                profileImage={profileImage}
                name={displayName}
                size="w-10 h-10"
                className="shadow hover:scale-105 transition-transform duration-200"
              />
              <span className="font-extrabold text-foreground">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-3">
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
              <Button
                variant="outline"
                onClick={handleLogout}
                className="px-4 py-2"
              >
                Sair
              </Button>
            </div>
          </header>
          <div className="h-20" />

          <div className="max-w-5xl mx-auto w-full px-2 sm:px-4 md:px-6 pb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-4 md:mb-6">
              Disponibilizar Horário
            </h1>

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col gap-8 items-start">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch">
                    <Card className="rounded-2xl shadow-lg p-0">
                      <CardHeader className="flex items-center justify-between px-4 py-3 md:py-4 bg-[#f8fafc] rounded-t-2xl mb-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-[#ED4231]/10"
                            onClick={() =>
                              setCurrentMonth(
                                new Date(
                                  currentMonth.getFullYear(),
                                  currentMonth.getMonth() - 1,
                                  1
                                )
                              )
                            }
                            aria-label="Mês anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <CardTitle className="font-semibold tracking-tight text-lg md:text-xl text-gray-800 dark:text-gray-200">
                            {format(currentMonth, "MMMM 'de' yyyy", {
                              locale: ptBR,
                            })}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-[#ED4231]/10"
                            onClick={() =>
                              setCurrentMonth(
                                new Date(
                                  currentMonth.getFullYear(),
                                  currentMonth.getMonth() + 1,
                                  1
                                )
                              )
                            }
                            aria-label="Próximo mês"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center">
                          <div className="inline-flex rounded-full border border-[#E6ECF5] bg-white dark:bg-[#23272F] dark:border-[#444857] overflow-hidden shadow-sm">
                            <Button
                              onClick={() => setModalidade("ONLINE")}
                              variant={
                                modalidade === "ONLINE" ? "default" : "outline"
                              }
                              size="sm"
                              className={`h-9 px-3 md:px-4 font-medium ${
                                modalidade === "ONLINE"
                                  ? "bg-[#ED4231] text-white border-[#ED4231]"
                                  : "border-0 text-gray-700"
                              } rounded-none`}
                              aria-pressed={modalidade === "ONLINE"}
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Online
                            </Button>
                            <Button
                              onClick={() => setModalidade("PRESENCIAL")}
                              variant={
                                modalidade === "PRESENCIAL"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className={`h-9 px-3 md:px-4 font-medium ${
                                modalidade === "PRESENCIAL"
                                  ? "bg-[#ED4231] text-white border-[#ED4231]"
                                  : "border-0 text-gray-700"
                              } rounded-none`}
                              aria-pressed={modalidade === "PRESENCIAL"}
                            >
                              <MapPin className="w-4 h-4 mr-1" />
                              Presencial
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="w-full flex justify-center items-center p-2 sm:p-4">
                          <div className="w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl">
                            <Calendar
                              mode="multiple"
                              selected={selectedDates}
                              onSelect={(dates) => {
                                const list = (dates as Date[]) || [];
                                setSelectedDates(list);
                                const first = list[0];
                                setActiveDate(first);
                                if (first)
                                  setCurrentMonth(
                                    new Date(
                                      first.getFullYear(),
                                      first.getMonth(),
                                      1
                                    )
                                  );
                              }}
                              showOutsideDays={false}
                              className="w-full rounded-xl border border-[#EDF2FB] bg-white shadow-sm text-base dark:bg-[#23272F] dark:border-[#444857]"
                              classNames={{ caption: "hidden", nav: "hidden" }}
                              locale={ptBR}
                              aria-label="Calendário para selecionar datas"
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              month={currentMonth}
                              onMonthChange={setCurrentMonth}
                            />
                          </div>
                        </div>
                        {selectedDates.length > 0 && (
                          <div className="w-full px-2 sm:px-4 pb-4 mt-2">
                            <div className="flex flex-wrap gap-2">
                              {selectedDates.map((d) => (
                                <div
                                  key={format(d, "yyyy-MM-dd")}
                                  className="flex items-center gap-2 bg-white dark:bg-[#23272F] border border-[#EDF2FB] dark:border-[#23272F] rounded-xl px-3 py-2 shadow-sm"
                                >
                                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {format(d, "dd/MM", { locale: ptBR })}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeDate(d)}
                                    aria-label={`Remover dia ${format(
                                      d,
                                      "dd/MM",
                                      { locale: ptBR }
                                    )}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div
                      className="space-y-6"
                      role="region"
                      aria-label="Seleção de horários"
                    >
                      {periods.map(({ title, Icon, timeSlots }) => {
                        const savedForDate = activeDate
                          ? loadAvailability()[format(activeDate, "yyyy-MM-dd")]
                              ?.times || []
                          : [];
                        return (
                          <div
                            key={title}
                            className="bg-white dark:bg-[#23272F] rounded-lg overflow-hidden border border-[#EDF2FB] dark:border-[#23272F] shadow-sm"
                          >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDF2FB] dark:border-[#23272F]">
                              <div className="flex items-center">
                                <Icon className="w-5 h-5 text-[#ED4231] mr-2" />
                                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                  {title}
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  className="h-12 px-5 text-base rounded-xl"
                                  onClick={() => selectAllTimes(timeSlots)}
                                >
                                  Selecionar todos
                                </Button>
                                <Button
                                  variant="outline"
                                  className="h-12 px-5 text-base rounded-xl"
                                  onClick={() => clearTimes(timeSlots)}
                                >
                                  Limpar
                                </Button>
                              </div>
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                              {timeSlots.map((t) => {
                                const [hh, mm] = t.split(":");
                                const endH = String(parseInt(hh) + 1).padStart(
                                  2,
                                  "0"
                                );
                                const label = `${hh}:${mm} - ${endH}:${mm}`;
                                const disabled = savedForDate.includes(t);
                                const active = selectedTimes.includes(t);
                                return (
                                  <Button
                                    key={t}
                                    variant={active ? "default" : "outline"}
                                    disabled={disabled}
                                    onClick={() => handleToggleTime(t)}
                                    className={`h-10 px-4 text-sm font-medium rounded-xl shadow-sm transition-all ${
                                      active
                                        ? "bg-[#ED4231] text-white border-2 border-[#ED4231] ring-1 ring-[#ED4231]/20"
                                        : "border-2 border-gray-300 bg-white text-gray-800 hover:border-[#ED4231] hover:bg-[#ED4231]/10"
                                    } ${
                                      disabled
                                        ? "opacity-60 cursor-not-allowed line-through"
                                        : ""
                                    }`}
                                    aria-pressed={active}
                                  >
                                    {label}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumo e ações abaixo */}
                  <div
                    ref={summaryRef}
                    className="w-full flex flex-col gap-6"
                    role="complementary"
                    aria-label="Resumo do horário selecionado"
                  >
                    {modalidade === "PRESENCIAL" && (
                      <Card className="rounded-lg">
                        <CardHeader>
                          <CardTitle>Local do atendimento</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <input
                            value={localPresencial}
                            onChange={(e) => setLocalPresencial(e.target.value)}
                            placeholder="Ex.: Sala 3, Rua Exemplo 123"
                            className="w-full py-2 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23272F]"
                          />
                        </CardContent>
                      </Card>
                    )}
                    <div className="w-full bg-[#FFF7F5] dark:bg-[#23272F] dark:border dark:border-[#23272F] rounded-lg shadow p-6 transition-colors duration-300 text-gray-900 dark:text-gray-100 border-l-4 border-[#ED4231]">
                      {selectedDates.length > 0 || selectedTimes.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-4">
                            <CalendarIcon className="w-5 h-5 text-[#ED4231]" />
                            <span className="font-semibold text-indigo-900 dark:text-indigo-200 text-lg">
                              Resumo da seleção
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-[#1f232b] rounded-xl border border-[#EDF2FB] dark:border-[#23272F] p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">Dias</span>
                                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                  {selectedDates.length} dia(s)
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedDates.map((d) => (
                                  <div
                                    key={format(d, "yyyy-MM-dd")}
                                    className="flex items-center gap-2 bg-white dark:bg-[#23272F] border border-[#EDF2FB] dark:border-[#23272F] rounded-xl px-3 py-2 shadow-sm"
                                  >
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {format(d, "dd/MM", { locale: ptBR })}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => removeDate(d)}
                                      aria-label={`Remover dia ${format(
                                        d,
                                        "dd/MM",
                                        { locale: ptBR }
                                      )}`}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-white dark:bg-[#1f232b] rounded-xl border border-[#EDF2FB] dark:border-[#23272F] p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">Horários</span>
                                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                  {selectedTimes.length} horário(s)
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedTimes.map((t) => (
                                  <span
                                    key={t}
                                    className="inline-flex items-center px-3 py-1 rounded-full border border-[#EDF2FB] dark:border-[#23272F] bg-white dark:bg-[#23272F] text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm"
                                  >
                                    {formatTimeRange(t)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#ED4231]" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Modalidade
                              </span>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              {modalidade === "ONLINE"
                                ? "Online"
                                : "Presencial"}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <CalendarIcon className="w-10 h-10 text-[#ED4231]" />
                          <span className="text-gray-400 text-base">
                            Nenhum horário selecionado
                          </span>
                          <span className="text-sm text-gray-500">
                            Escolha dias no calendário e horários à direita
                          </span>
                        </div>
                      )}
                      <div className="mt-3">
                        <ErrorMessage message={validationMessage} />
                      </div>
                    </div>
                    <div className="w-full flex gap-3 items-center justify-center mt-4 mb-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedDates([]);
                          setActiveDate(undefined);
                          setSelectedTimes([]);
                          setValidationMessage("");
                        }}
                        className="basis-[30%] h-14 text-base"
                      >
                        Limpar
                      </Button>
                      <Button
                        onClick={handleConfirm}
                        className="basis-[70%] h-14 bg-[#ED4231] hover:bg-[#c32d22] text-white text-base"
                        disabled={isLoading}
                      >
                        {isLoading ? "Salvando..." : "Salvar disponibilidade"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="text-center flex flex-col items-center">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Confirmação
                </DialogTitle>
              </DialogHeader>
              {validationMessage && (
                <p className="text-red-500 text-sm mb-4" role="alert">
                  {validationMessage}
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={() => setIsModalOpen(false)}>OK</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isSuccessModalOpen}
            onOpenChange={setIsSuccessModalOpen}
          >
            <DialogContent className="text-center flex flex-col items-center">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-green-700">
                  Horário disponibilizado!
                </DialogTitle>
              </DialogHeader>
              <p className="text-green-700 text-lg font-semibold mb-2">
                Seu horário foi salvo com sucesso.
              </p>
              <Button
                className="bg-indigo-900 hover:bg-indigo-800 text-white py-2 w-3/4 mt-2"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                OK
              </Button>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DisponibilizarHorario;
