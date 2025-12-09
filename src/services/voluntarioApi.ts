import axios from "axios";

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

// Interface para voluntário (correspondente ao backend DTO)
export interface VoluntarioListagem {
  idUsuario: number;
  idVoluntario: number;
  nome: string;
  sobrenome: string;
  email: string;
  funcao?: string;
  areaOrientacao?: string;
  dataCadastro: string; // ISO date string
  ultimoAcesso?: string; // ISO date string
  ativo: boolean;
  nomeCompleto?: string;
}

export interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableInfo {
  offset: number;
  sort: SortInfo;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

export interface Slice<T> {
  content: T[];
  size: number;
  number: number;
  sort: SortInfo;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  pageable: PageableInfo;
  empty: boolean;
}

// Tipos auxiliares para status
export type VoluntarioStatus = "ativo" | "inativo" | "pendente";

// Service class para voluntários
export class VoluntarioApiService {
  /**
   * Lista todos os voluntários cadastrados
   */
  static async listarVoluntarios(): Promise<VoluntarioListagem[]> {
    try {
      const response = await apiClient.get<VoluntarioListagem[]>(
        "/usuarios/voluntarios"
      );

      // Mapear dados para incluir informações derivadas
      return response.data.map((voluntario) => ({
        ...voluntario,
        nomeCompleto: `${voluntario.nome} ${voluntario.sobrenome}`.trim(),
      }));
    } catch (error) {
      console.error("Erro ao listar voluntários:", error);
      throw new Error("Falha ao carregar lista de voluntários");
    }
  }

  /**
   * Determina o status do voluntário baseado no último acesso
   */
  static determinarStatus(voluntario: VoluntarioListagem): VoluntarioStatus {
    if (!voluntario.ultimoAcesso) {
      return "pendente"; // Nunca acessou
    }

    const ultimoAcesso = new Date(voluntario.ultimoAcesso);
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    if (ultimoAcesso > trintaDiasAtras) {
      return "ativo";
    } else {
      return "inativo";
    }
  }

  /**
   * Filtra voluntários por status
   */
  static filtrarPorStatus(
    voluntarios: VoluntarioListagem[],
    status: VoluntarioStatus | "todos"
  ): VoluntarioListagem[] {
    if (status === "todos") {
      return voluntarios;
    }

    return voluntarios.filter(
      (voluntario) => this.determinarStatus(voluntario) === status
    );
  }

  /**
   * Filtra voluntários por termo de busca
   */
  static filtrarPorBusca(
    voluntarios: VoluntarioListagem[],
    termoBusca: string
  ): VoluntarioListagem[] {
    if (!termoBusca.trim()) {
      return voluntarios;
    }

    const termo = termoBusca.toLowerCase();

    return voluntarios.filter(
      (voluntario) =>
        voluntario.nome.toLowerCase().includes(termo) ||
        voluntario.sobrenome.toLowerCase().includes(termo) ||
        voluntario.email.toLowerCase().includes(termo) ||
        (voluntario.funcao &&
          voluntario.funcao.toLowerCase().includes(termo)) ||
        (voluntario.areaOrientacao &&
          voluntario.areaOrientacao.toLowerCase().includes(termo))
    );
  }

  /**
   * Aplica filtros combinados (status + busca)
   */
  static aplicarFiltros(
    voluntarios: VoluntarioListagem[],
    termoBusca: string,
    status: VoluntarioStatus | "todos"
  ): VoluntarioListagem[] {
    let resultado = voluntarios;

    // Aplicar filtro de status
    resultado = this.filtrarPorStatus(resultado, status);

    // Aplicar filtro de busca
    resultado = this.filtrarPorBusca(resultado, termoBusca);

    return resultado;
  }

  /**
   * Formata data para exibição
   */
  static formatarData(dataIso?: string): string {
    if (!dataIso) return "Nunca";

    try {
      const data = new Date(dataIso);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Data inválida";
    }
  }

  /**
   * Formata data e hora para exibição
   */
  static formatarDataHora(dataIso?: string): string {
    if (!dataIso) return "Nunca";

    try {
      const data = new Date(dataIso);
      return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Data inválida";
    }
  }

  /**
   * Busca um voluntário específico por ID
   */
  static async buscarVoluntarioPorId(
    idUsuario: number
  ): Promise<VoluntarioListagem | null> {
    try {
      const response = await apiClient.get<VoluntarioListagem>(
        `/usuarios/${idUsuario}`
      );

      // Adicionar informações derivadas
      const voluntario = {
        ...response.data,
        nomeCompleto: `${response.data.nome} ${response.data.sobrenome}`.trim(),
      };

      return voluntario;
    } catch (error) {
      console.error("Erro ao buscar voluntário:", error);
      return null;
    }
  }

  /**
   * Busca dados pessoais de um voluntário específico
   */
  static async buscarDadosPessoaisVoluntario(usuarioId: number): Promise<{
    nome: string;
    sobrenome: string;
    especialidade: string;
    email: string;
  }> {
    try {
      const response = await apiClient.get(
        `/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dados pessoais do voluntário:", error);
      throw new Error("Falha ao carregar dados do voluntário");
    }
  }

  /**
   * Lista voluntários para seleção em agendamentos respeitando paginação do backend
   */
  static async listarVoluntariosParaAgendamento(
    page = 0,
    size = 10,
    sortBy = "idUsuario",
    sortDir = "asc"
  ): Promise<{
    items: { id: number; nome: string; especialidade: string }[];
    page: number;
    size: number;
    last: boolean;
    numberOfElements: number;
  }> {
    try {
      const slice = await this.listarVoluntariosPaginado(
        page,
        size,
        sortBy,
        sortDir
      );

      const items = slice.content
        .filter((v) => this.determinarStatus(v) === "ativo")
        .map((v) => ({
          id: v.idUsuario,
          nome: v.nomeCompleto ?? `${v.nome} ${v.sobrenome}`.trim(),
          especialidade: v.areaOrientacao ?? v.funcao ?? "Consulta Geral",
        }));

      return {
        items,
        page: slice.number,
        size: slice.size,
        last: slice.last,
        numberOfElements: slice.numberOfElements,
      };
    } catch (error) {
      console.error("Erro ao listar voluntários para agendamento:", error);
      throw new Error("Falha ao carregar especialistas disponíveis");
    }
  }
  static async criarDisponibilidade(
    dataHorario: string,
    usuarioId: number
  ): Promise<{
    id: number;
    dataHorario: string;
    voluntarioId?: number;
    voluntarioNome?: string;
  } | null> {
    try {
      const resp = await apiClient.post(`/disponibilidade`, {
        dataHorario,
        usuarioId,
      });
      return resp.data ?? null;
    } catch (error) {
      console.error("Erro ao criar disponibilidade:", error);
      return null;
    }
  }

  static async criarDisponibilidadesParaUsuario(
    usuarioId: number,
    datas: Date[],
    horarios: string[]
  ): Promise<number> {
    const dateStrings = datas.map((d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });

    const payloads: { dataHorario: string; usuarioId: number }[] = [];
    for (const dateStr of dateStrings) {
      for (const h of horarios) {
        payloads.push({ dataHorario: `${dateStr}T${h}:00`, usuarioId });
      }
    }

    const results = await Promise.allSettled(
      payloads.map((p) => this.criarDisponibilidade(p.dataHorario, p.usuarioId))
    );
    const success = results.filter(
      (
        r
      ): r is PromiseFulfilledResult<{
        id: number;
        dataHorario: string;
        voluntarioId?: number;
        voluntarioNome?: string;
      } | null> => r.status === "fulfilled" && !!r.value
    );
    const successCount = success.length;
    try {
      const idsMap: Record<string, number> = {};
      success.forEach((r) => {
        const out = r.value;
        if (out && out.id && out.dataHorario) {
          const time = out.dataHorario.split("T")[1]?.substring(0, 5);
          const date = out.dataHorario.split("T")[0];
          if (date && time) {
            idsMap[`${date}|${time}`] = out.id;
          }
        }
      });
      const userData = localStorage.getItem("userData");
      const uid = userData
        ? (() => {
            try {
              const u = JSON.parse(userData);
              return u.idUsuario ?? "default";
            } catch {
              return "default";
            }
          })()
        : "default";
      localStorage.setItem(`availabilityIds:${uid}`, JSON.stringify(idsMap));
    } catch (e) {
      console.warn("Falha ao salvar availabilityIds no localStorage", e);
    }
    return successCount;
  }
  static async listarHorariosDisponiveisPorDia(
    dataISODate: string,
    idVoluntario: number
  ): Promise<string[]> {
    try {
      const response = await apiClient.get(`/consulta/horarios-disponiveis`, {
        params: { data: dataISODate, idVoluntario },
      });
      const horarios: string[] = response.data?.horarios ?? [];
      return horarios;
    } catch (error) {
      console.error("Erro ao listar horários disponíveis:", error);
      return [];
    }
  }
  static async listarVoluntariosPaginado(
    page = 0,
    size = 10,
    sortBy = "idUsuario",
    sortDir = "asc"
  ): Promise<Slice<VoluntarioListagem>> {
    try {
      const response = await apiClient.get(`/usuarios/voluntarios/paginado`, {
        params: { page, size, sortBy, sortDir },
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar voluntários paginados:", error);
      throw new Error("Falha ao carregar voluntários");
    }
  }

  static async deletarDisponibilidade(
    idDisponibilidade: number
  ): Promise<boolean> {
    try {
      await apiClient.delete(`/disponibilidade/${idDisponibilidade}`);
      return true;
    } catch (error) {
      console.error("Erro ao deletar disponibilidade:", error);
      return false;
    }
  }

  static async listarDisponibilidadesPorVoluntario(
    idVoluntario: number
  ): Promise<Array<{ id: number; dataHorario: string }>> {
    try {
      const resp = await apiClient.get<
        Array<{ id: number; dataHorario: string }>
      >(`/disponibilidade/voluntario/${idVoluntario}`);
      const arr: Array<{ id: number; dataHorario: string }> = Array.isArray(
        resp.data
      )
        ? resp.data
        : [];
      return arr.map((d) => ({ id: d.id, dataHorario: d.dataHorario }));
    } catch (error) {
      console.error("Erro ao listar disponibilidades por voluntário:", error);
      return [];
    }
  }

  static async atualizarDisponibilidade(
    id: number,
    dataHorario: string,
    usuarioId: number
  ): Promise<{ id: number; dataHorario: string } | null> {
    try {
      const resp = await apiClient.patch(`/disponibilidade/${id}`, {
        dataHorario,
        usuarioId,
      });
      return resp.data ?? null;
    } catch (error) {
      console.error("Erro ao atualizar disponibilidade:", error);
      return null;
    }
  }
}

export default VoluntarioApiService;
