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
          console.log('🔍 [useUserProfile] DEBUG: Resultado final - usuarioId:', usuarioId, 'token exists:', !!token);
        console.log('🔍 [useUserProfile] DEBUG: Tipo de usuário original:', tipoUsuario);
        
        if (!usuarioId) {
            console.error('❌ [useUserProfile] DEBUG: ID do usuário não encontrado!');
            throw new Error('ID do usuário não encontrado');
        }
          // ✅ CORREÇÃO: Para ProfileFormUser, sempre usar 'assistido'
        let tipoFormatado = 'assistido'; // Para usuários assistidos
        
        console.log('🔍 [useUserProfile] DEBUG: Tipo original do localStorage:', tipoUsuario);
        console.log('🔍 [useUserProfile] DEBUG: Tipo formatado FIXO para assistido:', tipoFormatado);
        
        return { user, token, usuarioId, tipoUsuario: tipoFormatado };
    };

    // Função para criar dados de perfil offline (quando backend não estiver disponível)
    const createOfflineProfile = (userAuthData: any): UserProfileOutput => {
        const { user, usuarioId } = userAuthData;
        
        // Buscar dados salvos localmente
        const savedProfile = localStorage.getItem('savedProfile');
        const localProfile = savedProfile ? JSON.parse(savedProfile) : {};
        
        return {
            idUsuario: usuarioId,
            nome: localProfile.nome || user.nome || '',
            sobrenome: localProfile.sobrenome || user.sobrenome || '',
            telefone: localProfile.telefone || user.telefone || '',
            email: localProfile.email || user.email || '',
            dataNascimento: localProfile.dataNascimento || '',
            genero: localProfile.genero || '',
            fotoUrl: localProfile.fotoUrl || ''
        };
    };

    const fetchPerfil = async (): Promise<UserProfileOutput> => {
        try {
            const authData = getUserAuthData();
            const { token, usuarioId, tipoUsuario } = authData;

            // Tentar buscar do backend
            const endpoint = tipoUsuario === 'assistente-social' 
                ? `http://localhost:8080/perfil/assistente-social?usuarioId=${usuarioId}`
                : `http://localhost:8080/perfil/${tipoUsuario}/dados-pessoais?usuarioId=${usuarioId}`;
            
            const response = await fetch(endpoint, {

                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                }
            });

            if (!response.ok) {
                // Se for erro de autenticação, só redirecionar se estivermos em página protegida
                if (response.status === 401) {
                    const currentPath = window.location.pathname;
                    const publicRoutes = ['/login', '/cadastro', '/completar-cadastro-usuario', '/completar-cadastro-voluntario'];
                    
                    if (!publicRoutes.some(route => currentPath.startsWith(route))) {

                        localStorage.removeItem('userData');
                        navigate('/login');
                    } else {
                        console.log('✅ [useUserProfile] DEBUG: Rota pública detectada, não redirecionando');
                    }
                    throw new Error('Token inválido ou expirado');
                }
                
                // Para outros erros (500, etc), usar dados offline
                console.warn(`Erro ${response.status} no backend, usando dados offline`);
                return createOfflineProfile(authData);

            }

            console.log('✅ [useUserProfile] DEBUG: Resposta OK, fazendo parse JSON...');
            const data = await response.json();
            
            // Se houver uma foto, adicionar a URL base
            if (data.fotoUrl) {
                data.fotoUrl = `http://localhost:8080${data.fotoUrl}`;
                console.log('🖼️ [useUserProfile] DEBUG: URL da foto processada:', data.fotoUrl);
            }

            // Salvar no localStorage para usar offline
            localStorage.setItem('savedProfile', JSON.stringify(data));
            
            return data;
        } catch (error) {
            // Se for erro de rede, usar dados offline
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.warn('Backend indisponível, usando dados offline');
                return createOfflineProfile(getUserAuthData());
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
        genero?: string;
    }> => {
        try {
            const { token, usuarioId, tipoUsuario } = getUserAuthData();

            // Sempre salvar localmente primeiro
            const currentProfile = localStorage.getItem('savedProfile');
            const profile = currentProfile ? JSON.parse(currentProfile) : {};
            const updatedProfile = { ...profile, ...dados };
            localStorage.setItem('savedProfile', JSON.stringify(updatedProfile));

            // Tentar enviar para o backend
            try {
                const endpoint = tipoUsuario === 'assistente-social' 
                    ? `http://localhost:8080/perfil/assistente-social/dados-pessoais?usuarioId=${usuarioId}`
                    : `http://localhost:8080/perfil/${tipoUsuario}/dados-pessoais?usuarioId=${usuarioId}`;

                const response = await fetch(endpoint, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token || ''}`
                    },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    // Atualizar localStorage se o email foi alterado
                    if (result.email) {
                        updateEmailInLocalStorage(result.email);
                    }
                    
                    // Salvar resultado do backend
                    localStorage.setItem('savedProfile', JSON.stringify({ ...updatedProfile, ...result }));
                    
                    return {
                        nome: result.nome || dados.nome,
                        sobrenome: result.sobrenome || dados.sobrenome,
                        telefone: result.telefone || dados.telefone,
                        email: result.email || dados.email,
                        dataNascimento: result.dataNascimento || dados.dataNascimento,
                        genero: result.genero || dados.genero
                    };
                } else {
                    console.warn('Erro no backend, dados salvos localmente');
                }
            } catch (networkError) {
                console.warn('Backend indisponível, dados salvos localmente');
            }

            // Se chegou aqui, usar dados locais
            if (dados.email) {
                updateEmailInLocalStorage(dados.email);
            }
            
            return dados;
        } catch (error) {
            console.error('Erro ao atualizar dados pessoais:', error);
            throw error;
        }
    };    const buscarEndereco = async (): Promise<Endereco | null> => {
        try {
            console.log('🔄 [useUserProfile] DEBUG: buscarEndereco iniciado');
            const { token, usuarioId, tipoUsuario } = getUserAuthData();
            console.log('🔍 [useUserProfile] DEBUG: buscarEndereco - tipoUsuario:', tipoUsuario);            const url = `http://localhost:8080/perfil/assistido/endereco?usuarioId=${usuarioId}`;
            console.log('🔍 [useUserProfile] DEBUG: buscarEndereco URL completa:', url);

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
                
                // Buscar endereço salvo localmente
                const savedProfile = localStorage.getItem('savedProfile');
                if (savedProfile) {
                    const profile = JSON.parse(savedProfile);
                    return profile.endereco || null;
                }
                
                return null;
            }

            const enderecoOutput = await response.json();
            console.log('✅ [useUserProfile] DEBUG: Endereço recebido:', enderecoOutput);
              // Converter EnderecoOutput para Endereco
            const endereco = {
                rua: enderecoOutput.logradouro || '',
                numero: enderecoOutput.numero || '',
                complemento: enderecoOutput.complemento || '',
                bairro: enderecoOutput.bairro || '',
                cidade: enderecoOutput.localidade || '', // ✅ CORREÇÃO: usar localidade do backend
                estado: enderecoOutput.uf || '',
                cep: enderecoOutput.cep || ''
            };

            // Salvar localmente
            const savedProfile = localStorage.getItem('savedProfile');
            const profile = savedProfile ? JSON.parse(savedProfile) : {};
            profile.endereco = endereco;
            localStorage.setItem('savedProfile', JSON.stringify(profile));

            return endereco;
        } catch (error) {
            console.warn('Erro ao buscar endereço do backend, usando dados locais');
            
            // Buscar endereço salvo localmente
            const savedProfile = localStorage.getItem('savedProfile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                return profile.endereco || null;
            }
            
            return null;
        }
    };    const atualizarEndereco = async (endereco: {
        cep: string;
        numero: string;
        complemento?: string;
    }): Promise<void> => {
        try {
            console.log('🔄 [useUserProfile] DEBUG: atualizarEndereco iniciado');
            console.log('🔍 [useUserProfile] DEBUG: Dados recebidos:', endereco);
            
            const { token, usuarioId, tipoUsuario } = getUserAuthData();
            console.log('🔍 [useUserProfile] DEBUG: Auth data:', { usuarioId, tipoUsuario, hasToken: !!token });

            // ✅ CORREÇÃO: Validar dados obrigatórios
            if (!endereco.cep?.trim() || !endereco.numero?.trim()) {
                throw new Error('CEP e número são obrigatórios para salvar o endereço');
            }

            // ✅ CORREÇÃO: Preparar dados exatamente como o backend espera
            const enderecoInput = {
                cep: endereco.cep.replace(/\D/g, ''), // Remove formatação: 03026-000 → 03026000
                numero: endereco.numero.toString().trim(),
                complemento: endereco.complemento?.trim() || ''
            };

            console.log('🔍 [useUserProfile] DEBUG: Dados formatados:', enderecoInput);

            // ✅ CORREÇÃO: URL sempre para assistido
            const url = `http://localhost:8080/perfil/assistido/endereco?usuarioId=${usuarioId}`;
            console.log('🌐 [useUserProfile] DEBUG: URL da requisição:', url);

            // ✅ CORREÇÃO: Headers completos
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            console.log('🚀 [useUserProfile] DEBUG: Enviando requisição PUT...');
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(enderecoInput)
            });

            console.log('📡 [useUserProfile] DEBUG: Status da resposta:', response.status);
            console.log('📡 [useUserProfile] DEBUG: Status text:', response.statusText);

            // ✅ CORREÇÃO: Verificar resposta correta (204 No Content é sucesso)
            if (response.status === 204) {
                console.log('✅ [useUserProfile] DEBUG: Endereço atualizado com sucesso (204 No Content)');
            } else if (response.ok) {
                console.log('✅ [useUserProfile] DEBUG: Endereço atualizado com sucesso');
            } else {
                let errorText = '';
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = 'Erro desconhecido';
                }
                
                console.error('❌ [useUserProfile] ERROR: Erro na resposta do backend:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                
                throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
            }

            // ✅ SALVAR localmente APENAS após confirmação do backend
            const savedProfile = localStorage.getItem('savedProfile');
            const profile = savedProfile ? JSON.parse(savedProfile) : {};
            
            // Manter dados completos do endereço
            profile.endereco = { 
                ...profile.endereco, 
                cep: endereco.cep,
                numero: endereco.numero,
                complemento: endereco.complemento || ''
            };
            localStorage.setItem('savedProfile', JSON.stringify(profile));
            
            console.log('💾 [useUserProfile] DEBUG: Endereço salvo localmente após sucesso no backend');

        } catch (error) {
            console.error('❌ [useUserProfile] ERROR: Erro ao atualizar endereço:', error);
            
            // ✅ IMPORTANTE: NÃO salvar localmente se houve erro no backend
            // Isso evita que o frontend mostre sucesso quando o backend falhou
            throw error;
        }
    };const uploadFoto = async (foto: File): Promise<string> => {
        try {
            const { token, usuarioId, tipoUsuario } = getUserAuthData();

            const formData = new FormData();
            formData.append('file', foto);

            const response = await fetch(`http://localhost:8080/perfil/assistido/foto?usuarioId=${usuarioId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || ''}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao fazer upload da foto: ${errorText}`);
            }

            const result = await response.json();
            
            // Concatena a URL base com o caminho relativo retornado pelo servidor
            const photoUrl = `http://localhost:8080${result.url}`;
            
            // Salvar localmente
            const savedProfile = localStorage.getItem('savedProfile');
            const profile = savedProfile ? JSON.parse(savedProfile) : {};
            profile.fotoUrl = photoUrl;
            localStorage.setItem('savedProfile', JSON.stringify(profile));

            return photoUrl;
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
