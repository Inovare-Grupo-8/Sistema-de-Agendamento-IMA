import { updateEmailInLocalStorage } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';

interface Endereco {
  rua: string;
  numero: string;
  complemento: string; // Changed from optional to required
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
        console.log('🔍 [useUserProfile] DEBUG: getUserAuthData iniciado');
        
        const userData = localStorage.getItem('userData');
        const userInfo = localStorage.getItem('userInfo');
        
        console.log('🔍 [useUserProfile] DEBUG: userData exists:', !!userData);
        console.log('🔍 [useUserProfile] DEBUG: userInfo exists:', !!userInfo);
        console.log('🔍 [useUserProfile] DEBUG: localStorage keys:', Object.keys(localStorage));
        
        let user: any = {};
        let token: string | undefined;
        let usuarioId: number | undefined;
        
        // Tentar buscar do userData primeiro
        if (userData) {
            try {
                user = JSON.parse(userData);
                token = user.token;
                usuarioId = user.idUsuario;
                console.log('🔍 [useUserProfile] DEBUG: userData parsed - idUsuario:', usuarioId, 'token length:', token?.length || 0);
            } catch (e) {
                console.error('❌ [useUserProfile] DEBUG: Erro ao fazer parse do userData:', e);
            }
        }
        
        // Se não encontrou idUsuario no userData, buscar no userInfo
        if (!usuarioId && userInfo) {
            try {
                const info = JSON.parse(userInfo);
                usuarioId = info.id;
                console.log('🔍 [useUserProfile] DEBUG: usuarioId obtido do userInfo:', usuarioId);
            } catch (e) {
                console.error('❌ [useUserProfile] DEBUG: Erro ao fazer parse do userInfo:', e);
            }
        }
        
        console.log('🔍 [useUserProfile] DEBUG: Resultado final - usuarioId:', usuarioId, 'token exists:', !!token);
        
        if (!usuarioId) {
            console.error('❌ [useUserProfile] DEBUG: ID do usuário não encontrado!');
            throw new Error('ID do usuário não encontrado');
        }
        
        return { user, token, usuarioId };
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
            console.log('🔄 [useUserProfile] DEBUG: fetchPerfil iniciado');
            const { user, token, usuarioId } = getUserAuthData();
            
            console.log('🔍 [useUserProfile] DEBUG - usuarioId final:', usuarioId);
            console.log('🔍 [useUserProfile] DEBUG - token exists:', !!token);
            console.log('🔍 [useUserProfile] DEBUG - token length:', token?.length || 0);

            // Atualizar último acesso do usuário
            if (token) {
                console.log('🔄 [useUserProfile] DEBUG: Atualizando último acesso...');
                await atualizarUltimoAcesso(usuarioId, token);
            }

            const url = `http://localhost:8080/perfil/usuario/dados-pessoais?usuarioId=${usuarioId}`;
            console.log('🔍 [useUserProfile] DEBUG - URL:', url);

