import { updateEmailInLocalStorage } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';

interface Endereco {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
}

export interface UserProfileInput {
    nome: string;
    sobrenome: string;
    telefone: string;
    email: string;
    dataNascimento?: string;
    genero?: string;
    endereco?: Endereco;
}

export interface UserProfileOutput {
    idUsuario: number;
    nome: string;
    sobrenome: string;
    telefone: string;
    email: string;
    dataNascimento?: string;
    genero?: string;
    fotoUrl?: string;
    endereco?: Endereco;
}

export const useUserProfile = () => {
    const navigate = useNavigate();    // Função utilitária para buscar dados de autenticação do localStorage
    const getUserAuthData = () => {
        const userData = localStorage.getItem('userData');
        const userInfo = localStorage.getItem('userInfo');
        
        let user: any = {};
        let token: string | undefined;
        let usuarioId: number | undefined;
        let tipoUsuario: string | undefined;
        
        // Tentar buscar do userData primeiro
        if (userData) {
            user = JSON.parse(userData);
            token = user.token;
            usuarioId = user.idUsuario;
            tipoUsuario = user.tipo;
        }
        
        // Se não encontrou idUsuario no userData, buscar no userInfo
        if (!usuarioId && userInfo) {
            const info = JSON.parse(userInfo);
            usuarioId = info.id;
            tipoUsuario = info.tipo;
        }
        
        if (!usuarioId) {
            throw new Error('ID do usuário não encontrado');
        }
        
        // Mapear tipo do usuário para o formato esperado pelo backend
        let tipoFormatado = 'assistido'; // default
        if (tipoUsuario) {
            const tipo = tipoUsuario.toUpperCase();
            if (tipo === 'VOLUNTARIO') {
                tipoFormatado = 'voluntario';
            } else if (tipo === 'ADMINISTRADOR') {
                tipoFormatado = 'assistente-social';
            } else if (tipo === 'VALOR_SOCIAL' || tipo === 'GRATUIDADE') {
                tipoFormatado = 'assistido';
            }
        }
        
        return { user, token, usuarioId, tipoUsuario: tipoFormatado };
    };

    const atualizarUltimoAcesso = async (usuarioId: number, token: string) => {
        try {
            const response = await fetch(`http://localhost:8080/usuarios/${usuarioId}/ultimo-acesso`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Erro ao atualizar último acesso:', response.status);
            }
        } catch (error) {
            console.error('Erro ao atualizar último acesso:', error);
        }
    };    const fetchPerfil = async (): Promise<UserProfileOutput> => {
        try {
            const { user, token, usuarioId, tipoUsuario } = getUserAuthData();
            
            console.log('🔍 Debug - usuarioId final:', usuarioId);
            console.log('🔍 Debug - tipoUsuario:', tipoUsuario);
            console.log('🔍 Debug - token:', token ? 'Token exists' : 'No token');

            // Atualizar último acesso do usuário
            if (token) {
                await atualizarUltimoAcesso(usuarioId, token);
            }            // Usar endpoint específico para assistente social
            const endpoint = tipoUsuario === 'assistente-social' 
                ? `http://localhost:8080/perfil/assistente-social?usuarioId=${usuarioId}`
                : `http://localhost:8080/perfil/${tipoUsuario}/dados-pessoais?usuarioId=${usuarioId}`;
            
            console.log('🔍 Debug - URL:', endpoint);
            console.log('🔍 Debug - Usando endpoint específico para assistente social:', tipoUsuario === 'assistente-social');

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                }
            });            if (!response.ok) {
                const errorText = await response.text();
                console.log('🔍 Debug - Error response:', errorText);
                
                // Se for erro de autenticação (401), mas apenas redirecionar se não estivermos em uma rota pública
                if (response.status === 401) {
                    console.log('Token inválido ou expirado');
                    // Verificar se o usuário está realmente em uma página que requer autenticação
                    const currentPath = window.location.pathname;
                    const publicRoutes = ['/login', '/cadastro', '/completar-cadastro-usuario', '/completar-cadastro-voluntario'];
                    
                    if (!publicRoutes.some(route => currentPath.startsWith(route))) {
                        console.log('Redirecionando para login devido a token inválido...');
                        localStorage.removeItem('userData');
                        navigate('/login');
                    }
                    throw new Error('Token inválido ou expirado');
                }
                
                // Se for erro de conexão (500, network error, etc), não redirecionar
                if (response.status >= 500) {
                    console.log('Erro do servidor - não redirecionando');
                    throw new Error('Erro do servidor - tente novamente mais tarde');
                }
                
                throw new Error('Erro ao buscar perfil');
            }

            const data = await response.json();
            
            // Se houver uma foto, adiciona a URL base
            if (data.fotoUrl) {
                data.fotoUrl = `http://localhost:8080${data.fotoUrl}`;
            }

            console.log('🔍 Debug - Profile data:', data);
            return data;
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            
            // Se for erro de rede (fetch failed), não redirecionar
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.log('Erro de rede - backend pode estar offline');
                throw new Error('Erro de conexão - verifique se o servidor está funcionando');
            }
            
            throw error;
        }
    };

    const atualizarDadosPessoais = async (dados: {
        nome: string;
        sobrenome: string;
        telefone: string;
        email: string;
        dataNascimento?: string;
        genero?: string;
    }): Promise<{
        nome: string;
        sobrenome: string;
        telefone: string;
        email: string;
        dataNascimento?: string;
        genero?: string;    }> => {
        try {
            const { token, usuarioId, tipoUsuario } = getUserAuthData();            console.log('🔍 Debug PATCH - dados enviados:', dados);
            console.log('🔍 Debug PATCH - tipoUsuario:', tipoUsuario);
            console.log('🔍 Debug PATCH - usuarioId:', usuarioId);

            // Usar endpoint específico para assistente social
            const endpoint = tipoUsuario === 'assistente-social' 
                ? `http://localhost:8080/perfil/assistente-social/dados-pessoais?usuarioId=${usuarioId}`
                : `http://localhost:8080/perfil/${tipoUsuario}/dados-pessoais?usuarioId=${usuarioId}`;

            console.log('🔍 Debug PATCH - endpoint:', endpoint);
            console.log('🔍 Debug PATCH - Usando endpoint específico para assistente social:', tipoUsuario === 'assistente-social');

            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                },
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na resposta:', errorText);
                throw new Error(`Erro ao atualizar dados pessoais: ${response.status}`);
            }

            const result = await response.json();
            
            // Atualizar localStorage se o email foi alterado
            if (result.email) {
                updateEmailInLocalStorage(result.email);
            }
            
            return {
                nome: result.nome || dados.nome,
                sobrenome: result.sobrenome || dados.sobrenome,
                telefone: result.telefone || dados.telefone,
                email: result.email || dados.email,
                dataNascimento: result.dataNascimento || dados.dataNascimento,
                genero: result.genero || dados.genero
            };
        } catch (error) {
            console.error('Erro ao atualizar dados pessoais:', error);
            throw error;
        }
    };    const buscarEndereco = async (): Promise<Endereco | null> => {
        try {
            const { token, usuarioId } = getUserAuthData();

            const response = await fetch(`http://localhost:8080/perfil/usuario/endereco?usuarioId=${usuarioId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // Endereço não encontrado
                }
                throw new Error('Erro ao buscar endereço');
            }

            const enderecoOutput = await response.json();
            
            // Converter EnderecoOutput para Endereco
            return {
                rua: enderecoOutput.logradouro || '',
                numero: enderecoOutput.numero || '',
                complemento: enderecoOutput.complemento || '',
                bairro: enderecoOutput.bairro || '',
                cidade: enderecoOutput.cidade || '',
                estado: enderecoOutput.uf || '',
                cep: enderecoOutput.cep || ''
            };
        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            throw error;
        }
    };    const atualizarEndereco = async (endereco: {
        cep: string;
        numero: string;
        complemento?: string;
    }): Promise<void> => {
        try {
            const { token, usuarioId } = getUserAuthData();

            // Preparar dados para envio no formato esperado pelo backend
            const enderecoInput = {
                cep: endereco.cep,
                numero: endereco.numero,
                complemento: endereco.complemento || ''
            };

            const response = await fetch(`http://localhost:8080/perfil/usuario/endereco?usuarioId=${usuarioId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                },
                body: JSON.stringify(enderecoInput)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar endereço');
            }
        } catch (error) {
            console.error('Erro ao atualizar endereço:', error);
            throw error;
        }
    };    const uploadFoto = async (foto: File): Promise<{ fotoUrl: string }> => {
        try {
            const { token, usuarioId } = getUserAuthData();

            const formData = new FormData();
            formData.append('file', foto);

            const response = await fetch(`http://localhost:8080/perfil/usuario/foto?usuarioId=${usuarioId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || ''}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro ao fazer upload da foto');
            }

            const result = await response.json();
            
            // Se houver uma foto, adiciona a URL base
            if (result.fotoUrl) {
                result.fotoUrl = `http://localhost:8080${result.fotoUrl}`;
            }

            return result;
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            throw error;
        }
    };

    return {
        fetchPerfil,
        atualizarDadosPessoais,
        buscarEndereco,
        atualizarEndereco,
        uploadFoto
    };
};
