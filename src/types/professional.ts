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
  endereco: {
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

export interface ProfessionalContextType {
  professionalData: ProfessionalData;
  setProfessionalData: (data: ProfessionalData) => void;
  updateProfessionalData: (updates: Partial<ProfessionalData>) => void;
}

export const defaultProfessionalData: ProfessionalData = {
  nome: "Ricardo",
  sobrenome: "Santos",
  email: "",
  telefone: "",
  dataNascimento: "",
  especialidade: "Psicologia",
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