            console.log('🌐 [useUserProfile] DEBUG: Fazendo requisição para buscar perfil...');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                }
            });

            console.log('📡 [useUserProfile] DEBUG: Resposta recebida - status:', response.status);
            console.log('📡 [useUserProfile] DEBUG: Resposta recebida - ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ [useUserProfile] DEBUG - Error response:', errorText);
                console.log('❌ [useUserProfile] DEBUG - Response status:', response.status);
                console.log('❌ [useUserProfile] DEBUG - Response headers:', Object.fromEntries(response.headers.entries()));
                
                // Se for erro de autenticação (401), mas apenas redirecionar se não estivermos em uma rota pública
                if (response.status === 401) {
                    console.log('🚨 [useUserProfile] DEBUG: Token inválido ou expirado (401)');
                    // Verificar se o usuário está realmente em uma página que requer autenticação
                    const currentPath = window.location.pathname;
                    const publicRoutes = ['/login', '/cadastro', '/completar-cadastro-usuario', '/completar-cadastro-voluntario'];
                    
                    console.log('🔍 [useUserProfile] DEBUG: Verificando rota atual:', currentPath);
                    console.log('🔍 [useUserProfile] DEBUG: Rotas públicas:', publicRoutes);
                    
                    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
                    console.log('🔍 [useUserProfile] DEBUG: É rota pública?', isPublicRoute);
                    
                    if (!isPublicRoute) {
                        console.log('🚨🚨🚨 [useUserProfile] DEBUG: REDIRECIONAMENTO PARA LOGIN DETECTADO!');
                        console.log('🚨 [useUserProfile] DEBUG: Rota atual não é pública:', currentPath);
                        console.log('🚨 [useUserProfile] DEBUG: Limpando localStorage e redirecionando...');
                        console.log('🚨 [useUserProfile] DEBUG: Timestamp do redirecionamento:', new Date().toISOString());
                        
                        localStorage.removeItem('userData');
                        navigate('/login');
                    } else {
                        console.log('✅ [useUserProfile] DEBUG: Rota pública detectada, não redirecionando');
                    }
                    throw new Error('Token inválido ou expirado');
                }
                
                // Se for erro de conexão (500, network error, etc), não redirecionar
                if (response.status >= 500) {
                    console.log('⚠️ [useUserProfile] DEBUG: Erro do servidor (>=500) - não redirecionando');
                    throw new Error('Erro do servidor - tente novamente mais tarde');
                }
                
                console.log('❌ [useUserProfile] DEBUG: Erro genérico na resposta');
                throw new Error('Erro ao buscar perfil');
            }

            console.log('✅ [useUserProfile] DEBUG: Resposta OK, fazendo parse JSON...');
            const data = await response.json();
            
            // Se houver uma foto, adiciona a URL base
            if (data.fotoUrl) {
                data.fotoUrl = `http://localhost:8080${data.fotoUrl}`;
                console.log('🖼️ [useUserProfile] DEBUG: URL da foto processada:', data.fotoUrl);
            }

            console.log('✅ [useUserProfile] DEBUG: Profile data recebido com sucesso');
            console.log('🔍 [useUserProfile] DEBUG: Campos recebidos:', Object.keys(data));
            return data;
        } catch (error) {
            console.error('❌ [useUserProfile] DEBUG: Erro ao buscar perfil:', error);
            console.log('🔍 [useUserProfile] DEBUG: Tipo do erro:', error?.constructor?.name);
            
            // Se for erro de rede (fetch failed), não redirecionar
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.log('🌐 [useUserProfile] DEBUG: Erro de rede detectado - backend pode estar offline');
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
            const { token, usuarioId } = getUserAuthData();

            const response = await fetch(`http://localhost:8080/perfil/usuario/dados-pessoais?usuarioId=${usuarioId}`, {
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
            console.log('🔄 [useUserProfile] DEBUG: buscarEndereco iniciado');
            const { token, usuarioId } = getUserAuthData();

            const url = `http://localhost:8080/perfil/usuario/endereco?usuarioId=${usuarioId}`;
            console.log('🔍 [useUserProfile] DEBUG: buscarEndereco URL:', url);

            console.log('🌐 [useUserProfile] DEBUG: Fazendo requisição para buscar endereço...');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                }
            });

            console.log('📡 [useUserProfile] DEBUG: buscarEndereco - status:', response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('ℹ️ [useUserProfile] DEBUG: Endereço não encontrado (404)');
                    return null; // Endereço não encontrado
                }
                
                console.log('❌ [useUserProfile] DEBUG: Erro ao buscar endereço - status:', response.status);
                throw new Error('Erro ao buscar endereço');
            }

            const enderecoOutput = await response.json();
            console.log('✅ [useUserProfile] DEBUG: Endereço recebido:', enderecoOutput);
            
            // Converter EnderecoOutput para Endereco
            const endereco = {
                rua: enderecoOutput.logradouro || '',
                numero: enderecoOutput.numero || '',
                complemento: enderecoOutput.complemento || '',
                bairro: enderecoOutput.bairro || '',
                cidade: enderecoOutput.cidade || '',
                estado: enderecoOutput.uf || '',
                cep: enderecoOutput.cep || ''
            };
            
            console.log('✅ [useUserProfile] DEBUG: Endereço convertido:', endereco);
            return endereco;
        } catch (error) {
            console.error('❌ [useUserProfile] DEBUG: Erro ao buscar endereço:', error);
            throw error;
        }
    };const atualizarEndereco = async (endereco: {
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
