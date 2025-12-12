import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  CheckCircle2,
  X,
  Save,
  User,
  MapPin,
  Heart,
  Star,
  Sparkles,
  GraduationCap,
  Loader2,
  TriangleAlert,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Building,
} from "lucide-react";
import InputMask from "react-input-mask";

// Constants and Types
const SALARIO_MINIMO = 1518.0;

interface FormVoluntarioData {
  nomeCompleto: string;
  telefone: string;
  dataNascimento: string;
  genero: string;
  cpf: string;
  faixaSalarial: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  funcao: string;
  profissao: string;
  crm?: string;
  tipo: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

type FieldState = "valid" | "invalid" | "default";

interface PrimeiraFaseData {
  nome?: string;
  sobrenome?: string;
  email?: string;
  dataNascimento?: string;
  telefone?: string;
  cpf?: string;
  id?: number;
}

// Helper functions
const convertFaixaSalarialToNumber = (
  faixa: string
): { rendaMinima: number; rendaMaxima: number } => {
  switch (faixa) {
    case "ate-1-salario":
      return { rendaMinima: 0, rendaMaxima: SALARIO_MINIMO };
    case "1-a-2-salarios":
      return { rendaMinima: SALARIO_MINIMO, rendaMaxima: SALARIO_MINIMO * 2 };
    case "2-a-3-salarios":
      return {
        rendaMinima: SALARIO_MINIMO * 2,
        rendaMaxima: SALARIO_MINIMO * 3,
      };
    case "3-a-5-salarios":
      return {
        rendaMinima: SALARIO_MINIMO * 3,
        rendaMaxima: SALARIO_MINIMO * 5,
      };
    case "5-a-10-salarios":
      return {
        rendaMinima: SALARIO_MINIMO * 5,
        rendaMaxima: SALARIO_MINIMO * 10,
      };
    case "acima-10-salarios":
      return {
        rendaMinima: SALARIO_MINIMO * 10,
        rendaMaxima: SALARIO_MINIMO * 20,
      };
    default:
      return { rendaMinima: 0, rendaMaxima: SALARIO_MINIMO };
  }
};

const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2");
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

// Animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

export function CompletarCadastroVoluntario() {
  // State
  const [formData, setFormData] = useState<FormVoluntarioData>({
    nomeCompleto: "",
    telefone: "",
    dataNascimento: "",
    genero: "",
    cpf: "",
    faixaSalarial: "",
    email: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    funcao: "",
    profissao: "",
    crm: "",
    tipo: "VOLUNTARIO",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>(
    {}
  );
  const [readOnlyFields, setReadOnlyFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [fetchUserError, setFetchUserError] = useState<string | null>(null);
  const [primeiraFaseData, setPrimeiraFaseData] =
    useState<PrimeiraFaseData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const idUsuario = searchParams.get("id");

  // Função para gerar senha padrão
  const generateDefaultPassword = (
    cpf: string,
    dataNascimento: string
  ): string => {
    const cpfDigits = cpf.replace(/\D/g, "");
    const firstThreeCpfDigits = cpfDigits.substring(0, 3);
    const birthDate = dataNascimento.replace(/\D/g, "");
    return firstThreeCpfDigits + birthDate;
  };
  const validateField = (fieldName: string, value: string) => {
    let isValid = true;
    let errorMessage = "";
    switch (fieldName) {
      case "dataNascimento":
        if (!value) {
          errorMessage = "Data de nascimento é obrigatória";
          isValid = false;
        }
        break;
      case "genero":
        if (!value) {
          errorMessage = "Gênero é obrigatório";
          isValid = false;
        }
        break;
      case "renda":
        if (!value || isNaN(Number(value))) {
          errorMessage = "Renda obrigatória e deve ser um número";
          isValid = false;
        }
        break;
      case "funcao":
        if (!value) {
          errorMessage = "Função é obrigatória";
          isValid = false;
        }
        break;
      case "profissao":
        if (!value) {
          errorMessage = "Profissão é obrigatória";
          isValid = false;
        }
        break;
      case "cep": {
        const cepRegex = /^\d{5}-\d{3}$/;
        if (!value) {
          errorMessage = "CEP é obrigatório";
          isValid = false;
        } else if (!cepRegex.test(value)) {
          errorMessage = "CEP inválido (formato: 00000-000)";
          isValid = false;
        }
        break;
      }
      case "numero":
        if (!value) {
          errorMessage = "Número é obrigatório";
          isValid = false;
        }
        break;
      case "ddd":
        if (!value || value.length !== 2) {
          errorMessage = "DDD obrigatório (2 dígitos)";
          isValid = false;
        }
        break;
      case "telefone": {
        const cleanPhone = value.replace(/\D/g, "");
        if (!value) {
          errorMessage = "Telefone é obrigatório";
          isValid = false;
        } else if (cleanPhone.length !== 11) {
          errorMessage = "Telefone deve ter 11 dígitos (celular)";
          isValid = false;
        } else if (!/^\d+$/.test(cleanPhone)) {
          errorMessage = "Telefone deve conter apenas números";
          isValid = false;
        }
        break;
      }
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
    setFieldStates((prev) => ({
      ...prev,
      [fieldName]: value ? (isValid ? "valid" : "invalid") : "default",
    }));
    return isValid;
  };
  // Funções de formatação
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };
  const handleFieldChange = (fieldName: string, value: string) => {
    // Não permitir edição de campos somente leitura
    if (readOnlyFields.has(fieldName)) {
      return;
    }

    let formattedValue = value;

    // Apply formatting based on field type
    if (fieldName === "cpf") {
      formattedValue = formatCPF(value);
    } else if (fieldName === "telefone") {
      formattedValue = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [fieldName]: formattedValue }));
    setChangedFields((prev) => new Set(prev).add(fieldName));
    setTimeout(() => validateField(fieldName, formattedValue), 100);
  };

  // Handler para mudanças nos campos com máscara
  const handleMaskedFieldChange = (fieldName: string, value: string) => {
    // Não permitir edição de campos somente leitura
    if (readOnlyFields.has(fieldName)) {
      return;
    }

    let formattedValue = value;
    if (fieldName === "cpf") {
      formattedValue = formatCPF(value);
    } else if (fieldName === "telefone") {
      formattedValue = formatPhone(value);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: formattedValue }));
    setChangedFields((prev) => new Set(prev).add(fieldName));
    setTimeout(() => validateField(fieldName, formattedValue), 300);
  };

