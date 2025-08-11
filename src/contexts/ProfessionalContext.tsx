import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ProfessionalData, ProfessionalContextType, defaultProfessionalData } from '@/types/professional';
import { VoluntarioApiService } from '@/services/voluntarioApi';


export const ProfessionalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [professionalData, setProfessionalDataState] = useState<ProfessionalData>(() => {
    const savedData = localStorage.getItem("professionalData");
    return savedData ? { ...defaultProfessionalData, ...JSON.parse(savedData) } : defaultProfessionalData;
  });

  const setProfessionalData = (data: ProfessionalData) => {
    setProfessionalDataState(data);
    localStorage.setItem("professionalData", JSON.stringify(data));
  };

  const updateProfessionalData = (updates: Partial<ProfessionalData>) => {
    const newData = { ...professionalData, ...updates };
    setProfessionalData(newData);
  };

  // Carregar dados do voluntário logado
  useEffect(() => {
    const loadVoluntarioData = async () => {
      try {
        // Verificar se temos dados de usuário no localStorage
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return;

        const user = JSON.parse(userInfo);
        
        // Verificar se é um voluntário
        if (user.tipo !== 'VOLUNTARIO') return;

        // Verificar se já temos dados salvos recentemente
        const savedData = localStorage.getItem("professionalData");
        if (savedData) {
          const saved = JSON.parse(savedData);
          // Se temos dados salvos e o ID é o mesmo, não recarregar
          if (saved.id === user.id && saved.nome && saved.sobrenome) {
            return;
          }
        }

        // Buscar dados atualizados do voluntário na API
        const voluntarioData = await VoluntarioApiService.buscarDadosPessoaisVoluntario(user.id);
        
        if (voluntarioData) {
          const professionalInfo: ProfessionalData = {
            id: user.id,
            nome: voluntarioData.nome,
            sobrenome: voluntarioData.sobrenome,
            especialidade: voluntarioData.especialidade,
            email: voluntarioData.email,
            telefone: '',
            dataNascimento: '',
            crm: '',
            bio: '',
            observacoesDisponibilidade: '',
            endereco: {
              rua: '',
              numero: '',
              complemento: '',
              bairro: '',
              cidade: '',
              estado: '',
              cep: ''
            }
          };
          
          setProfessionalData(professionalInfo);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do voluntário:', error);
      }
    };

    loadVoluntarioData();
  }, []);

  useEffect(() => {
    localStorage.setItem("professionalData", JSON.stringify(professionalData));
  }, [professionalData]);

  return (
    <ProfessionalContext.Provider value={{ professionalData, setProfessionalData, updateProfessionalData }}>
      {children}
    </ProfessionalContext.Provider>
  );
};

export const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);
