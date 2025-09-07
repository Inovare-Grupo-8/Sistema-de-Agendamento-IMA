import type { AppointmentRepository } from '@domain/ports/AppointmentRepository';
import type { Consulta, ProximaConsulta, CriarConsultaInput } from '@domain/entities/consulta';
import { apiClient } from '@/core/http/apiClient';
import axios from 'axios';

function normalizeError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response) return { message: error.response.data?.message || 'Erro no servidor', status: error.response.status };
    if (error.request) return { message: 'Servidor indisponível. Verifique sua conexão.', status: 0 };
  }
  return { message: 'Erro inesperado ao buscar dados', status: -1 };
}

export class AppointmentHttpRepository implements AppointmentRepository {
  async getCountDia(userType: 'voluntario' | 'assistido'): Promise<number> {
    try {
      const r = await apiClient.get<Consulta[]>(`/consulta/consultas/dia`, { params: { user: userType } });
      return r.data.length;
    } catch (e) { throw normalizeError(e); }
  }
  async getCountSemana(userType: 'voluntario' | 'assistido'): Promise<number> {
    try {
      const r = await apiClient.get<Consulta[]>(`/consulta/consultas/semana`, { params: { user: userType } });
      return r.data.length;
    } catch (e) { throw normalizeError(e); }
  }
  async getCountMes(userType: 'voluntario' | 'assistido'): Promise<number> {
    try {
      const r = await apiClient.get<Consulta[]>(`/consulta/consultas/mes`, { params: { user: userType } });
      return r.data.length;
    } catch (e) { throw normalizeError(e); }
  }
  async getAllStats(userType: 'voluntario' | 'assistido'): Promise<{ hoje: number; semana: number; mes: number }> {
    const [hoje, semana, mes] = await Promise.all([
      this.getCountDia(userType),
      this.getCountSemana(userType),
      this.getCountMes(userType),
    ]);
    return { hoje, semana, mes };
  }
  async getProximas(userType: 'voluntario' | 'assistido'): Promise<Consulta[]> {
    try {
      const r = await apiClient.get<Consulta[]>(`/consulta/consultas/3-proximas`, { params: { user: userType } });
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
  async getRecentes(userType: 'voluntario' | 'assistido'): Promise<Consulta[]> {
    try {
      const r = await apiClient.get<Consulta[]>(`/consulta/consultas/recentes`, { params: { user: userType } });
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
  async getHistorico(userType: 'voluntario' | 'assistido'): Promise<Consulta[]> {
    try {
      const r = await apiClient.get<Consulta[]>(`/consulta/consultas/historico`, { params: { user: userType } });
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
  async cancelar(id: number): Promise<Consulta> {
    try {
      const r = await apiClient.post<Consulta>(`/consulta/cancelar/${id}`);
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
  async adicionarAvaliacao(id: number, avaliacao: number): Promise<Consulta> {
    try {
      const r = await apiClient.post<Consulta>(`/consulta/consultas/${id}/avaliacao`, avaliacao.toString(), { headers: { 'Content-Type': 'text/plain' } });
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
  async adicionarFeedback(id: number, feedback: string): Promise<Consulta> {
    try {
      const r = await apiClient.post<Consulta>(`/consulta/consultas/${id}/feedback`, feedback, { headers: { 'Content-Type': 'text/plain' } });
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
  async getAvaliacoesFeedback(userType: 'voluntario' | 'assistido') {
    try {
      const r = await apiClient.get(`/consulta/consultas/avaliacoes-feedback`, { params: { user: userType } });
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
  async getProximaConsulta(idUsuario: number): Promise<ProximaConsulta> {
    try {
      const r = await apiClient.get<ProximaConsulta>(`/consulta/consultas/${idUsuario}/proxima`);
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
  async getHorariosDisponiveis(date: string, voluntarioId: number): Promise<string[]> {
    try {
      const r = await apiClient.get<string[]>(`/consulta/horarios-disponiveis`, { params: { data: date, idVoluntario: voluntarioId } });
      return r.data.map((dt) => new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) { throw normalizeError(e); }
  }
  async criarConsulta(input: CriarConsultaInput): Promise<Consulta> {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) throw new Error('Usuário não está logado');
      const user = JSON.parse(userData);
      const idAssistido = user.idUsuario;
      if (!idAssistido) throw new Error('ID do usuário não encontrado');

      const dateTime = `${input.data}T${input.horario}:00`;
  const idEspecialidade: number | null = 1;
      // Aqui poderíamos chamar um repositório de Especialidade em vez de lidar diretamente.

      const payload = {
        idVoluntario: input.idVoluntario,
        idAssistido,
        horario: dateTime,
        modalidade: input.modalidade,
        local: input.modalidade === 'ONLINE' ? 'Online' : 'Presencial',
        observacoes: input.observacoes || '',
        status: 'AGENDADA',
        idEspecialidade,
      };
      const r = await apiClient.post<Consulta>('/consulta', payload);
      return r.data;
    } catch (e) { throw normalizeError(e); }
  }
}

export default AppointmentHttpRepository;
