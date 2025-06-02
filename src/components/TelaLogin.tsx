import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../TelaLogin.css';
import ModalErro from './ui/ModalErro';
import ModalConfirmacao from './ui/ModalConfirmacao';
import { Locate } from 'lucide-react';

const TelaLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define o modo com base na URL
  const isCadastro = location.pathname === '/cadastro';
  const [isSignUpMode, setIsSignUpMode] = useState(isCadastro);
  const [modalErro, setModalErro] = useState<string | null>(null);
  const [modalConfirmacao, setModalConfirmacao] = useState<null | { mensagem: string, onConfirm: () => void }>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sincroniza o modo com a URL
  useEffect(() => {
    setIsSignUpMode(location.pathname === '/cadastro');
  }, [location.pathname]);

  // Atualiza o título da página conforme o modo
  useEffect(() => {
    document.title = isSignUpMode ? 'Cadastro' : 'Login';
  }, [isSignUpMode]);

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
    if (!loginEmail || !loginSenha) {
      setModalErro('Por favor, preencha todos os campos.');
      return;
    }
    const erroEmail = validarEmail(loginEmail);
    if (erroEmail) {
      setModalErro(erroEmail);
      return;
    }
    setIsLoading(true);
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
        console.log('[LOGIN][RESPONSE DATA]', data); 
        if (!response.ok) {
          throw new Error(data.message || 'Credenciais inválidas. Verifique seu email e senha.');
        }
        return data;
      })
      .then((data) => {
        if (!data) {
          throw new Error('Erro ao obter dados do usuário');
        }
        console.log('[LOGIN][DATA USADO NO FLUXO]', data); 
        localStorage.setItem('userData', JSON.stringify(data));
        setLoginEmail('');
        setLoginSenha('');
        if (data.fase === 1) {
          if (data.id) {
            navigate(`/inscricao-anamnese?id=${data.id}`);
          } else {
            navigate('/inscricao-anamnese');
          }
        } else {
          if (data.tipo == null) {
            setModalErro('Não é possível acessar o sistema sem preencher a ficha de inscrição ou sem ter passado pela assistente social.\nSe você já preencheu a inscrição, em breve a assistente social entrará em contato.');
            return;
          } else {
            const tipo = (data.tipo || '').toString().toLowerCase();
            console.log('[LOGIN][TIPO NORMALIZADO]', tipo); 
            switch (tipo) {
              case 'administrador':
                navigate('/home');
                break;
              case 'asssistente social':
                navigate('/assistente-social');
                break;
              case 'voluntario':
                navigate('/home-user');
                break;
              case 'valor social':
              case 'gratuidade':
                navigate('/home-user');
                break;
              default:
                navigate('/home-user');
            }
          }
        }
      })
      .catch((error) => {
        setModalErro(error.message || 'Erro ao tentar realizar o login. Tente novamente mais tarde.');
      })
      .finally(() => setIsLoading(false));
  };
  // Cadastro - Fase 1
  const handleCadastro = () => {
    if (!validarCadastro()) {
      return;
    }
    setIsLoading(true);
    const novoUsuario = {
      nome: cadastroNome,
      email: cadastroEmail,
      senha: cadastroSenha,
      cpf: cadastroCPF.replace(/\D/g, ''), 
      dataNascimento: cadastroDataNascimento
    };
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
            // Trata erro de CPF já cadastrado
            if (data.message && (data.message.includes('constraint') || data.message.includes('CONSTRAINT_INDEX_2') || data.message.includes('23505'))) {
              throw new Error('Já existe um cadastro com este CPF ou Email. Caso já tenha conta, faça login. Se esqueceu a senha, utilize a opção de recuperação.');
            }
            // Trata erros de validação do Spring
            if (data.errors || data.message?.includes('Validation failed')) {
              let mensagens = [];
              if (data.errors && Array.isArray(data.errors)) {
                mensagens = data.errors.map((err: any) => err.defaultMessage || err.message || err);
              } else if (data.message) {
                // Extrai mensagens do message se não vier em errors
                if (data.message.includes('senha')) {
                  mensagens.push('A senha deve ter pelo menos 6 caracteres, incluindo letras, números e um caractere especial.');
                }
                if (data.message.includes('dataNascimento')) {
                  mensagens.push('Data de nascimento inválida.');
                }
              }
              throw new Error(mensagens.join(' '));
            }
            throw new Error(data.message || 'Erro ao cadastrar usuário');
          });
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem('userData', JSON.stringify(data));
        const userId = data.idUsuario;
        setModalConfirmacao({
          mensagem: '<span class="font-bold text-lg">Cadastro realizado com sucesso!</span><br/><span>Deseja continuar para o formulário de anamnese?</span>',
          onConfirm: () => {
            setModalConfirmacao(null);
            if (userId) {
              navigate(`/inscricao-anamnese?id=${userId}`);
            } else {
              navigate('/inscricao-anamnese');
            }
          }
        });
      })
      .catch((error) => {
        setModalErro(error.message);
      })
      .finally(() => setIsLoading(false));
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
      {/* Modal de Confirmação */}
      {modalConfirmacao && (
        <ModalConfirmacao
          mensagem={<span dangerouslySetInnerHTML={{__html: modalConfirmacao.mensagem}} />}
          onConfirm={modalConfirmacao.onConfirm}
          onCancel={() => setModalConfirmacao(null)}
        />
      )}

      {/* Loading Animation */}
      {isLoading && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-80">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#F3F4F6] border-solid"></div>
            <span className="mt-4 text-[#F3F4F6] font-semibold text-lg">Enviando a requisição...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelaLogin;