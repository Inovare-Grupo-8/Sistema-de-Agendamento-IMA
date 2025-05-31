import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../TelaLogin.css';
import ModalErro from './ui/ModalErro';
import { Locate } from 'lucide-react';

const TelaLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define o modo com base na URL
  const isCadastro = location.pathname === '/cadastro';
  const [isSignUpMode, setIsSignUpMode] = useState(isCadastro);
  const [modalErro, setModalErro] = useState<string | null>(null);

  // Sincroniza o modo com a URL
  useEffect(() => {
    setIsSignUpMode(location.pathname === '/cadastro');
  }, [location.pathname]);

  // Atualiza o título da página conforme o modo
  useEffect(() => {
    document.title = isSignUpMode ? 'Cadastro' : 'Login';
  }, [isSignUpMode]);

  // Fechar modal automaticamente após 5 segundos
  useEffect(() => {
    if (modalErro) {
      const timer = setTimeout(() => setModalErro(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [modalErro]);

  // Alternar entre login e cadastro e atualizar a URL
  const toggleMode = () => {
    if (isSignUpMode) {
      navigate('/login');
    } else {
      navigate('/cadastro');
    }
  };

  // Estados para os campos de login e cadastro
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [cadastroNome, setCadastroNome] = useState('');
  const [cadastroEmail, setCadastroEmail] = useState('');
  const [cadastroSenha, setCadastroSenha] = useState('');
  const [cadastroCPF, setCadastroCPF] = useState('');
  const [cadastroDataNascimento, setCadastroDataNascimento] = useState('');

  // Validações individuais
  const validarNome = (nome: string): string | null => {
    if (nome.length < 3) {
      return 'O nome deve ter pelo menos 3 caracteres.';
    }
    return null;
  };

  const validarEmail = (email: string): string | null => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      return 'Por favor, insira um email válido.';
    }
    return null;
  };

  const validarSenha = (senha: string): string | null => {
    if (senha.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    } else if (!/[!@#$%^&*]/.test(senha)) {
      return 'A senha deve conter pelo menos um caractere especial como @, #, $, %, &, *.';
    }
    return null;
  };

  const validarCPF = (cpf: string): string | null => {
    if (cpf.length !== 14) {
      return 'Por favor, insira um CPF válido.';
    }
    return null;
  };

  const validarDataNascimento = (dataNascimento: string): string | null => {
    if (!dataNascimento) {
      return 'Por favor, insira a data de nascimento.';
    }
    return null;
  };

  const validarCadastro = (): boolean => {
    if (!cadastroNome || !cadastroEmail || !cadastroSenha || !cadastroCPF || !cadastroDataNascimento) {
      setModalErro('Por favor, preencha todos os campos.');
      return false;
    }
    const erroNome = validarNome(cadastroNome);
    if (erroNome) {
      setModalErro(erroNome);
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
    const erroCPF = validarCPF(cadastroCPF);
    if (erroCPF) {
      setModalErro(erroCPF);
      return false;
    }
    const erroDataNascimento = validarDataNascimento(cadastroDataNascimento);
    if (erroDataNascimento) {
      setModalErro(erroDataNascimento);
      return false;
    }
    return true;
  };

  // Máscara para CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    setCadastroCPF(value);
  };

  // Exibir/Ocultar senha
  const togglePasswordVisibility = (id: string) => {
    const passwordInput = document.getElementById(id) as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  };
  // Login
  const handleLogin = () => {
    // Validação dos campos antes de enviar ao backend
    if (!loginEmail || !loginSenha) {
      setModalErro('Por favor, preencha todos os campos.');
      return;
    }

    const erroEmail = validarEmail(loginEmail);
    if (erroEmail) {
      setModalErro(erroEmail);
      return;
    }

    // Mostrar loading ou desabilitar botão de login aqui se desejar

    const loginData = {
      email: loginEmail,
      senha: loginSenha
    };

    fetch('http://localhost:8080/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })
      .then(async (response) => {
        const data = await response.json();
        
        if (!response.ok) {
          // Usa a mensagem específica do backend se disponível
          throw new Error(data.message || 'Credenciais inválidas. Verifique seu email e senha.');
        }
        
        return data;
      })
      .then((data) => {
        if (!data) {
          throw new Error('Erro ao obter dados do usuário');
        }

        // Salva os dados do usuário incluindo token se houver
        localStorage.setItem('userData', JSON.stringify(data));

        // Limpa os campos de login
        setLoginEmail('');
        setLoginSenha('');

        // Verifica a fase do usuário e redireciona
        if (data.fase === 1) {
          // Só redireciona com id se existir
          if (data.id) {
            navigate(`/inscricao-anamnese?id=${data.id}`);
          } else {
            navigate('/inscricao-anamnese');
          }
        } else {
          // Redireciona baseado no tipo do usuário
          switch (data.tipo) {
            case 'ADMIN':
              navigate('/home');
              break;
            case 'ASSISTENTE_SOCIAL':
              navigate('/assistente-social');
              break;
            default:
              navigate('/home-user');
          }
        }
      })
      .catch((error) => {
        setModalErro(error.message || 'Erro ao tentar realizar o login. Tente novamente mais tarde.');
      });
  };
  // Cadastro - Fase 1
  const handleCadastro = () => {
    if (!validarCadastro()) {
      return;
    }

    const novoUsuario = {
      nome: cadastroNome,
      email: cadastroEmail,
      senha: cadastroSenha,
      cpf: cadastroCPF.replace(/\D/g, ''), 
      dataNascimento: cadastroDataNascimento
    };

    // Log do que está sendo enviado para cadastro
    console.log('[Cadastro] Enviando para backend:', novoUsuario);

    fetch('http://localhost:8080/usuarios/fase1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoUsuario),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Erro ao cadastrar usuário');
          });
        }
        return response.json();
      })
      .then((data) => {
        // Armazena os dados do usuário incluindo o ID
        localStorage.setItem('userData', JSON.stringify(data));

        alert('Cadastro realizado com sucesso! Por favor, preencha o formulário de anamnese.');
        // Redireciona para anamnese passando o ID do usuário se existir (id ou idUsuario)
        const userId = data.idUsuario;
        if (userId) {
          navigate(`/inscricao-anamnese?id=${userId}`);
        } else {
          navigate('/inscricao-anamnese');
        }
      })
      .catch((error) => {
        setModalErro(error.message);
      });
  };

  return (
    <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Login Form */}
          <form className="sign-in-form" onSubmit={(e) => e.preventDefault()}>
            <h2 className="title">LOGIN</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
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
                onClick={() => togglePasswordVisibility('password_login')}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>            
            <input type="button" value="Entrar" className="btn solid" onClick={handleLogin} />
            <button 
              className="btn-google" 
              onClick={() => window.location.href = '/home'}
            >
              <img src="./image/google-icon-logo.svg" alt="" />
            </button>
          </form>

          {/* Cadastro Form */}
          <form className="sign-up-form" onSubmit={(e) => e.preventDefault()}>
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
                onClick={() => togglePasswordVisibility('password_signup')}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="CPF"
                value={cadastroCPF}
                onChange={handleCPFChange}
                maxLength={14}
                required
              />
            </div>
            <div className="input-field">
              <i className="fa-solid fa-calendar"></i>
              <input
                type="date"
                value={cadastroDataNascimento}
                onChange={(e) => setCadastroDataNascimento(e.target.value)}
                required
              />
            </div>            <input type="button" className="btn" value="Cadastrar" onClick={handleCadastro} />
            <button 
              className="btn-google" 
              onClick={() => window.location.href = 'http://localhost:8080/login/authorization/google'}
            >
              <img src="./image/google-icon-logo.svg" alt="" />
            </button>
          </form>
        </div>
      </div>

      {/* Panels */}
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>NOVO AQUI?</h3>
            <p>Não possui acesso? Que tal aproveitar para se ingressar em nosso projeto?</p>
            <button className="btn transparent" onClick={toggleMode}>
              Cadastre-se
            </button>
          </div>
          <img src="./image/homem-computador.svg" id="homem" className="image" alt="Homem no computador" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>JÁ TEM CONTA?</h3>
            <p>Já aproveita dos nossos serviços?</p>
            <button className="btn transparent" onClick={toggleMode}>
              Log-in
            </button>
          </div>
          <img src="./image/senhorzinho.png" id="senhor" className="image" alt="Senhorzinho" />
        </div>
      </div>

      {/* Modal de Erro */}
      {modalErro && <ModalErro mensagem={modalErro} onClose={() => setModalErro(null)} />}
    </div>
  );
};

export default TelaLogin;