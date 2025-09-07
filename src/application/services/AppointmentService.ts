import type { AppointmentRepository } from '@domain/ports/AppointmentRepository';
import type { Consulta, ProximaConsulta, CriarConsultaInput } from '@domain/entities/consulta';

export class AppointmentService {
  constructor(private repo: AppointmentRepository) {}

  getStats(userType: 'voluntario' | 'assistido') {
    return this.repo.getAllStats(userType);
  }
  getProximas(userType: 'voluntario' | 'assistido') {
    return this.repo.getProximas(userType);
  }
  getRecentes(userType: 'voluntario' | 'assistido') {
    return this.repo.getRecentes(userType);
  }
  getHistorico(userType: 'voluntario' | 'assistido') {
    return this.repo.getHistorico(userType);
  }
  cancelar(id: number) {
    return this.repo.cancelar(id);
  }
  avaliar(id: number, avaliacao: number) {
    return this.repo.adicionarAvaliacao(id, avaliacao);
  }
  feedback(id: number, feedback: string) {
    return this.repo.adicionarFeedback(id, feedback);
  }
  getAvaliacoesFeedback(userType: 'voluntario' | 'assistido') {
    return this.repo.getAvaliacoesFeedback(userType);
  }
  getProximaConsulta(idUsuario: number): Promise<ProximaConsulta> {
    return this.repo.getProximaConsulta(idUsuario);
  }
  getHorariosDisponiveis(date: string, voluntarioId: number) {
    return this.repo.getHorariosDisponiveis(date, voluntarioId);
  }
  criarConsulta(input: CriarConsultaInput): Promise<Consulta> {
    return this.repo.criarConsulta(input);
  }
}

export default AppointmentService;
