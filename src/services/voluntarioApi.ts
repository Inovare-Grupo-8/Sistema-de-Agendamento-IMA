import axios from 'axios';
import { getBackendBaseUrl } from '@/lib/utils';

// API base configuration
const API_BASE_URL = getBackendBaseUrl();

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
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
      console.warn('Authentication failed, redirecting to login...');
      localStorage.removeItem('userData');
      window.location.href = '/login';
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
export type VoluntarioStatus = 'ativo' | 'inativo' | 'pendente';

// Service class para voluntários
export class VoluntarioApiService {
  
  /**
   * Lista todos os voluntários cadastrados
   */
  static async listarVoluntarios(): Promise<VoluntarioListagem[]> {
    try {
      const response = await apiClient.get<VoluntarioListagem[]>('/usuarios/voluntarios');
      
      // Mapear dados para incluir informações derivadas
      return response.data.map(voluntario => ({
        ...voluntario,
        nomeCompleto: `${voluntario.nome} ${voluntario.sobrenome}`.trim()
      }));
      
    } catch (error) {
      console.error('Erro ao listar voluntários:', error);
      throw new Error('Falha ao carregar lista de voluntários');
    }
  }

  /**
   * Determina o status do voluntário baseado no último acesso
   */
  static determinarStatus(voluntario: VoluntarioListagem): VoluntarioStatus {
    if (!voluntario.ultimoAcesso) {
      return 'pendente'; // Nunca acessou
    }

    const ultimoAcesso = new Date(voluntario.ultimoAcesso);
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    if (ultimoAcesso > trintaDiasAtras) {
      return 'ativo';
    } else {
      return 'inativo';
    }
  }

  /**
   * Filtra voluntários por status
   */
  static filtrarPorStatus(
    voluntarios: VoluntarioListagem[], 
    status: VoluntarioStatus | 'todos'
  ): VoluntarioListagem[] {
    if (status === 'todos') {
      return voluntarios;
    }

    return voluntarios.filter(voluntario => 
      this.determinarStatus(voluntario) === status
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
    
    return voluntarios.filter(voluntario => 
      voluntario.nome.toLowerCase().includes(termo) ||
      voluntario.sobrenome.toLowerCase().includes(termo) ||
      voluntario.email.toLowerCase().includes(termo) ||
      (voluntario.funcao && voluntario.funcao.toLowerCase().includes(termo)) ||
      (voluntario.areaOrientacao && voluntario.areaOrientacao.toLowerCase().includes(termo))
    );
  }

  /**
   * Aplica filtros combinados (status + busca)
   */
  static aplicarFiltros(
    voluntarios: VoluntarioListagem[],
    termoBusca: string,
    status: VoluntarioStatus | 'todos'
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
    if (!dataIso) return 'Nunca';

    try {
      const data = new Date(dataIso);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }

  /**
   * Formata data e hora para exibição
   */
  static formatarDataHora(dataIso?: string): string {
    if (!dataIso) return 'Nunca';

    try {
      const data = new Date(dataIso);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }

  /**
   * Busca um voluntário específico por ID
   */
  static async buscarVoluntarioPorId(idUsuario: number): Promise<VoluntarioListagem | null> {
    try {
      const response = await apiClient.get<VoluntarioListagem>(`/usuarios/${idUsuario}`);
      
      // Adicionar informações derivadas
      const voluntario = {
        ...response.data,
        nomeCompleto: `${response.data.nome} ${response.data.sobrenome}`.trim()
      };
      
      return voluntario;
      
    } catch (error) {
      console.error('Erro ao buscar voluntário:', error);
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
      const response = await apiClient.get(`/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados pessoais do voluntário:', error);
      throw new Error('Falha ao carregar dados do voluntário');
    }
  }

  /**
   * Lista todos os voluntários para seleção em agendamentos
   * Retorna apenas voluntários ativos com informações simplificadas
   */
  static async listarVoluntariosParaAgendamento(
    page = 0,
    size = 10,
    sortBy = "idUsuario",
    sortDir = "asc"
): Promise<{
  items: { id: number; nome: string; especialidade: string }[],
  page: number,
  size: number,
  last: boolean,
  numberOfElements: number
}> {
  try {
    const slice = await this.listarVoluntariosPaginado(page, size, sortBy, sortDir);
    const sliceObject = this.isSliceResponse(slice) ? slice : undefined;
    // Suporta respostas antigas que devolvem lista simples e novas que expõem Slice
    const content = sliceObject?.content
      ?? (Array.isArray(slice)
        ? slice
        : slice && typeof slice === "object" && Array.isArray((slice as { items?: VoluntarioListagem[] }).items)
          ? (slice as { items?: VoluntarioListagem[] }).items ?? []
          : []);

    if (!sliceObject && !Array.isArray(slice) && slice != null) {
      console.warn("Formato inesperado ao listar voluntários paginados", slice);
    }

    const items = content
      .filter(v => this.determinarStatus(v) === "ativo")
      .map(v => ({
        id: v.idUsuario,
        nome: v.nomeCompleto ?? `${v.nome} ${v.sobrenome}`.trim(),
        especialidade: v.areaOrientacao ?? v.funcao ?? "Consulta Geral"
      }));

    return {
      items,
      page: sliceObject?.number ?? page,
      size: sliceObject?.size ?? size,
      last: typeof sliceObject?.last === "boolean" ? sliceObject.last : items.length < size,
      numberOfElements: sliceObject?.numberOfElements ?? items.length
    };
  } catch (error) {
    console.error("Erro ao listar voluntários para agendamento:", error);
    throw new Error("Falha ao carregar especialistas disponíveis");
  }

  }
  static async criarDisponibilidade(dataHorario: string, usuarioId: number): Promise<void> {
    await apiClient.post(`/disponibilidade`, { dataHorario, usuarioId });
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

    const requests = payloads.map((p) => this.criarDisponibilidade(p.dataHorario, p.usuarioId));
    const results = await Promise.allSettled(requests);
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    return successCount;
  }
  // Compatibiliza diferentes versões da API que podem retornar Slice ou lista simples
  static async listarVoluntariosPaginado(
  page = 0,
  size = 10,
  sortBy = "idUsuario",
  sortDir = "asc"
  ): Promise<Slice<VoluntarioListagem> | VoluntarioListagem[]> {
    try {
      const response = await apiClient.get(`/usuarios/voluntarios/paginado`, {
        params: { page, size, sortBy, sortDir }
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar voluntários paginados:", error);
      throw new Error("Falha ao carregar voluntários");
    }
  }

  private static isSliceResponse(value: unknown): value is Slice<VoluntarioListagem> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }

    return Array.isArray((value as { content?: unknown }).content);
  }
}

export default VoluntarioApiService;
