import axios from 'axios';
import { apiClient } from '@/core/http/apiClient';
import { appointmentService } from '@composition/root';
import type { CriarConsultaInput } from '@domain/entities/consulta';

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
  especialidade: {
    id: number;
    nome: string;
  };
  voluntario: {
    idUsuario: number;
    email: string;
    ficha: {
      nome: string;
    };
  };
  assistido: {
    idUsuario: number;
    email: string;
    ficha: {
      nome: string;
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

// API service class for consultation endpoints
export class ConsultaApiService {
    /**
   * Get consultations count for today
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with consultation count
   */
  static async getConsultasDia(userType: 'voluntario' | 'assistido'): Promise<number> {
    try { return appointmentService.getStats(userType).then(s => s.hoje); }
    catch (error) { throw this.handleApiError(error); }
  }
  /**
   * Get consultations count for current week
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with consultation count
   */
  static async getConsultasSemana(userType: 'voluntario' | 'assistido'): Promise<number> {
    try { return appointmentService.getStats(userType).then(s => s.semana); }
    catch (error) { throw this.handleApiError(error); }
  }
  /**
   * Get consultations count for current month
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with consultation count
   */
  static async getConsultasMes(userType: 'voluntario' | 'assistido'): Promise<number> {
    try { return appointmentService.getStats(userType).then(s => s.mes); }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Get all consultation statistics at once
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with all consultation counts
   */
  static async getAllConsultaStats(userType: 'voluntario' | 'assistido') {
    try { return appointmentService.getStats(userType); }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Get upcoming consultations (next 3)
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with array of upcoming consultations
   */
  static async getProximasConsultas(userType: 'voluntario' | 'assistido'): Promise<ConsultaOutput[]> {
    try { return appointmentService.getProximas(userType) as unknown as ConsultaOutput[]; }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Get recent consultations history
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with array of recent consultations
   */
  static async getConsultasRecentes(userType: 'voluntario' | 'assistido'): Promise<ConsultaDto[]> {
    try { return appointmentService.getRecentes(userType) as unknown as ConsultaDto[]; }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Get consultation history
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with array of historical consultations
   */
  static async getHistoricoConsultas(userType: 'voluntario' | 'assistido'): Promise<ConsultaOutput[]> {
    try { return appointmentService.getHistorico(userType) as unknown as ConsultaOutput[]; }
    catch (error) { throw this.handleApiError(error); }
  }
  /**
   * Cancel a consultation
   * @param id - The ID of the consultation to cancel
   * @returns Promise with the cancelled consultation
   */
  static async cancelarConsulta(id: number): Promise<ConsultaDto> {
    try { return appointmentService.cancelar(id) as unknown as ConsultaDto; }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Add evaluation/rating to a consultation
   * @param id - The ID of the consultation
   * @param avaliacao - Rating from 1 to 5
   * @returns Promise with the updated consultation
   */
  static async adicionarAvaliacao(id: number, avaliacao: number): Promise<ConsultaDto> {
    try { return appointmentService.avaliar(id, avaliacao) as unknown as ConsultaDto; }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Add feedback to a consultation
   * @param id - The ID of the consultation
   * @param feedback - Feedback text comment
   * @returns Promise with the updated consultation
   */
  static async adicionarFeedback(id: number, feedback: string): Promise<ConsultaDto> {
    try { return appointmentService.feedback(id, feedback) as unknown as ConsultaDto; }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Get evaluations and feedbacks for a user
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with evaluations and feedbacks data
   */
  static async getAvaliacoesFeedback(userType: 'voluntario' | 'assistido') {
    try { return appointmentService.getAvaliacoesFeedback(userType); }
    catch (error) { throw this.handleApiError(error); }
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
          message: error.response.data?.message || 'Erro no servidor',
          status: error.response.status
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          message: 'Servidor indisponível. Verifique sua conexão.',
          status: 0
        };
      }
    }
    
    // Default error
    return {
      message: 'Erro inesperado ao buscar dados',
      status: -1
    };
  }

  /**
   * Get next consultation for user
   * @param idUsuario - ID of the user to get next consultation
   * @returns Promise with next consultation data
   */
  static async getProximaConsulta(idUsuario: number): Promise<ProximaConsulta> {
    try { return appointmentService.getProximaConsulta(idUsuario) as unknown as ProximaConsulta; }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Get available time slots for a specific volunteer on a specific date
   * @param date - Date in YYYY-MM-DD format
   * @param voluntarioId - ID of the volunteer/specialist
   * @returns Promise with array of available time slots
   */
  static async getHorariosDisponiveis(date: string, voluntarioId: number): Promise<string[]> {
    try { return appointmentService.getHorariosDisponiveis(date, voluntarioId); }
    catch (error) { throw this.handleApiError(error); }
  }
  /**
   * Create a new consultation appointment
   * @param consultaData - Data for creating the consultation
   * @returns Promise with the created consultation
   */
  static async criarConsulta(consultaData: {
    idVoluntario: number;
    data: string;
    horario: string;
    modalidade: 'ONLINE' | 'PRESENCIAL';
    observacoes?: string;
    especialidade?: string;
  }): Promise<ConsultaOutput> {
    try {
      const input: CriarConsultaInput = consultaData;
      return appointmentService.criarConsulta(input) as unknown as ConsultaOutput;
    } catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Get all specializations
   * @returns Promise with array of specializations
   */
  static async getEspecialidades(): Promise<EspecialidadeDto[]> {
    // Mantido direto por ora; pode virar outro repository (Especialidade)
    try { const r = await apiClient.get<EspecialidadeDto[]>('/especialidade'); return r.data; }
    catch (error) { throw this.handleApiError(error); }
  }

  /**
   * Get all consultations in the system
   * @returns Promise with array of all consultations
   */
  static async getTodasConsultas(): Promise<ConsultaDto[]> {
    try {
      const response = await apiClient.get<ConsultaDto[]>('/consulta/consultas/todas');
      return response.data;
    } catch (error) {
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
      const especialidade = especialidades.find(esp => {
        const nomeNormalizado = esp.nome.toUpperCase().replace(/[\s_-]/g, '');
        const nomeParametroNormalizado = nome.toUpperCase().replace(/[\s_-]/g, '');
        
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
      return null;
    }
  }
}
export default ConsultaApiService;
