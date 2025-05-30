import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, User, Clock, Menu, History, ChevronRight, Users, Activity, Sun, Moon, Home as HomeIcon, Phone, Mail, MessageSquare, FileText, UserCheck, Check, X, Eye, ThumbsUp, ThumbsDown, AlertTriangle, UserPlus, Shield, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interface para dados do assistente social
interface AssistenteSocialData {
  id: string;
  nome: string;
  sobrenome: string;
  crp: string;
  especialidade: string;
  telefone: string;
  email: string;
  disponivel: boolean;
  proximaDisponibilidade: Date;
  atendimentosRealizados: number;
  avaliacaoMedia: number;
}

// Interface para voluntário
interface Voluntario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  especialidade: string;
  status: "ativo" | "inativo" | "pendente";
  dataCadastro: Date;
  ultimoAcesso?: Date;
}

// Dados simulados do assistente social
const assistenteSocialData: AssistenteSocialData = {
  id: "as001",
  nome: "Maria",
  sobrenome: "Santos",
  crp: "CRP 06/123456",
  especialidade: "Assistência Social",
  telefone: "(11) 99999-8888",
  email: "maria.santos@inovare.com",
  disponivel: true,
  proximaDisponibilidade: new Date(2025, 4, 30, 14, 0),
  atendimentosRealizados: 127,
  avaliacaoMedia: 4.8
};

// Dados simulados de voluntários
const voluntariosData: Voluntario[] = [
  {
    id: "vol001",
    nome: "Dr. João",
    sobrenome: "Silva",
    email: "joao.silva@voluntario.com",
    especialidade: "Psicologia",
    status: "ativo",
    dataCadastro: new Date(2025, 3, 15),
    ultimoAcesso: new Date(2025, 4, 29)
  },
  {
    id: "vol002",
    nome: "Dra. Ana",
    sobrenome: "Costa",
    email: "ana.costa@voluntario.com",
    especialidade: "Serviço Social",
    status: "ativo",
    dataCadastro: new Date(2025, 3, 20),
    ultimoAcesso: new Date(2025, 4, 28)
  },
  {
    id: "vol003",
    nome: "Prof. Carlos",
    sobrenome: "Mendes",
    email: "carlos.mendes@voluntario.com",
    especialidade: "Orientação Profissional",
    status: "inativo",
    dataCadastro: new Date(2025, 2, 10),
    ultimoAcesso: new Date(2025, 4, 15)
  }
];

// Itens de navegação para o assistente social
const assistenteSocialNavItems = [
  {
    path: "/assistente-social",
    label: "Home",
    icon: <HomeIcon className="w-6 h-6" color="#ED4231" />
  },
  {
    path: "/cadastro-voluntario",
    label: "Cadastrar Voluntário",
    icon: <UserPlus className="w-6 h-6" color="#ED4231" />
  }
];

