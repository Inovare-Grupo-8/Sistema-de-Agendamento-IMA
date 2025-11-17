import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, User, Clock, Menu, History, Sun, Moon, ArrowLeft, Home as HomeIcon } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCep } from "@/hooks/useCep";
import { useUser } from "@/hooks/useUser";
import { useVoluntario, DadosPessoaisVoluntario, DadosProfissionaisVoluntario, EnderecoVoluntario } from "@/hooks/useVoluntario";
import { UserData } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { professionalNavigationItems } from "@/utils/userNavigation";

// Componente de breadcrumb simples para o profissional
const getProfessionalNavigationPath = (currentPath: string) => {
  const pathLabels: Record<string, string> = {
    "/home": "Home",
    "/agenda": "Agenda",
    "/historico": "Histórico",
    "/disponibilizar-horario": "Disponibilizar Horário",
    "/profile-form": "Editar Perfil"
  };

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
      <Link to="/home" className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400">
        <HomeIcon className="h-3.5 w-3.5 text-[#ED4231]" />
      </Link>
      <span className="mx-1">/</span>
      <span className="text-gray-900 dark:text-gray-200 font-medium">
        {pathLabels[currentPath] || "Página atual"}
      </span>
    </div>
  );
};

const ProfileForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage, setProfileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const { fetchAddressByCep, loading: loadingCep, formatCep } = useCep();
  // Get user data and setter from the context
  const { userData, setUserData } = useUser();
  const { buscarDadosPessoais, atualizarDadosPessoais, buscarDadosProfissionais, atualizarDadosProfissionais, buscarEndereco, atualizarEndereco, mapEnumToText, uploadFoto } = useVoluntario();
  
  // Adicionando estado para feedback visual de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const [funcaoVoluntario, setFuncaoVoluntario] = useState<string>(''); // Estado para função na sidebar

  // Estado para dados pessoais do voluntário
  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoaisVoluntario>({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    dataNascimento: ''
  });

  // Estado para dados profissionais do voluntário
  const [dadosProfissionais, setDadosProfissionais] = useState<DadosProfissionaisVoluntario>({
    funcao: '',
    registroProfissional: '',
    biografiaProfissional: ''
  });

  // Estado para endereço do voluntário
  const [endereco, setEndereco] = useState<EnderecoVoluntario>({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const isLoadingRef = useRef(false);

  // Estado para o formulário usando apenas dados do voluntário
  const [formData, setFormData] = useState(() => ({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    especialidade: '',
    crp: '',
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
  }));

  // Estado para a imagem selecionada
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Função para carregar dados pessoais do voluntário
  const loadProfileData = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      setIsLoadingData(true);
      setInitialLoading(true);
      
      // Buscar dados pessoais
      const dados = await buscarDadosPessoais();
      if (dados) {
        setDadosPessoais(dados);
      }

      // Buscar dados profissionais
      try {
        const dadosProfissionaisData = await buscarDadosProfissionais();
        if (dadosProfissionaisData) {
          setDadosProfissionais(dadosProfissionaisData);
          // Atualizar função para a sidebar
          setFuncaoVoluntario(mapEnumToText(dadosProfissionaisData.funcao));
        }
      } catch (profissionalError) {
        console.log('Dados profissionais não encontrados ou erro ao carregar:', profissionalError);
        // Não mostra erro para o usuário se os dados profissionais não existirem ainda
        setFuncaoVoluntario(''); // Limpar função se não conseguir carregar
      }

      // Buscar endereço
      try {
        const enderecoData = await buscarEndereco();
        if (enderecoData) {
          setEndereco(enderecoData);
        }
      } catch (enderecoError) {
        console.log('Endereço não encontrado ou erro ao carregar:', enderecoError);
        // Não mostra erro para o usuário se o endereço não existir ainda
      }

      setFormChanged(false);
    } catch (error) {
      console.error('Erro ao carregar dados pessoais do voluntário:', error);
      
      if (error instanceof Error && error.message.includes('Token inválido')) {
        return;
      }

      if (error instanceof Error && error.message.includes('conexão')) {
        toast({
          title: 'Erro de conexão',
          description: 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do seu perfil.',
        variant: 'destructive',
      });
    } finally {
      setInitialLoading(false);
      setIsLoadingData(false);
      isLoadingRef.current = false;
    }
  }, [buscarDadosPessoais, buscarDadosProfissionais, buscarEndereco, mapEnumToText]);

  // Carregar dados pessoais ao montar o componente (apenas uma vez)
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await loadProfileData();
    };
    
    void loadData();
    
    return () => {
      isMounted = false;
    };
  }, [loadProfileData]);

  // Função para lidar com a mudança nos campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormChanged(true);
    const { name, value } = e.target;
    
    // Formatação específica para o CEP
    if (name === "endereco.cep") {
      const formattedCep = formatCep(value);
      setFormData({
        ...formData,
        endereco: {
          ...formData.endereco,
          cep: formattedCep
        }
      });
      return;
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Função para lidar com a seleção da imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para validar o formulário antes de salvar
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validações simples como exemplo
    if (!formData.nome) {
      errors.nome = "Nome é obrigatório";
    }
    
    if (!formData.email) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido";
    }
    
    if (formData.telefone && formData.telefone.length < 10) {
      errors.telefone = "Telefone deve ter pelo menos 10 dígitos";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para validar dados pessoais do voluntário
  const validateDadosPessoais = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!dadosPessoais.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!dadosPessoais.sobrenome.trim()) {
      newErrors.sobrenome = 'Sobrenome é obrigatório';
    }

    if (!dadosPessoais.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(dadosPessoais.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!dadosPessoais.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!dadosPessoais.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para validar endereço do voluntário
  const validateEndereco = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!endereco.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (endereco.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP deve ter 8 dígitos';
    }

    if (!endereco.logradouro.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }

    if (!endereco.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    if (!endereco.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!endereco.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!endereco.uf.trim()) {
      newErrors.uf = 'UF é obrigatória';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para validar dados profissionais do voluntário
  const validateDadosProfissionais = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!dadosProfissionais.funcao.trim()) {
      newErrors.funcao = 'Função é obrigatória';
    }

    if (!dadosProfissionais.registroProfissional.trim()) {
      newErrors.registroProfissional = 'Registro profissional é obrigatório';
    }

    // biografiaProfissional é opcional, então não validamos

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para lidar com mudanças nos dados pessoais
  const handleDadosPessoaisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDadosPessoais(prev => ({
      ...prev,
      [name]: value
    }));
    setFormChanged(true);

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Função para lidar com mudanças no endereço
  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Formatação específica para o CEP
    let formattedValue = value;
    if (name === 'cep') {
      formattedValue = formatCep(value);
    }
    
    setEndereco(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    setFormChanged(true);

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Função para lidar com mudanças nos dados profissionais
  const handleDadosProfissionaisChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDadosProfissionais(prev => ({
      ...prev,
      [name]: value
    }));
    setFormChanged(true);

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Função para salvar dados pessoais
  const handleSaveDadosPessoais = async () => {
    if (!formChanged && !selectedImage) {
      toast({
        title: "Nenhuma alteração detectada",
        description: "Altere algum campo para salvar",
        variant: "default"
      });
      return;
    }

    if (!validateDadosPessoais()) {
      toast({
        title: "Formulário com erros",
        description: "Corrija os erros antes de salvar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      await atualizarDadosPessoais(dadosPessoais);
      setSuccessMessage('Dados pessoais atualizados com sucesso!');
      setFormChanged(false);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar dados pessoais:', error);
      setValidationErrors({ form: 'Erro ao salvar dados. Tente novamente.' });
      
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar endereço
  const handleSaveEndereco = async () => {
    if (!formChanged) {
      toast({
        title: "Nenhuma alteração detectada",
        description: "Altere algum campo para salvar",
        variant: "default"
      });
      return;
    }

    if (!validateEndereco()) {
      toast({
        title: "Formulário com erros",
        description: "Corrija os erros antes de salvar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      await atualizarEndereco(endereco);
      setSuccessMessage('Endereço atualizado com sucesso!');
      setFormChanged(false);
      
      toast({
        title: "Endereço atualizado",
        description: "Seu endereço foi atualizado com sucesso!",
      });
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      setValidationErrors({ form: 'Erro ao salvar endereço. Tente novamente.' });
      
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar seu endereço.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar dados profissionais
  const handleSaveDadosProfissionais = async () => {
    if (!formChanged) {
      toast({
        title: "Nenhuma alteração detectada",
        description: "Altere algum campo para salvar",
        variant: "default"
      });
      return;
    }

    if (!validateDadosProfissionais()) {
      toast({
        title: "Formulário com erros",
        description: "Corrija os erros antes de salvar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      await atualizarDadosProfissionais(dadosProfissionais);
      // Atualizar função na sidebar
      setFuncaoVoluntario(mapEnumToText(dadosProfissionais.funcao));
      
      setSuccessMessage('Dados profissionais atualizados com sucesso!');
      setFormChanged(false);
      
      toast({
        title: "Dados profissionais atualizados",
        description: "Suas informações profissionais foram atualizadas com sucesso!",
      });
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar dados profissionais:', error);
      setValidationErrors({ form: 'Erro ao salvar dados profissionais. Tente novamente.' });
      
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar seus dados profissionais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar apenas a foto de perfil do voluntário
  const handleSavePhoto = async () => {
    if (!selectedImage || !imagePreview) {
      toast({
        title: "Nenhuma foto selecionada",
        description: "Selecione uma foto para atualizar",
        variant: "default",
      });
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔄 [ProfileForm] Iniciando upload de foto do voluntário...');
      
      // Upload da foto e obter a URL
      const photoUrl = await uploadFoto(selectedImage);
      console.log('✅ [ProfileForm] URL da foto recebida:', photoUrl);

      // Atualizar o contexto com a nova URL da imagem do servidor
      setProfileImage(photoUrl);

      // Limpar estados locais
      setSelectedImage(null);
      setImagePreview(null);
      setFormChanged(false);

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      });

    } catch (error) {
      console.error('❌ [ProfileForm] Erro completo no upload:', error);
      
      let errorMessage = "Ocorreu um erro ao atualizar sua foto de perfil.";
      
      if (error instanceof Error) {
        if (error.message.includes('muito grande')) {
          errorMessage = error.message;
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Erro de conexão com o servidor. Verifique sua internet e se o backend está rodando na porta 8080.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao atualizar foto",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update to use apenas dados do voluntário
  const handleSave = async () => {
    if (!formChanged && !selectedImage) {
      toast({
        title: "Nenhuma alteração detectada",
        description: "Altere algum campo para salvar",
        variant: "default"
      });
      return;
    }
      if (!validateForm()) {
      toast({
        title: "Formulário com erros",
        description: "Corrija os erros antes de salvar",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Salvar apenas dados pessoais, profissionais e endereço do voluntário
      await handleSaveDadosPessoais();
      await handleSaveDadosProfissionais();
      await handleSaveEndereco();
      
      if (selectedImage && imagePreview) {
        setProfileImage(imagePreview);
      }
      
      setSuccessMessage("Perfil atualizado com sucesso!");
      setFormChanged(false);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para exportar dados em PDF
  const handleExportPDF = () => {
    toast({
      title: "Preparando PDF",
      description: "Seu perfil profissional está sendo exportado..."
    });
    
    // Aqui seria a implementação real de exportação para PDF
    setTimeout(() => {
      toast({
        title: "PDF exportado com sucesso",
        description: "O PDF com seu perfil profissional foi gerado."
      });
    }, 2000);
  };
    // Adicione seção para disponibilidade de horários no perfil do profissional
  const [disponibilidade, setDisponibilidade] = useState({
    segunda: { manha: false, tarde: false, noite: false },
    terca: { manha: false, tarde: false, noite: false },
    quarta: { manha: false, tarde: false, noite: false },
    quinta: { manha: false, tarde: false, noite: false },
    sexta: { manha: false, tarde: false, noite: false },
    sabado: { manha: false, tarde: false, noite: false },
    domingo: { manha: false, tarde: false, noite: false },
  });
  
  // Estados para o modal de horários específicos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ dia: '', periodo: '' });
  const [horariosEspecificos, setHorariosEspecificos] = useState('');
    const handleDisponibilidadeChange = (dia: string, periodo: string) => {
    // Se está marcando o checkbox (vai ficar true), abre o modal
    const currentValue = disponibilidade[dia as keyof typeof disponibilidade][periodo as 'manha' | 'tarde' | 'noite'];
    const isChecking = !currentValue;
    
    if (isChecking) {
      setModalData({ dia, periodo });
      setHorariosEspecificos('');
      setIsModalOpen(true);
    } else {
      // Se está desmarcando, remove diretamente
      setFormChanged(true);
      setDisponibilidade(prev => ({
        ...prev,
        [dia]: {
          ...prev[dia as keyof typeof prev],
          [periodo]: false
        }
      }));
    }
  };
  
  const confirmarDisponibilidade = () => {
    setFormChanged(true);
    setDisponibilidade(prev => ({
      ...prev,
      [modalData.dia]: {
        ...prev[modalData.dia as keyof typeof prev],
        [modalData.periodo]: true
      }
    }));
    setIsModalOpen(false);
    
    if (horariosEspecificos.trim()) {
      toast({
        title: "Disponibilidade configurada",
        description: `Horários específicos salvos para ${modalData.periodo} de ${modalData.dia}-feira.`,
      });
    }
  };
  
  // Fix the duplicate and incorrectly formatted handleCancel function
  const handleCancel = () => {
    // Recarregando dados originais dos estados do voluntário
    setDadosPessoais({
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      dataNascimento: ''
    });
    
    setDadosProfissionais({
      funcao: '',
      registroProfissional: '',
      biografiaProfissional: ''
    });
    
    setEndereco({
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: ''
    });
    
    // Resetando estados
    setSelectedImage(null);
    setImagePreview(null);
    setFormChanged(false);
    setValidationErrors({});
    
    // Recarregar dados
    loadProfileData();
    
    toast({
      title: "Alterações descartadas",
      description: "Suas alterações foram descartadas com sucesso.",
    });
  };

  // Função para buscar endereço pelo CEP
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    if (!cep || cep.length < 8) return;
    
    const endereco = await fetchAddressByCep(cep);
    if (endereco) {
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          rua: endereco.rua,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
          cep: endereco.cep
        }
      }));
      setFormChanged(true);
      
      toast({
        title: "Endereço encontrado",
        description: "Os campos foram preenchidos automaticamente.",
      });
    }
  };

  // Função para buscar endereço pelo CEP para o voluntário
  const handleEnderecoCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    if (!cep || cep.replace(/\D/g, '').length < 8) return;
    
    const enderecoData = await fetchAddressByCep(cep);
    if (enderecoData) {
      setEndereco(prev => ({
        ...prev,
        logradouro: enderecoData.rua || '',             
        bairro: enderecoData.bairro || '',
        complemento: enderecoData.complemento || '',
        cidade: enderecoData.cidade || '', 
        uf: enderecoData.estado || '',         
        cep: enderecoData.cep || ''
      }));
      setFormChanged(true);
      
      toast({
        title: "Endereço encontrado",
        description: "Os campos foram preenchidos automaticamente.",
      });
    }
  };

  if (initialLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans text-base">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED4231] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Carregando dados...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-gray-900/90 shadow-md backdrop-blur-md">
            <Button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-primary text-white focus:outline-none shadow-md" aria-label="Abrir menu lateral" tabIndex={0} title="Abrir menu lateral">
              <Menu className="w-7 h-7" />
            </Button>
            <ProfileAvatar 
              profileImage={profileImage}
              name={`${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() || 'Voluntário'}
              size="w-10 h-10"
              className="border-2 border-primary shadow"
            />
            {/* Use dadosPessoais to show the current updated values */}
            <span className="font-bold text-foreground">{dadosPessoais.nome} {dadosPessoais.sobrenome}</span>
          </div>
        )}
        
        <div className={`transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
          bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base`
        }>
          <div className="w-full flex justify-start mb-6">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </Button>
          </div>          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar 
              profileImage={profileImage}
              name={`${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() || 'Voluntário'}
              size="w-16 h-16"
              className="border-4 border-[#EDF2FB]"
            />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">
              {dadosPessoais.nome} {dadosPessoais.sobrenome}
            </span>
            {funcaoVoluntario && (
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                {funcaoVoluntario}
              </Badge>
            )}
          </div>
          
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {/* Utilizando os itens de navegação do professional */}
            {Object.values(professionalNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === item.path ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-[#ED4231]' : ''}`}>
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
              <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 text-[#ED4231] flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ED4231" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" /></svg>
                    <span>Sair</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Sair da conta</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
          
          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
            <span>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</span>
            <div className="flex gap-2">
              <a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">Site</a>
              <a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a>
            </div>
          </div>
        </div>

        <main id="main-content" role="main" aria-label="Conteúdo principal" className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? '' : 'ml-0'}`}>          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ProfileAvatar 
                profileImage={profileImage}
                name={`${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() || 'Voluntário'}
                size="w-10 h-10"
                className="border-2 border-primary"
              />
              {/* Use dadosPessoais to show the current updated values */}
              <span className="font-bold text-foreground">{dadosPessoais.nome} {dadosPessoais.sobrenome}</span>
            </div>
            
            <div className="flex items-center gap-3">              <Button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </Button>
            </div>
          </header>

          <div className="max-w-6xl mx-auto p-4 md:p-8 pt-24 md:pt-10">
            {/* Breadcrumb navigation */}
            {getProfessionalNavigationPath(location.pathname)}

            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  onClick={() => navigate("/home")} 
                  variant="ghost" 
                  className="p-2 rounded-full"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100">Editar Perfil</h1>
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    Atualize suas informações profissionais
                  </p>
                </div>
              </div>
              
              <Tabs defaultValue="pessoal" className="w-full">
                <TabsList className="mb-6 flex flex-wrap md:flex-nowrap w-full gap-2 md:gap-0">
                  <TabsTrigger value="pessoal" className="flex-1">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="profissional" className="flex-1">Dados Profissionais</TabsTrigger>
                  <TabsTrigger value="endereco" className="flex-1">Endereço</TabsTrigger>
                  <TabsTrigger value="disponibilidade" className="flex-1">Disponibilidade</TabsTrigger>
                  <TabsTrigger value="foto" className="flex-1">Foto de Perfil</TabsTrigger>
                </TabsList>
                
                {/* Aba de Dados Pessoais */}
                <TabsContent value="pessoal">
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle>Dados Pessoais</CardTitle>
                      <CardDescription>Atualize suas informações pessoais</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {validationErrors.form && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                          {validationErrors.form}
                        </div>
                      )}

                      {/* Nome e Sobrenome */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="nome" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome *
                          </Label>
                          <Input
                            id="nome"
                            name="nome"
                            type="text"
                            value={dadosPessoais.nome}
                            onChange={handleDadosPessoaisChange}
                            className={`w-full ${validationErrors.nome ? 'border-red-500' : ''}`}
                            placeholder="Digite seu nome"
                          />
                          {validationErrors.nome && (
                            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.nome}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sobrenome" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sobrenome *
                          </Label>
                          <Input
                            id="sobrenome"
                            name="sobrenome"
                            type="text"
                            value={dadosPessoais.sobrenome}
                            onChange={handleDadosPessoaisChange}
                            className={`w-full ${validationErrors.sobrenome ? 'border-red-500' : ''}`}
                            placeholder="Digite seu sobrenome"
                          />
                          {validationErrors.sobrenome && (
                            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.sobrenome}</p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={dadosPessoais.email}
                          onChange={handleDadosPessoaisChange}
                          className={`w-full ${validationErrors.email ? 'border-red-500' : ''}`}
                          placeholder="Digite seu email"
                        />
                        {validationErrors.email && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                        )}
                      </div>

                      {/* Telefone */}
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Telefone *
                        </Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          type="tel"
                          value={dadosPessoais.telefone}
                          onChange={handleDadosPessoaisChange}
                          className={`w-full ${validationErrors.telefone ? 'border-red-500' : ''}`}
                          placeholder="Digite seu telefone"
                        />
                        {validationErrors.telefone && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.telefone}</p>
                        )}
                      </div>

                      {/* Data de Nascimento */}
                      <div className="space-y-2">
                        <Label htmlFor="dataNascimento" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Data de Nascimento *
                        </Label>
                        <Input
                          id="dataNascimento"
                          name="dataNascimento"
                          type="date"
                          value={dadosPessoais.dataNascimento}
                          onChange={handleDadosPessoaisChange}
                          className={`w-full ${validationErrors.dataNascimento ? 'border-red-500' : ''}`}
                        />
                        {validationErrors.dataNascimento && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.dataNascimento}</p>
                        )}
                      </div>

                      {/* Botões de ação */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={handleSaveDadosPessoais}
                          disabled={loading}
                          className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Salvando...
                            </div>
                          ) : (
                            'Salvar Alterações'
                          )}
                        </Button>

                        <Button
                          onClick={handleCancel}
                          disabled={loading}
                          variant="outline"
                          className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Cancelar
                        </Button>
                      </div>

                      {/* Mensagem de sucesso */}
                      {successMessage && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                          {successMessage}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Aba de Dados Profissionais */}
                <TabsContent value="profissional">
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle>Dados Profissionais</CardTitle>
                      <CardDescription>Atualize suas informações profissionais</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {validationErrors.form && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                          {validationErrors.form}
                        </div>
                      )}

                      {/* Função */}
                      <div className="space-y-2">
                        <Label htmlFor="funcao" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Função/Especialidade *
                        </Label>
                        <select
                          id="funcao"
                          name="funcao"
                          value={dadosProfissionais.funcao}
                          onChange={handleDadosProfissionaisChange}
                          className={`w-full rounded-md border ${validationErrors.funcao ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ED4231]`}
                        >
                          {!dadosProfissionais.funcao && <option value="">Selecione uma especialidade</option>}
                          <option value="JURIDICA">Jurídica</option>
                          <option value="PSICOLOGIA">Psicologia</option>
                          <option value="PSICOPEDAGOGIA">Psicopedagogia</option>
                          <option value="CONTABIL">Contábil</option>
                          <option value="FINANCEIRA">Financeira</option>
                          <option value="PEDIATRIA">Pediatria</option>
                          <option value="FISIOTERAPIA">Fisioterapia</option>
                          <option value="QUIROPRAXIA">Quiropraxia</option>
                          <option value="NUTRICAO">Nutrição</option>
                        </select>
                        {validationErrors.funcao && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.funcao}</p>
                        )}
                      </div>

                      {/* Registro Profissional */}
                      <div className="space-y-2">
                        <Label htmlFor="registroProfissional" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Registro Profissional *
                        </Label>
                        <Input
                          id="registroProfissional"
                          name="registroProfissional"
                          type="text"
                          value={dadosProfissionais.registroProfissional}
                          onChange={handleDadosProfissionaisChange}
                          className={`w-full ${validationErrors.registroProfissional ? 'border-red-500' : ''}`}
                          placeholder="Ex: CRP 12345/SP, CRM 67890/RJ"
                        />
                        {validationErrors.registroProfissional && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.registroProfissional}</p>
                        )}
                      </div>

                      {/* Biografia Profissional */}
                      <div className="space-y-2">
                        <Label htmlFor="biografiaProfissional" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Biografia Profissional
                        </Label>
                        <textarea
                          id="biografiaProfissional"
                          name="biografiaProfissional"
                          value={dadosProfissionais.biografiaProfissional}
                          onChange={handleDadosProfissionaisChange}
                          rows={4}
                          className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ED4231] resize-vertical min-h-[100px]"
                          placeholder="Descreva sua experiência profissional, formação, especializações..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Conte um pouco sobre sua formação e experiência profissional (opcional)
                        </p>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={handleSaveDadosProfissionais}
                          disabled={loading}
                          className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Salvando...
                            </div>
                          ) : (
                            'Salvar Dados Profissionais'
                          )}
                        </Button>

                        <Button
                          onClick={handleCancel}
                          disabled={loading}
                          variant="outline"
                          className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Cancelar
                        </Button>
                      </div>

                      {/* Mensagem de sucesso */}
                      {successMessage && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                          {successMessage}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Aba de Endereço */}
                <TabsContent value="endereco">
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle>Endereço</CardTitle>
                      <CardDescription>Atualize seu endereço pessoal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {validationErrors.form && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                          {validationErrors.form}
                        </div>
                      )}

                      {/* CEP */}
                      <div className="space-y-2">
                        <Label htmlFor="cep" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          CEP *
                        </Label>
                        <div className="relative">
                          <Input 
                            id="cep" 
                            name="cep" 
                            value={endereco.cep} 
                            onChange={handleEnderecoChange}
                            onBlur={handleEnderecoCepBlur}
                            placeholder="00000-000"
                            maxLength={9}
                            className={`w-full ${validationErrors.cep ? 'border-red-500' : ''}`}
                          />
                          {loadingCep && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="animate-spin h-4 w-4 border-2 border-[#ED4231] border-t-transparent rounded-full"></div>
                            </div>
                          )}
                        </div>
                        {validationErrors.cep && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.cep}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">Digite o CEP para preencher o endereço automaticamente</p>
                      </div>

                      {/* Rua e Número */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="rua" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Rua *
                          </Label>
                          <Input 
                            id="rua" 
                            name="rua" 
                            value={endereco.logradouro} 
                            onChange={handleEnderecoChange}
                            className={`w-full ${validationErrors.rua ? 'border-red-500' : ''}`}
                            placeholder="Digite o nome da rua"
                          />
                          {validationErrors.rua && (
                            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.rua}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numero" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Número *
                          </Label>
                          <Input 
                            id="numero" 
                            name="numero" 
                            value={endereco.numero} 
                            onChange={handleEnderecoChange}
                            className={`w-full ${validationErrors.numero ? 'border-red-500' : ''}`}
                            placeholder="Nº"
                          />
                          {validationErrors.numero && (
                            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.numero}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Complemento */}
                      <div className="space-y-2">
                        <Label htmlFor="complemento" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Complemento
                        </Label>
                        <Input 
                          id="complemento" 
                          name="complemento" 
                          value={endereco.complemento} 
                          onChange={handleEnderecoChange}
                          className="w-full"
                          placeholder="Apartamento, bloco, etc. (opcional)"
                        />
                      </div>
                      
                      {/* Bairro */}
                      <div className="space-y-2">
                        <Label htmlFor="bairro" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bairro *
                        </Label>
                        <Input 
                          id="bairro" 
                          name="bairro" 
                          value={endereco.bairro} 
                          onChange={handleEnderecoChange}
                          className={`w-full ${validationErrors.bairro ? 'border-red-500' : ''}`}
                          placeholder="Digite o bairro"
                        />
                        {validationErrors.bairro && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.bairro}</p>
                        )}
                      </div>
                      
                      {/* Cidade e Estado */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cidade" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cidade *
                          </Label>
                          <Input 
                            id="cidade" 
                            name="cidade" 
                            value={endereco.cidade} 
                            onChange={handleEnderecoChange}
                            className={`w-full ${validationErrors.cidade ? 'border-red-500' : ''}`}
                            placeholder="Digite a cidade"
                          />
                          {validationErrors.cidade && (
                            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.cidade}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estado" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Estado *
                          </Label>
                          <Input 
                            id="estado" 
                            name="estado" 
                            value={endereco.uf} 
                            onChange={handleEnderecoChange}
                            className={`w-full ${validationErrors.uf ? 'border-red-500' : ''}`}
                            placeholder="Digite o estado"
                          />
                          {validationErrors.uf && (
                            <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.estado}</p>
                          )}
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={handleSaveEndereco}
                          disabled={loading}
                          className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Salvando...
                            </div>
                          ) : (
                            'Salvar Endereço'
                          )}
                        </Button>

                        <Button
                          onClick={handleCancel}
                          disabled={loading}
                          variant="outline"
                          className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Cancelar
                        </Button>
                      </div>

                      {/* Mensagem de sucesso */}
                      {successMessage && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                          {successMessage}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Aba de Disponibilidade */}
                <TabsContent value="disponibilidade">
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle>Disponibilidade de Atendimento</CardTitle>
                      <CardDescription>Configure sua disponibilidade semanal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="py-2 px-4 text-left"></th>
                              <th className="py-2 px-4 text-center">Manhã<br/><span className="text-xs text-gray-500">(08:00 - 12:00)</span></th>
                              <th className="py-2 px-4 text-center">Tarde<br/><span className="text-xs text-gray-500">(13:00 - 17:00)</span></th>
                              <th className="py-2 px-4 text-center">Noite<br/><span className="text-xs text-gray-500">(18:00 - 22:00)</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(disponibilidade).map(([dia, periodos]) => {
                              const diaNome = {
                                segunda: "Segunda-feira", 
                                terca: "Terça-feira", 
                                quarta: "Quarta-feira", 
                                quinta: "Quinta-feira", 
                                sexta: "Sexta-feira", 
                                sabado: "Sábado", 
                                domingo: "Domingo"
                              }[dia];
                              
                              return (
                                <tr key={dia} className="border-t border-gray-200 dark:border-gray-700">
                                  <td className="py-3 px-4 font-medium">{diaNome}</td>
                                  {Object.entries(periodos).map(([periodo, checked]) => (
                                    <td key={periodo} className="py-3 px-4 text-center">
                                      <label className="inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => handleDisponibilidadeChange(dia, periodo)}
                                          className="form-checkbox h-5 w-5 text-[#ED4231] rounded border-gray-300 focus:ring-[#ED4231]"
                                        />
                                      </label>
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Observações sobre sua disponibilidade:</h4>
                        <textarea 
                          value={formData.observacoesDisponibilidade || ''} 
                          onChange={(e) => {
                            setFormChanged(true);
                            setFormData(prev => ({ ...prev, observacoesDisponibilidade: e.target.value }));
                          }}
                          className="w-full min-h-[100px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm"
                          placeholder="Adicione observações sobre sua disponibilidade, como férias previstas, restrições de horário, etc."
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handleCancel} 
                        disabled={loading || (!formChanged && !selectedImage)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} disabled={loading} className="ml-auto bg-[#ED4231] hover:bg-[#d53a2a]">
                        {loading ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Aba de Foto de Perfil */}
                <TabsContent value="foto">
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle>Foto de Perfil</CardTitle>
                      <CardDescription>Atualize sua foto de perfil profissional</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#EDF2FB] dark:border-[#23272F] shadow-lg">
                          {(imagePreview || (profileImage && profileImage !== 'undefined' && profileImage !== '')) ? (
                            <img 
                              src={imagePreview || profileImage}
                              alt="Foto de perfil" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Erro ao carregar imagem de perfil:', e);
                                // Em caso de erro, mostrar avatar com iniciais
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <ProfileAvatar 
                              profileImage=""
                              name={`${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() || 'Voluntário'}
                              size="w-40 h-40"
                              className="text-4xl"
                            />
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center gap-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label 
                                htmlFor="photo-upload"
                                className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                              >
                                Escolher Foto
                              </Label>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Clique para selecionar uma nova foto de perfil</p>
                            </TooltipContent>
                          </Tooltip>
                          <Input 
                            id="photo-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Formatos suportados: JPG, PNG<br/>
                            Tamanho máximo: 5MB
                          </p>
                        </div>
                      </div>

                      {/* Mensagem de sucesso */}
                      {successMessage && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg mt-6">
                          {successMessage}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handleCancel} 
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSavePhoto} 
                        disabled={loading || !selectedImage} 
                        className="bg-[#ED4231] hover:bg-[#d53a2a]"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </div>
                        ) : (
                          "Salvar Foto"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>        </main>
      </div>
      
      {/* Modal para configurar horários específicos */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Horário Específico</DialogTitle>
            <DialogDescription>
              Você marcou como disponível no período da {modalData.periodo} de {modalData.dia}-feira. 
              Há algum horário específico deste período que você NÃO atende?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="horarios-especificos">
                Horários que você NÃO atende (opcional)
              </Label>
              <textarea
                id="horarios-especificos"
                value={horariosEspecificos}
                onChange={(e) => setHorariosEspecificos(e.target.value)}
                placeholder="Ex: 08:00-09:00, 11:30-12:00"
                className="w-full min-h-[80px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ED4231]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Digite os horários que você não atende neste período, separados por vírgula.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmarDisponibilidade}
                className="bg-[#ED4231] hover:bg-[#d53a2a]"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ProfileForm;