import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../TelaLogin.css';
import ModalErro from './ui/ModalErro';
import ModalConfirmacao from './ui/ModalConfirmacao';
import { Locate } from 'lucide-react';

const TelaLogin: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
    const [cadastroSobrenome, setCadastroSobrenome] = useState('');
    const [cadastroEmail, setCadastroEmail] = useState('');
    const [cadastroSenha, setCadastroSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');

    // Validações
    const validarNome = (nome: string): string | null => {
        if (nome.length < 3) {
            return 'O nome deve ter pelo menos 3 caracteres.';
        }
        return null;
    };

    const validarSobrenome = (sobrenome: string): string | null => {
        if (sobrenome.length < 3) {
            return 'O sobrenome deve ter pelo menos 3 caracteres.';
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

    const validarCadastro = (): boolean => {
        if (!cadastroNome || !cadastroSobrenome || !cadastroEmail || !cadastroSenha || !confirmaSenha) {
            setModalErro('Por favor, preencha todos os campos.');
            return false;
        }

        if (cadastroSenha !== confirmaSenha) {
            setModalErro('As senhas não coincidem.');
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
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        }
    };

    // Login
    const handleLogin = async () => {
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
        try {
            const response = await fetch('http://localhost:8080/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginEmail,
                    senha: loginSenha
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Credenciais inválidas');
            }

            localStorage.setItem('userData', JSON.stringify(data));
              if (data.fase === 1) {
                navigate(data.idUsuario ? `/inscricao-anamnese?id=${data.idUsuario}` : '/inscricao-anamnese');
            } else {
                if (!data.tipo) {
                    setModalErro('Aguarde o contato da assistente social');
                    return;
                }

                const tipoUsuario = (data.tipo || '').toString().toLowerCase();
                switch (tipoUsuario) {
                    case 'administrador':
                        navigate('/home');
                        break;
                    case 'assistente social':
                        navigate('/assistente-social');
                        break;
                    default:
                        navigate('/home-user');
                }
            }
        } catch (error: any) {
            setModalErro(error.message || 'Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    // Cadastro
    const handleCadastro = async () => {
        if (!validarCadastro()) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/usuarios/fase1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: cadastroNome,
                    sobrenome: cadastroSobrenome,
                    email: cadastroEmail,
                    senha: cadastroSenha
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                if (data.message?.includes('constraint') || data.message?.includes('CONSTRAINT_INDEX_2')) {
                    throw new Error('Email já cadastrado');
                }
                throw new Error(data.message || 'Erro ao cadastrar');
            }

            localStorage.setItem('userData', JSON.stringify(data));            setModalConfirmacao({
                mensagem: 'Cadastro realizado com sucesso! Deseja continuar para o formulário de anamnese?',
                onConfirm: () => {
                    setModalConfirmacao(null);
                    navigate(data.idUsuario ? `/inscricao-anamnese?id=${data.idUsuario}` : '/inscricao-anamnese');
                }
            });
        } catch (error: any) {
            setModalErro(error.message || 'Erro ao cadastrar');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
            <div className="forms-container">
                <div className="signin-signup">
                    {/* Login Form */}
                    <form className="sign-in-form" onSubmit={(e) => e.preventDefault()}>
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
                      </form>          {/* Cadastro Form */}
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
                            onClick={() => togglePasswordVisibility('confirma_password_signup')}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </div>
                        <input type="button" className="btn" value="Cadastrar" onClick={handleCadastro} />
                        <button 
                          className="btn-google" 
                          onClick={() => window.location.href = 'http://localhost:8080/login/authorization/google'}
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
                        <p>Não possui acesso? Que tal aproveitar para se ingressar em nosso projeto?</p>
                        <button className="btn transparent" onClick={toggleMode}>
                            Cadastre-se
                        </button>
                    </div>
                    <img src="./image/homem-computador.svg" className="image" alt="Homem no computador" />
                </div>
                <div className="panel right-panel">
                    <div className="content">
                        <h3>JÁ TEM CONTA?</h3>
                        <p>Já aproveita dos nossos serviços?</p>
                        <button className="btn transparent" onClick={toggleMode}>
                            Log-in
                        </button>
                    </div>
                    <img src="./image/senhorzinho.png" className="image" alt="Senhorzinho" />
                </div>
            </div>

            {/* Modal de Erro */}
            {modalErro && <ModalErro mensagem={modalErro} onClose={() => setModalErro(null)} />}
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
                        <span className="mt-4 text-[#F3F4F6] font-semibold text-lg">Enviando a requisição...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TelaLogin;