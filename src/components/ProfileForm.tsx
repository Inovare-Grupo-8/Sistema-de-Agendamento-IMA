import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bell, User, Calendar as CalendarIcon, Clock, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useProfileImage } from "@/components/ProfileImageContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileForm = () => {
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
        };
    });

    const { profileImage, setProfileImage } = useProfileImage();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

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
        localStorage.setItem("profileData", JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem("profileData", JSON.stringify(formData));
        setProfileImage(formData.profileImage || "/image/perfilProfile.svg");
        console.log("Form submitted:", formData);
    };

    const handleCancel = () => {
        const savedData = localStorage.getItem("profileData");
        if (savedData) {
            setFormData(JSON.parse(savedData));
        }
    };

    const [showModal, setShowModal] = useState(false);

    return (
        <SidebarProvider>
            <div className="min-h-screen w-full flex flex-col md:flex-row text-lg md:text-xl bg-[#EDF2FB]">
                {/* Botão de menu fora da sidebar quando fechada */}
                {!sidebarOpen && (
                    <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 shadow-md backdrop-blur-md">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
                            <Menu className="w-7 h-7" />
                        </button>
                        <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
                        <span className="font-bold text-indigo-900">{formData?.nome} {formData?.sobrenome}</span>
                    </div>
                )}
                <div className={`transition-all duration-500 ease-in-out
                    ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
                    bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden
                    fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB]`
                }>
                    <div className="w-full flex justify-start mb-6">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
                            <Menu className="w-7 h-7" />
                        </button>
                    </div>
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <img src={profileImage} alt="Logo" className="w-16 h-16 rounded-full border-4 border-[#EDF2FB] shadow" />
                        <span className="font-extrabold text-xl text-indigo-900 tracking-wide">{formData?.nome} {formData?.sobrenome}</span>
                    </div>
                    <SidebarMenu className="gap-4">
                        <SidebarMenuItem>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/agenda' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
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
                                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/disponibilizar-horario' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
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
                                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/profile-form' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                                        <Link to="/profile-form" className="flex items-center gap-3">
                                            <User className="w-6 h-6" color="#ED4231" />
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
                    <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB]">
                        <span>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</span>
                        <div className="flex gap-2">
                            <a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">Site</a>
                            <a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a>
                        </div>
                    </div>
                </div>
                <div className={`flex-1 w-full md:w-auto mt-4 md:mt-0 transition-all duration-500 ease-in-out ${sidebarOpen ? '' : 'ml-0'}`}>
                    <header className="w-full flex items-center justify-between px-6 py-4 bg-white/80 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200" />
                            <span className="font-bold text-indigo-900">{formData?.nome} {formData?.sobrenome}</span>
                        </div>
                        <button className="bg-[#ED4231] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#c32d22] transition-colors" aria-label="Sair">Sair</button>
                    </header>
                    <div className="h-20" />
                    <div className="max-w-5xl mx-auto p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold">Perfil</h1>
                            <div className="flex items-center gap-4">
                                <Bell className="w-5 h-5 cursor-pointer text-[#ED4231]" />
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-5 h-5 text-[#ED4231]" />
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="nome" className="block text-sm font-medium">
                                            Nome
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.nome}
                                            readOnly
                                            className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="sobrenome" className="block text-sm font-medium">
                                            Sobrenome
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.sobrenome}
                                            readOnly
                                            className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="endereco" className="block text-sm font-medium">
                                        Endereço
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.endereco}
                                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                        className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="telefone" className="block text-sm font-medium">
                                        Telefone/WhatsApp
                                    </label>
                                    <Input
                                        type="tel"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="cidade" className="block text-sm font-medium">
                                            Cidade
                                        </label>
                                        <select
                                            defaultValue={formData.cidade}
                                            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                            className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] w-full px-4 py-2"
                                        >
                                            <option value="São Paulo">São Paulo</option>
                                            <option value="Rio de Janeiro">Rio de Janeiro</option>
                                            <option value="Belo Horizonte">Belo Horizonte</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="uf" className="block text-sm font-medium">
                                            UF
                                        </label>
                                        <select
                                            defaultValue={formData.uf}
                                            onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                                            className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] w-full px-4 py-2"
                                        >
                                            <option value="SP">SP</option>
                                            <option value="RJ">RJ</option>
                                            <option value="MG">MG</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="atividade" className="block text-sm font-medium">
                                        Atividade a se cedida como voluntariado:
                                    </label>
                                    <Textarea
                                        value={formData.atividade}
                                        onChange={(e) => setFormData({ ...formData, atividade: e.target.value })}
                                        className="border border-[#ADADAD] border-solid border-2 rounded-[20px] min-h-[100px] bg-[#EDF2FB]"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" type="button">
                                                Cancelar
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <div className="p-4">
                                                <h2 className="text-lg font-bold">Confirmação</h2>
                                                <p className="text-gray-600">Tem certeza de que deseja cancelar as mudanças?</p>
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <Button variant="outline" onClick={() => setShowModal(false)}>
                                                        Não
                                                    </Button>
                                                    <Button className="bg-[#ED4231] text-white" onClick={handleCancel}>
                                                        Sim
                                                    </Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button type="submit" className="bg-[#1A1466] hover:bg-[#1a237e]/90">
                                                Salvar
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <div className="p-4">
                                                <h2 className="text-lg font-bold">Confirmação</h2>
                                                <p className="text-gray-600">Formulário salvo com sucesso!</p>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="relative flex flex-col items-center">
                                <img
                                    src={formData.profileImage || "/image/perfilProfile.svg"}
                                    alt="Profile"
                                    className="rounded-full w-72 h-72 object-cover"
                                />
                                <label
                                    htmlFor="upload-photo"
                                    className="mt-4 bg-[#1A1466] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[#1a237e]/90"
                                >
                                    Editar Foto
                                </label>
                                <input
                                    type="file"
                                    id="upload-photo"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                setFormData({ ...formData, profileImage: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                        </form>

                        {/* Loader de exemplo para feedback visual */}
                        {!formData.nome && (
                            <div className="p-4">
                                <Skeleton className="h-8 w-1/2 mb-2" />
                                <Skeleton className="h-6 w-1/3" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default ProfileForm;