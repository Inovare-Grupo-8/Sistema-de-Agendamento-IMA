import { Consulta, ProximaConsulta, CriarConsultaInput } from '@domain/entities/consulta';

export interface AppointmentRepository {
  getCountDia(userType: 'voluntario' | 'assistido'): Promise<number>;
  getCountSemana(userType: 'voluntario' | 'assistido'): Promise<number>;
  getCountMes(userType: 'voluntario' | 'assistido'): Promise<number>;
  getAllStats(userType: 'voluntario' | 'assistido'): Promise<{ hoje: number; semana: number; mes: number }>;
  getProximas(userType: 'voluntario' | 'assistido'): Promise<Consulta[]>;
  getRecentes(userType: 'voluntario' | 'assistido'): Promise<Consulta[]>;
  getHistorico(userType: 'voluntario' | 'assistido'): Promise<Consulta[]>;
  cancelar(id: number): Promise<Consulta>;
  adicionarAvaliacao(id: number, avaliacao: number): Promise<Consulta>;
  adicionarFeedback(id: number, feedback: string): Promise<Consulta>;
  getAvaliacoesFeedback(userType: 'voluntario' | 'assistido'): Promise<{
    feedbacks: { id: number; comentario: string; criadoEm?: string }[];
    avaliacoes: { id: number; nota: number; criadoEm?: string }[];
  }>;
  getProximaConsulta(idUsuario: number): Promise<ProximaConsulta>;
  getHorariosDisponiveis(date: string, voluntarioId: number): Promise<string[]>;
  criarConsulta(input: CriarConsultaInput): Promise<Consulta>;
}

export default AppointmentRepository;
