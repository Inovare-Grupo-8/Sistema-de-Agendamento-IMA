import { createContext } from "react";
import type { ProfessionalContextType } from "@/types/professional";

export const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);
