import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Tenta buscar o valor do localStorage
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        // Se o valor existir, retorna JSON parseado
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      // Se der erro, retorna o valor inicial
      console.error(`Erro ao ler a chave "${key}" do localStorage:`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor no localStorage e no estado
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que o valor seja uma função para imitar setState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salva o estado
      setStoredValue(valueToStore);
      
      // Salva no localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao definir a chave "${key}" no localStorage:`, error);
    }
  };

  // Sincroniza com alterações em outras abas/janelas
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };
    
    // Adiciona o event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Remove o event listener no cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}
