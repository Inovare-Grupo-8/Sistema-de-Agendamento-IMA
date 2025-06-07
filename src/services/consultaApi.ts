import axios from 'axios';

// API base configuration
const API_BASE_URL = 'http://localhost:8080';

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

// Types for API responses
export interface ConsultaCount {
  count: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

// API service class for consultation endpoints
export class ConsultaApiService {
  
  /**
   * Get consultations count for today
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with consultation count
   */
  static async getConsultasDia(userType: 'voluntario' | 'assistido'): Promise<number> {
    try {
      const response = await apiClient.get<ConsultaCount>(`/consulta/consultas/dia`, {
        params: { user: userType }
      });
      return response.data.count;
    } catch (error) {
      console.error('Error fetching consultas dia:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get consultations count for current week
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with consultation count
   */
  static async getConsultasSemana(userType: 'voluntario' | 'assistido'): Promise<number> {
    try {
      const response = await apiClient.get<ConsultaCount>(`/consulta/consultas/semana`, {
        params: { user: userType }
      });
      return response.data.count;
    } catch (error) {
      console.error('Error fetching consultas semana:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get consultations count for current month
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with consultation count
   */
  static async getConsultasMes(userType: 'voluntario' | 'assistido'): Promise<number> {
    try {
      const response = await apiClient.get<ConsultaCount>(`/consulta/consultas/mes`, {
        params: { user: userType }
      });
      return response.data.count;
    } catch (error) {
      console.error('Error fetching consultas mes:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all consultation statistics at once
   * @param userType - "voluntario" for professionals or "assistido" for users
   * @returns Promise with all consultation counts
   */
  static async getAllConsultaStats(userType: 'voluntario' | 'assistido'): Promise<{
    hoje: number;
    semana: number;
    mes: number;
  }> {
    try {
      const [hoje, semana, mes] = await Promise.all([
        this.getConsultasDia(userType),
        this.getConsultasSemana(userType),
        this.getConsultasMes(userType)
      ]);

      return { hoje, semana, mes };
    } catch (error) {
      console.error('Error fetching all consulta stats:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors and convert them to a consistent format
   * @param error - The error from axios
   * @returns Formatted error object
   */
  private static handleApiError(error: any): ApiError {
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
}

export default ConsultaApiService;
