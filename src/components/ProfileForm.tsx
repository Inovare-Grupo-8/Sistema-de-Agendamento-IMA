import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Menu, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useProfileImage } from "@/components/useProfileImage";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useTheme } from "next-themes";
import { z } from "zod";
import { STATUS_COLORS, MESSAGES } from "../constants/ui";
import { useTranslation } from "react-i18next";
import { ProfileFormSkeleton } from "./ui/custom-skeletons";
import { motion, AnimatePresence } from "framer-motion";

// Schema de validação com zod
const profileSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório."),
    sobrenome: z.string().min(1, "Sobrenome é obrigatório."),
    email: z.string().min(1, "E-mail é obrigatório.").email("E-mail inválido."),
    emailConfirm: z.string().min(1, "Confirmação de e-mail é obrigatória.").email("E-mail inválido."),
    endereco: z.string().optional(),
    telefone: z.string().min(1, "Telefone é obrigatório.").regex(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/, "Telefone inválido."),
    cidade: z.string().optional(),
    uf: z.string().optional(),
    atividade: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.string().optional(),
    cpf: z.string().optional().refine(val => !val || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), {
        message: "CPF inválido. Use o formato 000.000.000-00",
    }),
    cep: z.string().optional().refine(val => !val || /^\d{5}-\d{3}$/.test(val), {
        message: "CEP inválido. Use o formato 00000-000",
    }),
    nascimento: z.string().optional().refine(val => !val || /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
        message: "Data inválida. Use o formato dd/mm/aaaa",
    }),
}).refine((data) => data.email === data.emailConfirm, {
    message: "Os e-mails não coincidem.",
    path: ["emailConfirm"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileForm = () => {
    const { theme = "light", setTheme = () => {} } = useTheme();
    const { t } = useTranslation();

    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem("profileData");
        return savedData ? JSON.parse(savedData) : {
            nome: "Samuel",
            sobrenome: "Batista",
            email: "samuel.ima@gmail.com",
            endereco: "Rua x",
            telefone: "(11)11111-1111",
            cidade: "São Paulo",
            uf: "SP",
            atividade: "Lorem Lorem Lorem",
            profileImage: "",
            cpf: "",
            cep: "",
            nascimento: "",
        };
    });

    const { profileImage, setProfileImage } = useProfileImage();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const [bio, setBio] = useState(formData.bio || "");
    const [emailConfirm, setEmailConfirm] = useState(formData.email || "");
    const [lastUpdated, setLastUpdated] = useState(localStorage.getItem("profileLastUpdated") || "");
    const [imageLoading, setImageLoading] = useState(false);
    const [profileStatus, setProfileStatus] = useState("incompleto");
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [ufSuggestions, setUfSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const requiredFields = [
        formData.nome,
        formData.sobrenome,
        formData.email,
        formData.telefone,
        bio,
        formData.cpf,
        formData.cep,
        formData.nascimento
    ];
    const progress = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    }, []);

    useEffect(() => {
        const savedData = localStorage.getItem("profileData");
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setProfileImage(parsed.profileImage || "/image/perfilProfile.svg");
        } else {
            setProfileImage("/image/perfilProfile.svg");
        }
    }, [setProfileImage]);

    useEffect(() => {
        localStorage.setItem("profileData", JSON.stringify({ ...formData, bio }));
    }, [formData, bio]);

    useEffect(() => {
        const savedData = localStorage.getItem("profileData");
        const current = JSON.stringify({ ...formData, bio, emailConfirm });
        setHasChanged(savedData ? current !== savedData : true);
    }, [formData, bio, emailConfirm]);

    useEffect(() => {
        setBio(formData.bio || "");
        setEmailConfirm(formData.email || "");
    }, [formData]);

    useEffect(() => {
        const required = [formData.nome, formData.sobrenome, formData.email, formData.telefone, bio, formData.cpf, formData.cep, formData.nascimento];
        setProfileStatus(required.every(Boolean) ? "completo" : "incompleto");
    }, [formData, bio]);

    const validate = (data: ProfileFormData) => {
        const result = profileSchema.safeParse(data);
        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};
            result.error.errors.forEach(err => {
                if (err.path[0]) fieldErrors[err.path[0]] = err.message;
            });
            return fieldErrors;
        }
        return {};
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageLoading(true);
            const reader = new FileReader();
            reader.onload = () => {
                setFormData({ ...formData, profileImage: reader.result as string });
                setImageLoading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validate({ ...formData, emailConfirm, bio });
        setErrors(validation);
        if (Object.keys(validation).length > 0) {
            toast({
                title: t('save_error_title'),
                description: t('save_error'),
                variant: "destructive",
            });
            return;
        }
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem("profileData", JSON.stringify({ ...formData, bio }));
            setProfileImage(formData.profileImage || "/image/perfilProfile.svg");
            const now = new Date().toLocaleString();
            setLastUpdated(now);
            localStorage.setItem("profileLastUpdated", now);
            setIsSaving(false);
            setHasChanged(false);
            toast({
                title: t('profile_saved'),
                description: t('save_success'),
                variant: "default",
            });
        }, 1200);
    };

    const handleCancel = () => {
        const savedData = localStorage.getItem("profileData");
        if (savedData) {
            setFormData(JSON.parse(savedData));
            setErrors({});
            setHasChanged(false);
        }
        setShowCancelDialog(false);
    };

    const cidades = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Campinas", "Curitiba"];
    const ufs = ["SP", "RJ", "MG", "PR", "RS"];
    const handleCidadeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, cidade: e.target.value });
        setCitySuggestions(cidades.filter(c => c.toLowerCase().includes(e.target.value.toLowerCase())));
    };
    const handleUfInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, uf: e.target.value });
        setUfSuggestions(ufs.filter(u => u.toLowerCase().includes(e.target.value.toLowerCase())));
    };

    const SuggestionInput = ({
        id,
        label,
        value,
        onChange,
        suggestions,
        onSuggestionClick,
        onBlur,
        error
    }: {
        id: string;
        label: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        suggestions: string[];
        onSuggestionClick: (s: string) => void;
        onBlur: () => void;
        error?: string;
    }) => (
        <div className="space-y-2 relative">
            <Tooltip>
                <TooltipTrigger asChild>
                    <label htmlFor={id} className="block text-sm font-medium cursor-help">{label}</label>
                </TooltipTrigger>
                <TooltipContent>{`Digite seu ${label}`}</TooltipContent>
            </Tooltip>
            <Input
                id={id}
                type="text"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${error ? 'border-red-500' : ''}`}
                autoComplete="off"
                aria-autocomplete="list"
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-erro` : undefined}
            />
            {error && <span id={`${id}-erro`} className="text-red-500 text-xs" role="alert">{error}</span>}
            {suggestions.length > 0 && (
                <ul className="bg-white dark:bg-[#23272F] border rounded shadow absolute z-10 w-full" role="listbox" aria-label={`Sugestões para ${label}`}> 
                    {suggestions.map(s => (
                        <li key={s} role="option" className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-[#181A20] cursor-pointer" onMouseDown={() => onSuggestionClick(s)}>{s}</li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <SidebarProvider>
            <div className="min-h-screen w-full flex flex-col md:flex-row text-lg md:text-xl bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans">
                {!sidebarOpen && (
                    <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-[#23272F]/90 shadow-md backdrop-blur-md">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md focus:ring-2 focus:ring-[#ED4231]" aria-label="Abrir menu lateral" tabIndex={0} title="Abrir menu lateral">
                            <Menu className="w-7 h-7" />
                        </button>
                        <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
                        <span className="font-bold text-indigo-900 dark:text-gray-100">{formData?.nome} {formData?.sobrenome}</span>
                    </div>
                )}
                <div className={`transition-all duration-500 ease-in-out
                    ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
                    bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden
                    fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px]`
                }>
                    <div className="w-full flex justify-start mb-6">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md focus:ring-2 focus:ring-[#ED4231]">
                            <Menu className="w-7 h-7" />
                        </button>
                    </div>
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <img src={profileImage} alt="Logo" className="w-16 h-16 rounded-full border-4 border-[#EDF2FB] dark:border-[#23272F] shadow" />
                        <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">{formData?.nome} {formData?.sobrenome}</span>
                    </div>
                    <SidebarMenu className="gap-4">
                        <SidebarMenuItem>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${location.pathname === '/agenda' ? 'bg-[#EDF2FB] dark:bg-[#23272F] border-l-4 border-[#ED4231]' : ''}`}>
                                        <Link to="/agenda" className="flex items-center gap-3">
                                            <CalendarIcon className="w-6 h-6" color="#ED4231" />
                                            <span>Agenda</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Veja sua agenda de atendimentos
                                </TooltipContent>
                            </Tooltip>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${location.pathname === '/disponibilizar-horario' ? 'bg-[#EDF2FB] dark:bg-[#23272F] border-l-4 border-[#ED4231]' : ''}`}>
                                        <Link to="/disponibilizar-horario" className="flex items-center gap-3">
                                            <Clock className="w-6 h-6" color="#ED4231" />
                                            <span>Disponibilizar Horário</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Disponibilize novos horários para atendimento
                                </TooltipContent>
                            </Tooltip>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${location.pathname === '/profile-form' ? 'bg-[#EDF2FB] dark:bg-[#23272F] border-l-4 border-[#ED4231]' : ''}`}>
                                        <Link to="/profile-form" className="flex items-center gap-3">
                                            <span>Editar Perfil</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Edite seu perfil e foto
                                </TooltipContent>
                            </Tooltip>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 dark:text-gray-500 items-center pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
                        <span>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</span>
                        <div className="flex gap-2">
                            <a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">Site</a>
                            <a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a>
                        </div>
                    </div>
                </div>
                <div className={`flex-1 w-full md:w-auto mt-4 md:mt-0 transition-all duration-500 ease-in-out ${sidebarOpen ? '' : 'ml-0'}`}>
                    <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/80 dark:bg-[#23272F]/90 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md transition-colors duration-300 border-b border-[#EDF2FB] dark:border-[#23272F]" role="banner">
                        <div className="flex items-center gap-3">
                            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200" />
                            <span className="font-bold text-indigo-900 dark:text-gray-100">{formData?.nome} {formData?.sobrenome}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                                tabIndex={0}
                                title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
                            </button>
                            <button
                                className="bg-[#ED4231] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#c32d22] transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                                aria-label="Sair"
                                onClick={() => setShowLogoutDialog(true)}
                                tabIndex={0}
                                title="Sair"
                            >
                                Sair
                            </button>
                        </div>
                    </header>
                    <div className="h-20" />
                    <main id="main-content" role="main">
                        <div className="max-w-5xl mx-auto p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-2xl font-bold dark:text-gray-100 animate-fade-in">{t('profile')}</h1>
                            </div>

                            {loading ? (
                                <ProfileFormSkeleton />
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={formData.email}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -24 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white dark:bg-[#23272F] rounded-2xl shadow-lg dark:shadow-none p-8 transition-colors duration-300 border dark:border-[#23272F] animate-fade-in" aria-live="polite" role="form">
                                            <div className="space-y-6">
                                                <Progress value={progress} className="my-4" />
                                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Perfil {progress}% completo</div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <label htmlFor="nome" className="block text-sm font-medium cursor-help dark:text-gray-100">Nome</label>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Digite seu nome completo</TooltipContent>
                                                        </Tooltip>
                                                        <Input
                                                            id="nome"
                                                            type="text"
                                                            value={formData.nome}
                                                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                                            className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${errors.nome ? 'border-red-500' : ''}`}
                                                            aria-invalid={!!errors.nome}
                                                            aria-describedby="nome-erro"
                                                        />
                                                        {errors.nome && <span id="nome-erro" className="text-red-500 text-xs" role="alert">{errors.nome}</span>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <label htmlFor="sobrenome" className="block text-sm font-medium cursor-help dark:text-gray-100">Sobrenome</label>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Digite seu sobrenome</TooltipContent>
                                                        </Tooltip>
                                                        <Input
                                                            id="sobrenome"
                                                            type="text"
                                                            value={formData.sobrenome}
                                                            onChange={e => setFormData({ ...formData, sobrenome: e.target.value })}
                                                            className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${errors.sobrenome ? 'border-red-500' : ''}`}
                                                            aria-invalid={!!errors.sobrenome}
                                                            aria-describedby="sobrenome-erro"
                                                        />
                                                        {errors.sobrenome && <span id="sobrenome-erro" className="text-red-500 text-xs" role="alert">{errors.sobrenome}</span>}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <label htmlFor="email" className="block text-sm font-medium cursor-help dark:text-gray-100">Email</label>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Digite seu email</TooltipContent>
                                                    </Tooltip>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${errors.email ? 'border-red-500' : ''}`}
                                                        aria-invalid={!!errors.email}
                                                        aria-describedby="email-erro"
                                                    />
                                                    {errors.email && <span id="email-erro" className="text-red-500 text-xs" role="alert">{errors.email}</span>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <label htmlFor="emailConfirm" className="block text-sm font-medium cursor-help dark:text-gray-100">Confirme seu Email</label>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Confirme seu email</TooltipContent>
                                                    </Tooltip>
                                                    <Input
                                                        id="emailConfirm"
                                                        type="email"
                                                        value={emailConfirm}
                                                        onChange={e => setEmailConfirm(e.target.value)}
                                                        className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${errors.emailConfirm ? 'border-red-500' : ''}`}
                                                        aria-invalid={!!errors.emailConfirm}
                                                        aria-describedby="emailConfirm-erro"
                                                    />
                                                    {errors.emailConfirm && <span id="emailConfirm-erro" className="text-red-500 text-xs" role="alert">{errors.emailConfirm}</span>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <label htmlFor="endereco" className="block text-sm font-medium cursor-help dark:text-gray-100">Endereço</label>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Digite seu endereço</TooltipContent>
                                                    </Tooltip>
                                                    <Input
                                                        id="endereco"
                                                        type="text"
                                                        value={formData.endereco}
                                                        onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                                                        className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <label htmlFor="telefone" className="block text-sm font-medium cursor-help dark:text-gray-100">Telefone/WhatsApp</label>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Digite seu telefone ou WhatsApp</TooltipContent>
                                                    </Tooltip>
                                                    <Input
                                                        id="telefone"
                                                        type="tel"
                                                        value={formData.telefone}
                                                        onChange={e => {
                                                            let value = e.target.value.replace(/\D/g, "");
                                                            if (value.length > 11) value = value.slice(0, 11);
                                                            value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1)$2-$3");
                                                            if (value.length < 14) value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1)$2-$3");
                                                            setFormData({ ...formData, telefone: value });
                                                        }}
                                                        className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${errors.telefone ? 'border-red-500' : ''}`}
                                                        aria-invalid={!!errors.telefone}
                                                        aria-describedby="telefone-erro"
                                                    />
                                                    {errors.telefone && <span id="telefone-erro" className="text-red-500 text-xs" role="alert">{errors.telefone}</span>}
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <label htmlFor="cpf" className="block text-sm font-medium cursor-help dark:text-gray-100">CPF</label>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Digite seu CPF no formato 000.000.000-00</TooltipContent>
                                                        </Tooltip>
                                                        <Input
                                                            id="cpf"
                                                            type="text"
                                                            value={formData.cpf}
                                                            onChange={e => {
                                                                let v = e.target.value.replace(/\D/g, "");
                                                                if (v.length > 11) v = v.slice(0, 11);
                                                                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                                                                v = v.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
                                                                v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
                                                                setFormData({ ...formData, cpf: v });
                                                            }}
                                                            className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${errors.cpf ? 'border-red-500' : ''}`}
                                                            aria-invalid={!!errors.cpf}
                                                            aria-describedby="cpf-erro"
                                                            maxLength={14}
                                                        />
                                                        {errors.cpf && <span id="cpf-erro" className="text-red-500 text-xs" role="alert">{errors.cpf}</span>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <label htmlFor="cep" className="block text-sm font-medium cursor-help dark:text-gray-100">CEP</label>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Digite seu CEP no formato 00000-000</TooltipContent>
                                                        </Tooltip>
                                                        <Input
                                                            id="cep"
                                                            type="text"
                                                            value={formData.cep}
                                                            onChange={e => {
                                                                let v = e.target.value.replace(/\D/g, "");
                                                                if (v.length > 8) v = v.slice(0, 8);
                                                                v = v.replace(/(\d{5})(\d{1,3})/, "$1-$2");
                                                                setFormData({ ...formData, cep: v });
                                                            }}
                                                            className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${errors.cep ? 'border-red-500' : ''}`}
                                                            aria-invalid={!!errors.cep}
                                                            aria-describedby="cep-erro"
                                                            maxLength={9}
                                                        />
                                                        {errors.cep && <span id="cep-erro" className="text-red-500 text-xs" role="alert">{errors.cep}</span>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <label htmlFor="nascimento" className="block text-sm font-medium cursor-help dark:text-gray-100">Data de Nascimento</label>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Digite sua data de nascimento no formato dd/mm/aaaa</TooltipContent>
                                                        </Tooltip>
                                                        <Input
                                                            id="nascimento"
                                                            type="text"
                                                            value={formData.nascimento}
                                                            onChange={e => {
                                                                let v = e.target.value.replace(/\D/g, "");
                                                                if (v.length > 8) v = v.slice(0, 8);
                                                                v = v.replace(/(\d{2})(\d)/, "$1/$2");
                                                                v = v.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
                                                                setFormData({ ...formData, nascimento: v });
                                                            }}
                                                            className={`border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none ${errors.nascimento ? 'border-red-500' : ''}`}
                                                            aria-invalid={!!errors.nascimento}
                                                            aria-describedby="nascimento-erro"
                                                            maxLength={10}
                                                            placeholder="dd/mm/aaaa"
                                                        />
                                                        {errors.nascimento && <span id="nascimento-erro" className="text-red-500 text-xs" role="alert">{errors.nascimento}</span>}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <SuggestionInput
                                                        id="cidade"
                                                        label="Cidade"
                                                        value={formData.cidade}
                                                        onChange={handleCidadeInput}
                                                        suggestions={citySuggestions}
                                                        onSuggestionClick={c => { setFormData({ ...formData, cidade: c }); setCitySuggestions([]); }}
                                                        onBlur={() => setTimeout(() => setCitySuggestions([]), 100)}
                                                    />
                                                    <SuggestionInput
                                                        id="uf"
                                                        label="UF"
                                                        value={formData.uf}
                                                        onChange={handleUfInput}
                                                        suggestions={ufSuggestions}
                                                        onSuggestionClick={u => { setFormData({ ...formData, uf: u }); setUfSuggestions([]); }}
                                                        onBlur={() => setTimeout(() => setUfSuggestions([]), 100)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="atividade" className="block text-sm font-medium dark:text-gray-100">Atividade a se cedida como voluntariado:</label>
                                                    <Textarea
                                                        value={formData.atividade}
                                                        onChange={(e) => setFormData({ ...formData, atividade: e.target.value })}
                                                        className="border border-[#ADADAD] border-solid border-2 rounded-[20px] min-h-[100px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="bio" className="block text-sm font-medium dark:text-gray-100">Mini bio</label>
                                                    <Textarea
                                                        id="bio"
                                                        value={bio}
                                                        onChange={e => setBio(e.target.value)}
                                                        className="border border-[#ADADAD] border-solid border-2 rounded-[20px] min-h-[80px] bg-[#EDF2FB] dark:bg-[#23272F] focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                                                        aria-label="Mini bio"
                                                    />
                                                </div>

                                                <div className="flex gap-4">
                                                    <Button
                                                        variant="outline"
                                                        type="button"
                                                        onClick={() => setShowCancelDialog(true)}
                                                        className="focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="bg-[#1A1466] hover:bg-[#1a237e]/90 flex items-center justify-center focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                                                        disabled={!hasChanged || isSaving || Object.keys(errors).length > 0}
                                                        aria-disabled={!hasChanged || isSaving || Object.keys(errors).length > 0}
                                                        aria-label="Salvar perfil"
                                                    >
                                                        {isSaving && <span className="inline-block w-4 h-4 border-2 border-t-2 border-t-[#1A1466] border-[#EDF2FB] rounded-full animate-spin mr-2" aria-label="Salvando..." role="status" />}
                                                        Salvar
                                                    </Button>
                                                </div>
                                                <div className="mt-4 text-xs text-gray-500 dark:text-gray-300">Última atualização: {lastUpdated || 'Nunca'}</div>
                                                <div className={`mt-2 text-sm font-semibold ${profileStatus === 'completo' ? 'text-green-600' : 'text-yellow-600'}`}>Perfil {profileStatus}</div>
                                                {hasChanged && (
                                                    <Badge className={`ml-2 ${STATUS_COLORS.warning} animate-fade-in badge-animate`} aria-label={t('unsaved_changes')}>{t('unsaved_changes')}</Badge>
                                                )}
                                            </div>

                                            <div className="relative flex flex-col items-center">
                                                <div className="relative">
                                                    {imageLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/70 z-10"><span className="inline-block w-4 h-4 border-2 border-t-2 border-t-[#1A1466] border-[#EDF2FB] rounded-full animate-spin" aria-label="Carregando imagem..." /></div>}
                                                    <img
                                                        src={formData.profileImage || "/image/perfilProfile.svg"}
                                                        alt="Profile preview"
                                                        className="rounded-full w-72 h-72 object-cover mb-2"
                                                    />
                                                </div>
                                                <label
                                                    htmlFor="upload-photo"
                                                    className="mt-4 bg-[#1A1466] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[#1a237e]/90 focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                                                    aria-label="Editar foto de perfil"
                                                >
                                                    Editar Foto
                                                </label>
                                                <input
                                                    type="file"
                                                    id="upload-photo"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                        </form>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                                <DialogContent className="transition-all duration-300 ease-in-out scale-95 data-[state=open]:scale-100 data-[state=closed]:scale-95 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0">
                                    <DialogHeader>
                                        <DialogTitle>Cancelar alterações?</DialogTitle>
                                    </DialogHeader>
                                    <p className="mb-4">Tem certeza de que deseja descartar as alterações feitas no perfil?</p>
                                    <DialogFooter className="flex gap-2">
                                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="focus:ring-2 focus:ring-[#ED4231] focus:outline-none">Não</Button>
                                        <Button className="bg-[#ED4231] text-white focus:ring-2 focus:ring-[#ED4231] focus:outline-none" onClick={handleCancel}>Sim</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                                <DialogContent className="transition-all duration-300 ease-in-out scale-95 data-[state=open]:scale-100 data-[state=closed]:scale-95 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0">
                                    <DialogHeader>
                                        <DialogTitle>Deseja sair?</DialogTitle>
                                    </DialogHeader>
                                    <p className="mb-4">Tem certeza que deseja sair da sua conta?</p>
                                    <DialogFooter className="flex gap-2">
                                        <Button variant="outline" onClick={() => setShowLogoutDialog(false)} className="focus:ring-2 focus:ring-[#ED4231] focus:outline-none">Cancelar</Button>
                                        <Button className="bg-[#ED4231] text-white focus:ring-2 focus:ring-[#ED4231] focus:outline-none" onClick={() => { setShowLogoutDialog(false); /* Adicione lógica de logout aqui */ }}>Sair</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {!formData.nome && (
                                <div className="p-4">
                                    <Skeleton className="h-8 w-1/2 mb-2" />
                                    <Skeleton className="h-6 w-1/3" />
                                </div>
                            )}
                            {hasChanged && (
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#ED4231] text-white shadow-lg hover:bg-[#c32d22] focus:outline-none focus:ring-2 focus:ring-[#ED4231] animate-fade-in"
                                    aria-label="Voltar ao topo"
                                >
                                    ↑
                                </button>
                            )}
                        </div>
                    </main>
                </div>
            </div>
            <style>{`
                body.dark {
                    background: linear-gradient(135deg, #181A20 0%, #23272F 60%, #181A20 100%) !important;
                    color: #f3f4f6;
                }
                ::selection {
                    background: #ED4231;
                    color: #fff;
                }
                body.dark ::selection {
                    background: #ED4231;
                    color: #fff;
                }
                .dark .shadow-md, .dark .shadow-lg {
                    box-shadow: none !important;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .badge-animate {
                    animation: popBadge 0.4s cubic-bezier(.4,0,.2,1);
                }
                @keyframes popBadge {
                    0% { transform: scale(0.7); opacity: 0; }
                    60% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
                }
            `}</style>
        </SidebarProvider>
    );
};

export default ProfileForm;