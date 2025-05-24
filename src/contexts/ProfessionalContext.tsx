import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ProfessionalData, ProfessionalContextType, defaultProfessionalData } from '@/types/professional';

export const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);

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

  useEffect(() => {
    localStorage.setItem("professionalData", JSON.stringify(professionalData));
  }, [professionalData]);

  return (
    <ProfessionalContext.Provider value={{ professionalData, setProfessionalData, updateProfessionalData }}>
      {children}
    </ProfessionalContext.Provider>
  );
};