const CadastroVoluntario = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();

  // Estados para formulário de cadastro
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    especialidade: ""
  });

  // Estados para controle da interface
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>(voluntariosData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Especialidades disponíveis
  const especialidades = [
    "Psicologia",
    "Serviço Social", 
    "Orientação Profissional",
    "Direito",
    "Medicina",
    "Enfermagem",
    "Nutrição",
    "Fisioterapia",
    "Terapia Ocupacional",
    "Pedagogia"
  ];

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };

    loadData();
  }, []);

  // Função para formatar data
  const formatarData = (data: Date) => {
    return format(data, "dd/MM/yyyy", { locale: ptBR });
  };

  // Função para validar email
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Função para validar formulário
  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.sobrenome.trim()) {
      toast({
        title: "Erro de validação",
        description: "Sobrenome é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Erro de validação",
        description: "Email é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!validarEmail(formData.email)) {
      toast({
        title: "Erro de validação",
        description: "Email deve ter um formato válido.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.senha) {
      toast({
        title: "Erro de validação",
        description: "Senha é obrigatória.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.senha.length < 6) {
      toast({
        title: "Erro de validação",
        description: "Senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.especialidade) {
      toast({
        title: "Erro de validação",
        description: "Especialidade é obrigatória.",
        variant: "destructive",
      });
      return false;
    }

    // Verificar se email já existe
    const emailExiste = voluntarios.some(vol => vol.email.toLowerCase() === formData.email.toLowerCase());
    if (emailExiste) {
      toast({
        title: "Erro de validação",
        description: "Este email já está cadastrado.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Função para submeter formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      setShowConfirmModal(true);
    }
  };

  // Função para confirmar cadastro
  const confirmarCadastro = async () => {
    setIsProcessing(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Criar novo voluntário
      const novoVoluntario: Voluntario = {
        id: `vol${Date.now()}`,
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        especialidade: formData.especialidade,
        status: "ativo",
        dataCadastro: new Date()
      };
      
      // Adicionar à lista
      setVoluntarios(prev => [novoVoluntario, ...prev]);
      
      // Limpar formulário
      setFormData({
        nome: "",
        sobrenome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        especialidade: ""
      });
      
      setShowConfirmModal(false);
      
      toast({
        title: "Voluntário cadastrado!",
        description: `${formData.nome} ${formData.sobrenome} foi cadastrado como voluntário na área de ${formData.especialidade}.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar o voluntário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "inativo":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "inativo":
        return "Inativo";
      case "pendente":
        return "Pendente";
      default:
        return "Desconhecido";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#EDF2FB] dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ED4231]"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EDF2FB] dark:bg-gray-900">
        {/* Sidebar comprimida para mobile */}
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-gray-900/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
            <span className="font-bold text-indigo-900 dark:text-gray-100">{assistenteSocialData.nome} {assistenteSocialData.sobrenome}</span>
          </div>
        )}
        
        {/* Sidebar */}
        <div className={`transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
          bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base`
        }>
          <div className="w-full flex justify-start mb-6">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
          </div>
          
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src={profileImage} alt="Foto de perfil" className="w-16 h-16 rounded-full border-4 border-[#EDF2FB] shadow" />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">
              {assistenteSocialData.nome} {assistenteSocialData.sobrenome}
            </span>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              {assistenteSocialData.especialidade}
            </Badge>
          </div>
          
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {assistenteSocialNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === item.path ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                      <Link to={item.path} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
            <span>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</span>
            <div className="flex gap-2">
              <a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">Site</a>
              <a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <main className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? '' : 'ml-0'}`}>
          {/* Header */}
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200" />
              <span className="font-bold text-indigo-900 dark:text-gray-100">{assistenteSocialData.nome} {assistenteSocialData.sobrenome}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </Button>
            </div>
          </header>

          <div className="max-w-6xl mx-auto p-2 sm:p-4 md:p-8 pt-24 sm:pt-28 md:pt-24">
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-2">Cadastro de Voluntários</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Cadastre novos voluntários para atuar no sistema</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário de cadastro */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-[#ED4231]" />
                        Novo Voluntário
                      </CardTitle>
                      <CardDescription>
                        Preencha os dados do voluntário para criar o acesso
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nome">Nome *</Label>
                            <Input
                              id="nome"
                              type="text"
                              value={formData.nome}
                              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                              placeholder="Nome do voluntário"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="sobrenome">Sobrenome *</Label>
                            <Input
                              id="sobrenome"
                              type="text"
                              value={formData.sobrenome}
                              onChange={(e) => setFormData(prev => ({ ...prev, sobrenome: e.target.value }))}
                              placeholder="Sobrenome do voluntário"
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">Email Profissional *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@voluntario.com"
                            className="mt-1"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="especialidade">Especialidade *</Label>
                          <Select value={formData.especialidade} onValueChange={(value) => setFormData(prev => ({ ...prev, especialidade: value }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione a especialidade" />
                            </SelectTrigger>
                            <SelectContent>
                              {especialidades.map((esp) => (
                                <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="senha">Senha *</Label>
                            <Input
                              id="senha"
                              type="password"
                              value={formData.senha}
                              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                              placeholder="Mínimo 6 caracteres"
                              className="mt-1"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                            <Input
                              id="confirmarSenha"
                              type="password"
                              value={formData.confirmarSenha}
                              onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                              placeholder="Confirme a senha"
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full bg-[#ED4231] hover:bg-[#D63626] text-white">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Cadastrar Voluntário
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Lista de voluntários cadastrados */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#ED4231]" />
                        Voluntários Cadastrados
                      </CardTitle>
                      <CardDescription>
                        {voluntarios.length} voluntário{voluntarios.length !== 1 ? 's' : ''} no sistema
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {voluntarios.map((voluntario) => (
                          <div key={voluntario.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {voluntario.nome} {voluntario.sobrenome}
                              </h4>
                              <Badge className={getStatusColor(voluntario.status)}>
                                {getStatusText(voluntario.status)}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              <p>{voluntario.email}</p>
                              <p>{voluntario.especialidade}</p>
                              <p>Cadastrado em: {formatarData(voluntario.dataCadastro)}</p>
                              {voluntario.ultimoAcesso && (
                                <p>Último acesso: {formatarData(voluntario.ultimoAcesso)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal de Confirmação */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#ED4231]" />
                Confirmar Cadastro
              </DialogTitle>
              <DialogDescription>
                Confirme os dados do novo voluntário antes de finalizar o cadastro.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Dados do Voluntário:</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Nome:</strong> {formData.nome} {formData.sobrenome}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Especialidade:</strong> {formData.especialidade}</p>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Credenciais de Acesso</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  O voluntário receberá as credenciais de acesso por email após o cadastro.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button 
                onClick={confirmarCadastro} 
                disabled={isProcessing}
                className="bg-[#ED4231] hover:bg-[#D63626] text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Cadastro
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default CadastroVoluntario;
