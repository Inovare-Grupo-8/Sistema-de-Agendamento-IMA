import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Calendar as CalendarIcon,
  User,
  Clock,
  Menu,
  History,
  ChevronRight,
  Sun,
  Moon,
  Home as HomeIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  ConsultaDto,
  ProximaConsulta,
  ConsultaOutput,
} from "@/services/consultaApi";
import { useState, useEffect, useCallback, useRef } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import ErrorMessage from "./ErrorMessage";
import { STATUS_COLORS } from "../constants/ui";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { professionalNavigationItems } from "@/utils/userNavigation";
import { ConsultaApiService } from "@/services/consultaApi";
import { getUserType, isVolunteer } from "@/utils/userTypeDetector";
import { useUserData } from "@/hooks/useUserData";
import type { UserData } from "@/hooks/useUserData";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import {
  useVoluntario,
  DadosPessoaisVoluntario,
  DadosProfissionaisVoluntario,
} from "@/hooks/useVoluntario";

interface ConsultaSummary {
  total: number;
  proxima: Date | null;
  mes: number; // Consultas do mês
  semana: number; // Consultas da semana
}

interface AtendimentoSummary {
  realizados: number;
  canceladas: number;
  ultimaAvaliacao: number | null;
}

// Adicionar interface para Consulta
interface Consulta {
  id: number;
  profissional: string;
  especialidade: string;
  data: Date;
  tipo: string;
  status: string;
  avaliacao?: number;
  assistido?: {
    idUsuario: number;
    email?: string;
    ficha: {
      nome: string;
      sobrenome?: string;
    };
  };
}

// Adicionar interface para dados de cancelamento
interface ConsultaCancelamento {
  id: number;
  profissional: string;
  data: Date;
  tipo: string;
  especialidade?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const { t } = useTranslation();

  // Detect user type for conditional rendering
  const userType = getUserType();
  const isUserVolunteer = isVolunteer();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage, setProfileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const { userData, updateUserData, fetchPerfil } = useUserData();
  const {
    buscarDadosPessoais,
    buscarDadosProfissionais,
    mapEnumToText,
    loading: voluntarioLoading,
    error: voluntarioError,
  } = useVoluntario();

  // Estado local para dados pessoais do voluntário
  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoaisVoluntario>({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
  });

  // Estado para dados profissionais do voluntário
  const [dadosProfissionais, setDadosProfissionais] =
    useState<DadosProfissionaisVoluntario | null>(null);
  const [funcaoVoluntario, setFuncaoVoluntario] = useState<string>("");

  // Estado para o modal de cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [consultaParaCancelar, setConsultaParaCancelar] =
    useState<Consulta | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [motivoSelecionado, setMotivoSelecionado] = useState("");
  const [cancelandoConsulta, setCancellandoConsulta] = useState(false);
  // Estado para o modal de detalhes
  const [detalhesModalOpen, setDetalhesModalOpen] = useState(false);
  const [consultaDetalhes, setConsultaDetalhes] = useState<Consulta | null>(
    null
  );

