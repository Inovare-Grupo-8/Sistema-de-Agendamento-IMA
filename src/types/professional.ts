export interface Endereco {
  rua: string;
  numero: string;
  complemento: string; // Changed from optional to required
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface ProfessionalData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  especialidade: string;
  crm: string;
  bio: string;
  observacoesDisponibilidade: string;
  endereco: Endereco;
}

export interface ProfessionalContextType {
  professionalData: ProfessionalData;
  setProfessionalData: (data: ProfessionalData) => void;
  updateProfessionalData: (updates: Partial<ProfessionalData>) => void;
}

export const defaultProfessionalData: ProfessionalData = {
  nome: "",
  sobrenome: "",
  email: "",
  telefone: "",
  dataNascimento: "",
  especialidade: "",
  crm: "",
  bio: "",
  observacoesDisponibilidade: "",
  endereco: {
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: ""
  }
};
