import { useState, useEffect } from 'react';

interface UserAddress {
  rua: string;
  numero: string;
  complemento: string;
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
  endereco: UserAddress;
  // Add professional-specific properties with optional modifiers
  crm?: string;
  especialidade?: string;
  observacoesDisponibilidade?: string;
  bio?: string;
  // You can add more professional properties as needed
}

export const useUserData = () => {
  const [userData, setUserDataState] = useState<UserData>(() => {
    const savedData = localStorage.getItem("userData");
    return savedData ? JSON.parse(savedData) : {
      nome: "Maria",
      sobrenome: "Silva",
      email: "maria.silva@email.com",
      telefone: "(11) 98765-4321",
      dataNascimento: "1990-05-15",
      genero: "Feminino",
      endereco: {
        rua: "Av. Paulista",
        numero: "1000",
        complemento: "Apto 123",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01310-100"
      }
      // Default values for professional fields are not needed as they are optional
    };
  });

  // Listen for storage events to sync data across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userData" && e.newValue) {
        setUserDataState(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Create a setter function that updates both state and localStorage
  const setUserData = (data: UserData) => {
    setUserDataState(data);
    localStorage.setItem("userData", JSON.stringify(data));
    // Dispatch a custom event to notify other components about the change
    window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: data }));
  };

  return {
    userData,
    setUserData
  };
};
