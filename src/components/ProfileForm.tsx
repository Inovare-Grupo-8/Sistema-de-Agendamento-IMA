import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Sun,
  Moon,
  ArrowLeft,
  Home as HomeIcon,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCep } from "@/hooks/useCep";
import {
  useVoluntario,
  DadosPessoaisVoluntario,
  DadosProfissionaisVoluntario,
  EnderecoVoluntario,
} from "@/hooks/useVoluntario";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { professionalNavigationItems } from "@/utils/userNavigation";

const getProfessionalNavigationPath = (currentPath: string) => {
  const pathLabels: Record<string, string> = {
    "/home": "Home",
    "/agenda": "Agenda",
    "/historico": "Histórico",
    "/disponibilizar-horario": "Disponibilizar Horário",
    "/profile-form": "Editar Perfil",
  };

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
      <Link
        to="/home"
        className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
      >
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
  const { fetchAddressByCep, formatCep } = useCep();

  const {
    buscarDadosPessoais,
    atualizarDadosPessoais,
    buscarDadosProfissionais,
    atualizarDadosProfissionais,
    buscarEndereco,
    atualizarEndereco,
    mapEnumToText,
    uploadFoto,
    clearCache,
  } = useVoluntario();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [funcaoVoluntario, setFuncaoVoluntario] = useState<string>("");
  const [initialLoading, setInitialLoading] = useState(true);

  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoaisVoluntario>({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
  });

  const [dadosProfissionais, setDadosProfissionais] =
    useState<DadosProfissionaisVoluntario>({
      funcao: "",
      registroProfissional: "",
      biografiaProfissional: "",
    });

  const [endereco, setEndereco] = useState<EnderecoVoluntario>({
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Carregar dados
  const loadProfileData = useCallback(async () => {
    try {
      setInitialLoading(true);

      const dados = await buscarDadosPessoais();
      if (dados) setDadosPessoais(dados);

      try {
        const dadosProf = await buscarDadosProfissionais();
        if (dadosProf) {
          setDadosProfissionais(dadosProf);
          setFuncaoVoluntario(mapEnumToText(dadosProf.funcao));
        }
      } catch (error) {
        console.log("Dados profissionais não encontrados");
      }

      try {
        const enderecoData = await buscarEndereco();
        if (enderecoData) setEndereco(enderecoData);
      } catch (error) {
        console.log("Endereço não encontrado");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do perfil.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  }, [
    buscarDadosPessoais,
    buscarDadosProfissionais,
    buscarEndereco,
    mapEnumToText,
  ]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Validações
  const validateDadosPessoais = (): boolean => {
    const errors: Record<string, string> = {};

    if (!dadosPessoais.email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(dadosPessoais.email)) {
      errors.email = "Email inválido";
    }
    if (!dadosPessoais.telefone.trim()) {
      errors.telefone = "Telefone é obrigatório";
    } else if (dadosPessoais.telefone.replace(/\D/g, "").length !== 11) {
      errors.telefone = "Telefone deve ter 11 dígitos";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDadosProfissionais = (): boolean => {
    const errors: Record<string, string> = {};
    if (!dadosProfissionais.funcao.trim())
      errors.funcao = "Função é obrigatória";
    if (!dadosProfissionais.registroProfissional.trim())
      errors.registroProfissional = "Registro é obrigatório";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEndereco = (): boolean => {
    const errors: Record<string, string> = {};
    if (!endereco.cep.trim()) errors.cep = "CEP é obrigatório";
    if (!endereco.logradouro.trim())
      errors.logradouro = "Logradouro é obrigatório";
    if (!endereco.numero.trim()) errors.numero = "Número é obrigatório";
    if (!endereco.bairro.trim()) errors.bairro = "Bairro é obrigatório";
    if (!endereco.cidade.trim()) errors.cidade = "Cidade é obrigatória";
    if (!endereco.uf.trim()) errors.uf = "UF é obrigatória";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleDadosPessoaisChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setDadosPessoais((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDadosProfissionaisChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setDadosProfissionais((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = name === "cep" ? formatCep(value) : value;
    setEndereco((prev) => ({ ...prev, [name]: formattedValue }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    if (!cep || cep.replace(/\D/g, "").length < 8) return;

    const enderecoData = await fetchAddressByCep(cep);
    if (enderecoData) {
      setEndereco((prev) => ({
        ...prev,
        logradouro: enderecoData.rua || "",
        bairro: enderecoData.bairro || "",
        cidade: enderecoData.cidade || "",
        uf: enderecoData.estado || "",
        cep: enderecoData.cep || "",
      }));
      toast({
        title: "Endereço encontrado",
        description: "Campos preenchidos automaticamente.",
      });
    }
  };

  // Save handlers
  const handleSaveDadosPessoais = async () => {
    if (!validateDadosPessoais()) {
      toast({
        title: "Erros no formulário",
        description: "Corrija os erros antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await atualizarDadosPessoais(dadosPessoais);
      toast({
        title: "Dados atualizados",
        description: "Seus dados pessoais foram atualizados com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDadosProfissionais = async () => {
    if (!validateDadosProfissionais()) {
      toast({
        title: "Erros no formulário",
        description: "Corrija os erros antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await atualizarDadosProfissionais(dadosProfissionais);
      setFuncaoVoluntario(mapEnumToText(dadosProfissionais.funcao));
      toast({
        title: "Dados profissionais atualizados",
        description: "Suas informações foram atualizadas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar seus dados profissionais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEndereco = async () => {
    if (!validateEndereco()) {
      toast({
        title: "Erros no formulário",
        description: "Corrija os erros antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await atualizarEndereco(endereco);
      toast({
        title: "Endereço atualizado",
        description: "Seu endereço foi atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar seu endereço.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedImage) {
      toast({
        title: "Nenhuma foto selecionada",
        description: "Selecione uma foto para atualizar.",
        variant: "default",
      });
      return;
    }

    setLoading(true);
    try {
      const photoUrl = await uploadFoto(selectedImage);
      setProfileImage(photoUrl);
      setSelectedImage(null);
      setImagePreview(null);
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      });

      setTimeout(() => {
        window.location.reload();
      }, 150);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao atualizar foto",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    clearCache(); // Limpar cache para forçar recarga
    loadProfileData();
    setSelectedImage(null);
    setImagePreview(null);
    setValidationErrors({});
    toast({
      title: "Alterações descartadas",
      description: "Os dados foram recarregados.",
    });
  };

  if (initialLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED4231] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Carregando dados...
            </p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
        {/* Sidebar */}
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-gray-900/90 shadow-md backdrop-blur-md">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full bg-primary text-white"
              aria-label="Abrir menu"
            >
              <Menu className="w-7 h-7" />
            </Button>
            <ProfileAvatar
              profileImage={profileImage}
              name={
                `${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() ||
                "Voluntário"
              }
              size="w-10 h-10"
              className="border-2 border-primary"
            />
            <span className="font-extrabold text-foreground">
              {dadosPessoais.nome} {dadosPessoais.sobrenome}
            </span>
          </div>
        )}

        <div
          className={`transition-all duration-500 ease-in-out ${
            sidebarOpen
              ? "opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72"
              : "opacity-0 -translate-x-full w-0"
          } bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F]`}
        >
          <div className="w-full flex justify-start mb-6">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full bg-[#ED4231] text-white"
            >
              <Menu className="w-7 h-7" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar
              profileImage={profileImage}
              name={
                `${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() ||
                "Voluntário"
              }
              size="w-16 h-16"
              className="border-4 border-[#EDF2FB]"
            />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100">
              {dadosPessoais.nome} {dadosPessoais.sobrenome}
            </span>
            {funcaoVoluntario && (
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                {funcaoVoluntario}
              </Badge>
            )}
          </div>

          <SidebarMenu className="gap-4">
            {Object.values(professionalNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className={`rounded-xl px-4 py-3 transition-all duration-300 hover:bg-[#ED4231]/20 ${
                        location.pathname === item.path
                          ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-[#ED4231]"
                          : ""
                      }`}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}

            {/* Botão de Sair */}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => {
                      localStorage.clear();
                      navigate("/");
                    }}
                    className="rounded-xl px-4 py-3 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-[#ED4231] flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent>Sair da conta</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="mt-auto text-center text-xs text-gray-400 pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
            <p>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</p>
          </div>
        </div>

        {/* Main Content */}
        <main
          className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 px-2 md:px-0 ${
            sidebarOpen ? "" : "ml-0"
          }`}
        >
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ProfileAvatar
                profileImage={profileImage}
                name={
                  `${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() ||
                  "Voluntário"
                }
                size="w-10 h-10"
                className="border-2 border-primary"
              />
              <span className="font-extrabold text-foreground">
                {dadosPessoais.nome} {dadosPessoais.sobrenome}
              </span>
            </div>

            <Button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-800" />
              )}
            </Button>
          </header>

          <div className="pt-20 md:pt-24 min-h-screen">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
              {getProfessionalNavigationPath(location.pathname)}

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
                  <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100">
                    Editar Perfil
                  </h1>
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    Atualize suas informações profissionais
                  </p>
                </div>
              </div>

              <Tabs defaultValue="pessoal" className="w-full">
                <TabsList className="mb-6 flex flex-wrap md:flex-nowrap w-full gap-2 md:gap-0">
                  <TabsTrigger value="pessoal" className="flex-1">
                    Dados Pessoais
                  </TabsTrigger>
                  <TabsTrigger value="profissional" className="flex-1">
                    Dados Profissionais
                  </TabsTrigger>
                  <TabsTrigger value="endereco" className="flex-1">
                    Endereço
                  </TabsTrigger>
                  <TabsTrigger value="foto" className="flex-1">
                    Foto de Perfil
                  </TabsTrigger>
                </TabsList>

                {/* Aba Dados Pessoais */}
                <TabsContent value="pessoal">
                  <Card className="bg-white dark:bg-[#23272F]">
                    <CardHeader>
                      <CardTitle>Dados Pessoais</CardTitle>
                      <CardDescription>
                        Atualize suas informações pessoais
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome"
                            name="nome"
                            value={dadosPessoais.nome}
                            disabled
                            className={`${
                              validationErrors.nome ? "border-red-500" : ""
                            } opacity-70 cursor-not-allowed`}
                            placeholder="Nome não pode ser alterado"
                          />
                          {validationErrors.nome && (
                            <p className="text-xs text-red-500">
                              {validationErrors.nome}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sobrenome">Sobrenome *</Label>
                          <Input
                            id="sobrenome"
                            name="sobrenome"
                            value={dadosPessoais.sobrenome}
                            disabled
                            className={`${
                              validationErrors.sobrenome ? "border-red-500" : ""
                            } opacity-70 cursor-not-allowed`}
                            placeholder="Sobrenome não pode ser alterado"
                          />
                          {validationErrors.sobrenome && (
                            <p className="text-xs text-red-500">
                              {validationErrors.sobrenome}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={dadosPessoais.email}
                          onChange={handleDadosPessoaisChange}
                          onInput={handleDadosPessoaisChange}
                          autoComplete="off"
                          className={
                            validationErrors.email ? "border-red-500" : ""
                          }
                          placeholder="Digite seu email"
                        />
                        {validationErrors.email && (
                          <p className="text-xs text-red-500">
                            {validationErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          type="tel"
                          value={dadosPessoais.telefone}
                          onChange={handleDadosPessoaisChange}
                          onInput={handleDadosPessoaisChange}
                          autoComplete="off"
                          className={
                            validationErrors.telefone ? "border-red-500" : ""
                          }
                          placeholder="(11) 98765-4321"
                        />
                        {validationErrors.telefone && (
                          <p className="text-xs text-red-500">
                            {validationErrors.telefone}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dataNascimento">
                          Data de Nascimento *
                        </Label>
                        <Input
                          id="dataNascimento"
                          name="dataNascimento"
                          type="date"
                          value={dadosPessoais.dataNascimento}
                          disabled
                          className={`${
                            validationErrors.dataNascimento
                              ? "border-red-500"
                              : ""
                          } opacity-70 cursor-not-allowed`}
                        />
                        {validationErrors.dataNascimento && (
                          <p className="text-xs text-red-500">
                            {validationErrors.dataNascimento}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                      <Button
                        onClick={handleSaveDadosPessoais}
                        disabled={loading}
                        className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90"
                      >
                        {loading ? "Salvando..." : "Salvar Dados Pessoais"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Aba Dados Profissionais */}
                <TabsContent value="profissional">
                  <Card className="bg-white dark:bg-[#23272F]">
                    <CardHeader>
                      <CardTitle>Dados Profissionais</CardTitle>
                      <CardDescription>
                        Atualize suas informações profissionais
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="funcao">Função/Especialidade *</Label>
                        <select
                          id="funcao"
                          name="funcao"
                          value={dadosProfissionais.funcao}
                          onChange={handleDadosProfissionaisChange}
                          onInput={handleDadosProfissionaisChange}
                          className={`w-full rounded-md border ${
                            validationErrors.funcao
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          } bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ED4231]`}
                        >
                          <option value="">Selecione uma função</option>
                          <option value="PSICOLOGIA">Psicologia</option>
                          <option value="ASSISTENCIA_SOCIAL">
                            Assistência Social
                          </option>
                          <option value="PSICOPEDAGOGIA">Psicopedagogia</option>
                          <option value="FONOAUDIOLOGIA">Fonoaudiologia</option>
                          <option value="FISIOTERAPIA">Fisioterapia</option>
                          <option value="NUTRICAO">Nutrição</option>
                          <option value="PEDIATRIA">Pediatria</option>
                          <option value="QUIROPRAXIA">Quiropraxia</option>
                          <option value="JURIDICA">Jurídica</option>
                          <option value="CONTABIL">Contábil</option>
                          <option value="FINANCEIRA">Financeira</option>
                        </select>
                        {validationErrors.funcao && (
                          <p className="text-xs text-red-500">
                            {validationErrors.funcao}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registroProfissional">
                          Registro Profissional *
                        </Label>
                        <Input
                          id="registroProfissional"
                          name="registroProfissional"
                          value={dadosProfissionais.registroProfissional}
                          onChange={handleDadosProfissionaisChange}
                          onInput={handleDadosProfissionaisChange}
                          className={
                            validationErrors.registroProfissional
                              ? "border-red-500"
                              : ""
                          }
                          placeholder="Ex: CRP 12345/SP"
                        />
                        {validationErrors.registroProfissional && (
                          <p className="text-xs text-red-500">
                            {validationErrors.registroProfissional}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="biografiaProfissional">
                          Biografia Profissional
                        </Label>
                        <textarea
                          id="biografiaProfissional"
                          name="biografiaProfissional"
                          value={dadosProfissionais.biografiaProfissional}
                          onChange={handleDadosProfissionaisChange}
                          onInput={handleDadosProfissionaisChange}
                          rows={4}
                          className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ED4231] resize-vertical min-h-[100px]"
                          placeholder="Descreva sua experiência profissional..."
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                      <Button
                        onClick={handleSaveDadosProfissionais}
                        disabled={loading}
                        className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90"
                      >
                        {loading ? "Salvando..." : "Salvar Dados Profissionais"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Aba Endereço */}
                <TabsContent value="endereco">
                  <Card className="bg-white dark:bg-[#23272F]">
                    <CardHeader>
                      <CardTitle>Endereço</CardTitle>
                      <CardDescription>Atualize seu endereço</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP *</Label>
                        <Input
                          id="cep"
                          name="cep"
                          value={endereco.cep}
                          onChange={handleEnderecoChange}
                          onInput={handleEnderecoChange}
                          onBlur={handleCepBlur}
                          className={
                            validationErrors.cep ? "border-red-500" : ""
                          }
                          placeholder="00000-000"
                          maxLength={9}
                        />
                        {validationErrors.cep && (
                          <p className="text-xs text-red-500">
                            {validationErrors.cep}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Digite o CEP para preencher automaticamente
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="logradouro">Logradouro *</Label>
                          <Input
                            id="logradouro"
                            name="logradouro"
                            value={endereco.logradouro}
                            onChange={handleEnderecoChange}
                            onInput={handleEnderecoChange}
                            className={
                              validationErrors.logradouro
                                ? "border-red-500"
                                : ""
                            }
                            placeholder="Rua, Avenida..."
                          />
                          {validationErrors.logradouro && (
                            <p className="text-xs text-red-500">
                              {validationErrors.logradouro}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numero">Número *</Label>
                          <Input
                            id="numero"
                            name="numero"
                            value={endereco.numero}
                            onChange={handleEnderecoChange}
                            onInput={handleEnderecoChange}
                            className={
                              validationErrors.numero ? "border-red-500" : ""
                            }
                            placeholder="Nº"
                          />
                          {validationErrors.numero && (
                            <p className="text-xs text-red-500">
                              {validationErrors.numero}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input
                          id="complemento"
                          name="complemento"
                          value={endereco.complemento}
                          onChange={handleEnderecoChange}
                          onInput={handleEnderecoChange}
                          placeholder="Apto, Bloco... (opcional)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro *</Label>
                        <Input
                          id="bairro"
                          name="bairro"
                          value={endereco.bairro}
                          onChange={handleEnderecoChange}
                          onInput={handleEnderecoChange}
                          className={
                            validationErrors.bairro ? "border-red-500" : ""
                          }
                          placeholder="Digite o bairro"
                        />
                        {validationErrors.bairro && (
                          <p className="text-xs text-red-500">
                            {validationErrors.bairro}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cidade">Cidade *</Label>
                          <Input
                            id="cidade"
                            name="cidade"
                            value={endereco.cidade}
                            onChange={handleEnderecoChange}
                            onInput={handleEnderecoChange}
                            className={
                              validationErrors.cidade ? "border-red-500" : ""
                            }
                            placeholder="Digite a cidade"
                          />
                          {validationErrors.cidade && (
                            <p className="text-xs text-red-500">
                              {validationErrors.cidade}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="uf">UF *</Label>
                          <Input
                            id="uf"
                            name="uf"
                            value={endereco.uf}
                            onChange={handleEnderecoChange}
                            onInput={handleEnderecoChange}
                            className={
                              validationErrors.uf ? "border-red-500" : ""
                            }
                            placeholder="SP"
                            maxLength={2}
                          />
                          {validationErrors.uf && (
                            <p className="text-xs text-red-500">
                              {validationErrors.uf}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                      <Button
                        onClick={handleSaveEndereco}
                        disabled={loading}
                        className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90"
                      >
                        {loading ? "Salvando..." : "Salvar Endereço"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Aba Foto de Perfil */}
                <TabsContent value="foto">
                  <Card className="bg-white dark:bg-[#23272F]">
                    <CardHeader>
                      <CardTitle>Foto de Perfil</CardTitle>
                      <CardDescription>
                        Atualize sua foto de perfil profissional
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <ProfileAvatar
                            profileImage={imagePreview || profileImage}
                            name={
                              `${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() ||
                              "Voluntário"
                            }
                            size="w-32 h-32"
                            className="border-4 border-[#ED4231]"
                          />
                        </div>

                        <div className="w-full max-w-md">
                          <Label
                            htmlFor="photo-upload"
                            className="flex items-center justify-center w-full px-4 py-2 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Clique para selecionar uma foto
                            </span>
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </Label>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                      <Button
                        onClick={handleSavePhoto}
                        disabled={loading || !selectedImage}
                        className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90"
                      >
                        {loading ? "Enviando..." : "Salvar Foto"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProfileForm;
