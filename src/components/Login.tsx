import React, { useState } from 'react';
import '../login-e-cadastro.css';
import ModalErro from './ui/ModalErro';

const Login: React.FC = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [modalErro, setModalErro] = useState<string | null>(null);

  // Estados para os campos de login e cadastro
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [cadastroNome, setCadastroNome] = useState('');
  const [cadastroEmail, setCadastroEmail] = useState('');
  const [cadastroSenha, setCadastroSenha] = useState('');
  const [cadastroCPF, setCadastroCPF] = useState('');
  const [cadastroDataNascimento, setCadastroDataNascimento] = useState('');

  // Alternar entre login e cadastro
  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
  };

  // Validações
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
    const erroEmail = validarEmail(loginEmail);
    if (erroEmail) {
      setModalErro(erroEmail);
      return;
    }

    fetch('http://localhost:3000/usuarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
      .then((response) => response.json())
      .then((usuarios) => {
        const usuario = usuarios.find(
          (user: any) => user.email === loginEmail && user.senha === loginSenha
        );

        if (usuario) {
          alert('Login bem-sucedido!');
          window.location.href = '../index.html';
        } else {
          setModalErro('Email ou senha incorretos.');
        }
      })
      .catch(() => {
        setModalErro('Erro ao tentar realizar o login.');
      });
  };

  // Cadastro
  const handleCadastro = () => {
    if (!validarCadastro()) {
      return;
    }

    const novoUsuario = {
      nome: cadastroNome,
      email: cadastroEmail,
      senha: cadastroSenha,
      cpf: cadastroCPF,
      dataNascimento: cadastroDataNascimento,
    };

    fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(novoUsuario),
    })
      .then(() => {
        alert('Usuário cadastrado com sucesso!');
        setIsSignUpMode(false);
      })
      .catch(() => {
        setModalErro('Erro ao tentar cadastrar usuário.');
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
            </div>
            <input type="button" className="btn" value="Cadastrar" onClick={handleCadastro} />
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
          <img src="../image/homem-computador.svg" id="homem" className="image" alt="Homem no computador" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>JÁ TEM CONTA?</h3>
            <p>Já aproveita dos nossos serviços?</p>
            <button className="btn transparent" onClick={toggleMode}>
              Log-in
            </button>
          </div>
          <img src="../image/senhorzinho.png" id="senhor" className="image" alt="Senhorzinho" />
        </div>
      </div>

      {/* Modal de Erro */}
      {modalErro && <ModalErro mensagem={modalErro} onClose={() => setModalErro(null)} />}
    </div>
  );
};

export default Login;