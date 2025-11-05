import { apiClient } from '@/core/http/apiClient';

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
  // Central error logging pode ser aplicado aqui se necessário
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
      throw new Error('Falha ao carregar dados do voluntário');
    }
  }

  /**
   * Lista todos os voluntários para seleção em agendamentos
   * Retorna apenas voluntários ativos com informações simplificadas
   */
  static async listarVoluntariosParaAgendamento(): Promise<{
    id: number;
    nome: string;
    especialidade: string;
  }[]> {
    try {
      const voluntarios = await this.listarVoluntarios();
      
      // Filtrar apenas voluntários ativos e mapear para formato simplificado
      return voluntarios
        .filter(voluntario => this.determinarStatus(voluntario) === 'ativo')
        .map(voluntario => ({
          id: voluntario.idUsuario,
          nome: voluntario.nomeCompleto || `${voluntario.nome} ${voluntario.sobrenome}`.trim(),
          especialidade: voluntario.areaOrientacao || voluntario.funcao || 'Consulta Geral'
        }));
      
    } catch (error) {
      throw new Error('Falha ao carregar especialistas disponíveis');
    }
  }
}

export default VoluntarioApiService;
