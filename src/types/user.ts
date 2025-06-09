export interface Endereco {
  rua: string;
  numero: string;
  complemento: string; // Changed from optional to required
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface UserData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  genero: string;
  endereco: Endereco;
}

export interface UserContextType {
  userData: UserData;
  setUserData: (data: UserData) => void;
  updateUserData: (updates: Partial<UserData>) => void;
}

export const defaultUserData: UserData = {
  nome: "",
  sobrenome: "",
  email: "",
  telefone: "",
  dataNascimento: "",
  genero: "",
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
