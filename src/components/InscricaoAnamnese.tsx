import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    MapPin,
    GraduationCap,
    Phone,
    Mail,
    Calendar,
    Building,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Trash2,
    Send,
    Loader2,
    FileText,
    Heart,
    Star,
    TriangleAlert,
    X,
    UserCheck,
    Save,
    Smartphone,
    Clock,
    Check
} from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';

export function InscricaoAnamnese() {
    const [formData, setFormData] = useState({
        nomeCompleto: "",
        telefone: "",
        dataNascimento: "",
        email: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        areaOrientacao: "",
        profissao: "",
        comoSoube: "",
        sugestaoOutraArea: "",
        genero: "", 
        isVoluntario: false,
    });

    // State for error feedback when submitting
    const [submitError, setSubmitError] = useState<string | null>(null);

    // New state to store user ID from first phase
    const [userId, setUserId] = useState<number | null>(null);

    // Estado para controle dos dados da primeira fase
    const [primeiraFaseData, setPrimeiraFaseData] = useState<any>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [completedFields, setCompletedFields] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [fieldStates, setFieldStates] = useState<Record<string, 'valid' | 'invalid' | 'default'>>({});
    const [isLoading, setIsLoading] = useState({ cep: false });
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [profissionSuggestions, setProfissionSuggestions] = useState<string[]>([]);
    const [showProfessionSuggestions, setShowProfessionSuggestions] = useState(false);
    const profissionInputRef = useRef<HTMLInputElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    // Extract idUsuario from URL (move this to top, only declare once)
    const searchParams = new URLSearchParams(location.search);
    const idUsuario = searchParams.get('id');
    // States for user fetch loading/error
    const [fetchingUser, setFetchingUser] = useState(false);
    const [fetchUserError, setFetchUserError] = useState<string | null>(null);

    // Lista de profissões comuns
    const commonProfessions = [
        "Advogado", "Médico", "Enfermeiro", "Professor", "Engenheiro", "Contador",
        "Administrador", "Psicólogo", "Dentista", "Fisioterapeuta", "Arquiteto",
        "Designer", "Programador", "Jornalista", "Farmacêutico", "Veterinário",
        "Nutricionista", "Biomédico", "Terapeuta Ocupacional", "Fonoaudiólogo",
        "Assistente Social", "Pedagogo", "Economista", "Publicitário", "Chef",
        "Corretor de Imóveis", "Vendedor", "Consultor", "Analista", "Técnico"
    ];

    const [errors, setErrors] = useState({
        nomeCompleto: "",
        telefone: "",
        dataNascimento: "",
        email: "",
        cep: "",
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        areaOrientacao: "",
        profissao: "",
        comoSoube: "",
        genero: "", // Erro para o novo campo de gênero
        isVoluntario: "", // Erro para o campo "É voluntário?"
    });

    // Carregar dados salvos ao montar o componente
    useEffect(() => {
        const savedData = localStorage.getItem('inscricao_form_data');
        const savedTimestamp = localStorage.getItem('inscricao_form_timestamp');

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setFormData(parsedData);
                if (savedTimestamp) {
                    setLastSaved(new Date(savedTimestamp));
                }
            } catch (error) {
                console.error('Erro ao carregar dados salvos:', error);
            }
        }
    }, []);

    // Auto-salvar dados no localStorage
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (Object.values(formData).some(value => typeof value === 'string' ? value.trim() !== '' : value !== undefined)) {
                localStorage.setItem('inscricao_form_data', JSON.stringify(formData));
                localStorage.setItem('inscricao_form_timestamp', new Date().toISOString());
                setLastSaved(new Date());
            }
        }, 1000); // Salva 1 segundo após a última mudança

        return () => clearTimeout(timeoutId);
    }, [formData]);

    // Filtrar sugestões de profissão
    const filterProfessionSuggestions = (value: string) => {
        if (value.length < 2) {
            setProfissionSuggestions([]);
            setShowProfessionSuggestions(false);
            return;
        }

        const filtered = commonProfessions.filter(profession =>
            profession.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);

        setProfissionSuggestions(filtered);
        setShowProfessionSuggestions(filtered.length > 0);
    };

    // Validação em tempo real
    const validateField = (fieldName: string, value: string) => {
        let isValid = true;
        let errorMessage = "";

        switch (fieldName) {
            case 'nomeCompleto':
                if (!value.trim()) {
                    errorMessage = "Nome é obrigatório";
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = "Nome deve ter no mínimo 3 caracteres";
                    isValid = false;
                } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
                    errorMessage = "Nome deve conter apenas letras";
                    isValid = false;
                }
                break; case 'telefone': {
                    const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
                    if (!value) {
                        errorMessage = "Telefone é obrigatório";
                        isValid = false;
                    } else if (!phoneRegex.test(value)) {
                        errorMessage = "Telefone inválido";
                        isValid = false;
                    }
                    break;
                } case 'email': {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!value) {
                        errorMessage = "Email é obrigatório";
                        isValid = false;
                    } else if (!emailRegex.test(value)) {
                        errorMessage = "Email inválido";
                        isValid = false;
                    }
                    break;
                }

            case 'dataNascimento':
                if (!value) {
                    errorMessage = "Data de nascimento é obrigatória";
                    isValid = false;
                } else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();

                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }

                    if (birthDate > today) {
                        errorMessage = "Data não pode ser futura";
                        isValid = false;
                    } else if (age < 16 || age > 120) {
                        errorMessage = "Idade deve estar entre 16 e 120 anos";
                        isValid = false;
                    }
                }
                break; case 'cep': {
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

            // Validação para o novo campo de gênero
            case 'genero':
                if (!value) {
                    errorMessage = "Gênero é obrigatório";
                    isValid = false;
                }
                break;

            // Validação para o campo "É voluntário?"
            case 'isVoluntario':
                if (value === "") {
                    errorMessage = "Campo obrigatório";
                    isValid = false;
                }
                break;

            default:
                if (!value.trim() && ['profissao', 'logradouro', 'numero', 'bairro', 'cidade', 'estado', 'areaOrientacao', 'comoSoube'].includes(fieldName)) {
                    errorMessage = "Campo obrigatório";
                    isValid = false;
                }
        }

        setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
        setFieldStates(prev => ({
            ...prev,
            [fieldName]: value ? (isValid ? 'valid' : 'invalid') : 'default'
        }));

        return isValid;
    };

    // Handler para mudanças nos campos com validação em tempo real
    const handleFieldChange = (fieldName: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));

        // Debounce validation
        setTimeout(() => {
            if (typeof value === 'string') {
                validateField(fieldName, value);
            } else {
                // Para booleanos, só valida se for obrigatório
                setErrors(prev => ({ ...prev, [fieldName]: value === false ? 'Campo obrigatório' : '' }));
                setFieldStates(prev => ({ ...prev, [fieldName]: value !== undefined ? 'valid' : 'default' }));
            }
        }, 300);

        // Filtrar profissões se for o campo profissão
        if (fieldName === 'profissao' && typeof value === 'string') {
            filterProfessionSuggestions(value);
        }
    };

    // Detecção de telefone móvel mais inteligente
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return "(99) 9999-9999"; // Telefone fixo
        } else {
            return "(99) 99999-9999"; // Celular
        }
    };

    const fetchAddressByCep = async (cep: string) => {
        try {
            setIsLoading(prev => ({ ...prev, cep: true }));
            const cleanCep = cep.replace(/\D/g, '');

            if (cleanCep.length === 8) {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        logradouro: data.logradouro || "",
                        bairro: data.bairro || "",
                        cidade: data.localidade || "",
                        estado: data.uf || "",
                    }));

                    // Limpar erros de endereço e marcar como válidos
                    setErrors(prev => ({
                        ...prev,
                        logradouro: "",
                        bairro: "",
                        cidade: "",
                        estado: "",
                    }));

                    setFieldStates(prev => ({
                        ...prev,
                        logradouro: data.logradouro ? 'valid' : 'default',
                        bairro: data.bairro ? 'valid' : 'default',
                        cidade: data.localidade ? 'valid' : 'default',
                        estado: data.uf ? 'valid' : 'default',
                    }));
                } else {
                    setErrors(prev => ({ ...prev, cep: "CEP não encontrado" }));
                    setFieldStates(prev => ({ ...prev, cep: 'invalid' }));
                }
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP" }));
            setFieldStates(prev => ({ ...prev, cep: 'invalid' }));
        } finally {
            setIsLoading(prev => ({ ...prev, cep: false }));
        }
    };

    // Calcular progresso do formulário
    const calculateProgress = () => {
        const totalFields = Object.keys(formData).length - 1;
        const filledFields = Object.entries(formData).filter(([key, value]) =>
            key !== 'sugestaoOutraArea' && key !== 'complemento' && (typeof value === 'string' ? value.trim() !== '' : value !== undefined)
        ).length;
        return Math.round((filledFields / totalFields) * 100);
    };

    // Verificar se seção está completa
    const isSectionComplete = (section: number) => {
        switch (section) {
            case 1:
                return formData.nomeCompleto && formData.telefone && formData.dataNascimento &&
                    formData.email && formData.profissao &&
                    !errors.nomeCompleto && !errors.telefone && !errors.dataNascimento &&
                    !errors.email && !errors.profissao;
            case 2:
                return formData.cep && formData.logradouro && formData.numero &&
                    formData.bairro && formData.cidade && formData.estado &&
                    !errors.cep && !errors.logradouro && !errors.numero &&
                    !errors.bairro && !errors.cidade && !errors.estado;
            case 3:
                return formData.areaOrientacao && formData.comoSoube &&
                    !errors.areaOrientacao && !errors.comoSoube;
            default:
                return false;
        }
    };

    // Variantes de animação
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4 }
        }
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleFieldChange('cep', value);

        const cleanCep = value.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            fetchAddressByCep(value);
        }
    };

    const validateForm = () => {
        let isValid = true;
        const fields = Object.keys(formData).filter(key =>
            key !== 'sugestaoOutraArea' && key !== 'complemento'
        );

        fields.forEach(field => {
            const value = formData[field as keyof typeof formData];
            if (typeof value === 'string') {
                const fieldIsValid = validateField(field, value);
                if (!fieldIsValid) isValid = false;
            } else if (typeof value === 'boolean') {
                // Para campos booleanos obrigatórios
                if (value === undefined || value === null) {
                    setErrors(prev => ({ ...prev, [field]: 'Campo obrigatório' }));
                    setFieldStates(prev => ({ ...prev, [field]: 'invalid' }));
                    isValid = false;
                } else {
                    setErrors(prev => ({ ...prev, [field]: '' }));
                    setFieldStates(prev => ({ ...prev, [field]: 'valid' }));
                }
            }
        });

        return isValid;
    };

    // Fetch user data for prefill (GET /usuarios/fase1/{idUsuario})
    useEffect(() => {
        if (!idUsuario) return;
        setFetchingUser(true);
        setFetchUserError(null);
        fetch(`http://localhost:8080/usuarios/fase1/${idUsuario}`)
            .then(async (res) => {
                if (!res.ok) throw new Error('Erro ao buscar dados do usuário.');
                const data = await res.json();
                // Preencher nomeCompleto, email e dataNascimento se existirem na resposta
                setFormData((prev) => ({
                    ...prev,
                    nomeCompleto: data.nome || prev.nomeCompleto,
                    email: data.email || prev.email,
                    dataNascimento: data.dataNascimento || prev.dataNascimento,
                }));
            })
            .finally(() => setFetchingUser(false));
    }, [idUsuario]);

    // Busca usuário por email se idUsuario não existir ou for 0
    useEffect(() => {
        if ((!idUsuario || idUsuario === '0') && formData.email && fieldStates.email === 'valid') {
            setFetchingUser(true);
            // Não mostra erro, apenas tenta preencher se encontrar
            fetch(`http://localhost:8080/usuarios/fase1?email=${encodeURIComponent(formData.email)}`)
                .then(async (res) => {
                    if (!res.ok) throw new Error('Usuário não encontrado com este email.');
                    const data = await res.json();
                    setFormData((prev) => ({
                        ...prev,
                        nomeCompleto: data.nome || prev.nomeCompleto,
                        email: data.email || prev.email,
                        dataNascimento: data.dataNascimento || prev.dataNascimento,
                    }));
                })
                .finally(() => setFetchingUser(false));
        }
    }, [formData.email, idUsuario, fieldStates.email]);

    // Atualize o handleSubmit para permitir envio mesmo sem idUsuario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (formData.genero === "") {
                setErrors(prev => ({ ...prev, genero: "Selecione um gênero válido." }));
                setIsSubmitting(false);
                return;
            }
            // Não bloqueia mais se não houver idUsuario
            if (validateForm()) {
                // PATCH /usuarios/fase2/{idUsuario} se houver id, senão apenas PATCH /usuarios/fase2
                const payload = {
                    ...formData,
                    isVoluntario: false
                };
                let url = 'http://localhost:8080/usuarios/fase2';
                if (idUsuario) {
                    url += `/${idUsuario}`;
                }
                const response = await fetch(url, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error('Erro ao completar cadastro');
                }
                // Success: clear local storage and show modal
                localStorage.removeItem('inscricao_form_data');
                localStorage.removeItem('inscricao_form_timestamp');
                // Redireciona para /login após sucesso
                navigate('/login');
                return;
            } else {
                console.log('Formulário com erros:', errors);
            }
        } catch (error: any) {
            setSubmitError(error.message || 'Erro ao enviar inscrição.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Componente para renderizar campo com estado visual
    const renderFieldWithState = (fieldName: string, children: React.ReactNode) => {
        const state = fieldStates[fieldName] || 'default';
        return (
            <div className="relative">
                {children}
                {state === 'valid' && (
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
                                    transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 300 }}
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
                                    Inscrição Realizada com Sucesso!
                                </motion.h3>

                                <motion.div
                                    className="space-y-3 mb-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Obrigado por se inscrever no projeto <span className="font-semibold text-indigo-600 dark:text-indigo-400">Mãos Amigas</span>.
                                    </p>

                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                                        <div className="flex items-center gap-3 mb-2">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                            >
                                                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </motion.div>
                                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                                Próximos Passos
                                            </span>
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Uma <strong>assistente social</strong> entrará em contato com você em breve para agendar sua orientação na área selecionada.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Action Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        onClick={closeSuccessModal}
                                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <motion.span
                                            className="flex items-center gap-2"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <Heart className="w-4 h-4" />
                                            Entendi, obrigado!
                                        </motion.span>
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Decorative Elements */}
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
                {/* Progress Bar */}
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
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-sm"
                                initial={{ width: 0 }}
                                animate={{ width: `${calculateProgress()}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Header Section */}
                <motion.div
                    className="text-center mb-12"
                    variants={sectionVariants}
                >
                    <div className="flex items-center justify-center gap-6 mb-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <img src="image/LogoIMA.png" alt="Logo Mãos Amigas" className="h-24 w-auto drop-shadow-2xl" />
                        </motion.div>
                        <div className="text-left">
                            <motion.h1
                                className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400 mb-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Inscrição de Atendimento
                            </motion.h1>
                            <motion.p
                                className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Sparkles className="w-5 h-5" />
                                Mãos Amigas
                            </motion.p>
                        </div>
                    </div>
                    <motion.p
                        className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Preencha o formulário abaixo para se inscrever e receber orientação especializada em diversas áreas.
                        Nossa equipe está pronta para ajudá-lo em sua jornada.                    </motion.p>
                </motion.div>

                {/* Form Container */}
                <motion.div
                    className="max-w-4xl mx-auto"
                    variants={sectionVariants}
                >
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
                        <div className="p-4 sm:p-8 lg:p-12">
                            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">
                                {/* Dados Pessoais */}
                                <motion.div
                                    className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 sm:p-8 border border-blue-100/50 dark:border-gray-600/30 backdrop-blur-sm relative overflow-hidden"
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
                                                    <motion.div
                                                        className="text-sm text-green-600 dark:text-green-400 font-normal"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                    >
                                                        ✓ Seção completa
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.h2>

                                        {/* Nome, Telefone, Data de Nascimento */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                                            <div className="sm:col-span-2 lg:col-span-6">
                                                <Label htmlFor="nomeCompleto" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Nome Completo <span className="text-red-500">*</span>
                                                </Label>
                                                {renderFieldWithState('nomeCompleto',
                                                    <Input
                                                        id="nomeCompleto"
                                                        value={formData.nomeCompleto}
                                                        onChange={(e) => handleFieldChange('nomeCompleto', e.target.value)}
                                                        placeholder="Digite seu nome completo"
                                                        className={cn(
                                                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                            fieldStates.nomeCompleto === 'valid' && "border-green-500 bg-green-50/50",
                                                            fieldStates.nomeCompleto === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        )}
                                                        required
                                                    />
                                                )}
                                                {errors.nomeCompleto && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.nomeCompleto}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div className="lg:col-span-3">
                                                <Label htmlFor="telefone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Telefone <span className="text-red-500">*</span>
                                                </Label>
                                                {renderFieldWithState('telefone',
                                                    <InputMask
                                                        mask={formatPhoneNumber(formData.telefone)}
                                                        id="telefone"
                                                        value={formData.telefone}
                                                        onChange={(e) => handleFieldChange('telefone', e.target.value)}
                                                        placeholder="(11) 98765-4321"
                                                        className={cn(
                                                            "flex h-12 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200",
                                                            "mt-2",
                                                            fieldStates.telefone === 'valid' && "border-green-500 bg-green-50/50",
                                                            fieldStates.telefone === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        )}
                                                        required
                                                    />
                                                )}
                                                {errors.telefone && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.telefone}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div className="lg:col-span-3">
                                                <Label htmlFor="dataNascimento" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Data de Nascimento <span className="text-red-500">*</span>
                                                </Label>
                                                {renderFieldWithState('dataNascimento',
                                                    <Input
                                                        id="dataNascimento"
                                                        type="date"
                                                        value={formData.dataNascimento}
                                                        onChange={(e) => handleFieldChange('dataNascimento', e.target.value)}
                                                        className={cn(
                                                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                            fieldStates.dataNascimento === 'valid' && "border-green-500 bg-green-50/50",
                                                            fieldStates.dataNascimento === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        )}
                                                        required
                                                    />
                                                )}
                                                {errors.dataNascimento && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.dataNascimento}
                                                    </motion.p>
                                                )}
                                            </div>

                                            {/* Novo campo para selecionar o gênero */}
                                            <div className="mb-4 lg:w-1/2 min-w-[180px]">
                                              <Label htmlFor="genero" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Gênero <span className="text-red-500">*</span>
                                              </Label>
                                              <div className="relative">
                                                <select
                                                  id="genero"
                                                  name="genero"
                                                  className={cn(
                                                    "w-full h-12 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-all duration-200 shadow-sm text-base pr-10 appearance-auto",
                                                    fieldStates.genero === 'invalid' && "border-red-500 focus:ring-red-500",
                                                    fieldStates.genero === 'valid' && "border-green-500 bg-green-50/50"
                                                  )}
                                                  value={formData.genero || ''}
                                                  onChange={e => {
                                                    handleFieldChange('genero', e.target.value);
                                                  }}
                                                  required
                                                >
                                                  <option value="">Selecione...</option>
                                                  <option value="M">Masculino</option>
                                                  <option value="F">Feminino</option>
                                                  <option value="OUTRO">Outro</option>
                                                </select>
                                                {/* Setinha padrão do select mantida (appearance-auto) */}
                                                {/* Ícone customizado pode ser adicionado aqui se quiser uma seta personalizada */}
                                              </div>
                                              {errors.genero && (
                                                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                                  <TriangleAlert className="w-4 h-4" /> {errors.genero}
                                                </p>
                                              )}
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="mb-6">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Email <span className="text-red-500">*</span>
                                            </Label>
                                            {renderFieldWithState('email',
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    inputMode="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                                    placeholder="seu.email@exemplo.com"
                                                    className={cn(
                                                        "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                        fieldStates.email === 'valid' && "border-green-500 bg-green-50/50",
                                                        fieldStates.email === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                    )}
                                                    required
                                                />
                                            )}
                                            {errors.email && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                >
                                                    <TriangleAlert className="w-4 h-4" />
                                                    {errors.email}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Profissão com autocomplete */}
                                        <div className="relative">
                                            <Label htmlFor="profissao" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Profissão <span className="text-red-500">*</span>
                                            </Label>
                                            {renderFieldWithState('profissao',
                                                <Input
                                                    ref={profissionInputRef}
                                                    id="profissao"
                                                    value={formData.profissao}
                                                    onChange={(e) => handleFieldChange('profissao', e.target.value)}
                                                    placeholder="Digite sua profissão..."
                                                    className={cn(
                                                        "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                        fieldStates.profissao === 'valid' && "border-green-500 bg-green-50/50",
                                                        fieldStates.profissao === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                    )}
                                                    autoComplete="off"
                                                    required
                                                />
                                            )}

                                            {/* Suggestions dropdown */}
                                            <AnimatePresence>
                                                {showProfessionSuggestions && profissionSuggestions.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                                    >
                                                        {profissionSuggestions.map((profession, index) => (
                                                            <motion.button
                                                                key={profession}
                                                                type="button"
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                onClick={() => {
                                                                    handleFieldChange('profissao', profession);
                                                                    setShowProfessionSuggestions(false);
                                                                }}
                                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                                                            >
                                                                {profession}
                                                            </motion.button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>                                        {errors.profissao && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                >
                                                    <TriangleAlert className="w-4 h-4" />
                                                    {errors.profissao}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Endereço section with improved CEP loading */}
                                <motion.div
                                    className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 sm:p-8 border border-green-100/50 dark:border-gray-600/30 backdrop-blur-sm relative overflow-hidden"
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
                                                    <motion.div
                                                        className="text-sm text-green-600 dark:text-green-400 font-normal"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                    >
                                                        ✓ Seção completa
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.h2>

                                        {/* CEP, Logradouro, Número */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                                            <div className="lg:col-span-3">
                                                <Label htmlFor="cep" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    CEP <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    {renderFieldWithState('cep',
                                                        <InputMask
                                                            mask="99999-999"
                                                            id="cep"
                                                            value={formData.cep}
                                                            onChange={handleCepChange}
                                                            placeholder="00000-000"
                                                            className={cn(
                                                                "flex h-12 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200",
                                                                "mt-2",
                                                                fieldStates.cep === 'valid' && "border-green-500 bg-green-50/50",
                                                                fieldStates.cep === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                            )}
                                                            required
                                                        />
                                                    )}
                                                    {isLoading.cep && (
                                                        <div className="absolute right-3 top-[50%] transform -translate-y-1/2">
                                                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                {errors.cep && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.cep}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div className="lg:col-span-6">
                                                <Label htmlFor="logradouro" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Logradouro <span className="text-red-500">*</span>
                                                </Label>
                                                {renderFieldWithState('logradouro',
                                                    <Input
                                                        id="logradouro"
                                                        value={formData.logradouro}
                                                        onChange={(e) => handleFieldChange('logradouro', e.target.value)}
                                                        placeholder="Rua, Avenida, etc."
                                                        className={cn(
                                                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                            fieldStates.logradouro === 'valid' && "border-green-500 bg-green-50/50",
                                                            fieldStates.logradouro === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        )}
                                                        required
                                                    />
                                                )}
                                                {errors.logradouro && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.logradouro}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div className="lg:col-span-3">
                                                <Label htmlFor="numero" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Número <span className="text-red-500">*</span>
                                                </Label>
                                                {renderFieldWithState('numero',
                                                    <Input
                                                        id="numero"
                                                        value={formData.numero}
                                                        onChange={(e) => handleFieldChange('numero', e.target.value)}
                                                        placeholder="123"
                                                        className={cn(
                                                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                            fieldStates.numero === 'valid' && "border-green-500 bg-green-50/50",
                                                            fieldStates.numero === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        )}
                                                        required
                                                    />
                                                )}
                                                {errors.numero && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.numero}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Complemento, Bairro, Cidade, Estado */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                                            <div className="lg:col-span-3">
                                                <Label htmlFor="complemento" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Complemento
                                                </Label>
                                                <Input
                                                    id="complemento"
                                                    value={formData.complemento}
                                                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                                    placeholder="Apto, Bloco, etc."
                                                    className="mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <Label htmlFor="bairro" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Bairro <span className="text-red-500">*</span>
                                                </Label>
                                                {renderFieldWithState('bairro',
                                                    <Input
                                                        id="bairro"
                                                        value={formData.bairro}
                                                        onChange={(e) => handleFieldChange('bairro', e.target.value)}
                                                        placeholder="Centro"
                                                        className={cn(
                                                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                            fieldStates.bairro === 'valid' && "border-green-500 bg-green-50/50",
                                                            fieldStates.bairro === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        )}
                                                        required
                                                    />
                                                )}
                                                {errors.bairro && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.bairro}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div className="lg:col-span-4">
                                                <Label htmlFor="cidade" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Cidade <span className="text-red-500">*</span>
                                                </Label>
                                                {renderFieldWithState('cidade',
                                                    <Input
                                                        id="cidade"
                                                        value={formData.cidade}
                                                        onChange={(e) => handleFieldChange('cidade', e.target.value)}
                                                        placeholder="São Paulo"
                                                        className={cn(
                                                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                            fieldStates.cidade === 'valid' && "border-green-500 bg-green-50/50",
                                                            fieldStates.cidade === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        )}
                                                        required
                                                    />
                                                )}
                                                {errors.cidade && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.cidade}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div className="lg:col-span-2">
                                                <Label htmlFor="estado" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Estado <span className="text-red-500">*</span>
                                                </Label>
                                                {renderFieldWithState('estado',
                                                    <Input
                                                        id="estado"
                                                        value={formData.estado}
                                                        onChange={(e) => handleFieldChange('estado', e.target.value.toUpperCase())}
                                                        placeholder="SP"
                                                        className={cn(
                                                            "mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                                                            fieldStates.estado === 'valid' && "border-green-500 bg-green-50/50",
                                                            fieldStates.estado === 'invalid' && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                        )}
                                                        maxLength={2}
                                                        required
                                                    />
                                                )}
                                                {errors.estado && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                                    >
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.estado}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Orientação e Informações Adicionais */}
                                <motion.div
                                    className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 sm:p-8 border border-purple-100/50 dark:border-gray-600/30 backdrop-blur-sm relative overflow-hidden"
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
                                                <span>Orientação e Informações Adicionais</span>
                                                {isSectionComplete(3) && (
                                                    <motion.div
                                                        className="text-sm text-green-600 dark:text-green-400 font-normal"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                    >
                                                        ✓ Seção completa
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.h2>

                                        {/* Área de Orientação */}
                                        <div className="mb-6">
                                            <Label htmlFor="areaOrientacao" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Área que gostaria de receber orientação <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={formData.areaOrientacao}
                                                onValueChange={(value) => setFormData({ ...formData, areaOrientacao: value })}
                                            >
                                                <SelectTrigger className="w-full mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                                    <SelectValue placeholder="Selecione uma área de orientação" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    <SelectItem value="juridica">ORIENTAÇÃO JURÍDICA (CIVIL, TRABALHISTA, CRIMINAL, FAMILIAR)</SelectItem>
                                                    <SelectItem value="financeira">ORIENTAÇÃO FINANCEIRA (CONTROLE DE GASTOS, APRENDER A INVESTIR...)</SelectItem>
                                                    <SelectItem value="psicopedagogica">ORIENTAÇÃO PSICOPEDAGOGICA (DIFICULDADE EM APRENDIZAGEM NA ESCOLA)</SelectItem>
                                                    <SelectItem value="contabil">ORIENTAÇÃO CONTÁBIL (DÚVIDAS PARA FINS DE APOSENTADORIA, FISCAL, SOCIETÁRIA, ...)</SelectItem>
                                                    <SelectItem value="psicologica">ORIENTAÇÃO PSICOLÓGICA</SelectItem>
                                                    <SelectItem value="medica">ORIENTAÇÃO MÉDICA/PEDIATRICA (ATENDIMENTO AMBULATORIAL BÁSICO)</SelectItem>
                                                    <SelectItem value="mentoria">ORIENTAÇÃO E TRANSIÇÃO DE CARREIRA PROFISSIONAL - MENTORIA</SelectItem>
                                                    <SelectItem value="empresarial">ORIENTAÇÃO EMPRESARIAL</SelectItem>
                                                    <SelectItem value="curriculo">ORIENTAÇÃO NA ELABORAÇÃO DE CURRÍCULO</SelectItem>
                                                    <SelectItem value="odontologica">ORIENTAÇÃO/ AVALIAÇÃO ODONTOLÓGICA</SelectItem>
                                                    <SelectItem value="fisioterapeuta">ORIENTAÇÃO FISIOTERAPEUTA</SelectItem>
                                                    <SelectItem value="artesanato">OFICINA DE ARTESANATO</SelectItem>
                                                    <SelectItem value="veicular">ORIENTAÇÃO - DESPACHANTE VEICULAR</SelectItem>
                                                    <SelectItem value="redesSocias">ORIENTAÇÃO - REDES SOCIAIS</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.areaOrientacao && (
                                                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                                    <TriangleAlert className="w-4 h-4" />
                                                    {errors.areaOrientacao}
                                                </p>
                                            )}
                                        </div>

                                        {/* Como soube e Sugestão */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="comoSoube" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Como soube do projeto <span className="text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={formData.comoSoube}
                                                    onValueChange={(value) => setFormData({ ...formData, comoSoube: value })}
                                                >
                                                    <SelectTrigger className="w-full mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                                        <SelectValue placeholder="Selecione uma opção" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="internet">Internet</SelectItem>
                                                        <SelectItem value="redes-sociais">Redes Sociais</SelectItem>
                                                        <SelectItem value="indicacao">Indicação Amigo</SelectItem>
                                                        <SelectItem value="igreja">Igreja</SelectItem>
                                                        <SelectItem value="outros">Outros</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.comoSoube && (
                                                    <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                                        <TriangleAlert className="w-4 h-4" />
                                                        {errors.comoSoube}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="sugestaoOutraArea" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Sugestão de outra área
                                                </Label>                                            <Input
                                                    id="sugestaoOutraArea"
                                                    value={formData.sugestaoOutraArea}
                                                    onChange={(e) => setFormData({ ...formData, sugestaoOutraArea: e.target.value })}
                                                    placeholder="Sugira uma nova área de orientação (opcional)"
                                                    className="mt-2 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />                                        </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Form Actions com melhor layout para mobile */}
                                <motion.div
                                    className="border-t border-gray-200/50 dark:border-gray-600/50 pt-6 sm:pt-10 mt-6 sm:mt-10"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    localStorage.removeItem('inscricao_form_data');
                                                    localStorage.removeItem('inscricao_form_timestamp');
                                                    setFormData({
                                                        nomeCompleto: "",
                                                        telefone: "",
                                                        dataNascimento: "",
                                                        email: "",
                                                        cep: "",
                                                        logradouro: "",
                                                        numero: "",
                                                        complemento: "",
                                                        bairro: "",
                                                        cidade: "",
                                                        estado: "",
                                                        areaOrientacao: "",
                                                        profissao: "",
                                                        comoSoube: "",
                                                        sugestaoOutraArea: "",
                                                        genero: "", // Resetar o campo de gênero
                                                        isVoluntario: false, // Resetar o campo "É voluntário?"
                                                    });
                                                    setFieldStates({});
                                                    setErrors({
                                                        nomeCompleto: "",
                                                        telefone: "",
                                                        dataNascimento: "",
                                                        email: "",
                                                        cep: "",
                                                        logradouro: "",
                                                        numero: "",
                                                        bairro: "",
                                                        cidade: "",
                                                        estado: "",
                                                        areaOrientacao: "",
                                                        profissao: "",
                                                        comoSoube: "",
                                                        genero: "", // Resetar erro do campo de gênero
                                                        isVoluntario: "", // Resetar erro do campo "É voluntário?"
                                                    });
                                                    setLastSaved(null);
                                                }}
                                                className="w-full sm:w-auto px-6 sm:px-10 h-12 sm:h-14 text-base font-medium border-2 border-gray-300/70 text-gray-700 dark:text-gray-200 dark:border-gray-600/70 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-all duration-300 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl"
                                            >
                                                <motion.span
                                                    className="flex items-center gap-2"
                                                    whileHover={{ x: -2 }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Limpar Formulário
                                                </motion.span>
                                            </Button>
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto px-6 sm:px-10 h-12 sm:h-14 text-base font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform rounded-xl backdrop-blur-sm border border-white/20 relative overflow-hidden"
                                            >
                                                <AnimatePresence mode="wait">
                                                    {isSubmitting ? (
                                                        <motion.span
                                                            key="loading"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Enviando...
                                                        </motion.span>
                                                    ) : (
                                                        <motion.span
                                                            key="submit"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex items-center gap-2"
                                                            whileHover={{ x: 2 }}
                                                        >
                                                            <Send className="w-4 h-4" />
                                                            Enviar Inscrição
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </Button>
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        className="text-center mt-8"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 p-4 rounded-2xl border border-yellow-200/50 dark:border-yellow-800/30 backdrop-blur-sm">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: [0, 10, -10, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </motion.div>
                                                Os campos marcados com <span className="text-red-500 font-medium">*</span> são de preenchimento obrigatório
                                            </p>
                                        </div>
                                    </motion.div>                                </motion.div>
                            </form>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
                        <motion.p
                            className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                            >
                                <Heart className="w-4 h-4 text-red-500" />
                            </motion.div>
                            © 2025 Projeto Mãos Amigas - Ajudando a construir um futuro melhor
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <Star className="w-4 h-4 text-yellow-500" />
                            </motion.div>
                        </motion.p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}