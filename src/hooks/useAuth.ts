import { useState, useEffect, useCallback } from "react";
import { buildBackendUrl } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: "profissional" | "paciente";
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const PUBLIC_ROUTES = [
  "/login",
  "/cadastro",
  "/completar-cadastro-usuario",
  "/completar-cadastro-voluntario",
];
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const atualizarUltimoAcesso = async (usuarioId: string, token: string) => {
    try {
      const response = await fetch(
        buildBackendUrl(`/usuarios/${usuarioId}/ultimo-acesso`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Erro ao atualizar último acesso após login:",
          response.status
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar último acesso após login:", error);
    }
  };

  // Função para verificar se uma rota é pública
  const isPublicRoute = useCallback((path: string) => {
    return PUBLIC_ROUTES.some((route) => path.startsWith(route));
  }, []);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const userData = localStorage.getItem("userData");
      const storedUser = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);

      // Priorizar o novo sistema de autenticação (userData)
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          // Converter dados do novo formato para o formato esperado pelo hook
          if (parsedUserData.idUsuario && parsedUserData.token) {
            const userForHook = {
              id: parsedUserData.idUsuario.toString(),
              nome: parsedUserData.nome || "",
              email: parsedUserData.email || "",
              tipo: (parsedUserData.tipo === "USUARIO"
                ? "paciente"
                : "profissional") as "profissional" | "paciente",
              token: parsedUserData.token,
            };
            setUser(userForHook);
          }
        } catch (e) {
          console.error("Error loading userData:", e);
          // Clear invalid data
          localStorage.removeItem("userData");
        }
      } else if (storedUser && storedToken) {
        // Fallback para o sistema antigo
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error loading legacy user data:", e);
          // Clear invalid data
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    };

    checkAuth();
    // Executar apenas uma vez ao montar o componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null);

      try {
        const loginUrl = buildBackendUrl(`/usuarios/login`);
        console.log("🔐 [useAuth] Tentando login com:", {
          email: credentials.email,
          url: loginUrl,
        });

        const response = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            senha: credentials.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(
            "❌ [useAuth] Erro no login:",
            response.status,
            errorData
          );
          throw new Error(errorData.message || "Email ou senha inválidos");
        }

        const data = await response.json();
        const tipoNormalized = String(data.tipo || "").toUpperCase();
        const funcaoNormalized = String(data.funcao || "").toUpperCase();
        const dataNormalized = {
          ...data,
          tipo: tipoNormalized,
          funcao: funcaoNormalized,
        };

        // Atualizar último acesso após login bem-sucedido
        await atualizarUltimoAcesso(data.idUsuario, data.token); // 🔄 LIMPEZA: Limpar dados de perfil antigos para evitar conflitos entre usuários
        localStorage.removeItem("savedProfile");
        localStorage.removeItem("profileData");
        localStorage.removeItem("userProfileData");
        console.log(
          "🧹 [useAuth] Dados de perfil antigos limpos após novo login"
        );

        // Salvar no localStorage (novo formato)
        localStorage.setItem("userData", JSON.stringify(dataNormalized));
        // Compatibilidade com formato legado
        try {
          const legacyUser = {
            id: String(data.idUsuario ?? data.id ?? ""),
            nome: data.nome ?? "",
            email: data.email ?? "",
            tipo:
              data.tipo === "GRATUIDADE" ||
              data.tipo === "VALOR_SOCIAL" ||
              data.tipo === "USUARIO"
                ? ("paciente" as const)
                : ("profissional" as const),
            token: data.token ?? "",
          };
          localStorage.setItem("auth_user", JSON.stringify(legacyUser));
          localStorage.setItem("auth_token", legacyUser.token);
        } catch (e) {
          void e;
        }

        // 🔄 TRIGGER: Forçar atualização do contexto de imagem para novo usuário
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "userData",
            newValue: JSON.stringify(dataNormalized),
            oldValue: null,
            storageArea: localStorage,
          })
        );
        console.log(
          "📡 [useAuth] Evento de mudança disparado para ProfileImageContext"
        );

        // Redirecionar com base no tipo de usuário
        console.log("🔀 [useAuth] Redirecionando usuário:", {
          tipo: tipoNormalized,
          funcao: funcaoNormalized,
          classificacao: data.classificacao,
        });

        /**
         * REGRAS DE REDIRECIONAMENTO POR TIPO DE USUÁRIO:
         * Valores do campo 'tipo' no banco: ADMINISTRADOR, GRATUIDADE, VALOR_SOCIAL, VOLUNTARIO
         *
         * 1. Assistente Social → /assistente-social
         *    - tipo: "VOLUNTARIO" + funcao: "ASSISTENCIA_SOCIAL"
         *    - Rotas: /assistente-social, /cadastro-assistente, /classificacao-usuarios,
         *             /profile-form-assistente-social, /cadastro-voluntario
         *
         * 2. Administrador → /assistente-social
         *    - tipo: "ADMINISTRADOR"
         *    - Mesmas rotas da Assistente Social
         *
         * 3. Usuário Assistido → /home-user
         *    - tipo: "GRATUIDADE" ou "VALOR_SOCIAL"
         *    - Rotas: /home-user, /agenda-user, /historico-user,
         *             /agendar-horario-user, /profile-form-user, /pagamento-user
         *
         * 4. Voluntário Profissional → /home
         *    - tipo: "VOLUNTARIO" (sem funcao ASSISTENCIA_SOCIAL)
         *    - Exemplo: médico, psicólogo, nutricionista, etc.
         *    - Rotas: /home, /disponibilizar-horario, /agenda, /historico, /profile-form
         */

        // Valores do banco: ADMINISTRADOR, GRATUIDADE, VALOR_SOCIAL, VOLUNTARIO
        if (
          tipoNormalized === "VOLUNTARIO" &&
          funcaoNormalized === "ASSISTENCIA_SOCIAL"
        ) {
          // Assistente Social
          navigate("/assistente-social");
        } else if (tipoNormalized === "ADMINISTRADOR") {
          // Administrador
          navigate("/assistente-social");
        } else if (
          tipoNormalized === "GRATUIDADE" ||
          tipoNormalized === "VALOR_SOCIAL" ||
          tipoNormalized === "USUARIO"
        ) {
          // Usuário assistido
          navigate("/home-user");
        } else if (tipoNormalized === "VOLUNTARIO") {
          // Voluntário profissional (médico, psicólogo, etc.)
          navigate("/home");
        } else {
          // Fallback: se não identificar o tipo, redirecionar para login
          console.error(
            "⚠️ [useAuth] Tipo de usuário não reconhecido:",
            data.tipo
          );
          navigate("/login");
        }

        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao fazer login";
        setError(message);
        toast({
          title: "Erro ao fazer login",
          description: message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("userData"); // Clear new auth data too

    // 🔄 LIMPEZA: Limpar todos os dados de perfil no logout
    localStorage.removeItem("savedProfile");
    localStorage.removeItem("profileData");
    localStorage.removeItem("userProfileData");
    localStorage.removeItem("selectedDates");
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (key.startsWith("availabilityVoluntario:")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      void e;
    }
    console.log("🧹 [useAuth] Todos os dados de usuário limpos no logout");

    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);
  // Check if user is authenticated based on both old and new auth mechanisms
  const isAuthenticated = !!user || !!localStorage.getItem("userData");
  const userType = user?.tipo;

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    userType,
    isPublicRoute,
  };
}
