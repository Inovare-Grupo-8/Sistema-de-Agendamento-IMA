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
  Calendar as CalendarIcon,
  User,
  Clock,
  Menu,
  History,
  Calendar,
  Sun,
  Moon,
  Home as HomeIcon,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { userNavigationItems } from "@/utils/userNavigation";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import { getUserNavigationPath } from "@/utils/userNavigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCep } from "@/hooks/useCep";
import { useUserData } from "@/hooks/useUserData";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { Endereco } from "@/hooks/useUserProfile";
import { isPhone, formatters } from "@/utils/validation";
import { LetterAvatar } from "@/components/ui/LetterAvatar";

const ProfileFormUser = () => {
  // Interceptar mudanças de location para detectar redirecionamentos
  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      console.log("🌍 [ProfileForm] DEBUG: history.pushState chamado:", args);
      console.log("🌍 [ProfileForm] DEBUG: Stack trace:", new Error().stack);
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      console.log(
        "🌍 [ProfileForm] DEBUG: history.replaceState chamado:",
        args
      );
      console.log("🌍 [ProfileForm] DEBUG: Stack trace:", new Error().stack);
      return originalReplaceState.apply(this, args);
    };

    // Interceptar popstate (botão voltar/avançar)
    const handlePopState = (event: PopStateEvent) => {
      console.log("🔙 [ProfileForm] DEBUG: popstate event detectado:", event);
      console.log("🔙 [ProfileForm] DEBUG: Nova URL:", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profileImage, setProfileImage, refreshImageFromStorage } =
    useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const { fetchAddressByCep, loading: loadingCep, formatCep } = useCep();

  // Estado para o modal de logout
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Get user data and setter from the hook
  const { userData, setUserData } = useUserData();
  const fullName = [userData?.nome, userData?.sobrenome].filter(Boolean).join(" ");
  const displayName = fullName || "Usuário";
  // Use the new useUserProfile hook
  const {
    fetchPerfil,
    atualizarDadosPessoais,
    atualizarEndereco,
    uploadFoto,
    buscarEndereco,
  } = useUserProfile(); // Estado para o formulário - inicializar com valores padrão seguros
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    genero: "",
    endereco: {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [successMessage, setSuccessMessage] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  // Base classes centralize input colors across light and dark themes
  const inputBaseClasses =
    "bg-[#F8FBFF] border-[#D7E3FF] text-[#1B2559] placeholder:text-[#7C8AA8] focus-visible:ring-[#ED4231]/80 focus-visible:border-[#ED4231] focus-visible:ring-offset-2 dark:bg-[#1F2330] dark:border-[#343B4A] dark:text-gray-100 dark:placeholder:text-gray-400 transition-colors disabled:bg-[#E6ECFF] dark:disabled:bg-[#2A3142] disabled:text-[#7C8AA8] dark:disabled:text-gray-500";

  const loadProfileData = useCallback(async () => {
    console.log("🟢 [ProfileForm] DEBUG: loadProfileData iniciado");
    console.log("🟢 [ProfileForm] DEBUG: URL atual:", window.location.href);
    console.log("🟢 [ProfileForm] DEBUG: Timestamp:", new Date().toISOString());

    try {
      setInitialLoading(true);

      // Verificar se o usuário está logado antes de fazer chamadas à API
      const userData = localStorage.getItem("userData");
      console.log(
        "🔍 Debug ProfileFormUser - userData do localStorage:",
        userData
      );

      if (!userData) {
        console.warn(
          "⚠️ [ProfileForm] DEBUG: Usuário não logado - userData não encontrado."
        );
        console.log(
          "🔍 [ProfileForm] DEBUG: localStorage completo:",
          Object.keys(localStorage)
        );
        return;
      }
      try {
        const parsedData = JSON.parse(userData);
        console.log("🔍 [ProfileForm] DEBUG: userData parsed:", {
          hasIdUsuario: !!parsedData.idUsuario,
          hasToken: !!parsedData.token,
          tokenLength: parsedData.token?.length || 0,
          idUsuario: parsedData.idUsuario,
        });

        if (!parsedData.idUsuario || !parsedData.token) {
          console.warn("⚠️ [ProfileForm] DEBUG: Dados do usuário incompletos.");
          console.log(
            "🔍 [ProfileForm] DEBUG: parsedData structure:",
            Object.keys(parsedData)
          );
          return;
        }
      } catch (parseError) {
        console.error(
          "❌ [ProfileForm] DEBUG: Erro ao fazer parse do userData:",
          parseError
        );
        console.log("🔍 [ProfileForm] DEBUG: userData raw:", userData);
        return;
      }
      const dadosPessoais = await fetchPerfil();
      const endereco = await buscarEndereco();

      console.log(
        "🔍 Debug ProfileFormUser - dadosPessoais recebidos:",
        dadosPessoais
      );
      console.log("🔍 Debug ProfileFormUser - endereco recebido:", endereco);
      console.log(
        "🔍 Debug ProfileFormUser - telefone específico:",
        dadosPessoais?.telefone
      );

      const perfilCompleto = {
        nome: dadosPessoais?.nome || "",
        sobrenome: dadosPessoais?.sobrenome || "",
        email: dadosPessoais?.email || "",
        telefone: dadosPessoais?.telefone || "",
        dataNascimento: dadosPessoais?.dataNascimento || "",
        genero: dadosPessoais?.genero || "",
        endereco: {
          cep: endereco?.cep || "",
          rua: endereco?.rua || "",
          numero: endereco?.numero || "",
          complemento: endereco?.complemento || "",
          bairro: endereco?.bairro || "",
          cidade: endereco?.cidade || "",
          estado: endereco?.estado || "",
        },
      };

      console.log(
        "🔍 Debug ProfileFormUser - perfilCompleto montado:",
        perfilCompleto
      );
      console.log(
        "🔍 Debug ProfileFormUser - telefone no perfilCompleto:",
        perfilCompleto.telefone
      );

      console.log(
        "✅ [ProfileForm] DEBUG: Perfil completo montado, atualizando estados..."
      );
      setFormData(perfilCompleto);
      setUserData(perfilCompleto);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);

      // Não mostrar toast de erro se for uma questão de autenticação

      if (error instanceof Error && error.message.includes("Token inválido")) {
        console.warn(
          "⚠️ [ProfileForm] DEBUG: Erro de autenticação detectado - token inválido"
        );
        console.log(
          "🔍 [ProfileForm] DEBUG: Verificando se deve redirecionar..."
        );
        console.log(
          "🔍 [ProfileForm] DEBUG: URL atual antes do erro:",
          window.location.pathname
        );

        // Verificar se já estamos sendo redirecionados
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          console.log(
            "🚨 [ProfileForm] DEBUG: POSSÍVEL REDIRECIONAMENTO AQUI - token inválido na página:",
            currentPath
          );
        }
        return;
      }

      if (error instanceof Error && error.message.includes("conexão")) {
        console.warn("⚠️ [ProfileForm] DEBUG: Erro de conexão detectado");
        toast({
          title: "Erro de conexão",
          description:
            "Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do seu perfil.",
        variant: "destructive",
      });
    } finally {
      console.log("🏁 [ProfileForm] DEBUG: loadProfileData finalizado");
      setInitialLoading(false);
    }
  }, [buscarEndereco, fetchPerfil, setUserData]);
  useEffect(() => {
    console.log(
      "🚀 [ProfileForm] DEBUG: useEffect montado - iniciando carregamento do perfil"
    );
    console.log(
      "🚀 [ProfileForm] DEBUG: Componente montado em:",
      window.location.pathname
    );
    console.log("🚀 [ProfileForm] DEBUG: User agent:", navigator.userAgent);
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once when component mounts

  // 🔄 CORREÇÃO: Sincronizar imagem do perfil ao carregar o componente
  useEffect(() => {
    console.log(
      "🖼️ [ProfileForm] DEBUG: Sincronizando imagem do perfil ao carregar componente"
    );
    refreshImageFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once when component mounts
  // Update form data when userData changes (sync across tabs)

  useEffect(() => {
    if (!formChanged && userData && typeof userData === "object") {
      // Garantir que todos os valores são strings e não null/undefined
      const safeUserData = {
        nome: userData.nome || "",
        sobrenome: userData.sobrenome || "",
        email: userData.email || "",
        telefone: userData.telefone || "",
        dataNascimento: userData.dataNascimento || "",
        genero: userData.genero || "",
        endereco: {
          cep: userData.endereco?.cep || "",
          rua: userData.endereco?.rua || "",
          numero: userData.endereco?.numero || "",
          complemento: userData.endereco?.complemento || "",
          bairro: userData.endereco?.bairro || "",
          cidade: userData.endereco?.cidade || "",
          estado: userData.endereco?.estado || "",
        },
      };
      setFormData(safeUserData);
    }
  }, [userData, formChanged]); // Reset image error state when profile image or preview changes
  useEffect(() => {
    if (
      (profileImage && profileImage !== "undefined" && profileImage !== "") ||
      imagePreview
    ) {
      setImageError(false);
    }
  }, [profileImage, imagePreview]);
  // Função para lidar com a mudança nos campos de input
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
          cep: formattedCep,
        },
      });
      return;
    }

    // Formatação específica para telefone
    if (name === "telefone") {
      const formattedPhone = formatters.phone(value);
      setFormData({
        ...formData,
        telefone: formattedPhone,
      });
      return;
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Função específica para lidar com elementos select
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormChanged(true);
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
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
  
  // Handle logout function
  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('profileData');
    navigate('/');
    toast({
      title: "Sessão encerrada",
      description: "Você foi desconectado com sucesso.",
    });
    setShowLogoutDialog(false);
  };

  // Função para validar o formulário antes de salvar
  const validateForm = () => {
    console.log("🔍 Debug validateForm - formData:", formData);
    const errors: Record<string, string> = {};

    // Validação APENAS dos campos obrigatórios - nome, sobrenome e email
    if (!formData.nome || !formData.nome.trim()) {
      errors.nome = "Nome é obrigatório";
      console.log("🔍 Debug validateForm - Nome inválido:", formData.nome);
    }
    if (!formData.sobrenome || !formData.sobrenome.trim()) {
      errors.sobrenome = "Sobrenome é obrigatório";
      console.log(
        "🔍 Debug validateForm - Sobrenome inválido:",
        formData.sobrenome
      );
    }

    // Validação de email - campo obrigatório
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.email.trim()) {
      errors.email = "Email é obrigatório";
      console.log("🔍 Debug validateForm - Email vazio:", formData.email);
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Email inválido";
      console.log(
        "🔍 Debug validateForm - Email formato inválido:",
        formData.email
      );
    }

    // REMOVI todas as validações opcionais que estavam causando problema
    // Telefone, data de nascimento e CEP são opcionais e não devem bloquear o salvamento

    console.log("🔍 Debug validateForm - Erros encontrados:", errors);
    console.log(
      "🔍 Debug validateForm - Formulário válido?",
      Object.keys(errors).length === 0
    );

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }; // Função para salvar as alterações

  const handleSave = async () => {
    console.log("🔍 Debug handleSave - iniciando...");
    console.log("🔍 Debug handleSave - formChanged:", formChanged);

    if (!formChanged) {
      toast({
        title: "Nenhuma alteração detectada",
        description: "Altere algum campo para salvar",
        variant: "default",
      });
      return;
    }

    if (!validateForm()) {
      console.log("🔍 Debug handleSave - validação falhou");
      toast({
        title: "Formulário com erros",
        description: "Corrija os erros antes de salvar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // ✅ CORREÇÃO: Salvar dados pessoais primeiro
      const dadosPessoais = {
        nome: formData.nome || "",
        sobrenome: formData.sobrenome || "",
        email: formData.email || "",
        telefone: formData.telefone || "",
        dataNascimento: formData.dataNascimento || "",
        genero: formData.genero || "",
      };
      console.log(
        "🔍 Debug handleSave - Atualizando dados pessoais:",
        dadosPessoais
      );
      const resultadoDadosPessoais = await atualizarDadosPessoais(
        dadosPessoais
      );
      console.log(
        "✅ Debug handleSave - Dados pessoais atualizados:",
        resultadoDadosPessoais
      ); // ✅ CORREÇÃO: Verificar se há dados de endereço COMPLETOS antes de tentar salvar
      const cepLimpo = formData.endereco?.cep?.replace(/\D/g, "") || "";
      const temCepValido = cepLimpo.length === 8;
      const temNumero = formData.endereco?.numero?.trim();
      const temDadosEnderecoCompletos = temCepValido && temNumero;

      console.log("🔍 Debug handleSave - Verificação de endereço:");
      console.log("🔍 Debug handleSave - CEP limpo:", cepLimpo);
      console.log(
        "🔍 Debug handleSave - CEP válido (8 dígitos)?",
        temCepValido
      );
      console.log("🔍 Debug handleSave - Tem número?", !!temNumero);
      console.log(
        "🔍 Debug handleSave - Tem dados completos?",
        temDadosEnderecoCompletos
      );

      // ✅ SÓ tentar salvar endereço se tiver dados REALMENTE completos
      if (temDadosEnderecoCompletos) {
        console.log(
          "🔍 Debug handleSave - Dados de endereço completos encontrados, tentando salvar..."
        );
        const enderecoParaBackend: Endereco = {
          cep: cepLimpo,
          numero: temNumero.toString().trim(),
          complemento: formData.endereco.complemento?.trim() || "",
          rua: formData.endereco.rua?.trim() || "",
          bairro: formData.endereco.bairro?.trim() || "",
          cidade: formData.endereco.cidade?.trim() || "",
          estado: formData.endereco.estado?.trim() || "",
        };

        console.log(
          "🔍 Debug handleSave - Dados formatados para backend:",
          enderecoParaBackend
        );

        try {
          console.log(
            "🚀 Debug handleSave - Enviando endereço para o backend..."
          );
          await atualizarEndereco(enderecoParaBackend);
          console.log(
            "✅ Debug handleSave - Endereço atualizado com sucesso no backend"
          );
        } catch (enderecoError) {
          console.error(
            "❌ Debug handleSave - ERRO ao salvar endereço:",
            enderecoError
          );

          // ✅ Mostrar aviso mas NÃO bloquear o salvamento dos dados pessoais
          toast({
            title: "Aviso",
            description:
              "Dados pessoais salvos com sucesso, mas houve problema ao salvar o endereço. Verifique os dados do endereço.",
            variant: "default",
          });

          // ✅ NÃO retornar aqui - continuar com o sucesso dos dados pessoais
          console.log(
            "⚠️ Debug handleSave - Continuando apesar do erro no endereço..."
          );
        }
      } else {
        console.log(
          "🔍 Debug handleSave - Dados de endereço incompletos - pulando atualização de endereço"
        );
        console.log(
          "🔍 Debug handleSave - Dados pessoais serão salvos normalmente"
        );
      } // ✅ Atualizar contexto local
      const dadosParaSincronizar = {
        nome: resultadoDadosPessoais.nome || formData.nome,
        sobrenome: resultadoDadosPessoais.sobrenome || formData.sobrenome,
        email: resultadoDadosPessoais.email || formData.email,
        telefone: resultadoDadosPessoais.telefone || formData.telefone,
        dataNascimento:
          resultadoDadosPessoais.dataNascimento || formData.dataNascimento,
        genero: resultadoDadosPessoais.genero || formData.genero,
        endereco: formData.endereco,
      };

      console.log(
        "🔍 Debug handleSave - Sincronizando com contexto:",
        dadosParaSincronizar
      );
      setUserData(dadosParaSincronizar);

      // ✅ CORREÇÃO: Recarregar dados do backend para garantir sincronização
      console.log("🔄 Debug handleSave - Recarregando dados do backend...");
      try {
        await loadProfileData();
        console.log("✅ Debug handleSave - Dados recarregados com sucesso");
      } catch (reloadError) {
        console.warn(
          "⚠️ Debug handleSave - Erro ao recarregar dados (não crítico):",
          reloadError
        );
      }

      // ✅ Feedback de sucesso
      setSuccessMessage("Perfil atualizado com sucesso!");
      setFormChanged(false);
      setSelectedImage(null);
      setImagePreview(null);
      setValidationErrors({});

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });

      // Limpar mensagem após alguns segundos
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Debug handleSave - Erro:", error);
      toast({
        title: "Erro ao salvar",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }; // Função para salvar a foto de perfil
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

      console.log("🔄 [ProfileForm] DEBUG: Iniciando upload de foto...");
      console.log("🔍 [ProfileForm] DEBUG: Arquivo selecionado:", {
        name: selectedImage.name,
        size: selectedImage.size,
        type: selectedImage.type,
      });

      // Verificar conexão com o backend primeiro
      try {
        const healthCheck = await fetch(
          `${import.meta.env.VITE_URL_BACKEND}/health`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(
          "🏥 [ProfileForm] DEBUG: Health check:",
          healthCheck.status
        );
      } catch (healthError) {
        console.warn(
          "⚠️ [ProfileForm] DEBUG: Backend pode não estar rodando:",
          healthError
        );
        throw new Error(
          "Servidor não está disponível. Verifique se o backend está rodando."
        );
      }
      // Upload da foto e obter a URL
      const photoUrl = await uploadFoto(selectedImage);
      console.log("✅ [ProfileForm] DEBUG: URL da foto recebida:", photoUrl);

      // Atualizar o contexto com a nova URL da imagem do servidor
      setProfileImage(photoUrl);

      // 🔄 CORREÇÃO ADICIONAL: Forçar refresh do contexto para garantir sincronização
      setTimeout(() => {
        refreshImageFromStorage();
        console.log(
          "🔄 [ProfileForm] DEBUG: Refresh forçado do contexto de imagem"
        );
      }, 100);

      // Limpar estados locais
      setSelectedImage(null);
      setImagePreview(null);
      setFormChanged(false);

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      });

      setTimeout(() => {
        window.location.reload();
      }, 150);
    } catch (error) {
      console.error("❌ [ProfileForm] DEBUG: Erro completo no upload:", error);

      let errorMessage = "Ocorreu um erro ao atualizar sua foto de perfil.";

      if (error instanceof Error) {
        if (
          error.message.includes("servidor não está disponível") ||
          error.message.includes("conectar ao servidor")
        ) {
          errorMessage =
            "Não foi possível conectar ao servidor. Verifique se o backend está rodando e tente novamente.";
        } else if (error.message.includes("muito grande")) {
          errorMessage = error.message;
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "Erro de conexão com o servidor. Verifique sua internet e se o backend está rodando na porta 8080.";
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
  // Função para buscar endereço pelo CEP
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    if (!cep || cep.length < 8) return;

    const endereco = await fetchAddressByCep(cep);
    if (endereco) {
      console.log("🔍 Debug handleCepBlur - endereco recebido:", endereco);

      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          rua: endereco.rua,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
          cep: endereco.cep,
          // Manter número e complemento existentes
          numero: prev.endereco.numero,
          complemento: endereco.complemento || prev.endereco.complemento,
        },
      }));
      setFormChanged(true);

      toast({
        title: "Endereço encontrado",
        description: "Os campos foram preenchidos automaticamente.",
      });
    }
  };
  // Função para descartar alterações
  const handleCancel = () => {
    // Recarregando dados originais do localStorage
    const savedData = localStorage.getItem("userData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }

    // Resetando estados
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(false);
    setFormChanged(false);
    setValidationErrors({});

    toast({
      title: "Alterações descartadas",
      description: "Suas alterações foram descartadas com sucesso.",
    });
  };

  // Monitorar mudanças de localização
  useEffect(() => {
    console.log(
      "🔄 [ProfileForm] DEBUG: Localização mudou para:",
      location.pathname
    );
    console.log("🔄 [ProfileForm] DEBUG: Location state:", location.state);
  }, [location]);

  // Monitor de desmontagem do componente
  useEffect(() => {
    return () => {
      console.log(
        "🔴 [ProfileForm] DEBUG: Componente ProfileFormUser sendo desmontado"
      );
      console.log(
        "🔴 [ProfileForm] DEBUG: Timestamp da desmontagem:",
        new Date().toISOString()
      );
      console.log(
        "🔴 [ProfileForm] DEBUG: URL no momento da desmontagem:",
        window.location.href
      );
    };
  }, []); // Interceptador para monitorar todas as tentativas de navegação
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#EDF2FB] dark:bg-gradient-to-br dark:from-[#181A20] dark:via-[#23272F] dark:to-[#181A20] transition-colors duration-300 font-sans text-base">
        {" "}
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 dark:bg-[#23272F]/90 shadow-md backdrop-blur-md">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md"
              aria-label="Abrir menu lateral"
              tabIndex={0}
              title="Abrir menu lateral"
            >
              <Menu className="w-7 h-7" />
            </Button>
            <ProfileAvatar
              profileImage={profileImage}
              name={displayName}
              size="w-10 h-10"
              className="border-2 border-[#ED4231]"
            />
            <span className="font-bold text-indigo-900 dark:text-gray-100">
              {displayName}
            </span>
          </div>
        )}
        <div
          className={`transition-all duration-500 ease-in-out
          ${
            sidebarOpen
              ? "opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72"
              : "opacity-0 -translate-x-full w-0"
          }
          bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base`}
        >
          {" "}
          <div className="w-full flex justify-start mb-6">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md"
            >
              <Menu className="w-7 h-7" />
            </Button>
          </div>{" "}
          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar
              profileImage={profileImage}
              name={displayName}
              size="w-16 h-16"
              className="border-4 border-[#EDF2FB]"
            />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">
              {displayName}
            </span>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {/* Utilizando os itens de navegação do userNavigationItems */}
            {Object.values(userNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${
                        location.pathname === item.path
                          ? "bg-[#ED4231]/15 dark:bg-[#ED4231]/25 border-l-4 border-[#ED4231] text-[#ED4231] dark:text-white"
                          : ""
                      }`}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">{item.label}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 text-[#ED4231] flex items-center gap-3"
                    onClick={() => setShowLogoutDialog(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#ED4231"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9"
                      />
                    </svg>
                    <span>Sair</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Sair da conta</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
            <span>
              &copy; {new Date().getFullYear()} Desenvolvido por Inovare
            </span>
            <div className="flex gap-2">
              <a
                href="https://inovare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#ED4231]"
              >
                Site
              </a>
              <a
                href="mailto:contato@inovare.com"
                className="underline hover:text-[#ED4231]"
              >
                Contato
              </a>
            </div>
          </div>
        </div>
        <main
          id="main-content"
          role="main"
          aria-label="Conteúdo principal"
          className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${
            sidebarOpen ? "" : "ml-0"
          }`}
        >
          {" "}
          <header
            className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-[#23272F]/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md transition-colors duration-300 border-b border-[#EDF2FB] dark:border-[#23272F]"
            role="banner"
            aria-label="Cabeçalho"
          >
            <div className="flex items-center gap-3">
              <ProfileAvatar
                profileImage={profileImage}
                name={displayName}
                size="w-10 h-10"
                className="border-2 border-[#ED4231]"
              />
              <span className="font-bold text-indigo-900 dark:text-gray-100">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {" "}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                    aria-label={
                      theme === "dark"
                        ? "Ativar modo claro"
                        : "Ativar modo escuro"
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-800" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {theme === "dark"
                      ? "Mudar para modo claro"
                      : "Mudar para modo escuro"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>
          <div className="max-w-6xl mx-auto p-4 md:p-8 pt-24 md:pt-10">
            {/* Breadcrumb navigation */}
            {getUserNavigationPath(location.pathname)}

            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                {" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate("/home-user")}
                      variant="ghost"
                      className="p-2 rounded-full"
                      aria-label="Voltar"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Voltar para página inicial</p>
                  </TooltipContent>
                </Tooltip>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100">
                    Editar Perfil
                  </h1>
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    Atualize suas informações pessoais
                  </p>
                </div>
              </div>

              <Tabs defaultValue="pessoal" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="endereco">Endereço</TabsTrigger>
                  <TabsTrigger value="foto">Foto de Perfil</TabsTrigger>
                </TabsList>

                {/* Aba de Dados Pessoais */}
                <TabsContent value="pessoal">
                  <Card className="w-full bg-white dark:bg-[#23272F] border border-[#EDF2FB] dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-indigo-900 dark:text-gray-100">
                        Dados Pessoais
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Atualize suas informações pessoais
                      </CardDescription>
                    </CardHeader>{" "}
                    <CardContent className="space-y-6">
                      {initialLoading && (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED4231]"></div>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            Carregando dados...
                          </span>
                        </div>
                      )}

                      {!initialLoading && (
                        <>
                          {/* Nome e Sobrenome */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="nome"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Nome *
                              </Label>
                              <Input
                                id="nome"
                                name="nome"
                                type="text"
                                value={formData.nome}
                                disabled
                                className={`${inputBaseClasses} opacity-70 cursor-not-allowed ${
                                  validationErrors.nome
                                    ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                                    : ""
                                }`}
                                placeholder="Nome não pode ser alterado"
                              />
                              {validationErrors.nome && (
                                <span className="text-sm text-red-500">
                                  {validationErrors.nome}
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="sobrenome"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Sobrenome *
                              </Label>
                              <Input
                                id="sobrenome"
                                name="sobrenome"
                                type="text"
                                value={formData.sobrenome}
                                disabled
                                className={`${inputBaseClasses} opacity-70 cursor-not-allowed ${
                                  validationErrors.sobrenome
                                    ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                                    : ""
                                }`}
                                placeholder="Sobrenome não pode ser alterado"
                              />
                              {validationErrors.sobrenome && (
                                <span className="text-sm text-red-500">
                                  {validationErrors.sobrenome}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              E-mail *
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`${inputBaseClasses} ${
                                validationErrors.email
                                  ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                                  : ""
                              }`}
                              placeholder="Digite seu e-mail"
                            />
                            {validationErrors.email && (
                              <span className="text-sm text-red-500">
                                {validationErrors.email}
                              </span>
                            )}
                          </div>

                          {/* Telefone */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="telefone"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Telefone
                            </Label>
                            <Input
                              id="telefone"
                              name="telefone"
                              type="tel"
                              value={formData.telefone}
                              onChange={handleInputChange}
                              className={`${inputBaseClasses} ${
                                validationErrors.telefone
                                  ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                                  : ""
                              }`}
                              placeholder="(11) 94555-5555"
                            />
                            {validationErrors.telefone && (
                              <span className="text-sm text-red-500">
                                {validationErrors.telefone}
                              </span>
                            )}
                          </div>

                          {/* Data de Nascimento e Gênero */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="dataNascimento"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Data de Nascimento
                              </Label>
                              <Input
                                id="dataNascimento"
                                name="dataNascimento"
                                type="date"
                                value={formData.dataNascimento}
                                disabled
                                className={`${inputBaseClasses} opacity-70 cursor-not-allowed`}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="genero"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Gênero
                              </Label>{" "}
                              <select
                                id="genero"
                                name="genero"
                                value={formData.genero}
                                onChange={handleSelectChange}
                                className="w-full px-3 py-2 rounded-md border border-[#D7E3FF] bg-[#F8FBFF] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#ED4231]/80 focus:border-[#ED4231] dark:bg-[#1F2330] dark:border-[#343B4A] dark:text-gray-100 transition-colors"
                              >
                                <option value="OUTRO">
                                  Prefiro não informar
                                </option>
                                <option value="FEMININO">Feminino</option>
                                <option value="MASCULINO">Masculino</option>
                              </select>
                            </div>
                          </div>

                          {/* Botões de ação */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                              onClick={handleSave}
                              disabled={loading}
                              className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                              {loading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Salvando...
                                </>
                              ) : (
                                "Salvar Alterações"
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
                        </>
                      )}
                    </CardContent>
                  </Card>{" "}
                </TabsContent>

                {/* Aba de Endereço */}
                <TabsContent value="endereco">
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle>Endereço</CardTitle>
                      <CardDescription>Atualize seu endereço</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {initialLoading && (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED4231]"></div>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            Carregando dados...
                          </span>
                        </div>
                      )}

                      {!initialLoading && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor="rua">Rua</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Input
                                    id="rua"
                                    name="endereco.rua"
                                    value={formData.endereco.rua}
                                    onChange={handleInputChange}
                                    className={inputBaseClasses}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>Nome da rua, avenida ou logradouro</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="numero">Número</Label>
                              <Input
                                id="numero"
                                name="endereco.numero"
                                value={formData.endereco.numero}
                                onChange={handleInputChange}
                                className={inputBaseClasses}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="complemento">Complemento</Label>
                            <Input
                              id="complemento"
                              name="endereco.complemento"
                              value={formData.endereco.complemento}
                              onChange={handleInputChange}
                              className={inputBaseClasses}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input
                              id="bairro"
                              name="endereco.bairro"
                              value={formData.endereco.bairro}
                              onChange={handleInputChange}
                              className={inputBaseClasses}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1 space-y-2">
                              <Label htmlFor="cidade">Cidade</Label>
                              <Input
                                id="cidade"
                                name="endereco.cidade"
                                value={formData.endereco.cidade}
                                onChange={handleInputChange}
                                className={inputBaseClasses}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="estado">Estado</Label>
                              <Input
                                id="estado"
                                name="endereco.estado"
                                value={formData.endereco.estado}
                                onChange={handleInputChange}
                                className={inputBaseClasses}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cep">CEP</Label>
                              <div className="relative">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Input
                                      id="cep"
                                      name="endereco.cep"
                                      value={formData.endereco.cep}
                                      onChange={handleInputChange}
                                      onBlur={handleCepBlur}
                                      placeholder="00000-000"
                                      maxLength={9}
                                      className={`${inputBaseClasses} pr-12`}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>
                                      Formato: 00000-000 (preenchimento
                                      automático ao sair do campo)
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                                {loadingCep && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-4 w-4 border-2 border-[#ED4231] border-t-transparent rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Digite o CEP para preencher o endereço
                                automaticamente
                              </p>
                            </div>{" "}
                          </div>
                        </>
                      )}
                    </CardContent>{" "}
                    <CardFooter>
                      <div className="flex gap-2 ml-auto">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleSave}
                              disabled={loading}
                              className="bg-[#ED4231] hover:bg-[#d53a2a]"
                            >
                              {loading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Salvar alterações feitas no endereço</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
                {/* Aba de Foto de Perfil */}
                <TabsContent value="foto">
                  <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857]">
                    <CardHeader>
                      <CardTitle>Foto de Perfil</CardTitle>
                      <CardDescription>
                        Atualize sua foto de perfil
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#EDF2FB] dark:border-[#23272F] shadow-lg">
                          {(imagePreview ||
                            (profileImage &&
                              profileImage !== "undefined" &&
                              profileImage !== "")) &&
                          !imageError ? (
                            <img
                              src={imagePreview || profileImage}
                              alt="Foto de perfil"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log(
                                  "Erro ao carregar imagem de perfil:",
                                  e
                                );
                                setImageError(true);
                              }}
                            />
                          ) : (
                            <LetterAvatar
                              name={formData.nome || "U"}
                              size="w-40 h-40"
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
                              <p>
                                Clique para selecionar uma nova foto de perfil
                              </p>
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
                            Formatos suportados: JPG, PNG
                            <br />
                            Tamanho máximo: 1MB (imagens maiores serão
                            comprimidas automaticamente)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleSavePhoto}
                            disabled={loading || !selectedImage}
                            className="ml-auto bg-[#ED4231] hover:bg-[#d53a2a]"
                          >
                            {loading ? "Salvando..." : "Salvar Foto"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Salvar a nova foto de perfil</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Logout dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Deseja realmente sair?</DialogTitle>
            <DialogDescription>Você será desconectado da sua conta.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancelar</Button>
            <Button variant="default" onClick={handleLogout} className="bg-[#ED4231] hover:bg-[#D63A2A] text-white font-medium">
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ProfileFormUser;
