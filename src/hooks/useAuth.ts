import { useState, useEffect, useCallback } from "react";
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
      const base = import.meta.env.VITE_URL_BACKEND || "/api";
      const response = await fetch(
        `${base}/usuarios/${usuarioId}/ultimo-acesso`,
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
          const parsedUserData = JSON.parse(userData); // Converter dados do novo formato para o formato esperado pelo hook
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
      } else if (!isPublicRoute(location.pathname)) {
        // If not on a public route and no auth, redirect to login
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta página.",
          variant: "destructive",
        });
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        });
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate, location.pathname, isPublicRoute]);
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null);

      try {
        const base = import.meta.env.VITE_URL_BACKEND || "/api";
        const response = await fetch(
          `${base}/usuarios/autenticar`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: credentials.email, senha: credentials.password }),
          }
        );

        if (!response.ok) {
          throw new Error("Credenciais inválidas");
        }

        const data = await response.json();

        // Atualizar último acesso após login bem-sucedido
        await atualizarUltimoAcesso(data.idUsuario, data.token); // 🔄 LIMPEZA: Limpar dados de perfil antigos para evitar conflitos entre usuários
        localStorage.removeItem("savedProfile");
        localStorage.removeItem("profileData");
        localStorage.removeItem("userProfileData");
        console.log(
          "🧹 [useAuth] Dados de perfil antigos limpos após novo login"
        );

        // Salvar no localStorage
        localStorage.setItem("userData", JSON.stringify(data));

        // 🔄 TRIGGER: Forçar atualização do contexto de imagem para novo usuário
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "userData",
            newValue: JSON.stringify(data),
            oldValue: null,
            storageArea: localStorage,
          })
        );
        console.log(
          "📡 [useAuth] Evento de mudança disparado para ProfileImageContext"
        );

        // Redirecionar com base no tipo de usuário
        if (data.tipo === "ADMINISTRADOR") {
          navigate("/home-admin");
        } else if (
          data.tipo === "VOLUNTARIO" &&
          data.funcao === "ASSISTENCIA_SOCIAL"
        ) {
          navigate("/assistente-social");
        } else if (data.tipo === "USUARIO") {
          navigate("/home-user");
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
    } catch {}
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
