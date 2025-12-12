import axios from "axios";
import { getBackendBaseUrl } from "@/lib/utils";

// API base configuration
const API_BASE_URL = getBackendBaseUrl();

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      console.warn("Authentication failed, redirecting to login...");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface ConsultaCount {
  count: number;
}

export interface EspecialidadeDto {
  id: number;
  nome: string;
}

export interface ConsultaDto {
  idConsulta: number;
  horario: string; // ISO date string
  status: string;
  modalidade: string;
  local: string;
  observacoes: string;
  idEspecialidade: number;
  nomeEspecialidade: string;
  idVoluntario: number;
  nomeVoluntario: string;
  idAssistido: number;
  nomeAssistido: string;
  feedbackStatus: string;
  avaliacaoStatus: string;
  criadoEm: string; // ISO date string
  atualizadoEm: string; // ISO date string
}

export interface ConsultaOutput {
  idConsulta: number;
  horario: string; // ISO date string
  status: string;
  modalidade: string;
  local: string;
  observacoes: string;
  idEspecialidade?: number;
  nomeEspecialidade?: string;
  idVoluntario?: number;
  nomeVoluntario?: string;
  idAssistido?: number;
  nomeAssistido?: string;
  feedbackStatus?: string;
  avaliacaoStatus?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  // Legacy fields for backward compatibility
  especialidade?: {
    id: number;
    nome: string;
  };
  voluntario?: {
    idUsuario: number;
    email: string;
    ficha: {
      nome: string;
      sobrenome?: string;
    };
  };
  assistido?: {
    idUsuario: number;
    email: string;
    ficha: {
      nome: string;
      sobrenome?: string;
    };
  };
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface ProximaConsulta {
  horario: string;
  status: string;
  modalidade: string;
  local: string;
  observacoes: string;
  especialidade: {
    idEspecialidade: number;
    nome: string;
  };
  assistido: {
    idUsuario: number;
    ficha: {
      nome: string;
      sobrenome: string;
    };
  };
  voluntario: {
    idUsuario: number;
    ficha: {
      nome: string;
      sobrenome: string;
      profissao: string;
    };
  };
}

export interface ConsultaAvaliacao {
  idAvaliacao?: number;
  nota?: number | null;
  consulta?: {
    idConsulta?: number;
  } | null;
}

export interface ConsultaFeedback {
  idFeedback?: number;
  comentario?: string | null;
  consulta?: {
    idConsulta?: number;
  } | null;
}

export interface AvaliacoesFeedbackResponse {
  feedbacks: ConsultaFeedback[];
  avaliacoes: ConsultaAvaliacao[];
}

export interface HorarioDisponivel {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  dateTime: string; // raw backend value
}

// API service class for consultation endpoints
export class ConsultaApiService {
  /**
   * Get consultations count for today
   * @param userId - ID of the user (voluntario or assistido)
   * @returns Promise with consultation count
   */
  static async getConsultasDia(userId: number): Promise<number> {
    try {
      const response = await apiClient.get<ConsultaDto[]>(
        `/consulta/consultas/minhas`,
        {
          params: { userId, periodo: "DIA" },
        }
      );
      return response.data.length;
    } catch (error) {
      console.error("Error fetching consultas dia:", error);
      throw this.handleApiError(error);
    }
  }
  /**
   * Get consultations count for current week (Sunday to Saturday)
   * @param userId - ID of the user (voluntario or assistido)
   * @returns Promise with consultation count
   */
  static async getConsultasSemana(userId: number): Promise<number> {
    try {
      const response = await apiClient.get<ConsultaDto[]>(
        `/consulta/consultas/minhas`,
        {
          params: { userId, periodo: "SEMANA" },
        }
      );
      return response.data.length;
    } catch (error) {
      console.error("Error fetching consultas semana:", error);
      throw this.handleApiError(error);
    }
  }
  /**
   * Get consultations count for current month (1st to last day)
   * @param userId - ID of the user (voluntario or assistido)
   * @returns Promise with consultation count
   */
  static async getConsultasMes(userId: number): Promise<number> {
    try {
      const response = await apiClient.get<ConsultaDto[]>(
        `/consulta/consultas/minhas`,
        {
          params: { userId, periodo: "MES" },
        }
      );
      return response.data.length;
    } catch (error) {
      console.error("Error fetching consultas mes:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all consultation statistics at once
   * @param userId - ID of the user (voluntario or assistido)
   * @returns Promise with all consultation counts
   */
  static async getAllConsultaStats(userId: number): Promise<{
    hoje: number;
    semana: number;
    mes: number;
  }> {
    try {
      const [hoje, semana, mes] = await Promise.all([
        this.getConsultasDia(userId),
        this.getConsultasSemana(userId),
        this.getConsultasMes(userId),
      ]);
      return { hoje, semana, mes };
    } catch (error) {
      console.error("Error fetching all consulta stats:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get upcoming consultations (next 3)
   * @param userId - ID of the user (voluntario or assistido)
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with array of upcoming consultations
   */
  static async getProximasConsultas(
    userId: number,
    userType: "voluntario" | "assistido"
  ): Promise<ConsultaOutput[]> {
    try {
      const response = await apiClient.get<ConsultaOutput[]>(
        `/consulta/consultas/3-proximas`,
        {
          params: { user: userType, userId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching proximas consultas:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get recent consultations history
   * @param userId - ID of the user (voluntario or assistido)
   * @returns Promise with array of recent consultations
   */
  static async getConsultasRecentes(userId: number): Promise<ConsultaDto[]> {
    try {
      const response = await apiClient.get<ConsultaDto[]>(
        `/consulta/consultas/minhas`,
        {
          params: { userId, periodo: "RECENTE" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching consultas recentes:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get consultation history
   * @param userId - ID of the user (voluntario or assistido)
   * @param userType - Type of user ("voluntario" or "assistido") - optional, defaults to "assistido"
   * @returns Promise with array of historical consultations
   */
  static async getHistoricoConsultas(
    userId: number,
    userType?: "voluntario" | "assistido"
  ): Promise<ConsultaOutput[]> {
    try {
      const params: any = { userId };
      if (userType) {
        params.user = userType;
      }

      const response = await apiClient.get<any>(
        `/consulta/consultas/historico`,
        { params }
      );
      // Backend retorna um Map com a chave "consultas"
      return response.data.consultas || response.data;
    } catch (error) {
      console.error("Error fetching historico consultas:", error);
      throw this.handleApiError(error);
    }
  }
  /**
   * Cancel a consultation
   * @param id - The ID of the consultation to cancel
   * @returns Promise with the cancelled consultation
   */
  static async cancelarConsulta(id: number): Promise<ConsultaDto> {
    try {
      const response = await apiClient.post<ConsultaDto>(
        `/consulta/cancelar/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling consulta:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Add evaluation/rating to a consultation
   * @param id - The ID of the consultation
   * @param avaliacao - Rating from 1 to 5
   * @returns Promise with the updated consultation
   */
  static async adicionarAvaliacao(
    id: number,
    avaliacao: number
  ): Promise<ConsultaDto> {
    try {
      const response = await apiClient.post<ConsultaDto>(
        `/consulta/consultas/${id}/avaliacao`,
        avaliacao.toString(),
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding avaliacao:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Add feedback to a consultation
   * @param id - The ID of the consultation
   * @param feedback - Feedback text comment
   * @returns Promise with the updated consultation
   */
  static async adicionarFeedback(
    id: number,
    feedback: string
  ): Promise<ConsultaDto> {
    try {
      const response = await apiClient.post<ConsultaDto>(
        `/consulta/consultas/${id}/feedback`,
        feedback,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding feedback:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get evaluations and feedbacks for a user
   * @param userId - ID of the user (voluntario or assistido)
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with evaluations and feedbacks data
   */
  static async getAvaliacoesFeedback(
    userId: number,
    userType: "voluntario" | "assistido"
  ): Promise<AvaliacoesFeedbackResponse> {
    try {
      const response = await apiClient.get<AvaliacoesFeedbackResponse>(
        `/consulta/consultas/avaliacoes-feedback`,
        {
          params: { user: userType, userId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching avaliacoes e feedback:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors and convert them to a consistent format
   * @param error - The error from axios
   * @returns Formatted error object
   */
  private static handleApiError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        return {
          message: error.response.data?.message || "Erro no servidor",
          status: error.response.status,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          message: "Servidor indisponível. Verifique sua conexão.",
          status: 0,
        };
      }
    }

    // Default error
    return {
      message: "Erro inesperado ao buscar dados",
      status: -1,
    };
  }

  /**
   * Get next consultation for user
   * @param idUsuario - ID of the user to get next consultation
   * @returns Promise with next consultation data
   */
  static async getProximaConsulta(idUsuario: number): Promise<ProximaConsulta> {
    try {
      const response = await apiClient.get<ProximaConsulta>(
        `/consulta/consultas/${idUsuario}/proxima`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching próxima consulta:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get available time slots for a specific volunteer on a specific date
   * @param date - Date in YYYY-MM-DD format
   * @param voluntarioId - ID of the volunteer/specialist
   * @returns Lista normalizada de horários disponíveis
   */
  static async getHorariosDisponiveis(
    date: string,
    voluntarioId: number
  ): Promise<HorarioDisponivel[]> {
    try {
      const relativePath = `/consulta/horarios-disponiveis`;
      const fullUrl = `${apiClient.defaults.baseURL || ""}${relativePath}`;
      console.log("🔎 [ConsultaApi] GET:", fullUrl, {
        data: date,
        idVoluntario: voluntarioId,
      });
      const response = await apiClient.get(relativePath, {
        params: {
          data: date,
          idVoluntario: voluntarioId,
        },
      });
      console.log("✅ [ConsultaApi] resposta status:", response.status);

      const payload = response.data as unknown;
      const rawValues = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { horarios?: unknown[] })?.horarios)
        ? (payload as { horarios?: unknown[] }).horarios ?? []
        : [];

      return rawValues
        .map((value: unknown) => {
          if (typeof value !== "string") {
            return null;
          }

          const [datePart] = value.split("T");
          const timePart = value.includes("T")
            ? value.split("T")[1]?.substring(0, 5)
            : "";

          if (!datePart || !timePart) {
            return null;
          }

          return {
            date: datePart,
            time: timePart,
            dateTime: value,
          } satisfies HorarioDisponivel;
        })
        .filter((item): item is HorarioDisponivel => item !== null);
    } catch (error) {
      // Log detalhado para diagnóstico de 404/erros
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyErr = error as any;
        if (anyErr?.response) {
          console.error(
            "Error fetching horarios disponiveis: status",
            anyErr.response.status,
            anyErr.response.data
          );
        } else {
          console.error("Error fetching horarios disponiveis:", anyErr);
        }
      } catch (logErr) {
        console.error("Erro ao logar erro de horarios disponiveis:", logErr);
      }
      throw this.handleApiError(error);
    }
  }

  /**
   * Lista datas futuras com horários disponíveis para um voluntário.
   */
  static async listarDisponibilidadesPorVoluntario(
    voluntarioId: number,
    diasEmFrente = 30
  ): Promise<Record<string, HorarioDisponivel[]>> {
    const hoje = new Date();
    const disponibilidades: Record<string, HorarioDisponivel[]> = {};
    let diasSemHorarioSeguidos = 0;

    for (let offset = 0; offset < diasEmFrente; offset += 1) {
      const dataAtual = new Date(hoje);
      dataAtual.setHours(0, 0, 0, 0);
      dataAtual.setDate(hoje.getDate() + offset);

      const dataIso = dataAtual.toISOString().split("T")[0];

      try {
        const horarios = await this.getHorariosDisponiveis(
          dataIso,
          voluntarioId
        );
        if (horarios.length > 0) {
          disponibilidades[dataIso] = horarios;
          diasSemHorarioSeguidos = 0;
        } else {
          diasSemHorarioSeguidos += 1;
        }
      } catch (error) {
        console.warn("Falha ao carregar horários para", dataIso, error);
        diasSemHorarioSeguidos += 1;
      }

      if (
        diasSemHorarioSeguidos >= 7 &&
        Object.keys(disponibilidades).length > 0
      ) {
        break;
      }
    }

    return disponibilidades;
  }
  /**
   * Create a new consultation appointment
   * @param consultaData - Data for creating the consultation
   * @returns Promise with the created consultation
   */
  static async criarConsulta(consultaData: {
    idVoluntario: number;
    data: string; // ISO date string
    horario: string; // Time in HH:mm format
    modalidade: "ONLINE" | "PRESENCIAL";
    observacoes?: string;
    especialidade?: string;
  }): Promise<ConsultaOutput> {
    try {
      console.log("🚀 [AGENDAMENTO] Iniciando processo de criação de consulta");
      console.log("📋 [AGENDAMENTO] Dados recebidos:", consultaData);

      // Get current user ID from localStorage
      const userData = localStorage.getItem("userData");
      if (!userData) {
        console.error("❌ [AGENDAMENTO] Usuário não está logado");
        throw new Error("Usuário não está logado");
      }

      const user = JSON.parse(userData);
      const idAssistido = user.idUsuario;
      console.log("👤 [AGENDAMENTO] ID do assistido:", idAssistido);

      if (!idAssistido) {
        console.error("❌ [AGENDAMENTO] ID do usuário não encontrado");
        throw new Error("ID do usuário não encontrado");
      }

      // Combine date and time into a proper datetime string
      const dateTime = `${consultaData.data}T${consultaData.horario}:00`;
      console.log("📅 [AGENDAMENTO] Data/hora formatada:", dateTime);

      // Get specialization ID if specialization name is provided
      let idEspecialidade: number | null = null;
      if (consultaData.especialidade) {
        console.log(
          "🔍 [AGENDAMENTO] Buscando ID da especialidade:",
          consultaData.especialidade
        );
        idEspecialidade = await this.getEspecialidadeIdByName(
          consultaData.especialidade
        );
        if (!idEspecialidade) {
          console.warn(
            `⚠️ [AGENDAMENTO] Especialidade '${consultaData.especialidade}' não encontrada. Usando ID padrão 1.`
          );
          idEspecialidade = 1; // Default specialization ID
        } else {
          console.log(
            "✅ [AGENDAMENTO] ID da especialidade encontrado:",
            idEspecialidade
          );
        }
      } else {
        console.log(
          "ℹ️ [AGENDAMENTO] Especialidade não fornecida. Usando ID padrão 1."
        );
        idEspecialidade = 1; // Default specialization ID
      }

      const payload = {
        idVoluntario: consultaData.idVoluntario,
        idEspecialista: consultaData.idVoluntario, // idEspecialista is the same as idVoluntario
        idAssistido: idAssistido,
        horario: dateTime,
        modalidade: consultaData.modalidade,
        local: consultaData.modalidade === "ONLINE" ? "Online" : "Presencial",
        observacoes: consultaData.observacoes || "",
        status: "AGENDADA",
        idEspecialidade: idEspecialidade,
      };

      console.log("📦 [AGENDAMENTO] Payload montado:");
      console.log(JSON.stringify(payload, null, 2));
      console.log("🌐 [AGENDAMENTO] Enviando requisição POST /consulta...");

      const response = await apiClient.post<ConsultaOutput>(
        "/consulta",
        payload
      );

      console.log("✅ [AGENDAMENTO] Consulta criada com sucesso!");
      console.log("📄 [AGENDAMENTO] Resposta do servidor:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ [AGENDAMENTO] Erro ao criar consulta:", error);

      // Log detalhado do erro
      if (error.response) {
        console.error("❌ [AGENDAMENTO] Status HTTP:", error.response.status);
        console.error(
          "❌ [AGENDAMENTO] Dados da resposta:",
          error.response.data
        );
        console.error(
          "❌ [AGENDAMENTO] Headers da resposta:",
          error.response.headers
        );
      } else if (error.request) {
        console.error(
          "❌ [AGENDAMENTO] Requisição sem resposta:",
          error.request
        );
      } else {
        console.error("❌ [AGENDAMENTO] Erro na configuração:", error.message);
      }

      throw this.handleApiError(error);
    }
  }

  /**
   * Get all specializations
   * @returns Promise with array of specializations
   */
  static async getEspecialidades(): Promise<EspecialidadeDto[]> {
    try {
      const response = await apiClient.get<EspecialidadeDto[]>(
        "/especialidade"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching especialidades:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all consultations in the system
   * @returns Promise with array of all consultations
   */
  static async getTodasConsultas(): Promise<ConsultaDto[]> {
    try {
      const response = await apiClient.get<ConsultaDto[]>(
        "/consulta/consultas/todas"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching todas consultas:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all consultations for a specific user by role, combining histórico + próximas
   */
  static async getConsultasDoUsuario(
    userId: number,
    userType: "voluntario" | "assistido"
  ): Promise<ConsultaOutput[]> {
    try {
      const [historico, proximas] = await Promise.all([
        this.getHistoricoConsultas(userId, userType),
        this.getProximasConsultas(userId, userType),
      ]);

      const map = new Map<number, ConsultaOutput>();
      [...historico, ...proximas].forEach((c) => {
        if (c?.idConsulta != null) {
          map.set(c.idConsulta, c);
        }
      });
      return Array.from(map.values()).sort((a, b) => {
        const da = new Date(a.horario).getTime();
        const db = new Date(b.horario).getTime();
        return da - db;
      });
    } catch (error) {
      console.error("Error fetching consultas do usuario:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get specialization ID by name
   * @param nome - Name of the specialization
   * @returns Promise with specialization ID or null if not found
   */
  static async getEspecialidadeIdByName(nome: string): Promise<number | null> {
    try {
      const especialidades = await this.getEspecialidades();
      const especialidade = especialidades.find((esp) => {
        const nomeNormalizado = esp.nome.toUpperCase().replace(/[\s_-]/g, "");
        const nomeParametroNormalizado = nome
          .toUpperCase()
          .replace(/[\s_-]/g, "");

        return (
          esp.nome.toUpperCase() === nome.toUpperCase() ||
          esp.nome.toUpperCase().includes(nome.toUpperCase()) ||
          nome.toUpperCase().includes(esp.nome.toUpperCase()) ||
          nomeNormalizado === nomeParametroNormalizado ||
          nomeNormalizado.includes(nomeParametroNormalizado) ||
          nomeParametroNormalizado.includes(nomeNormalizado)
        );
      });
      return especialidade ? especialidade.id : null;
    } catch (error) {
      console.error("Error finding especialidade by name:", error);
      return null;
    }
  }
}
export default ConsultaApiService;
