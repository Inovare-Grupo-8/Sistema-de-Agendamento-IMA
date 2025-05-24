import { useContext } from 'react';
import { ProfessionalContext } from '@/contexts/ProfessionalContext';

export const useProfessional = () => {
  const context = useContext(ProfessionalContext);
  if (context === undefined) {
    throw new Error('useProfessional must be used within a ProfessionalProvider');
  }
  return context;
};
