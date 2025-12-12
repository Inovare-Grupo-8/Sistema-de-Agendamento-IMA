import React, { useState, useEffect } from "react";
import { buildBackendUrl } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import "../TelaLogin.css";
import ModalErro from "./ui/ModalErro";
import ModalConfirmacao from "./ui/ModalConfirmacao";

const TelaLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCadastro = location.pathname === "/cadastro";
  const [isSignUpMode, setIsSignUpMode] = useState(isCadastro);
  const [modalErro, setModalErro] = useState<string | null>(null);
  const [modalConfirmacao, setModalConfirmacao] = useState<null | {
    mensagem: string;
    onConfirm: () => void;
  }>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o usuário já está logado e redirecionar (exceto em rotas públicas)
  useEffect(() => {
    const isPublic = location.pathname === "/login" || location.pathname === "/cadastro";
    const userData = localStorage.getItem("userData");
    if (userData && !isPublic) {
      try {
        const user = JSON.parse(userData);
        console.log("🔄 [TelaLogin] Usuário já logado:", {
          tipo: user.tipo,
          funcao: user.funcao,
          classificacao: user.classificacao,
        });

        const usuarioId = user.idUsuario || user.id;
        const token = user.token;
        if (usuarioId && token) {
          fetch(buildBackendUrl(`/usuarios/${usuarioId}/ultimo-acesso`), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => {});
        }

        if (user.tipo === "VOLUNTARIO" && user.funcao === "ASSISTENCIA_SOCIAL") {
          navigate("/assistente-social", { replace: true });
        } else if (user.tipo === "ADMINISTRADOR") {
          navigate("/assistente-social", { replace: true });
        } else if (
          user.tipo === "GRATUIDADE" ||
          user.tipo === "VALOR_SOCIAL" ||
          user.tipo === "USUARIO"
        ) {
          navigate("/home-user", { replace: true });
        } else if (user.tipo === "VOLUNTARIO") {
          navigate("/home", { replace: true });
        }
      } catch (error) {
        console.error("Erro ao verificar usuário logado:", error);
        localStorage.removeItem("userData");
      }
    }
  }, [navigate, location.pathname]);

  // Sincroniza o modo com a URL
  useEffect(() => {
    setIsSignUpMode(location.pathname === "/cadastro");
  }, [location.pathname]);

  // Atualiza o título da página conforme o modo
  useEffect(() => {
    document.title = isSignUpMode ? "Cadastro" : "Login";
  }, [isSignUpMode]);

  // Alternar entre login e cadastro e atualizar a URL
  const toggleMode = () => {
    if (isSignUpMode) {
      navigate("/login");
    } else {
      navigate("/cadastro");
    }
  }; // Estados para os campos de login e cadastro
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroSobrenome, setCadastroSobrenome] = useState("");
  const [cadastroCpf, setCadastroCpf] = useState("");
  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroSenha, setCadastroSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  // Validações
  const validarNome = (nome: string): string | null => {
    if (nome.length < 3) {
      return "O nome deve ter pelo menos 3 caracteres.";
    }
    return null;
  };

  const validarSobrenome = (sobrenome: string): string | null => {
    if (sobrenome.length < 3) {
      return "O sobrenome deve ter pelo menos 3 caracteres.";
    }
    return null;
  };

  const validarEmail = (email: string): string | null => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      return "Por favor, insira um email válido.";
    }
    return null;
  };
  const validarSenha = (senha: string): string | null => {
    if (senha.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    } else if (!/[!@#$%^&*]/.test(senha)) {
      return "A senha deve conter pelo menos um caractere especial como @, #, $, %, &, *.";
    }
    return null;
  };

  const validarCpf = (cpf: string): string | null => {
    // Remove todos os caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, "");

    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return "CPF deve ter 11 dígitos.";
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return "CPF inválido.";
    }

    // Validação do algoritmo do CPF
    let soma = 0;
    let resto;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
      return "CPF inválido.";
    }

    soma = 0;
    // Validação do segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
      return "CPF inválido.";
    }

    return null;
  };

  const formatarCpf = (valor: string): string => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, "");

    // Aplica a máscara XXX.XXX.XXX-XX
    return apenasNumeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };
  const validarCadastro = (): boolean => {
    if (
      !cadastroNome ||
      !cadastroSobrenome ||
      !cadastroCpf ||
      !cadastroEmail ||
      !cadastroSenha ||
      !confirmaSenha
    ) {
      setModalErro("Por favor, preencha todos os campos.");
      return false;
    }

    if (cadastroSenha !== confirmaSenha) {
      setModalErro("As senhas não coincidem.");
      return false;
    }

    const erroNome = validarNome(cadastroNome);
    if (erroNome) {
      setModalErro(erroNome);
      return false;
    }
    const erroSobrenome = validarSobrenome(cadastroSobrenome);
    if (erroSobrenome) {
      setModalErro(erroSobrenome);
      return false;
    }
    const erroCpf = validarCpf(cadastroCpf);
    if (erroCpf) {
      setModalErro(erroCpf);
      return false;
    }
    const erroEmail = validarEmail(cadastroEmail);
    if (erroEmail) {
      setModalErro(erroEmail);
      return false;
    }
    const erroSenha = validarSenha(cadastroSenha);
    if (erroSenha) {
      setModalErro(erroSenha);
      return false;
    }
    return true;
  };

  // Exibir/Ocultar senha
  const togglePasswordVisibility = (id: string) => {
    const passwordInput = document.getElementById(id) as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
    }
  };

  // Função auxiliar para atualizar último acesso
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
        console.error("Erro ao atualizar último acesso:", response.status);
      }
    } catch (error) {
      console.error("Erro ao atualizar último acesso:", error);
    }
  };

  // Login
  const handleLogin = async () => {
    if (isLoading) return;
    if (!loginEmail || !loginSenha) {
      setModalErro("Por favor, preencha todos os campos.");
      return;
    }

    const erroEmail = validarEmail(loginEmail);
    if (erroEmail) {
      setModalErro(erroEmail);
      return;
    }

    setIsLoading(true);
    try {
      const controller = new AbortController();
      const { signal } = controller;
      const loginUrl = buildBackendUrl(`/usuarios/login`);
      console.log("🔐 [Login] Tentando login com:", {
        email: loginEmail,
        url: loginUrl,
      });

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ [Login] Erro:", response.status, errorData);
        throw new Error(errorData.message || "Email ou senha inválidos");
      }

      const data = await response.json();
      console.log("✅ [Login] Dados completos do usuário:", data);
      console.log(
        "🔀 [Login] Redirecionamento - tipo:",
        data.tipo,
        "funcao:",
        data.funcao,
        "classificacao:",
        data.classificacao
      );

      // Atualizar último acesso
      await atualizarUltimoAcesso(data.idUsuario, data.token);

      // Limpar dados de perfil antigos
      localStorage.removeItem("savedProfile");
      localStorage.removeItem("profileData");
      localStorage.removeItem("userProfileData");

      // Salvar no localStorage
      localStorage.setItem("userData", JSON.stringify(data));
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

      // Redirecionar com base no tipo de usuário
      // Valores do banco: ADMINISTRADOR, GRATUIDADE, VALOR_SOCIAL, VOLUNTARIO
      if (data.tipo === "VOLUNTARIO" && data.funcao === "ASSISTENCIA_SOCIAL") {
        // Assistente Social (VOLUNTARIO + funcao ASSISTENCIA_SOCIAL)
        console.log(
          "➡️ Redirecionando para: /assistente-social (Assistente Social)"
        );
        navigate("/assistente-social", { replace: true });
      } else if (data.tipo === "ADMINISTRADOR") {
        // Administrador do sistema
        console.log("➡️ Redirecionando para: /home-admin (Administrador)");
        navigate("/home-admin", { replace: true });
      } else if (
        data.tipo === "GRATUIDADE" ||
        data.tipo === "VALOR_SOCIAL" ||
        data.tipo === "USUARIO"
      ) {
        // Usuário assistido (GRATUIDADE ou VALOR_SOCIAL)
        console.log(
          "➡️ Redirecionando para: /home-user (Usuário Assistido -",
          data.tipo + ")"
        );
        navigate("/home-user", { replace: true });
      } else if (data.tipo === "VOLUNTARIO") {
        // Voluntário profissional (médico, psicólogo, etc.) - sem funcao ASSISTENCIA_SOCIAL
        console.log("➡️ Redirecionando para: /home (Profissional Voluntário)");
        navigate("/home", { replace: true });
      } else {
        console.error("⚠️ [Login] Tipo não reconhecido:", data.tipo);
        navigate("/login", { replace: true });
      }
    } catch (error) {
      const isAbort = (error as any)?.name === "AbortError";
      if (!isAbort) {
        const message =
          error instanceof Error ? error.message : "Erro ao fazer login";
        setModalErro(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cadastro
  const handleCadastro = async () => {
    if (!validarCadastro()) return;

    setIsLoading(true);
    try {
      const response = await fetch(buildBackendUrl(`/usuarios/primeira-fase`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: cadastroNome,
          sobrenome: cadastroSobrenome,
          cpf: cadastroCpf.replace(/\D/g, ""), // Remove formatação do CPF
          email: cadastroEmail,
          senha: cadastroSenha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          data.message?.includes("constraint") ||
          data.message?.includes("CONSTRAINT_INDEX_2")
        ) {
          throw new Error("Email já cadastrado");
        }
        throw new Error(data.message || "Erro ao cadastrar");
      }

      localStorage.setItem("userData", JSON.stringify(data));
      setModalConfirmacao({
        mensagem:
          "Cadastro realizado com sucesso! Deseja continuar para o formulário de anamnese?",
        onConfirm: () => {
          setModalConfirmacao(null);
          navigate(
            data.idUsuario
              ? `/completar-cadastro-usuario?id=${data.idUsuario}`
              : "/completar-cadastro-usuario"
          );
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao cadastrar";
      setModalErro(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Login Form */}
          <form
            className="sign-in-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <h2 className="title">LOGIN</h2>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Senha"
                id="password_login"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                required
              />
              <i
                className="fas fa-eye"
                onClick={() => togglePasswordVisibility("password_login")}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
            <button type="submit" className="btn solid">
              Entrar
            </button>
            <button
              className="btn-google"
              onClick={() => (window.location.href = "/home")}
            >
              <img src="./image/google-icon-logo.svg" alt="" />
            </button>
          </form>{" "}
          {/* Cadastro Form */}
          <form
            className="sign-up-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleCadastro();
            }}
          >
            <h2 className="title">CADASTRAR</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Nome"
                value={cadastroNome}
                onChange={(e) => setCadastroNome(e.target.value)}
                required
              />
            </div>{" "}
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Sobrenome"
                value={cadastroSobrenome}
                onChange={(e) => setCadastroSobrenome(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-id-card"></i>
              <input
                type="text"
                placeholder="CPF"
                value={cadastroCpf}
                onChange={(e) => setCadastroCpf(formatarCpf(e.target.value))}
                maxLength={14}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={cadastroEmail}
                onChange={(e) => setCadastroEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Senha"
                id="password_signup"
                value={cadastroSenha}
                onChange={(e) => setCadastroSenha(e.target.value)}
                required
              />
              <i
                className="fas fa-eye"
                onClick={() => togglePasswordVisibility("password_signup")}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Confirme a Senha"
                id="confirma_password_signup"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                required
              />
              <i
                className="fas fa-eye"
                onClick={() =>
                  togglePasswordVisibility("confirma_password_signup")
                }
                style={{ cursor: "pointer" }}
              ></i>
            </div>
            <button type="submit" className="btn">
              Cadastrar
            </button>
            <button
              className="btn-google"
              onClick={() =>
                (window.location.href = `${buildBackendUrl(
                  "/login/authorization/google"
                )}`)
              }
            >
              <img src="./image/google-icon-logo.svg" alt="" />
            </button>
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>NOVO AQUI?</h3>
            <p>
              Não possui acesso? Que tal aproveitar para se ingressar em nosso
              projeto?
            </p>
            <button className="btn transparent" onClick={toggleMode}>
              Cadastre-se
            </button>
          </div>
          <img
            src="./image/homem-computador.svg"
            className="image"
            alt="Homem no computador"
          />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>JÁ TEM CONTA?</h3>
            <p>Já aproveita dos nossos serviços?</p>
            <button className="btn transparent" onClick={toggleMode}>
              Log-in
            </button>
          </div>
          <img
            src="./image/senhorzinho.png"
            className="image"
            alt="Senhorzinho"
          />
        </div>
      </div>

      {/* Modal de Erro */}
      {modalErro && (
        <ModalErro mensagem={modalErro} onClose={() => setModalErro(null)} />
      )}
      {/* Modal de Confirmação */}
      {modalConfirmacao && (
        <ModalConfirmacao
          mensagem={modalConfirmacao.mensagem}
          onConfirm={modalConfirmacao.onConfirm}
          onCancel={() => setModalConfirmacao(null)}
        />
      )}

      {/* Loading Animation */}
      {isLoading && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-80">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#F3F4F6] border-solid"></div>
            <span className="mt-4 text-[#F3F4F6] font-semibold text-lg">
              Enviando a requisição...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelaLogin;
