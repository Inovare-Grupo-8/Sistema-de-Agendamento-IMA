// Tipos de domínio para consultas (independentes de UI/Infra)

export type ConsultaStatus = 'AGENDADA' | 'CANCELADA' | 'REALIZADA' | string;
export type Modalidade = 'ONLINE' | 'PRESENCIAL' | string;

export interface Especialidade {
  id: number;
  nome: string;
}

export interface UsuarioRef {
  idUsuario: number;
  email?: string;
  nome?: string;
  sobrenome?: string;
}

export interface Consulta {
  idConsulta: number;
  horario: string; // ISO
  status: ConsultaStatus;
  modalidade: Modalidade;
  local: string;
  observacoes?: string;
  especialidade?: Especialidade;
  voluntario?: UsuarioRef;
  assistido?: UsuarioRef;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ProximaConsulta {
  horario: string;
  status: ConsultaStatus;
  modalidade: Modalidade;
  local: string;
  observacoes?: string;
  especialidade: { idEspecialidade: number; nome: string };
  assistido: { idUsuario: number; ficha: { nome: string; sobrenome: string } };
  voluntario: { idUsuario: number; ficha: { nome: string; sobrenome: string; profissao: string } };
}

export interface CriarConsultaInput {
  idVoluntario: number;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  modalidade: Modalidade;
  observacoes?: string;
  especialidade?: string;
}
