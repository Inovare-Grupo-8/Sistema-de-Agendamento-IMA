// Funções de validação reutilizáveis

export const isRequired = (value: unknown): string | null => {
  return !value || (typeof value === 'string' && value.trim() === '') 
    ? 'Este campo é obrigatório' 
    : null;
};

export const isEmail = (value: string): string | null => {
  if (!value) return null;
  
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(value) ? null : 'Email inválido';
};

export const isPhone = (value: string): string | null => {
  if (!value) return null;

  const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
  const numericPhone = value.replace(/\D/g, '');
  return phoneRegex.test(value) && numericPhone.length === 11 ? null : 'Telefone inválido';
};

export const minLength = (min: number) => (value: string): string | null => {
  if (!value) return null;
  
  return value.length < min 
    ? `Deve ter pelo menos ${min} caracteres` 
    : null;
};

export const maxLength = (max: number) => (value: string): string | null => {
  if (!value) return null;
  
  return value.length > max 
    ? `Deve ter no máximo ${max} caracteres` 
    : null;
};

export const isCpf = (value: string): string | null => {
  if (!value) return null;
  
  const cleanCPF = value.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return 'CPF inválido';
  
  // Verificação básica de CPF
  let sum = 0;
  let remainder;
  
  // Primeira verificação
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i-1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return 'CPF inválido';
  
  // Segunda verificação
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i-1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return 'CPF inválido';
  
  return null;
};

// Funções de formatação
export const formatters = {
  cep: (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length <= 5 
      ? numbers 
      : `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  },
  
  phone: (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  },
  
  cpf: (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
};