  // Função utilitária para salvar dados do perfil do voluntário no localStorage
  const saveVoluntarioProfileData = (
    formData: FormVoluntarioData,
    primeiraFaseData?: PrimeiraFaseData
  ) => {
    // Extrai nome e sobrenome do nomeCompleto
    let nome = "";
    let sobrenome = "";
    if (formData.nomeCompleto) {
      const partes = formData.nomeCompleto.trim().split(" ");
      nome = partes[0] || "";
      sobrenome = partes.slice(1).join(" ") || "";
    }
    // Se primeiraFaseData existir, prioriza nome/sobrenome dela
    if (primeiraFaseData) {
      nome = primeiraFaseData.nome || nome;
      sobrenome = primeiraFaseData.sobrenome || sobrenome;
    }
    // Função do voluntário
    const funcao = formData.funcao || "";
    // Foto de perfil (futuro: buscar de backend se existir)
    const profileImage = null; // Pode ser atualizado se houver upload futuramente
    const profileData = { nome, sobrenome, funcao, profileImage };
    localStorage.setItem("voluntarioProfileData", JSON.stringify(profileData));
  };

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (changedFields.size > 0) {
        localStorage.setItem("voluntario_form_data", JSON.stringify(formData));
        localStorage.setItem(
          "voluntario_form_timestamp",
          new Date().toISOString()
        );
        setLastSaved(new Date());
        setChangedFields(new Set());
        // Salva dados do perfil simplificado
        saveVoluntarioProfileData(formData, primeiraFaseData);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [changedFields, formData, primeiraFaseData]); // Buscar dados do usuário quando o ID está disponível
  useEffect(() => {
    if (!idUsuario) {
      console.log("idUsuario não encontrado na URL.");
      return;
    }

    console.log("Buscando usuário com idUsuario:", idUsuario);
    setFetchingUser(true);
    setFetchUserError(null);

    fetch(
      `${import.meta.env.VITE_URL_BACKEND}/usuarios/primeira-fase/${idUsuario}`
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Erro ao buscar dados do usuário");
        }
        const data = await res.json();
        console.log("Dados recebidos:", data);

        // Verificar se é usuário novo (sem dados da primeira fase completos)
        const hasBasicInfo = data.nome && data.cpf;
        setIsNewUser(!hasBasicInfo);

        // Determinar quais campos vieram do banco de dados e devem ser somente leitura
        const fieldsFromDB = new Set<string>();

        // Atualizar dados do formulário e marcar campos como somente leitura
        setFormData((prev) => {
          const updatedData = { ...prev };

          // Nome completo (combinação de nome + sobrenome)
          if (data.nome) {
            const nomeCompleto = data.sobrenome
              ? `${data.nome} ${data.sobrenome}`
              : data.nome;
            updatedData.nomeCompleto = nomeCompleto;
            fieldsFromDB.add("nomeCompleto");
          }

          // Email
          if (data.email) {
            updatedData.email = data.email;
            fieldsFromDB.add("email");
          }

          // CPF
          if (data.cpf) {
            updatedData.cpf = data.cpf;
            fieldsFromDB.add("cpf");
          }

          // Data de nascimento
          if (data.dataNascimento) {
            updatedData.dataNascimento = data.dataNascimento;
          }

          return updatedData;
        });

        // Marcar campos como somente leitura
        setReadOnlyFields(fieldsFromDB);

        // Salvar dados da primeira fase
        setPrimeiraFaseData(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar usuário:", error);
        setFetchUserError(error.message);
      })
      .finally(() => setFetchingUser(false));
  }, [idUsuario]); // Buscar usuário por email se idUsuario não existir
  useEffect(() => {
    if (
      (!idUsuario || idUsuario === "0") &&
      formData.email &&
      fieldStates.email === "valid"
    ) {
      setFetchingUser(true);

      fetch(
        `${
          import.meta.env.VITE_URL_BACKEND
        }/usuarios/primeira-fase/email/${encodeURIComponent(formData.email)}`
      )
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("Usuário não encontrado");
          }
          const data = await res.json();

          if (data) {
            // Verificar se é usuário novo (sem dados da primeira fase completos)
            const hasBasicInfo = data.nome && data.cpf;
            setIsNewUser(!hasBasicInfo);

            // Determinar quais campos vieram do banco de dados e devem ser somente leitura
            const fieldsFromDB = new Set<string>();

            // Atualizar dados do formulário e marcar campos como somente leitura
            setFormData((prev) => {
              const updatedData = { ...prev };

              // Nome completo (combinação de nome + sobrenome)
              if (data.nome) {
                const nomeCompleto = data.sobrenome
                  ? `${data.nome} ${data.sobrenome}`
                  : data.nome;
                updatedData.nomeCompleto = nomeCompleto;
                fieldsFromDB.add("nomeCompleto");
              }

              // Email
              if (data.email) {
                updatedData.email = data.email;
                fieldsFromDB.add("email");
              }

              // CPF
              if (data.cpf) {
                updatedData.cpf = data.cpf;
                fieldsFromDB.add("cpf");
              }

              // Data de nascimento
              if (data.dataNascimento) {
                updatedData.dataNascimento = data.dataNascimento;
              }

              return updatedData;
            });

            // Marcar campos como somente leitura
            setReadOnlyFields(fieldsFromDB);

            // Salvar dados da primeira fase
            setPrimeiraFaseData(data);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar usuário por email:", error);
        })
        .finally(() => setFetchingUser(false));
    }
  }, [formData.email, idUsuario, fieldStates.email]); // Busca endereço por CEP
  const fetchAddressByCep = async (cep: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, cep: true }));
      const cleanCep = cep.replace(/\D/g, "");

      if (cleanCep.length === 8) {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCep}/json/`
        );

        interface ViaCepResponse {
          erro?: boolean;
          logradouro?: string;
          bairro?: string;
          localidade?: string;
          uf?: string;
          complemento?: string;
        }

        const data: ViaCepResponse = await response.json();

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
            complemento: data.complemento || prev.complemento,
          }));

          // Limpar erros de endereço e marcar como válidos
          setErrors((prev) => ({
            ...prev,
            cep: "",
            logradouro: "",
            bairro: "",
            cidade: "",
            estado: "",
          }));

          setFieldStates((prev) => ({
            ...prev,
            cep: "valid",
            logradouro: data.logradouro ? "valid" : "default",
            bairro: data.bairro ? "valid" : "default",
            cidade: data.localidade ? "valid" : "default",
            estado: data.uf ? "valid" : "default",
          }));
        } else {
          setErrors((prev) => ({ ...prev, cep: "CEP não encontrado" }));
          setFieldStates((prev) => ({ ...prev, cep: "invalid" }));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setErrors((prev) => ({ ...prev, cep: "Erro ao buscar CEP" }));
      setFieldStates((prev) => ({ ...prev, cep: "invalid" }));
    } finally {
      setIsLoading((prev) => ({ ...prev, cep: false }));
    }
  };

  // Validação geral
  const validateForm = () => {
    let isValid = true;
    Object.keys(formData).forEach((field) => {
      if (!validateField(field, formData[field as keyof typeof formData]))
        isValid = false;
    });
    return isValid;
  }; // Payload para backend
  const getPayload = () => {
    // Clean up phone number - remove all non-digits and ensure proper format
    const cleanPhone = formData.telefone.replace(/\D/g, "");
    // Clean up CEP - remove all non-digits for backend
    const cleanCep = formData.cep.replace(/\D/g, "");

    // Parse phone number: 11 digits = ddd (2) + prefixo (5) + sufixo (4)
    let telefoneData = {};
    if (cleanPhone.length === 11) {
      telefoneData = {
        ddd: cleanPhone.substring(0, 2),
        prefixo: cleanPhone.substring(2, 7),
        sufixo: cleanPhone.substring(7, 11),
        whatsapp: true, // Default to true for volunteers
      };
    } else if (cleanPhone.length === 10) {
      // Handle 10-digit numbers: ddd (2) + prefixo (4) + sufixo (4) -> convert to new format
      telefoneData = {
        ddd: cleanPhone.substring(0, 2),
        prefixo: "9" + cleanPhone.substring(2, 6), // Add 9 prefix for mobile
        sufixo: cleanPhone.substring(6, 10),
        whatsapp: true,
      };
    }
    const salaryData = convertFaixaSalarialToNumber(formData.faixaSalarial);

    interface PayloadData {
      dataNascimento: string;
      genero: string;
      rendaMinima: number;
      rendaMaxima: number;
      tipo: string;
      endereco: {
        cep: string;
        numero: string;
        complemento: string;
      };
      telefone: object;
      profissao: string;
      funcao?: string;
      crm?: string;
      nome?: string;
      sobrenome?: string;
      email?: string;
      cpf?: string;
      senha?: string;
    }

    const payload: PayloadData = {
      // CPF is not included here since it comes from first phase
      dataNascimento: formData.dataNascimento,
      genero: formData.genero,
      rendaMinima: salaryData.rendaMinima,
      rendaMaxima: salaryData.rendaMaxima,
      tipo: "VOLUNTARIO",
      endereco: {
        cep: cleanCep,
        numero: formData.numero,
        complemento: formData.complemento || "N/A", // Required field, provide default
      },
      telefone: telefoneData,
      profissao: formData.profissao,
    };

    // Add optional fields
    if (formData.funcao) payload.funcao = formData.funcao;
    if (formData.crm) payload.crm = formData.crm;

    // Para usuários novos, incluir dados da primeira fase e senha
    if (isNewUser) {
      // Separar nome completo em nome e sobrenome
      const nomePartes: string[] = formData.nomeCompleto.trim().split(" ");
      const nome = nomePartes[0];
      const sobrenome = nomePartes.slice(1).join(" ") || "";

      const senha = generateDefaultPassword(
        formData.cpf,
        formData.dataNascimento
      );
      setGeneratedPassword(senha);

      payload.nome = nome;
      payload.sobrenome = sobrenome;
      payload.email = formData.email;
      payload.cpf = formData.cpf.replace(/\D/g, "");
      payload.senha = senha;
    }

    return payload;
  };
  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!idUsuario) {
        throw new Error("ID do usuário não encontrado na URL.");
      }

      if (!validateForm()) {
        throw new Error(
          "Por favor, preencha todos os campos obrigatórios corretamente."
        );
      }

      const payload = getPayload();
      console.log("Enviando payload:", JSON.stringify(payload, null, 2));
      const baseUrl = (import.meta.env.VITE_URL_BACKEND || '').toString().trim();
      const computedBase = baseUrl ? baseUrl.replace(/\/+$/, '') : '';
      const url = computedBase
        ? `${computedBase}/usuarios/voluntario/segunda-fase?idUsuario=${idUsuario}`
        : `/api/usuarios/voluntario/segunda-fase?idUsuario=${idUsuario}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Resposta do servidor:", errorData);

        throw new Error(errorData.message || "Erro ao completar cadastro");
      }

      // Limpar dados do localStorage
      localStorage.removeItem("voluntario_form_data");
      localStorage.removeItem("voluntario_form_timestamp");
      // Salvar dados do perfil simplificado para uso global
      saveVoluntarioProfileData(formData, primeiraFaseData);

      // Mostrar modal de sucesso
      setShowSuccessModal(true);

      // Para usuários existentes, redirecionar automaticamente após delay
      if (!isNewUser) {
        setTimeout(() => navigate("/login"), 2000);
      }
      // Para usuários novos, aguardar fechamento manual do modal
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao enviar cadastro.";
      setSubmitError(errorMessage);

      console.error("Erro no submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Função para obter classes CSS do campo baseado no estado readonly
  const getFieldClasses = (
    fieldName: string,
    baseClass: string = "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  ) => {
    if (readOnlyFields.has(fieldName)) {
      return `${baseClass} bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400`;
    }
    return baseClass;
  };

  // Renderização do campo com estado visual
  const renderFieldWithState = (
    fieldName: string,
    children: React.ReactNode
  ) => {
    const state = fieldStates[fieldName] || "default";
    return (
      <div className="relative">
        {children}
        {state === "valid" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-[50%] transform -translate-y-1/2"
          >
            <Check className="w-5 h-5 text-green-500" />
          </motion.div>
        )}
      </div>
    );
  };

  // Calcular progresso do formulário
  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length - 2; // Excluir complemento e crm (opcionais)
    const filledFields = Object.entries(formData).filter(
      ([key, value]) =>
        key !== "complemento" &&
        key !== "crm" &&
        (typeof value === "string" ? value.trim() !== "" : value !== undefined)
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  // Verificar se seção está completa
  const isSectionComplete = (section: number) => {
    switch (section) {
      case 1:
        return (
          formData.nomeCompleto &&
          formData.telefone &&
          formData.dataNascimento &&
          formData.cpf &&
          formData.email &&
          formData.genero &&
          formData.faixaSalarial &&
          !errors.nomeCompleto &&
          !errors.telefone &&
          !errors.dataNascimento &&
          !errors.cpf &&
          !errors.email &&
          !errors.genero &&
          !errors.faixaSalarial
        );
      case 2:
        return (
          formData.cep &&
          formData.logradouro &&
          formData.numero &&
          formData.bairro &&
          formData.cidade &&
          formData.estado &&
          !errors.cep &&
          !errors.logradouro &&
          !errors.numero &&
          !errors.bairro &&
          !errors.cidade &&
          !errors.estado
        );
      case 3:
        return (
          formData.funcao &&
          formData.profissao &&
          !errors.funcao &&
          !errors.profissao
        );
      default:
        return false;
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);

    // Se foi um usuário novo, navegar para login
    if (isNewUser) {
      navigate("/login");
    }

    // Reset form
    setFormData({
      nomeCompleto: "",
      telefone: "",
      dataNascimento: "",
      genero: "",
      cpf: "",
      faixaSalarial: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      funcao: "",
      profissao: "",
      crm: "",
      tipo: "VOLUNTARIO",
    });
    setErrors({});
    setFieldStates({});
    setLastSaved(null);
  };
  // Layout e animações semelhantes à tela de anamnese
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSuccessModal}
            />

            {/* Modal Content */}
            <motion.div
              className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 max-w-md w-full mx-4 overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
            >
              {/* Close Button */}
              <motion.button
                onClick={closeSuccessModal}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </motion.button>

              {/* Success Content */}
              <div className="p-8 text-center">
                {/* Success Icon */}
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>

                {/* Success Message */}
                <motion.h3
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {isNewUser
                    ? "Cadastro de Voluntário Realizado!"
                    : "Cadastro de Voluntário Completo!"}
                </motion.h3>

                <motion.div
                  className="space-y-3 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {isNewUser ? (
                    <>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Bem-vindo! Seu cadastro foi criado com sucesso.
                      </p>
                      <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sua senha padrão é:
                        </p>
                        <div className="bg-white dark:bg-gray-600 rounded border px-3 py-2 font-mono text-lg text-center font-bold text-blue-600 dark:text-blue-400">
                          {generatedPassword}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Guarde esta senha em local seguro. Você pode alterá-la
                          após fazer login.
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Obrigado por completar seu cadastro como voluntário! Nossa
                      equipe entrará em contato em breve.
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save indicator */}
      <AnimatePresence>
        {lastSaved && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-40 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm">
              Salvo automaticamente às {lastSaved.toLocaleTimeString()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 py-8 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Progress Bar Enhanced */}
        <motion.div
          className="w-full max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full p-2 shadow-lg border border-white/20">
            <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 px-4">
              <span>Progresso do Formulário</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {/* Step indicators */}
            <div className="grid grid-cols-3 gap-4 px-4 pb-2">
              {[
                {
                  step: 1,
                  title: "Dados Pessoais",
                  icon: User,
                  complete: isSectionComplete(1),
                },
                {
                  step: 2,
                  title: "Endereço",
                  icon: MapPin,
                  complete: isSectionComplete(2),
                },
                {
                  step: 3,
                  title: "Dados Profissionais",
                  icon: GraduationCap,
                  complete: isSectionComplete(3),
                },
              ].map(({ step, title, icon: Icon, complete }) => (
                <motion.div
                  key={step}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                    complete
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: step * 0.1 }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      complete
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {complete ? <Check className="w-3 h-3" /> : step}
                  </div>
                  <div className="hidden sm:block">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium hidden md:block">
                    {title}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Header Section */}
        <motion.div className="text-center mb-12" variants={sectionVariants}>
          <div className="flex items-center justify-center gap-6 mb-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <img
                src="/image/LogoIMA.png"
                alt="Logo Mãos Amigas"
                className="h-24 w-auto drop-shadow-2xl"
              />
            </motion.div>
            <div className="text-left">
              <motion.h1
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Cadastro de
              </motion.h1>
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Heart className="w-8 h-8 text-red-500" />
                Voluntário
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </motion.h2>
            </div>
          </div>
          <motion.p
            className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Complete seu cadastro para se tornar um voluntário e ajudar nossa
            comunidade. Sua dedicação faz a diferença na vida de muitas pessoas!
          </motion.p>
        </motion.div>

        {/* Form Container */}
        <motion.div className="max-w-4xl mx-auto" variants={sectionVariants}>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-8 p-8 md:p-12">
              {/* Loading/Error States */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center gap-3">
                    <TriangleAlert className="w-5 h-5 text-red-500" />
                    <div>
                      <h3 className="font-medium text-red-800 dark:text-red-200">
                        Erro no Cadastro
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        {submitError}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {fetchUserError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center gap-3">
                    <TriangleAlert className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Aviso
                      </h3>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                        {fetchUserError}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {fetchingUser && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Carregando dados do usuário...</span>
                  </div>
                </motion.div>
              )}

              {/* Dados Pessoais section */}
              <motion.div
                className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 sm:p-8 border border-blue-100/50 dark:border-gray-600/30 backdrop-blur-sm relative overflow-hidden mb-8"
                variants={sectionVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <motion.h2
                    className="text-2xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {isSectionComplete(1) ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </motion.div>
                    <div>
                      <span>Dados Pessoais</span>
                      {isSectionComplete(1) && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="block text-sm font-normal text-green-600 dark:text-green-400"
                        >
                          ✓ Seção completa
                        </motion.span>
                      )}
                    </div>
                  </motion.h2>
                  {/* Nome e Telefone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="nomeCompleto"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Nome Completo <span className="text-red-500">*</span>
                        {readOnlyFields.has("nomeCompleto") && (
                          <span className="text-xs text-gray-500 ml-1">
                            (vindos do cadastro)
                          </span>
                        )}
                      </Label>

                      {renderFieldWithState(
                        "nomeCompleto",
                        <Input
                          id="nomeCompleto"
                          type="text"
                          value={formData.nomeCompleto}
                          onChange={(e) =>
                            handleFieldChange("nomeCompleto", e.target.value)
                          }
                          placeholder="Ex: João da Silva"
                          className={cn(
                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                            fieldStates.nomeCompleto === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.nomeCompleto === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500",
                            readOnlyFields.has("nomeCompleto") &&
                              "bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400"
                          )}
                          readOnly={readOnlyFields.has("nomeCompleto")}
                          aria-label="Campo obrigatório para nome completo"
                          aria-describedby={
                            errors.nomeCompleto
                              ? "nomeCompleto-error"
                              : undefined
                          }
                          aria-invalid={!!errors.nomeCompleto}
                          autoComplete="name"
                          required
                        />
                      )}

                      {errors.nomeCompleto && (
                        <motion.p
                          id="nomeCompleto-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.nomeCompleto}
                        </motion.p>
                      )}
                    </div>

                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="telefone"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Telefone <span className="text-red-500">*</span>
                      </Label>

                      {renderFieldWithState(
                        "telefone",
                        <InputMask
                          mask="(99) 99999-9999"
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) =>
                            handleMaskedFieldChange("telefone", e.target.value)
                          }
                          placeholder="(11) 94555-5555"
                          className={cn(
                            "flex h-12 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200",
                            "mt-2",
                            fieldStates.telefone === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.telefone === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-label="Campo obrigatório para telefone"
                          aria-describedby={
                            errors.telefone ? "telefone-error" : undefined
                          }
                          aria-invalid={!!errors.telefone}
                          autoComplete="tel"
                          inputMode="tel"
                          required
                        />
                      )}

                      {errors.telefone && (
                        <motion.p
                          id="telefone-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.telefone}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  {/* Data de Nascimento e Gênero */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="dataNascimento"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Data de Nascimento{" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      {renderFieldWithState(
                        "dataNascimento",
                        <Input
                          id="dataNascimento"
                          type="date"
                          value={formData.dataNascimento}
                          onChange={(e) =>
                            handleFieldChange("dataNascimento", e.target.value)
                          }
                          className={cn(
                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                            fieldStates.dataNascimento === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.dataNascimento === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-label="Campo obrigatório para data de nascimento"
                          aria-describedby={
                            errors.dataNascimento
                              ? "dataNascimento-error"
                              : undefined
                          }
                          aria-invalid={!!errors.dataNascimento}
                          autoComplete="bday"
                          inputMode="none"
                          required
                        />
                      )}

                      {errors.dataNascimento && (
                        <motion.p
                          id="dataNascimento-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.dataNascimento}
                        </motion.p>
                      )}
                    </div>

                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="genero"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Gênero <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <select
                          id="genero"
                          name="genero"
                          className={cn(
                            "w-full h-12 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-all duration-200 shadow-sm text-base pr-10 appearance-auto",
                            "mt-2",
                            fieldStates.genero === "invalid" &&
                              "border-red-500 focus:ring-red-500",
                            fieldStates.genero === "valid" &&
                              "border-green-500 bg-green-50/50"
                          )}
                          value={formData.genero || ""}
                          onChange={(e) => {
                            handleFieldChange("genero", e.target.value);
                          }}
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                          <option value="O">Outro</option>
                        </select>
                      </div>
                      {errors.genero && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <TriangleAlert className="w-4 h-4" /> {errors.genero}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* CPF e Faixa Salarial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="cpf"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        CPF <span className="text-red-500">*</span>
                        {readOnlyFields.has("cpf") && (
                          <span className="text-xs text-gray-500 ml-1">
                            (vindos do cadastro)
                          </span>
                        )}
                      </Label>

                      {renderFieldWithState(
                        "cpf",
                        <InputMask
                          mask="999.999.999-99"
                          id="cpf"
                          value={formData.cpf || ""}
                          onChange={(e) =>
                            handleFieldChange("cpf", e.target.value)
                          }
                          placeholder="000.000.000-00"
                          className={cn(
                            "flex h-12 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200",
                            "mt-2",
                            fieldStates.cpf === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.cpf === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500",
                            readOnlyFields.has("cpf") &&
                              "bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400"
                          )}
                          readOnly={readOnlyFields.has("cpf")}
                          aria-label="Campo obrigatório para CPF"
                          aria-describedby={
                            errors.cpf ? "cpf-error" : undefined
                          }
                          aria-invalid={!!errors.cpf}
                          autoComplete="off"
                          inputMode="numeric"
                          required
                        />
                      )}

                      {errors.cpf && (
                        <motion.p
                          id="cpf-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.cpf}
                        </motion.p>
                      )}
                    </div>

                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="faixaSalarial"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Qual sua faixa salarial?{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {renderFieldWithState(
                        "faixaSalarial",
                        <Select
                          value={formData.faixaSalarial}
                          onValueChange={(value) =>
                            handleFieldChange("faixaSalarial", value)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                              fieldStates.faixaSalarial === "valid" &&
                                "border-green-500 bg-green-50/50",
                              fieldStates.faixaSalarial === "invalid" &&
                                "border-red-500 focus:ring-red-500 focus:border-red-500"
                            )}
                          >
                            <SelectValue placeholder="Selecione sua faixa salarial" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ate-1-salario">
                              Até 1 salário mínimo
                            </SelectItem>
                            <SelectItem value="1-a-2-salarios">
                              1 a 2 salários mínimos
                            </SelectItem>
                            <SelectItem value="2-a-3-salarios">
                              2 a 3 salários mínimos
                            </SelectItem>
                            <SelectItem value="3-a-5-salarios">
                              3 a 5 salários mínimos
                            </SelectItem>
                            <SelectItem value="5-a-10-salarios">
                              5 a 10 salários mínimos
                            </SelectItem>
                            <SelectItem value="acima-10-salarios">
                              Acima de 10 salários mínimos
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {errors.faixaSalarial && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.faixaSalarial}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  {/* Email */}
                  <div className="mb-6">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email <span className="text-red-500">*</span>
                      {readOnlyFields.has("email") && (
                        <span className="text-xs text-gray-500 ml-1">
                          (vindos do cadastro)
                        </span>
                      )}
                    </Label>

                    {renderFieldWithState(
                      "email",
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                        placeholder="seu.email@exemplo.com"
                        className={cn(
                          "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                          fieldStates.email === "valid" &&
                            "border-green-500 bg-green-50/50",
                          fieldStates.email === "invalid" &&
                            "border-red-500 focus:ring-red-500 focus:border-red-500",
                          readOnlyFields.has("email") &&
                            "bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400"
                        )}
                        readOnly={readOnlyFields.has("email")}
                        aria-label="Campo obrigatório para email"
                        aria-describedby={
                          errors.email ? "email-error" : undefined
                        }
                        aria-invalid={!!errors.email}
                        autoComplete="email"
                        required
                      />
                    )}

                    {errors.email && (
                      <motion.p
                        id="email-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                        role="alert"
                      >
                        <TriangleAlert className="w-4 h-4" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>{" "}
                </div>
              </motion.div>

              {/* Endereço section */}
              <motion.div
                className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 sm:p-8 border border-green-100/50 dark:border-gray-600/30 backdrop-blur-sm relative overflow-hidden mb-8"
                variants={sectionVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/30 to-transparent rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <motion.h2
                    className="text-2xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {isSectionComplete(2) ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <MapPin className="w-6 h-6 text-white" />
                      )}
                    </motion.div>
                    <div>
                      <span>Endereço</span>
                      {isSectionComplete(2) && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="block text-sm font-normal text-green-600 dark:text-green-400"
                        >
                          ✓ Seção completa
                        </motion.span>
                      )}
                    </div>
                  </motion.h2>

                  {/* CEP e Número */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="cep"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        CEP <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        {renderFieldWithState(
                          "cep",
                          <InputMask
                            mask="99999-999"
                            id="cep"
                            value={formData.cep}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleFieldChange("cep", value);
                              const cleanCep = value.replace(/\D/g, "");
                              if (cleanCep.length === 8) {
                                fetchAddressByCep(value);
                              }
                            }}
                            placeholder="00000-000"
                            className={cn(
                              "flex h-12 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200",
                              "mt-2",
                              fieldStates.cep === "valid" &&
                                "border-green-500 bg-green-50/50",
                              fieldStates.cep === "invalid" &&
                                "border-red-500 focus:ring-red-500 focus:border-red-500",
                              isLoading.cep && "pr-10"
                            )}
                            aria-label="Campo obrigatório para CEP"
                            aria-describedby={
                              errors.cep ? "cep-error" : undefined
                            }
                            aria-invalid={!!errors.cep}
                            autoComplete="postal-code"
                            inputMode="numeric"
                            required
                          />
                        )}
                        {isLoading.cep && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                      {errors.cep && (
                        <motion.p
                          id="cep-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.cep}
                        </motion.p>
                      )}
                    </div>

                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="numero"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Número <span className="text-red-500">*</span>
                      </Label>

                      {renderFieldWithState(
                        "numero",
                        <Input
                          id="numero"
                          type="text"
                          value={formData.numero}
                          onChange={(e) =>
                            handleFieldChange("numero", e.target.value)
                          }
                          placeholder="123"
                          className={cn(
                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                            fieldStates.numero === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.numero === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-label="Campo obrigatório para número do endereço"
                          aria-describedby={
                            errors.numero ? "numero-error" : undefined
                          }
                          aria-invalid={!!errors.numero}
                          autoComplete="address-line2"
                          inputMode="numeric"
                          required
                        />
                      )}

                      {errors.numero && (
                        <motion.p
                          id="numero-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.numero}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Logradouro e Complemento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    <div className="lg:col-span-8">
                      <Label
                        htmlFor="logradouro"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Logradouro <span className="text-red-500">*</span>
                        {fieldStates.logradouro === "valid" && (
                          <span className="text-xs text-green-600 ml-1">
                            (preenchido automaticamente)
                          </span>
                        )}
                      </Label>

                      {renderFieldWithState(
                        "logradouro",
                        <Input
                          id="logradouro"
                          type="text"
                          value={formData.logradouro}
                          onChange={(e) =>
                            handleFieldChange("logradouro", e.target.value)
                          }
                          placeholder="Rua, Avenida, etc."
                          className={cn(
                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                            fieldStates.logradouro === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.logradouro === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-label="Campo obrigatório para logradouro"
                          aria-describedby={
                            errors.logradouro ? "logradouro-error" : undefined
                          }
                          aria-invalid={!!errors.logradouro}
                          autoComplete="address-line1"
                          required
                        />
                      )}

                      {errors.logradouro && (
                        <motion.p
                          id="logradouro-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.logradouro}
                        </motion.p>
                      )}
                    </div>

                    <div className="lg:col-span-4">
                      <Label
                        htmlFor="complemento"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Complemento
                      </Label>

                      <Input
                        id="complemento"
                        type="text"
                        value={formData.complemento}
                        onChange={(e) =>
                          handleFieldChange("complemento", e.target.value)
                        }
                        placeholder="Apto, Casa, etc."
                        className="mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label="Campo opcional para complemento do endereço"
                        autoComplete="address-line3"
                      />
                    </div>
                  </div>

                  {/* Bairro, Cidade e Estado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    <div className="lg:col-span-4">
                      <Label
                        htmlFor="bairro"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Bairro <span className="text-red-500">*</span>
                        {fieldStates.bairro === "valid" && (
                          <span className="text-xs text-green-600 ml-1">
                            (preenchido automaticamente)
                          </span>
                        )}
                      </Label>

                      {renderFieldWithState(
                        "bairro",
                        <Input
                          id="bairro"
                          type="text"
                          value={formData.bairro}
                          onChange={(e) =>
                            handleFieldChange("bairro", e.target.value)
                          }
                          placeholder="Centro, Vila Nova, etc."
                          className={cn(
                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                            fieldStates.bairro === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.bairro === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-label="Campo obrigatório para bairro"
                          aria-describedby={
                            errors.bairro ? "bairro-error" : undefined
                          }
                          aria-invalid={!!errors.bairro}
                          autoComplete="address-level2"
                          required
                        />
                      )}

                      {errors.bairro && (
                        <motion.p
                          id="bairro-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.bairro}
                        </motion.p>
                      )}
                    </div>

                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="cidade"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Cidade <span className="text-red-500">*</span>
                        {fieldStates.cidade === "valid" && (
                          <span className="text-xs text-green-600 ml-1">
                            (preenchido automaticamente)
                          </span>
                        )}
                      </Label>

                      {renderFieldWithState(
                        "cidade",
                        <Input
                          id="cidade"
                          type="text"
                          value={formData.cidade}
                          onChange={(e) =>
                            handleFieldChange("cidade", e.target.value)
                          }
                          placeholder="São Paulo, Rio de Janeiro, etc."
                          className={cn(
                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                            fieldStates.cidade === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.cidade === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-label="Campo obrigatório para cidade"
                          aria-describedby={
                            errors.cidade ? "cidade-error" : undefined
                          }
                          aria-invalid={!!errors.cidade}
                          autoComplete="address-level2"
                          required
                        />
                      )}

                      {errors.cidade && (
                        <motion.p
                          id="cidade-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.cidade}
                        </motion.p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <Label
                        htmlFor="estado"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Estado <span className="text-red-500">*</span>
                        {fieldStates.estado === "valid" && (
                          <span className="text-xs text-green-600 ml-1">
                            (auto)
                          </span>
                        )}
                      </Label>

                      {renderFieldWithState(
                        "estado",
                        <Input
                          id="estado"
                          type="text"
                          value={formData.estado}
                          onChange={(e) =>
                            handleFieldChange(
                              "estado",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="SP"
                          maxLength={2}
                          className={cn(
                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase",
                            fieldStates.estado === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.estado === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-label="Campo obrigatório para estado"
                          aria-describedby={
                            errors.estado ? "estado-error" : undefined
                          }
                          aria-invalid={!!errors.estado}
                          autoComplete="address-level1"
                          required
                        />
                      )}

                      {errors.estado && (
                        <motion.p
                          id="estado-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.estado}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dados Profissionais section */}
              <motion.div
                className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 sm:p-8 border border-purple-100/50 dark:border-gray-600/30 backdrop-blur-sm relative overflow-hidden mb-8"
                variants={sectionVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <motion.h2
                    className="text-2xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {isSectionComplete(3) ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <GraduationCap className="w-6 h-6 text-white" />
                      )}
                    </motion.div>
                    <div>
                      <span>Dados Profissionais</span>
                      {isSectionComplete(3) && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="block text-sm font-normal text-green-600 dark:text-green-400"
                        >
                          ✓ Seção completa
                        </motion.span>
                      )}
                    </div>
                  </motion.h2>

                  {/* Função e Profissão */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="funcao"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Função <span className="text-red-500">*</span>
                      </Label>
                      {renderFieldWithState(
                        "funcao",
                        <Select
                          value={formData.funcao}
                          onValueChange={(value) =>
                            handleFieldChange("funcao", value)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                              fieldStates.funcao === "valid" &&
                                "border-green-500 bg-green-50/50",
                              fieldStates.funcao === "invalid" &&
                                "border-red-500 focus:ring-red-500 focus:border-red-500"
                            )}
                          >
                            <SelectValue placeholder="Selecione a função de voluntário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="JURIDICA">Jurídica</SelectItem>
                            <SelectItem value="PSICOLOGIA">
                              Psicologia
                            </SelectItem>
                            <SelectItem value="PSICOPEDAGOGIA">
                              Psicopedagogia
                            </SelectItem>
                            <SelectItem value="ASSISTENCIA_SOCIAL">
                              Assistência Social
                            </SelectItem>
                            <SelectItem value="CONTABIL">Contábil</SelectItem>
                            <SelectItem value="FINANCEIRA">
                              Financeira
                            </SelectItem>
                            <SelectItem value="PEDIATRIA">Pediatria</SelectItem>
                            <SelectItem value="FISIOTERAPIA">
                              Fisioterapia
                            </SelectItem>
                            <SelectItem value="QUIROPRAXIA">
                              Quiropraxia
                            </SelectItem>
                            <SelectItem value="NUTRICAO">Nutrição</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {errors.funcao && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.funcao}
                        </motion.p>
                      )}
                    </div>

                    <div className="lg:col-span-6">
                      <Label
                        htmlFor="profissao"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Profissão <span className="text-red-500">*</span>
                      </Label>

                      {renderFieldWithState(
                        "profissao",
                        <Input
                          id="profissao"
                          type="text"
                          value={formData.profissao}
                          onChange={(e) =>
                            handleFieldChange("profissao", e.target.value)
                          }
                          placeholder="Ex: Psicóloga Clínica"
                          className={cn(
                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                            fieldStates.profissao === "valid" &&
                              "border-green-500 bg-green-50/50",
                            fieldStates.profissao === "invalid" &&
                              "border-red-500 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-label="Campo obrigatório para profissão"
                          aria-describedby={
                            errors.profissao ? "profissao-error" : undefined
                          }
                          aria-invalid={!!errors.profissao}
                          autoComplete="organization-title"
                          required
                        />
                      )}

                      {errors.profissao && (
                        <motion.p
                          id="profissao-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                          role="alert"
                        >
                          <TriangleAlert className="w-4 h-4" />
                          {errors.profissao}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* CRM */}
                  <div className="mb-6">
                    <Label
                      htmlFor="crm"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      CRM/Registro Profissional (opcional)
                    </Label>

                    {renderFieldWithState(
                      "crm",
                      <Input
                        id="crm"
                        type="text"
                        value={formData.crm}
                        onChange={(e) =>
                          handleFieldChange("crm", e.target.value)
                        }
                        placeholder="Ex: 123456/SP"
                        className="mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label="Campo opcional para registro profissional"
                        autoComplete="off"
                      />
                    )}

                    {errors.crm && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                        role="alert"
                      >
                        <TriangleAlert className="w-4 h-4" />
                        {errors.crm}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  <motion.span
                    className="flex items-center gap-2"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando cadastro...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Completar Cadastro de Voluntário
                      </>
                    )}
                  </motion.span>
                </Button>{" "}
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 max-w-4xl mx-auto">
          <motion.div
            className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            {" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              <Heart className="w-4 h-4 text-red-500" />
            </motion.span>
            © 2025 Projeto Mãos Amigas - Ajudando a construir um futuro melhor
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-4 h-4 text-yellow-500" />
            </motion.span>
          </motion.div>{" "}
        </div>
      </motion.div>
    </div>
  );
}