  // Estado para o modal de feedback/avaliação
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedConsultaFeedback, setSelectedConsultaFeedback] =
    useState<Consulta | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState("");
  // Estado para o calendário
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const savedDate = localStorage.getItem("selectedDateForBooking");
    return savedDate ? new Date(savedDate) : undefined;
  });

  // Salvar a data selecionada no localStorage sempre que ela mudar
  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem(
        "selectedDateForBooking",
        selectedDate.toISOString()
      );
    }
  }, [selectedDate]);

  // Carregar dados pessoais do voluntário
  useEffect(() => {
    const loadDadosPessoais = async () => {
      try {
        const dados = await buscarDadosPessoais();
        if (dados) {
          setDadosPessoais(dados);
        }
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

  // Estado para o resumo dos dados
  const [consultasSummary, setConsultasSummary] = useState<ConsultaSummary>({
    total: 0,
    proxima: null,
    mes: 0,
    semana: 0,
  });

  // Adicionando estado para o status da próxima consulta
  const [proximaConsultaData, setProximaConsultaData] = useState<{
    profissional: string;
    especialidade: string;
    tipo: string;
    status: string;
  } | null>(null); // Estado para o resumo dos dados
  const [atendimentosSummary, setAtendimentosSummary] =
    useState<AtendimentoSummary>({
      realizados: 0,
      canceladas: 0,
      ultimaAvaliacao: null,
    }); // Estado para as próximas consultas - carregado via API
  const [proximasConsultas, setProximasConsultas] = useState<Consulta[]>([]);
  // Estado para todas as consultas (para o calendário)
  const [todasConsultas, setTodasConsultas] = useState<Consulta[]>([]);
  //Proxima consulta do usuario - usando tipo Consulta que já tem profissional formatado
  const [proximaConsulta, setProximaConsulta] = useState<Consulta | null>(null);

  // A próxima consulta será obtida através dos dados das 3 próximas consultas
  // Removido useEffect que chamava endpoint inexistente
  // Estado para histórico recente - carregado via API
  const [historicoRecente, setHistoricoRecente] = useState<Consulta[]>([]);
  // Carregar dados das consultas via API uma vez, junto ao carregamento principal
  const loadHistoricoRecente = useCallback(async () => {
    try {
      // Buscar userId do localStorage
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        throw new Error("Usuário não está logado");
      }
      const user = JSON.parse(userDataStr);
      const userId = user.idUsuario;
      const tipoUsuario = user.tipo;

      if (!userId) {
        throw new Error("ID do usuário não encontrado");
      }

      // Load historical consultations (completed and canceled)
      const historicoResponse = await ConsultaApiService.getHistoricoConsultas(
        userId,
        isUserVolunteer ? "voluntario" : "assistido"
      );

      // Extrair o array de consultas do objeto retornado
      let historicoData;
      if (Array.isArray(historicoResponse)) {
        historicoData = historicoResponse;
      } else if (
        historicoResponse &&
        Array.isArray((historicoResponse as any).consultas)
      ) {
        // Caso o back-end retorne { consultas: [...], total: X, ... }
        historicoData = (historicoResponse as any).consultas;
      } else {
        console.warn("Histórico retornou dados inválidos:", historicoResponse);
        setHistoricoRecente([]);
        return;
      }

      // Determine userType based on user data
      const userTypeParam =
        String(tipoUsuario).toUpperCase() === "VOLUNTARIO"
          ? "voluntario"
          : "assistido";

      // Load evaluations and feedbacks from API
      const avaliacoesFeedback = await ConsultaApiService.getAvaliacoesFeedback(
        userId,
        userTypeParam
      );

      // Create maps for quick lookup
      const avaliacoesMap = new Map<number, number | null>();
      const feedbacksMap = new Map<number, string | null>();

      avaliacoesFeedback.avaliacoes?.forEach((avaliacao) => {
        if (avaliacao.consulta?.idConsulta) {
          avaliacoesMap.set(
            avaliacao.consulta.idConsulta,
            avaliacao.nota ?? null
          );
        }
      });

      avaliacoesFeedback.feedbacks?.forEach((feedback) => {
        if (feedback.consulta?.idConsulta) {
          feedbacksMap.set(
            feedback.consulta.idConsulta,
            feedback.comentario ?? null
          );
        }
      });

      // Convert API data to component format and filter for recent history
      const historicoFormatted: Consulta[] = historicoData
        .map((consulta: any) => {
          const consultaDate = new Date(consulta.horario);
          const consultaId = consulta.idConsulta;

          // Get evaluation for this consultation
          const rating = avaliacoesMap.get(consultaId);

          // Adapt profissional field based on user type
          // Use direct fields first, then nested objects as fallback
          let profissionalNome: string;
          if (isUserVolunteer) {
            // Volunteer sees patient name
            profissionalNome =
              consulta.nomeAssistido?.trim() ||
              (consulta.assistido?.ficha?.nome &&
              consulta.assistido?.ficha?.sobrenome
                ? `${consulta.assistido.ficha.nome} ${consulta.assistido.ficha.sobrenome}`.trim()
                : consulta.assistido?.ficha?.nome || "Assistido não informado");
          } else {
            // Assisted user sees volunteer name
            profissionalNome =
              consulta.nomeVoluntario?.trim() ||
              (consulta.voluntario?.ficha?.nome &&
              consulta.voluntario?.ficha?.sobrenome
                ? `${consulta.voluntario.ficha.nome} ${consulta.voluntario.ficha.sobrenome}`.trim()
                : consulta.voluntario?.ficha?.nome ||
                  "Voluntário não informado");
          }

          // Get specialty name from direct field or nested object
          const especialidadeNome =
            consulta.nomeEspecialidade?.trim() ||
            consulta.especialidade?.nome ||
            "Especialidade";

          // Get service type/location
          const tipoConsulta =
            consulta.local ||
            (consulta.modalidade === "ONLINE"
              ? "Consulta Online"
              : "Consulta Presencial");

          return {
            id: consultaId,
            profissional: profissionalNome,
            especialidade: especialidadeNome,
            data: consultaDate,
            tipo: tipoConsulta,
            status: consulta.status.toLowerCase() as
              | "realizada"
              | "cancelada"
              | "remarcada",
            avaliacao: rating ?? undefined,
            assistido: consulta.assistido,
          };
        })
        // Sort by date descending (most recent first) and take only last 5
        .sort((a, b) => b.data.getTime() - a.data.getTime())
        .slice(0, 5);

      setHistoricoRecente(historicoFormatted);

      // Calculate statistics for "Meu Histórico" card based on all historical data
      const consultasRealizadas = historicoData.filter(
        (consulta: any) => consulta.status.toLowerCase() === "realizada"
      ).length;

      // Calculate cancelled consultations (both from historical data and upcoming)
      const consultasHistoricoCanceladas = historicoData.filter(
        (consulta: any) => consulta.status.toLowerCase() === "cancelada"
      ).length;

      const consultasProximasCanceladas = proximasConsultas.filter(
        (consulta) => {
          return consulta.status.toLowerCase() === "cancelada";
        }
      ).length;

      const consultasCanceladas =
        consultasHistoricoCanceladas + consultasProximasCanceladas;

      // Get the most recent evaluation from real API data
      let ultimaAvaliacao = null;
      const consultasComAvaliacao = historicoFormatted.filter(
        (c) => c.avaliacao
      );
      if (consultasComAvaliacao.length > 0) {
        // Get the most recent consultation with evaluation
        const consultaRecente = consultasComAvaliacao.sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        )[0];
        ultimaAvaliacao = consultaRecente.avaliacao || null;
      }
      // Update the statistics with real data
      setAtendimentosSummary({
        realizados: consultasRealizadas,
        canceladas: consultasCanceladas,
        ultimaAvaliacao: ultimaAvaliacao,
      });

      console.log("Histórico recente carregado:", historicoFormatted);
      console.log("Estatísticas atualizadas:", {
        realizados: consultasRealizadas,
        canceladas: consultasCanceladas,
        ultimaAvaliacao: ultimaAvaliacao,
      });
    } catch (error) {
      console.error("Erro ao carregar histórico recente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico recente",
        variant: "destructive",
      });
    }
  }, [proximasConsultas, setAtendimentosSummary]);

  const atualizarResumoConsultas = async () => {
    setLoading(true);
    setError("");
    try {
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        throw new Error("Usuário não está logado");
      }
      const user = JSON.parse(userDataStr);
      const userId = user.idUsuario;
      if (!userId) {
        throw new Error("ID do usuário não encontrado");
      }
      const consultaStats = await ConsultaApiService.getAllConsultaStats(
        userId
      );
      let proximaData =
        proximasConsultas.length > 0 ? proximasConsultas[0].data : null;

      // Validate that proximaData is a valid Date object
      if (
        proximaData &&
        (!(proximaData instanceof Date) || isNaN(proximaData.getTime()))
      ) {
        console.warn("Invalid date detected in proximaData, setting to null");
        proximaData = null;
      }

      if (
        !proximaData &&
        Array.isArray(todasConsultas) &&
        todasConsultas.length
      ) {
        const hoje = new Date();
        const futuras = todasConsultas
          .filter((c) => c.data > hoje && c.status !== "cancelada")
          .sort((a, b) => a.data.getTime() - b.data.getTime());
        proximaData = futuras.length ? futuras[0].data : null;

        // Validate again after getting from todasConsultas
        if (
          proximaData &&
          (!(proximaData instanceof Date) || isNaN(proximaData.getTime()))
        ) {
          console.warn("Invalid date detected in futuras, setting to null");
          proximaData = null;
        }

        if (proximaData) {
          setProximasConsultas(futuras);
        }
      }
      setConsultasSummary({
        total: consultaStats.hoje,
        proxima: proximaData,
        mes: consultaStats.mes,
        semana: consultaStats.semana,
      });
      if (proximaData) {
        const base = proximasConsultas?.length
          ? proximasConsultas
          : todasConsultas || [];
        const proximaConsulta = base.find(
          (c) => c.data.toDateString() === proximaData.toDateString()
        );
        if (proximaConsulta) {
          setProximaConsulta(proximaConsulta);
          setProximaConsultaData({
            profissional: proximaConsulta.profissional,
            especialidade: proximaConsulta.especialidade,
            tipo: proximaConsulta.tipo,
            status: proximaConsulta.status,
          });
        }
      } else {
        setProximaConsultaData(null);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados das consultas";
      setError(message);
      setConsultasSummary({ total: 0, proxima: null, mes: 0, semana: 0 });
      setProximaConsultaData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // First load all consultations (calendar data)
      await loadTodasConsultas();
      // Then load the next 3 upcoming consultations (cards display)
      await loadProximasConsultasVoluntario();
      // Update consultation summary statistics
      await atualizarResumoConsultas();
      // Finally load recent history
      await loadHistoricoRecente();
    };
    try {
      const s = localStorage.getItem("userData");
      if (s) {
        const u = JSON.parse(s);
        setTipoUsuario(String(u?.tipo || ""));
      }
    } catch (e) {
      void e;
    }
    loadData();
  }, []);

  // Removed infinite loop useEffect that was triggering on proximasConsultas changes  // Function to load recent history including canceled consultations
  // Function to load all consultations and order them by date
  const loadTodasConsultas = async () => {
    try {
      // Buscar userId do localStorage
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        throw new Error("Usuário não está logado");
      }
      const user = JSON.parse(userDataStr);
      const userId = user.idUsuario;

      if (!userId) {
        throw new Error("ID do usuário não encontrado");
      }

      // Buscar todas as consultas atuais e futuras usando periodo="ATUAL"
      const consultasAtuaisResponse =
        await ConsultaApiService.getConsultasRecentes(userId);

      // Buscar histórico para incluir consultas passadas
      const historicoResponse = await ConsultaApiService.getHistoricoConsultas(
        userId,
        isUserVolunteer ? "voluntario" : "assistido"
      );

      // Extrair consultas do histórico
      let consultasHistorico: any[] = [];
      if (Array.isArray(historicoResponse)) {
        consultasHistorico = historicoResponse;
      } else if (
        historicoResponse &&
        Array.isArray((historicoResponse as any).consultas)
      ) {
        consultasHistorico = (historicoResponse as any).consultas;
      }

      // Combinar consultas atuais/futuras com histórico
      const todasConsultasData = [
        ...consultasAtuaisResponse,
        ...consultasHistorico,
      ];

      // Remover duplicatas (pelo ID)
      const consultasUnicas = todasConsultasData.filter(
        (consulta, index, self) =>
          index === self.findIndex((c) => c.idConsulta === consulta.idConsulta)
      );

      const consultasConvertidas: Consulta[] = consultasUnicas
        .map((consulta) => {
          // Adapt profissional field based on user type
          let profissionalNome: string;
          if (isUserVolunteer) {
            // Volunteer sees patient name
            const nome =
              consulta.assistido?.ficha?.nome || consulta.assistido?.nome;
            const sobrenome =
              consulta.assistido?.ficha?.sobrenome ||
              consulta.assistido?.sobrenome;
            profissionalNome =
              [nome, sobrenome].filter(Boolean).join(" ") ||
              "Assistido não informado";
          } else {
            // Assisted user sees volunteer name
            const nomeVol =
              consulta.voluntario?.ficha?.nome || consulta.voluntario?.nome;
            const sobrenomeVol =
              consulta.voluntario?.ficha?.sobrenome ||
              consulta.voluntario?.sobrenome;
            profissionalNome =
              [nomeVol, sobrenomeVol].filter(Boolean).join(" ") ||
              "Profissional não informado";
          }

          return {
            id: consulta.idConsulta,
            profissional: profissionalNome,
            especialidade:
              consulta.especialidade?.nome || "Especialidade não informada",
            data: new Date(consulta.horario),
            tipo:
              consulta.modalidade === "ONLINE"
                ? "Consulta Online"
                : "Consulta Presencial",
            status: consulta.status.toLowerCase(),
            avaliacao: undefined, // ajuste conforme necessário
            assistido: consulta.assistido, // agora é o objeto!
          };
        })
        .filter((consulta) => {
          // Filter out consultations with invalid dates
          const isValidDate =
            consulta.data instanceof Date && !isNaN(consulta.data.getTime());
          if (!isValidDate) {
            console.warn(
              `Invalid date detected for consultation ${consulta.id}, skipping`
            );
          }
          return isValidDate;
        });
      setTodasConsultas(consultasConvertidas);
      // Filter upcoming consultations (future dates only) and sort by date (nearest first)
      const agora = new Date();
      const consultasFuturas = consultasConvertidas
        .filter((consulta) => consulta.data > agora)
        .sort((a, b) => a.data.getTime() - b.data.getTime());
      setProximasConsultas(consultasFuturas);

      console.log(
        `✅ Calendário atualizado: ${consultasConvertidas.length} consultas totais, ${consultasFuturas.length} próximas consultas`
      );
    } catch (error) {
      console.error("Erro ao carregar todas as consultas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as consultas",
        variant: "destructive",
      });
    }
  };

  const loadProximasConsultasVoluntario = async () => {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        throw new Error("Usuário não está logado");
      }
      const user = JSON.parse(userDataStr);
      const userId = user.idUsuario;
      const tipoUsuario = user.tipo;
      if (!userId) {
        throw new Error("ID do usuário não encontrado");
      }

      // Determine userType based on user data
      const userTypeParam =
        String(tipoUsuario).toUpperCase() === "VOLUNTARIO"
          ? "voluntario"
          : "assistido";

      const proximas = await ConsultaApiService.getProximasConsultas(
        userId,
        userTypeParam
      );

      const proximasFormatadas: Consulta[] = (proximas || []).map(
        (consulta) => {
          // Adapt profissional field based on user type
          let profissionalNome: string;
          if (userTypeParam === "voluntario") {
            // Volunteer sees patient name
            const nome =
              consulta.assistido?.ficha?.nome || consulta.assistido?.nome;
            const sobrenome =
              consulta.assistido?.ficha?.sobrenome ||
              consulta.assistido?.sobrenome;
            profissionalNome =
              [nome, sobrenome].filter(Boolean).join(" ") ||
              "Assistido não informado";
          } else {
            // Assisted user sees volunteer name
            const nomeVol =
              consulta.voluntario?.ficha?.nome || consulta.voluntario?.nome;
            const sobrenomeVol =
              consulta.voluntario?.ficha?.sobrenome ||
              consulta.voluntario?.sobrenome;
            profissionalNome =
              [nomeVol, sobrenomeVol].filter(Boolean).join(" ") ||
              "Profissional não informado";
          }

          return {
            id: consulta.idConsulta,
            profissional: profissionalNome,
            especialidade:
              consulta.especialidade?.nome || "Especialidade não informada",
            data: new Date(consulta.horario),
            tipo:
              consulta.modalidade === "ONLINE"
                ? "Consulta Online"
                : "Consulta Presencial",
            status: String(consulta.status || "AGENDADA").toLowerCase(),
            assistido: consulta.assistido,
          };
        }
      );

      setProximasConsultas(
        proximasFormatadas.sort((a, b) => a.data.getTime() - b.data.getTime())
      );

      console.log(
        `✅ Próximas consultas carregadas (${userTypeParam}): ${proximasFormatadas.length} consultas`
      );
    } catch (error) {
      console.error("Erro ao carregar próximas consultas:", error);
    }
  };

  const statusColors: Record<string, string> = {
    agendada:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    realizada:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    remarcada:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };

  // Função para formatar a data
  const formatarData = (data: Date | null) => {
    if (!data || !(data instanceof Date) || isNaN(data.getTime())) {
      return "Data não disponível";
    }

    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje às ${format(data, "HH:mm")}`;
    } else if (data.toDateString() === amanha.toDateString()) {
      return `Amanhã às ${format(data, "HH:mm")}`;
    } else {
      return `${format(data, "dd/MM", { locale: ptBR })} às ${format(
        data,
        "HH:mm"
      )}`;
    }
  };

  // Calcular estrelas para avaliação
  const renderEstrelas = (avaliacao: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
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
    switch (status) {
      case "agendada":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case "realizada":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-500"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        );
      case "cancelada":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        );
      case "remarcada":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Função para abrir modal de cancelamento
  const abrirModalDetalhes = (consulta: Consulta) => {
    setConsultaDetalhes(consulta);
    setDetalhesModalOpen(true);
  };

  const abrirModalCancelamento = (consulta: Consulta) => {
    setConsultaParaCancelar(consulta);
    setShowCancelModal(true);
    setMotivoCancelamento("");
    setMotivoSelecionado("");
  };

  // Função para abrir modal de feedback/avaliação
  const abrirModalFeedback = (consulta: Consulta) => {
    setSelectedConsultaFeedback(consulta);
    setCurrentRating(consulta.avaliacao || 0);
    setCurrentComment("");
    setShowFeedbackModal(true);
  };

  // Função para salvar feedback/avaliação
  const saveFeedback = async () => {
    if (!selectedConsultaFeedback || currentRating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione pelo menos uma estrela.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send evaluation to API
      await ConsultaApiService.adicionarAvaliacao(
        Number(selectedConsultaFeedback.id),
        currentRating
      );

      // Send feedback comment if provided
      if (currentComment?.trim()) {
        await ConsultaApiService.adicionarFeedback(
          Number(selectedConsultaFeedback.id),
          currentComment.trim()
        );
      }

      // Update local state - both historicoRecente and reload data
      setHistoricoRecente((prev) =>
        prev.map((c) =>
          c.id === selectedConsultaFeedback.id
            ? { ...c, avaliacao: currentRating }
            : c
        )
      );

      // Reload histórico recente to get updated evaluation data
      setTimeout(() => {
        loadHistoricoRecente();
      }, 100);

      toast({
        title: "Feedback salvo!",
        description: "Obrigado pela sua avaliação.",
        variant: "default",
      });

      setShowFeedbackModal(false);
      setSelectedConsultaFeedback(null);
      setCurrentRating(0);
      setCurrentComment("");
    } catch (error: unknown) {
      console.error("Error saving feedback:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao salvar sua avaliação. Tente novamente.";
      toast({
        title: "Erro ao salvar feedback",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  // Função para confirmar cancelamento
  const confirmarCancelamento = async () => {
    if (!motivoSelecionado) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, selecione um motivo para o cancelamento.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (motivoSelecionado === "outro" && !motivoCancelamento.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, descreva o motivo do cancelamento.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!consultaParaCancelar) return;

    setCancellandoConsulta(true);

    try {
      // Call the actual API to cancel the consultation
      await ConsultaApiService.cancelarConsulta(consultaParaCancelar.id);

      // Update the status of the consultation to cancelled
      setProximasConsultas((prev) =>
        prev.map((consulta) =>
          consulta.id === consultaParaCancelar.id
            ? { ...consulta, status: "cancelada" }
            : consulta
        )
      );

      // Reload data to get accurate statistics
      try {
        // Buscar userId do localStorage
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          const userId = user.idUsuario;

          if (userId) {
            const consultaStats = await ConsultaApiService.getAllConsultaStats(
              userId
            );
            setConsultasSummary((prev) => ({
              ...prev,
              total: consultaStats.hoje,
              mes: consultaStats.mes,
              semana: consultaStats.semana,
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao recarregar estatísticas:", error);
      } // Reload all consultations to reflect the change
      await loadTodasConsultas();

      // Reload recent history to show the canceled consultation
      // This will automatically recalculate statistics due to useEffect
      setTimeout(() => {
        loadHistoricoRecente();
      }, 100);

      toast({
        title: "Consulta cancelada",
        description: "Sua consulta foi cancelada com sucesso.",
        variant: "destructive",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      toast({
        title: "Erro ao cancelar consulta",
        description:
          "Ocorreu um erro ao cancelar sua consulta. Tente novamente.",
        variant: "destructive",
      });
    }

    setCancellandoConsulta(false);
    setShowCancelModal(false);
    setConsultaParaCancelar(null);
    setMotivoCancelamento("");
    setMotivoSelecionado("");
  };

  // Função para fechar modal
  const fecharModal = () => {
    if (cancelandoConsulta) return;
    setShowCancelModal(false);
    setConsultaParaCancelar(null);
    setMotivoCancelamento("");
    setMotivoSelecionado("");
  };

  // Calcular tempo até a consulta
  const calcularTempoAteConsulta = (dataConsulta: Date) => {
    const agora = new Date();
    const diferenca = dataConsulta.getTime() - agora.getTime();
    const horas = Math.floor(diferenca / (1000 * 60 * 60));

    if (horas < 24) {
      return `${horas}h`;
    } else {
      const dias = Math.floor(horas / 24);
      return `${dias} dia${dias > 1 ? "s" : ""}`;
    }
  };

  // Opções de motivo para cancelamento
  const motivosCancelamento = [
    { value: "agenda", label: "Conflito de agenda" },
    { value: "emergencia", label: "Emergência pessoal" },
    { value: "doenca", label: "Problemas de saúde" },
    { value: "trabalho", label: "Compromisso de trabalho" },
    { value: "financeiro", label: "Motivos financeiros" },
    { value: "tecnico", label: "Problemas técnicos" },
    { value: "outro", label: "Outro motivo" },
  ];

  // Função para gerar link de videochamada simulado
  const gerarLinkVideochamada = (): string => {
    const links = [
      "https://meet.google.com/abc-defg-hij",
      "https://zoom.us/j/123456789",
      "https://teams.microsoft.com/l/meetup-join/...",
    ];
    return links[Math.floor(Math.random() * links.length)];
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          const updates: Partial<UserData> = {};

          if (typeof parsedUserData.nome === "string") {
            updates.nome = parsedUserData.nome.trim();
          }

          const sobrenomeDireto =
            typeof parsedUserData.sobrenome === "string"
              ? parsedUserData.sobrenome.trim()
              : typeof parsedUserData.sobreNome === "string"
              ? parsedUserData.sobreNome.trim()
              : "";

          if (sobrenomeDireto) {
            updates.sobrenome = sobrenomeDireto;
          } else if (typeof parsedUserData.nomeCompleto === "string") {
            const [primeiroNome, ...resto] = parsedUserData.nomeCompleto
              .trim()
              .split(/\s+/);
            if (!updates.nome && primeiroNome) {
              updates.nome = primeiroNome;
            }
            if (resto.length > 0) {
              updates.sobrenome = resto.join(" ");
            }
          }

          if (typeof parsedUserData.email === "string") {
            updates.email = parsedUserData.email.trim();
          }

          if (typeof parsedUserData.telefone === "string") {
            updates.telefone = parsedUserData.telefone.trim();
          }

          if (typeof parsedUserData.dataNascimento === "string") {
            updates.dataNascimento = parsedUserData.dataNascimento.trim();
          } else if (typeof parsedUserData.data_nascimento === "string") {
            updates.dataNascimento = parsedUserData.data_nascimento.trim();
          }

          if (typeof parsedUserData.genero === "string") {
            updates.genero = parsedUserData.genero.trim();
          } else if (typeof parsedUserData.sexo === "string") {
            updates.genero = parsedUserData.sexo.trim();
          }

          if (Object.keys(updates).length > 0) {
            updateUserData(updates);
          }

          if (parsedUserData.fotoUrl) {
            setProfileImage(parsedUserData.fotoUrl);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, [setProfileImage, updateUserData]);

  const perfilIntervalRef = useRef<number | null>(null);
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfile = await fetchPerfil();
        console.log("User profile data:", userProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do usuário.",
          variant: "destructive",
        });
      }
    };
    loadUserData();
    if (!perfilIntervalRef.current) {
      const id = window.setInterval(loadUserData, 300000);
      perfilIntervalRef.current = id;
    }
    return () => {
      if (perfilIntervalRef.current) {
        clearInterval(perfilIntervalRef.current);
        perfilIntervalRef.current = null;
      }
    };
  }, []);

  const [voluntarioProfile, setVoluntarioProfile] = useState<{
    nome: string;
    sobrenome: string;
    funcao: string;
    profileImage: string | null;
  }>({ nome: "", sobrenome: "", funcao: "", profileImage: null });

  useEffect(() => {
    const data = localStorage.getItem("voluntarioProfileData");
    if (data) {
      try {
        setVoluntarioProfile(JSON.parse(data));
      } catch (error) {
        console.error(
          "Erro ao parsear voluntarioProfileData do localStorage",
          error
        );
      }
    }
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans text-base">
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
            </Button>{" "}
            <ProfileAvatar
              profileImage={profileImage}
              name={
                `${userData?.nome} ${userData?.sobrenome}`.trim() || "Usuário"
              }
              size="w-10 h-10"
              className="border-2 border-[#ED4231] shadow"
            />
            <span className="font-bold text-indigo-900 dark:text-gray-100">
              {`${userData?.nome} ${userData?.sobrenome}`.trim() || "Usuário"}
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
              name={
                `${dadosPessoais?.nome || userData?.nome} ${
                  dadosPessoais?.sobrenome || userData?.sobrenome
                }`.trim() || "Voluntário"
              }
              size="w-16 h-16"
              className="border-4 border-[#EDF2FB] shadow"
            />
            <span className="font-bold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">
              {dadosPessoais?.nome || userData?.nome}{" "}
              {dadosPessoais?.sobrenome || userData?.sobrenome}
            </span>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              {funcaoVoluntario || "Profissional"}
            </Badge>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {/* Substituir os items de menu por uma iteração do professionalNavigationItems */}
            {Object.values(professionalNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${
                        location.pathname === item.path
                          ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-[#ED4231]"
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
            ))}
            {/* Botão de Sair permanece o mesmo */}{" "}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => {
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
                      } catch (e) {
                        void e;
                      }
                      navigate("/login", { replace: true });
                    }}
                    className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 text-[#ED4231] flex items-center gap-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
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
          aria-label="Conteúdo principal do dashboard"
          className={`flex-1 w-full md:w-auto transition-all duration-500 ease-in-out ${
            sidebarOpen ? "" : "ml-0"
          }`}
        >
          {" "}
          <header
            className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-[#23272F]/95 shadow-md fixed top-0 left-0 right-0 z-20 backdrop-blur-md transition-colors duration-300 border-b border-[#EDF2FB] dark:border-[#23272F]"
            role="banner"
            aria-label="Cabeçalho do dashboard"
          >
            {" "}
            <div className="flex items-center gap-3">
              <ProfileAvatar
                profileImage={profileImage}
                name={
                  `${userData?.nome} ${userData?.sobrenome}`.trim() || "Usuário"
                }
                size="w-10 h-10"
                className="border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200"
              />
              <span className="font-bold text-indigo-900 dark:text-gray-100">
                {userData?.nome} {userData?.sobrenome}
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
            </div>
          </header>
          {/* Content area with proper spacing */}
          <div className="pt-20 md:pt-24 min-h-screen">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-2">
                  Dashboard
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
                  Bem-vindo(a), {userData?.nome}! Aqui está o resumo{" "}
                  {isUserVolunteer
                    ? "dos seus atendimentos"
                    : "das suas consultas"}
                  .
                </p>

                {error && <ErrorMessage message={error} />}

                {/* Cards do dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* Card de Consultas */}
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Clock className="w-5 h-5 text-[#ED4231] cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Resumo de{" "}
                              {isUserVolunteer
                                ? "todos os seus atendimentos agendados"
                                : "todas as suas consultas agendadas"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {isUserVolunteer ? "Atendimentos" : "Consultas"}
                      </CardTitle>
                      <CardDescription>
                        Visão geral{" "}
                        {isUserVolunteer
                          ? "dos seus atendimentos"
                          : "das suas consultas"}
                      </CardDescription>
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
                            {" "}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className="flex flex-col items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md cursor-help gap-1"
                                >
                                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300 block">
                                    {consultasSummary.total || 0}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400 block">
                                    Hoje
                                  </span>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {isUserVolunteer
                                    ? "Atendimentos agendados para hoje"
                                    : "Consultas agendadas para hoje"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className="flex flex-col items-center justify-center p-2 bg-green-50 dark:bg-green-900/20 rounded-md cursor-help gap-1"
                                >
                                  <span className="text-lg font-bold text-green-700 dark:text-green-300 block">
                                    {consultasSummary.semana || 0}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400 block">
                                    Semana
                                  </span>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {isUserVolunteer
                                    ? "Atendimentos agendados para esta semana"
                                    : "Consultas agendadas para esta semana"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className="flex flex-col items-center justify-center p-2 bg-red-50 dark:bg-red-900/20 rounded-md cursor-help gap-1"
                                >
                                  <span className="text-lg font-bold text-red-700 dark:text-red-300 block">
                                    {consultasSummary.mes || 0}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400 block">
                                    Mês
                                  </span>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Total de{" "}
                                  {isUserVolunteer
                                    ? "atendimentos agendados"
                                    : "consultas agendadas"}{" "}
                                  para este mês
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          {consultasSummary.proxima ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="mt-3 border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:border-[#ED4231]/30 dark:hover:border-[#ED4231]/30 transition-colors"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                                  {isUserVolunteer
                                    ? "Próximo atendimento:"
                                    : "Próxima consulta:"}
                                </h3>
                                {proximaConsulta && (
                                  <div className="flex items-center gap-1">
                                    {renderStatusIcon(
                                      proximaConsulta.status.toLocaleLowerCase()
                                    )}
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      Status:{" "}
                                      {proximaConsulta.status === "AGENDADA"
                                        ? "Confirmada"
                                        : proximaConsulta.status === "REALIZADA"
                                        ? "Realizada"
                                        : proximaConsulta.status === "CANCELADA"
                                        ? "Cancelada"
                                        : "Remarcada"}
                                    </span>
                                  </div>
                                )}
                              </div>{" "}
                              {proximaConsulta && proximaConsultaData ? (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                      {proximaConsulta.profissional}
                                    </span>
                                    <Badge
                                      className={
                                        statusColors[proximaConsultaData.status]
                                      }
                                    >
                                      {proximaConsultaData.especialidade}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {proximaConsulta.tipo}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {proximaConsulta.data.toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 border-t border-dashed border-gray-200 dark:border-gray-700 pt-2">
                                    <Clock className="w-4 h-4 text-[#ED4231]" />
                                    <span className="text-sm font-medium text-[#ED4231]">
                                      {formatarData(proximaConsulta.data)}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-xs flex gap-1 items-center flex-1 border-[#ED4231] text-[#ED4231] hover:bg-[#ED4231]/10"
                                          onClick={() => {
                                            const consulta =
                                              proximasConsultas.find(
                                                (c) =>
                                                  c.data.toDateString() ===
                                                  consultasSummary.proxima?.toDateString()
                                              );
                                            if (consulta)
                                              abrirModalCancelamento(consulta);
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12Z" />
                                            <path d="m10 11 4 4m0-4-4 4" />
                                            <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                                          </svg>
                                          Cancelar
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Cancelar esta consulta (sujeito à
                                          política de cancelamento)
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-xs flex gap-1 items-center flex-1 border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                          onClick={() =>
                                            proximaConsultaData &&
                                            abrirModalDetalhes({
                                              id:
                                                proximasConsultas.find(
                                                  (c) =>
                                                    c.data.toDateString() ===
                                                    consultasSummary.proxima?.toDateString()
                                                )?.id || 1,
                                              profissional:
                                                proximaConsultaData.profissional,
                                              especialidade:
                                                proximaConsultaData.especialidade,
                                              data: consultasSummary.proxima,
                                              tipo: proximaConsultaData.tipo,
                                              status:
                                                proximaConsultaData.status,
                                            })
                                          }
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M10 11h2v5" />
                                            <circle cx="12" cy="7" r="1" />
                                            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                          </svg>
                                          Detalhes
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Ver informações completas sobre esta
                                          consulta
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
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
                                Você não tem nenhuma consulta agendada para os
                                próximos dias.
                              </span>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Link
                        to={
                          String(tipoUsuario || "").toUpperCase() ===
                          "VOLUNTARIO"
                            ? "/agenda"
                            : "/agenda-user"
                        }
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1"
                      >
                        {isUserVolunteer
                          ? "Ver todos os atendimentos"
                          : "Ver todas as consultas"}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      {!loading && consultasSummary.proxima && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-xs p-0 h-auto text-gray-500 hover:text-[#ED4231]"
                              onClick={() =>
                                toast({
                                  title: "Lembrete configurado",
                                  description:
                                    "Você receberá um lembrete antes da consulta",
                                  duration: 3000,
                                })
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                              </svg>
                              Lembrar-me
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Receber notificações antes da consulta por email e
                              SMS
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </CardFooter>
                  </Card>
                  {/* Card de Atendimentos */}
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <User className="w-5 h-5 text-[#ED4231] cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Histórico das suas consultas realizadas e
                              avaliações
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        Atendimento
                      </CardTitle>
                      <CardDescription>
                        Histórico de consultas realizadas
                      </CardDescription>
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Consultas realizadas:
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {atendimentosSummary.realizados}
                            </span>
                          </div>{" "}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Consultas canceladas:
                            </span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {atendimentosSummary.canceladas}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Última avaliação:
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1 cursor-help">
                                  {atendimentosSummary.ultimaAvaliacao !==
                                  null ? (
                                    <div className="flex">
                                      {renderEstrelas(
                                        atendimentosSummary.ultimaAvaliacao
                                      )}
                                    </div>
                                  ) : (
                                    "N/A"
                                  )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Sua última avaliação dada para um profissional
                                  (1-5 estrelas)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>{" "}
                  {/* Card de Calendário (substituindo Ações Rápidas) */}
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CalendarIcon className="w-5 h-5 text-[#ED4231] cursor-help" />
                          </TooltipTrigger>{" "}
                          <TooltipContent>
                            <p>
                              Calendário somente leitura - clique em datas com
                              consultas para ver detalhes
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        Calendário
                      </CardTitle>
                      <CardDescription>
                        Clique em datas com consultas para ver detalhes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {" "}
                      <div className="flex justify-center">
                        {" "}
                        <Calendar
                          mode="single"
                          selected={undefined} // Removido para tornar apenas leitura
                          onSelect={(date) => {
                            if (!date) return;
                            const iso = new Date(date);
                            iso.setHours(0, 0, 0, 0);
                            const isoStr = `${iso.getFullYear()}-${String(
                              iso.getMonth() + 1
                            ).padStart(2, "0")}-${String(
                              iso.getDate()
                            ).padStart(2, "0")}`;
                            const hoje = new Date();
                            hoje.setHours(0, 0, 0, 0);
                            const isPast = iso.getTime() < hoje.getTime();
                            const isVoluntario =
                              String(tipoUsuario || "").toUpperCase() ===
                              "VOLUNTARIO";
                            const target = isPast
                              ? isVoluntario
                                ? "/historico"
                                : "/historico-user"
                              : isVoluntario
                              ? "/agenda-voluntario"
                              : "/agenda-user";
                            navigate(`${target}?date=${isoStr}`);
                          }}
                          className="rounded-md border border-[#EDF2FB] dark:border-[#444857] [&_button]:cursor-pointer [&_button[disabled]]:cursor-default"
                          locale={ptBR}
                          disabled={() => false}
                          initialFocus
                          modifiers={{
                            booked: (date) => {
                              const agora = new Date();
                              agora.setHours(0, 0, 0, 0);
                              return todasConsultas.some((consulta) => {
                                const consultaDate = new Date(consulta.data);
                                consultaDate.setHours(0, 0, 0, 0);
                                return (
                                  consultaDate.getTime() >= agora.getTime() &&
                                  consulta.data.toDateString() ===
                                    date.toDateString()
                                );
                              });
                            },
                            past: (date) => {
                              const agora = new Date();
                              agora.setHours(0, 0, 0, 0);
                              const dateCheck = new Date(date);
                              dateCheck.setHours(0, 0, 0, 0);
                              return todasConsultas.some((consulta) => {
                                const consultaDate = new Date(consulta.data);
                                consultaDate.setHours(0, 0, 0, 0);
                                return (
                                  consultaDate.getTime() < agora.getTime() &&
                                  consulta.data.toDateString() ===
                                    date.toDateString()
                                );
                              });
                            },
                          }}
                          modifiersStyles={{
                            booked: {
                              backgroundColor: "rgba(237, 66, 49, 0.1)",
                              borderColor: "rgba(237, 66, 49, 0.5)",
                              color: "#ED4231",
                              fontWeight: "bold",
                              cursor: "pointer",
                            },
                            past: {
                              backgroundColor: "rgba(100, 116, 139, 0.1)",
                              borderColor: "rgba(100, 116, 139, 0.3)",
                              color: "#64748b",
                              fontWeight: "bold",
                              cursor: "pointer",
                            },
                          }}
                        />
                      </div>
                      {/* Legenda do calendário */}
                      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{
                              backgroundColor: "rgba(237, 66, 49, 0.1)",
                              borderColor: "rgba(237, 66, 49, 0.5)",
                            }}
                          ></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Consultas futuras
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{
                              backgroundColor: "rgba(100, 116, 139, 0.1)",
                              borderColor: "rgba(100, 116, 139, 0.3)",
                            }}
                          ></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Consultas passadas
                          </span>
                        </div>
                      </div>
                      {/* Comentado: Seção de data selecionada removida para manter calendário apenas de visualização
                    {selectedDate && (
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
                    */}
                    </CardContent>
                    {/* Comentado: CardFooter removido para manter calendário apenas de visualização
                  <CardFooter>
                    {selectedDate ? (
                      <div className="w-full space-y-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ir para a tela de agendamento com esta data pré-selecionada</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <div className="flex justify-between items-center text-xs">
                          <Link to={(String(tipoUsuario || "").toUpperCase() === "VOLUNTARIO" ? "/agenda-voluntario" : "/agenda-user")} className="text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1">
                            Ver minha agenda
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remover a data selecionada do calendário</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Selecione uma data para agendar uma consulta
                        </p>
                        <Link to={(String(tipoUsuario || "").toUpperCase() === "VOLUNTARIO" ? "/agenda-voluntario" : "/agenda-user")}>
                          <Button variant="outline" size="sm" className="text-xs border-[#ED4231] text-[#ED4231] hover:bg-[#ED4231]/10">
                            Ver minha agenda
                          </Button>
                        </Link>
                      </div>
                    )}                  </CardFooter>
                  */}
                  </Card>
                </div>

                {/* Seções de Próximas Consultas e Histórico Recente */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Seção Próximas Consultas */}
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none">
                    {" "}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Clock className="w-5 h-5 text-[#ED4231] cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Lista{" "}
                                  {isUserVolunteer
                                    ? "dos seus próximos atendimentos agendados"
                                    : "das suas próximas consultas agendadas"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            {isUserVolunteer
                              ? "Próximos Atendimentos"
                              : "Próximas Consultas"}
                          </CardTitle>
                          <CardDescription>
                            {isUserVolunteer
                              ? "Atendimentos agendados para os próximos dias"
                              : "Consultas agendadas para os próximos dias"}
                          </CardDescription>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800 cursor-help"
                            >
                              {proximasConsultas.length} agendadas
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Número total de{" "}
                              {isUserVolunteer
                                ? "atendimentos agendados"
                                : "consultas agendadas"}{" "}
                              para os próximos dias
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div
                              key={i}
                              className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg"
                            >
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
                              transition={{
                                duration: 0.3,
                                delay: consulta.id * 0.1,
                              }}
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
                                        <p>
                                          Status:{" "}
                                          {consulta.status === "agendada"
                                            ? "Consulta confirmada e agendada"
                                            : consulta.status === "realizada"
                                            ? "Consulta já foi realizada"
                                            : consulta.status === "cancelada"
                                            ? "Consulta foi cancelada"
                                            : "Consulta foi remarcada"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                      {consulta.profissional}
                                    </span>
                                  </div>
                                  <Badge
                                    className={statusColors[consulta.status]}
                                  >
                                    {consulta.status === "agendada"
                                      ? "Agendada"
                                      : consulta.status === "realizada"
                                      ? "Realizada"
                                      : consulta.status === "cancelada"
                                      ? "Cancelada"
                                      : "Remarcada"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="inline-flex items-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-1"
                                      >
                                        <path d="M2 3h20" />
                                        <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
                                        <path d="m7 16 5 5 5-5" />
                                      </svg>
                                      {consulta.especialidade}
                                    </span>
                                  </span>{" "}
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
                                          <span className="text-sm font-medium">
                                            {formatarData(consulta.data)}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Data e horário da consulta:{" "}
                                          {format(
                                            consulta.data,
                                            "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                            { locale: ptBR }
                                          )}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="flex gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-gray-500 h-auto p-0"
                                          onClick={() => {
                                            abrirModalDetalhes(consulta);
                                            toast({
                                              title: "Detalhes da consulta",
                                              description:
                                                "As informações detalhadas da consulta foram carregadas.",
                                              duration: 3000,
                                            });
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="mr-1"
                                          >
                                            <path d="M10 11h2v5" />
                                            <circle cx="12" cy="7" r="1" />
                                            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                          </svg>
                                          Detalhes
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Ver informações detalhadas da consulta
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 h-auto p-0"
                                          onClick={() =>
                                            abrirModalCancelamento(consulta)
                                          }
                                        >
                                          {" "}
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="mr-1"
                                          >
                                            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12Z" />
                                            <path d="m10 11 4 4m0-4-4 4" />
                                            <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                                          </svg>
                                          Cancelar
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Cancelar esta consulta (pode haver
                                          taxas)
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Clock
                            className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600"
                            aria-hidden="true"
                          />
                          <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-1">
                            {isUserVolunteer
                              ? "Sem atendimentos agendados"
                              : "Sem consultas agendadas"}
                          </div>
                          <div className="text-gray-400 dark:text-gray-500 text-sm">
                            Você não tem{" "}
                            {isUserVolunteer
                              ? "nenhum atendimento agendado"
                              : "nenhuma consulta agendada"}{" "}
                            para os próximos dias.
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Link
                        to={
                          String(tipoUsuario || "").toUpperCase() ===
                          "VOLUNTARIO"
                            ? "/agenda"
                            : "/agenda-user"
                        }
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1"
                      >
                        {isUserVolunteer
                          ? "Ver todos os atendimentos"
                          : "Ver todas as consultas"}
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <History className="w-5 h-5 text-[#ED4231] cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Histórico{" "}
                                  {isUserVolunteer
                                    ? "dos seus atendimentos mais recentes"
                                    : "das suas consultas mais recentes"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            Histórico Recente
                          </CardTitle>
                          <CardDescription>
                            Últimas{" "}
                            {isUserVolunteer
                              ? "sessões realizadas"
                              : "consultas realizadas"}
                          </CardDescription>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800 cursor-help"
                            >
                              {atendimentosSummary.realizados} realizadas
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Total de{" "}
                              {isUserVolunteer
                                ? "atendimentos já realizados por você"
                                : "consultas já realizadas por você"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg"
                            >
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
                              transition={{
                                duration: 0.3,
                                delay: consulta.id * 0.1,
                              }}
                              className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-[#ED4231]/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    {renderStatusIcon(consulta.status)}
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                      {consulta.assistido?.ficha?.nome}{" "}
                                      {consulta.assistido?.ficha?.sobrenome}
                                    </span>
                                  </div>
                                  <Badge
                                    className={statusColors[consulta.status]}
                                  >
                                    {consulta.status === "agendada"
                                      ? "Agendada"
                                      : consulta.status === "realizada"
                                      ? "Realizada"
                                      : consulta.status === "cancelada"
                                      ? "Cancelada"
                                      : "Remarcada"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="inline-flex items-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-1"
                                      >
                                        <path d="M2 3h20" />
                                        <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
                                        <path d="m7 16 5 5 5-5" />
                                      </svg>
                                      {consulta.especialidade}
                                    </span>
                                  </span>{" "}
                                  <span className="text-xs text-gray-500 dark:text-gray-500">
                                    <span className="inline-flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {consulta.tipo}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    <span className="text-sm">
                                      {formatarData(consulta.data)}
                                    </span>
                                  </div>
                                  {consulta.status === "realizada" &&
                                    consulta.avaliacao && (
                                      <div className="flex items-center gap-2">
                                        <strong>Sua avaliação:</strong>
                                        <div className="flex">
                                          {renderEstrelas(consulta.avaliacao)}
                                        </div>
                                        <span>({consulta.avaliacao}/5)</span>
                                      </div>
                                    )}
                                </div>
                                {consulta.status === "realizada" && (
                                  <div className="flex justify-end mt-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      onClick={() =>
                                        abrirModalDetalhes(consulta)
                                      }
                                    >
                                      Ver detalhes
                                    </Button>{" "}
                                    {!consulta.avaliacao && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                        onClick={() =>
                                          abrirModalFeedback(consulta)
                                        }
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
                          <History
                            className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600"
                            aria-hidden="true"
                          />
                          <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-1">
                            Sem histórico recente
                          </div>
                          <div className="text-gray-400 dark:text-gray-500 text-sm">
                            Você ainda não{" "}
                            {isUserVolunteer
                              ? "realizou nenhum atendimento"
                              : "realizou nenhuma consulta"}
                            .
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Link
                        to="/historico-user"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-[#ED4231] dark:hover:text-[#ED4231] flex items-center gap-1"
                      >
                        {isUserVolunteer
                          ? "Ver histórico completo de atendimentos"
                          : "Ver histórico completo"}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      {!loading &&
                        historicoRecente.some(
                          (consulta) =>
                            consulta.status === "realizada" &&
                            !consulta.avaliacao
                        ) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs border-amber-500 text-amber-500 hover:bg-amber-500/10"
                                onClick={() =>
                                  toast({
                                    title: "Avaliação em desenvolvimento",
                                    description:
                                      "A funcionalidade de avaliação estará disponível em breve.",
                                    duration: 3000,
                                  })
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-1"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                Avaliar Consultas
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Avaliar consultas realizadas que ainda não foram
                                avaliadas
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal de Confirmação de Cancelamento */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-[#23272F] border border-[#EDF2FB] dark:border-[#444857] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ED4231"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-600 dark:text-red-400"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="m12 17 .01 0" />
                  </svg>
                </div>
                Cancelar Consulta
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Você está prestes a cancelar uma consulta agendada. Esta ação é
                irreversível e pode estar sujeita às políticas de cancelamento.
              </DialogDescription>
            </DialogHeader>

            {consultaParaCancelar && (
              <div className="space-y-6">
                {/* Detalhes da Consulta */}
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Detalhes da Consulta
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Consulta que será cancelada
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                        {calcularTempoAteConsulta(consultaParaCancelar.data)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {isUserVolunteer ? "Paciente:" : "Profissional:"}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 ml-6">
                        {consultaParaCancelar.profissional}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-500"
                        >
                          <path d="M2 3h20" />
                          <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
                          <path d="m7 16 5 5 5-5" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">
                          Especialidade:
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 ml-6">
                        {consultaParaCancelar.especialidade || "Não informado"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Data e Hora:
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 ml-6">
                        {formatarData(consultaParaCancelar.data)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-500"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          />
                          <path d="m9 9 5 5v-5h-5" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">
                          Tipo:
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 ml-6">
                        {consultaParaCancelar.tipo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seleção de Motivo */}
                <div className="space-y-3">
                  <Label
                    htmlFor="motivo"
                    className="text-base font-semibold text-gray-900 dark:text-gray-100"
                  >
                    Motivo do cancelamento *
                  </Label>
                  <Select
                    value={motivoSelecionado}
                    onValueChange={setMotivoSelecionado}
                  >
                    <SelectTrigger className="w-full border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Selecione o motivo do cancelamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {motivosCancelamento.map((motivo) => (
                        <SelectItem key={motivo.value} value={motivo.value}>
                          {motivo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo de descrição - aparece quando "Outro" é selecionado */}
                {motivoSelecionado === "outro" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <Label
                      htmlFor="descricao"
                      className="text-base font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Descreva o motivo *
                    </Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descreva brevemente o motivo do cancelamento..."
                      value={motivoCancelamento}
                      onChange={(e) => setMotivoCancelamento(e.target.value)}
                      className="min-h-[80px] border-gray-300 dark:border-gray-600 focus:border-[#ED4231] dark:focus:border-[#ED4231]"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {motivoCancelamento.length}/500 caracteres
                    </p>
                  </motion.div>
                )}

                {/* Política de Cancelamento */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ED4231"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-amber-600 dark:text-amber-400"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="m12 8 .01 0" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-amber-800 dark:text-amber-300 font-semibold mb-2">
                        Política de Cancelamento
                      </p>
                      <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                        <li>• Cancelamentos com mais de 24h: sem cobrança</li>
                        <li>• Cancelamentos entre 12-24h: cobrança de 50%</li>
                        <li>
                          • Cancelamentos com menos de 12h: cobrança integral
                        </li>
                        <li>• Emergências médicas são isentas de cobrança</li>
                      </ul>
                      <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/40 rounded border-l-4 border-amber-400">
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                          Tempo restante:{" "}
                          <span className="font-bold">
                            {calcularTempoAteConsulta(
                              consultaParaCancelar.data
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sugestões */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ED4231"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600 dark:text-blue-400"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <path d="M12 7v5l4 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
                        Considere outras opções
                      </p>
                      <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Reagendar para outra data</li>
                        <li>• Alterar para consulta online</li>
                        <li>• Transferir para outro profissional</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={fecharModal}
                disabled={cancelandoConsulta}
                className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </svg>
                Manter Consulta
              </Button>
              <Button
                variant="destructive"
                onClick={confirmarCancelamento}
                disabled={cancelandoConsulta || !motivoSelecionado}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelandoConsulta ? (
                  <>
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
                    Cancelando...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12Z" />
                      <path d="m10 11 4 4m0-4-4 4" />
                      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                    Confirmar Cancelamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalhes da Consulta */}
        <Dialog open={detalhesModalOpen} onOpenChange={setDetalhesModalOpen}>
          <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#23272F] border border-[#EDF2FB] dark:border-[#444857] mx-4 sm:mx-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-indigo-900 dark:text-gray-100 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ED4231"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Detalhes da Consulta
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                Informações completas sobre sua consulta agendada.
              </DialogDescription>
            </DialogHeader>

            {consultaDetalhes && (
              <div className="space-y-4 sm:space-y-6 px-1">
                {/* Informações principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card do Profissional */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profissional
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Nome:</strong> {consultaDetalhes.profissional}
                      </p>
                      <p>
                        <strong>Especialidade:</strong>{" "}
                        {consultaDetalhes.especialidade}
                      </p>
                      <p>
                        <strong>CRM:</strong> 12345-SP
                      </p>
                      <p>
                        <strong>Telefone:</strong> (11) 98888-8888
                      </p>
                      <p>
                        <strong>Experiência:</strong> 15 anos
                      </p>
                    </div>
                  </div>
                  {/* Card do Paciente (Assistido) */}
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="7" r="4" />
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      </svg>
                      Paciente
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Nome:</strong>{" "}
                        {consultaDetalhes.assistido?.ficha?.nome}{" "}
                        {consultaDetalhes.assistido?.ficha?.sobrenome}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {consultaDetalhes.assistido?.email || "Não informado"}
                      </p>
                    </div>
                  </div>
                  {/* Card da Consulta */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 2v4" />
                        <path d="M16 2v4" />
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M3 10h18" />
                      </svg>
                      Consulta
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Tipo:</strong> {consultaDetalhes.tipo}
                      </p>
                      <p>
                        <strong>Data:</strong>{" "}
                        {format(
                          consultaDetalhes.data,
                          "dd 'de' MMMM 'de' yyyy",
                          { locale: ptBR }
                        )}
                      </p>
                      <p>
                        <strong>Horário:</strong>{" "}
                        {format(consultaDetalhes.data, "HH:mm")}
                      </p>
                      <p>
                        <strong>Duração:</strong> 50 minutos
                      </p>
                      <div className="flex items-center gap-2">
                        <strong>Status:</strong>
                        <Badge
                          className={`${
                            statusColors[consultaDetalhes.status]
                          } text-xs`}
                        >
                          {consultaDetalhes.status === "agendada"
                            ? "Confirmada"
                            : consultaDetalhes.status === "realizada"
                            ? "Realizada"
                            : consultaDetalhes.status === "cancelada"
                            ? "Cancelada"
                            : "Remarcada"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações específicas por tipo de consulta */}
                {consultaDetalhes.tipo === "Consulta Online" ? (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="14" x="2" y="3" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                      </svg>
                      Consulta Online
                    </h4>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <strong className="text-sm">
                          Link da videochamada:
                        </strong>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">
                            {gerarLinkVideochamada()}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                gerarLinkVideochamada()
                              );
                              toast({
                                title: "Link copiado!",
                                description:
                                  "O link da videochamada foi copiado para a área de transferência.",
                                duration: 3000,
                              });
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                width="14"
                                height="14"
                                x="8"
                                y="8"
                                rx="2"
                                ry="2"
                              />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        <p>
                          <strong>Preparação para a consulta:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Teste sua conexão 5 minutos antes</li>
                          <li>Tenha seus documentos e exames em mãos</li>
                          <li>Escolha um local silencioso e bem iluminado</li>
                          <li>
                            Certifique-se de que a câmera e microfone funcionem
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Consulta Presencial
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Endereço:</strong> Rua das Flores, 123
                      </p>
                      <p>
                        <strong>Bairro:</strong> Vila Madalena
                      </p>
                      <p>
                        <strong>Cidade:</strong> São Paulo - SP
                      </p>
                      <p>
                        <strong>CEP:</strong> 05435-000
                      </p>
                      <p>
                        <strong>Complemento:</strong> Sala 205
                      </p>
                      <div className="mt-3 text-orange-700 dark:text-orange-300">
                        <p>
                          <strong>Instruções importantes:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Chegue 15 minutos antes do horário</li>
                          <li>Traga um documento com foto</li>
                          <li>Traga seus exames e receitas anteriores</li>
                          <li>Use máscara se necessário</li>
                          <li>Há estacionamento no local</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações financeiras e procedimentos */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                    Informações Financeiras
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Valor da consulta:</strong> R$ 180,00
                    </p>
                    <p>
                      <strong>Formas de pagamento:</strong> PIX, dinheiro,
                      cartão de débito/crédito
                    </p>
                    <p>
                      <strong>Convênios aceitos:</strong> Particular
                    </p>
                    <div className="mt-3 text-yellow-700 dark:text-yellow-300">
                      <p>
                        <strong>Política de cancelamento:</strong>
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Cancelamento com mais de 24h: sem cobrança</li>
                        <li>Cancelamento entre 12-24h: cobrança de 50%</li>
                        <li>
                          Cancelamento com menos de 12h: cobrança integral
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Preparação para a consulta */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" x2="8" y1="13" y2="13" />
                      <line x1="16" x2="8" y1="17" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                    Preparação para a Consulta
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>O que levar:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 mb-3">
                      <li>Documento de identidade com foto</li>
                      <li>Carteirinha do convênio (se aplicável)</li>
                      <li>Exames anteriores relacionados ao problema</li>
                      <li>Lista de medicamentos em uso</li>
                      <li>Histórico médico familiar</li>
                    </ul>
                    <p>
                      <strong>Preparação necessária:</strong>
                    </p>
                    <p className="mt-1">
                      Para esta consulta de {consultaDetalhes.especialidade},
                      não é necessária preparação especial. Venha com suas
                      dúvidas anotadas para aproveitar melhor o tempo.
                    </p>
                  </div>
                </div>

                {/* Histórico com o profissional (se houver) */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ED4231"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v5h5" />
                      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                      <path d="M12 7v5l4 2" />
                    </svg>
                    Seu Histórico
                  </h4>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>
                        {isUserVolunteer
                          ? "Atendimentos com este paciente:"
                          : "Consultas com este profissional:"}
                      </strong>{" "}
                      {consultaDetalhes.status === "realizada"
                        ? "2 (incluindo esta)"
                        : "1ª consulta"}
                    </p>
                    {consultaDetalhes.status === "realizada" && (
                      <p>
                        <strong>Última consulta:</strong>{" "}
                        {format(new Date(2025, 3, 10), "dd/MM/yyyy")}
                      </p>
                    )}
                    <p>
                      <strong>Total de consultas na plataforma:</strong> 8
                    </p>
                    {consultaDetalhes.status === "realizada" &&
                      consultaDetalhes.avaliacao && (
                        <div className="flex items-center gap-2">
                          <strong>Sua avaliação:</strong>
                          <div className="flex">
                            {renderEstrelas(consultaDetalhes.avaliacao)}
                          </div>
                          <span>({consultaDetalhes.avaliacao}/5)</span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Lembrete para consulta agendada */}
                {consultaDetalhes.status === "agendada" && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ED4231"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </svg>
                      Lembrete
                    </h4>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p>Você receberá um lembrete por email e SMS:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>24 horas antes da consulta</li>
                        <li>2 horas antes da consulta</li>
                        <li>
                          Link da videochamada (se online) 15 minutos antes
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Button
                variant="outline"
                onClick={() => setDetalhesModalOpen(false)}
                className="border-gray-200 dark:border-gray-700"
              >
                Fechar
              </Button>

              {consultaDetalhes?.status === "agendada" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetalhesModalOpen(false);
                      abrirModalCancelamento(consultaDetalhes);
                    }}
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12Z" />
                      <path d="m10 11 4 4m0-4-4 4" />
                      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                    Cancelar Consulta
                  </Button>

                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      if (consultaDetalhes.tipo === "Consulta Online") {
                        window.open(gerarLinkVideochamada(), "_blank");
                      }
                      toast({
                        title:
                          consultaDetalhes.tipo === "Consulta Online"
                            ? "Entrando na videochamada"
                            : "Consulta confirmada",
                        description:
                          consultaDetalhes.tipo === "Consulta Online"
                            ? "A videochamada foi aberta em uma nova aba. Aguarde o profissional."
                            : "Sua presença foi confirmada. Dirija-se ao local da consulta.",
                        duration: 5000,
                      });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      {consultaDetalhes?.tipo === "Consulta Online" ? (
                        <>
                          <rect width="20" height="14" x="2" y="3" rx="2" />
                          <line x1="8" x2="16" y1="21" y2="21" />
                          <line x1="12" x2="12" y1="17" y2="21" />
                        </>
                      ) : (
                        <>
                          <path d="M20 6L9 17l-5-5" />
                        </>
                      )}
                    </svg>
                    {consultaDetalhes?.tipo === "Consulta Online"
                      ? "Entrar na Videochamada"
                      : "Confirmar Presença"}
                  </Button>
                </>
              )}

              {consultaDetalhes?.status === "realizada" &&
                !consultaDetalhes.avaliacao && (
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => {
                      toast({
                        title: "Avaliação em desenvolvimento",
                        description:
                          "A funcionalidade de avaliação estará disponível em breve.",
                        duration: 3000,
                      });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Avaliar Consulta
                  </Button>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Feedback/Avaliação */}
        <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
          <DialogContent className="w-[95vw] max-w-[500px] bg-white dark:bg-[#23272F] border border-[#EDF2FB] dark:border-[#444857]">
            <DialogHeader>
              <DialogTitle className="text-indigo-900 dark:text-gray-100">
                Avaliar Consulta
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {selectedConsultaFeedback &&
                  `Avalie sua consulta com ${selectedConsultaFeedback.profissional}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Rating Section */}
              <div className="space-y-3">
                <Label
                  htmlFor="rating"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Avaliação (obrigatório)
                </Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCurrentRating(star)}
                      className="focus:outline-none transition-colors hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= currentRating
                            ? "text-[#ED4231]"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {currentRating > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentRating === 1 && "Muito insatisfeito"}
                    {currentRating === 2 && "Insatisfeito"}
                    {currentRating === 3 && "Neutro"}
                    {currentRating === 4 && "Satisfeito"}
                    {currentRating === 5 && "Muito satisfeito"}
                  </p>
                )}
              </div>

              {/* Comment Section */}
              <div className="space-y-3">
                <Label
                  htmlFor="comment"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Comentário (opcional)
                </Label>
                <Textarea
                  id="comment"
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  placeholder="Compartilhe sua experiência com esta consulta..."
                  className="min-h-[100px] resize-none border-gray-200 dark:border-gray-700 focus:border-[#ED4231] dark:focus:border-[#ED4231]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {currentComment.length}/500 caracteres
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
                className="border-gray-200 dark:border-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={saveFeedback}
                disabled={currentRating === 0}
                className="bg-[#ED4231] hover:bg-[#ED4231]/90 text-white"
              >
                Salvar Avaliação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add responsive styles */}
      <style>{`
        /* Mobile-first responsive adjustments */
        @media (max-width: 768px) {
          .max-w-6xl {
            max-width: 100% !important;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          
          .grid-cols-1.md\\:grid-cols-3 {
            gap: 1rem !important;
          }
          
          .grid-cols-1.lg\\:grid-cols-2 {
            gap: 1rem !important;
          }
          
          /* Ensure proper spacing on mobile */
          .pt-20 {
            padding-top: 5.5rem !important; /* Increase mobile top padding */
          }
        }
        
        @media (min-width: 769px) {
          .pt-20.md\\:pt-24 {
            padding-top: 6.5rem !important; /* Increase desktop top padding */
          }
        }
        
        /* Ensure header doesn't overlap content */
        header[role="banner"] {
          height: 4.5rem; /* Fixed header height */
        }
        
        /* Fix sidebar overlap on mobile */
        @media (max-width: 768px) {
          .fixed.z-40 {
            top: 0 !important;
            height: 100vh !important;
          }
        }
        
        /* Improve card responsiveness */
        .grid > .bg-white {
          min-height: auto !important;
        }
        
        /* Better mobile card layouts */
        @media (max-width: 640px) {
          .space-y-4 > * {
            margin-bottom: 1rem !important;
          }
          
          .flex.flex-col.sm\\:flex-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          .w-full.sm\\:w-auto {
            width: 100% !important;
          }
        }
      `}</style>
    </SidebarProvider>
  );
};

export default Home;
