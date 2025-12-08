import { useCallback, useContext } from 'react';
import { UserContext } from '@/contexts/UserContextInstance';
import { buildBackendUrl, resolvePerfilPath } from '@/lib/utils';
import type { Endereco, UserData } from '@/types/user';

const toTrimmedString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const mergeEnderecoData = (
  current: Endereco,
  incoming: Record<string, unknown> | null | undefined
): Endereco => {
  if (!incoming || typeof incoming !== 'object') {
    return current;
  }

  return {
    rua: toTrimmedString(incoming['rua']) || toTrimmedString(incoming['logradouro']) || current.rua,
    numero: toTrimmedString(incoming['numero']) || current.numero,
    complemento: toTrimmedString(incoming['complemento']) || current.complemento,
    bairro: toTrimmedString(incoming['bairro']) || current.bairro,
    cidade: toTrimmedString(incoming['cidade']) || current.cidade,
    estado: toTrimmedString(incoming['estado']) || current.estado,
    cep: toTrimmedString(incoming['cep']) || current.cep,
  };
};

const extractNamesFromFullName = (fullName: unknown): Pick<UserData, 'nome' | 'sobrenome'> => {
  const trimmed = toTrimmedString(fullName);
  if (!trimmed) {
    return { nome: '', sobrenome: '' };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { nome: parts[0], sobrenome: '' };
  }

  return {
    nome: parts[0],
    sobrenome: parts.slice(1).join(' '),
  };
};

const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  const { userData: contextUserData, updateUserData: contextUpdateUserData } = context;

  const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes

  // Função para validar o tamanho da imagem
  const validateImageSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
  };

  // Função para comprimir a imagem se necessário
  const compressImage = async (file: File): Promise<File> => {
    if (file.size <= MAX_FILE_SIZE) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular nova dimensão mantendo aspecto
          if (width > height) {
            if (width > 800) {
              height = Math.round((height * 800) / width);
              width = 800;
            }
          } else {
            if (height > 800) {
              width = Math.round((width * 800) / height);
              height = 800;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Falha ao comprimir imagem'));
              }
            },
            'image/jpeg',
            0.7
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };
  // Função para buscar dados do perfil do usuário
  const fetchPerfil = useCallback(async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Usuário não está logado');
      }
      
      const user = JSON.parse(userData);
      const token = user.token;

      const usuarioId = user.idUsuario || user.id;

      const tipoUsuario = user.tipo;
      const funcao = user.funcao;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado');
      }
      const base = import.meta.env.VITE_URL_BACKEND || '/api';
      let tipoPath = 'assistido';
      if (tipoUsuario === 'ADMINISTRADOR') {
        tipoPath = 'administrador';
      } else if (tipoUsuario === 'VOLUNTARIO' && funcao === 'ASSISTENCIA_SOCIAL') {
        tipoPath = 'assistente-social';
      } else if (tipoUsuario === 'VOLUNTARIO') {
        tipoPath = 'voluntario';
      } else {
        tipoPath = 'assistido';
      }

      const dadosPessoaisEndpoint = `${resolvePerfilPath(tipoUsuario, funcao)}?usuarioId=${usuarioId}`;
      const response = await fetch(buildBackendUrl(dadosPessoaisEndpoint), {

        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do perfil');
      }

      const dados = await response.json();
      
      // Se houver uma foto, ajustar a URL se necessário
      if (dados.fotoUrl && !dados.fotoUrl.startsWith('http')) {
        dados.fotoUrl = buildBackendUrl(dados.fotoUrl);
      }

      // Atualizar o contexto com os dados retornados
      if (contextUpdateUserData) {
        const updatedFields: Partial<UserData> = {};

        const assignIfChanged = <K extends keyof UserData>(key: K, value: UserData[K]) => {
          if (value !== undefined && value !== null && value !== contextUserData[key]) {
            updatedFields[key] = value;
          }
        };

        const nomeResposta = toTrimmedString(dados.nome);
        const sobrenomeResposta = toTrimmedString(dados.sobrenome) || toTrimmedString(dados.sobreNome);
        const nomesFromFull = extractNamesFromFullName(dados.nomeCompleto);

        if (nomeResposta || sobrenomeResposta || nomesFromFull.nome) {
          const nomeAtualizado = nomeResposta || nomesFromFull.nome || contextUserData.nome;
          const sobrenomeAtualizado = sobrenomeResposta || nomesFromFull.sobrenome || contextUserData.sobrenome;
          assignIfChanged('nome', nomeAtualizado);
          assignIfChanged('sobrenome', sobrenomeAtualizado);
        }

        if (typeof dados.email === 'string') {
          assignIfChanged('email', toTrimmedString(dados.email));
        }

        if (typeof dados.telefone === 'string') {
          assignIfChanged('telefone', toTrimmedString(dados.telefone));
        }

        if (typeof dados.dataNascimento === 'string') {
          assignIfChanged('dataNascimento', toTrimmedString(dados.dataNascimento));
        } else if (typeof dados.data_nascimento === 'string') {
          assignIfChanged('dataNascimento', toTrimmedString(dados.data_nascimento));
        }

        if (typeof dados.genero === 'string') {
          assignIfChanged('genero', toTrimmedString(dados.genero));
        } else if (typeof dados.sexo === 'string') {
          assignIfChanged('genero', toTrimmedString(dados.sexo));
        }

        if (dados.endereco && typeof dados.endereco === 'object') {
          const enderecoAtualizado = mergeEnderecoData(contextUserData.endereco, dados.endereco);
          const enderecoMudou = Object.keys(enderecoAtualizado).some((key) => {
            const typedKey = key as keyof Endereco;
            return enderecoAtualizado[typedKey] !== contextUserData.endereco[typedKey];
          });

          if (enderecoMudou) {
            updatedFields.endereco = enderecoAtualizado;
          }
        }

        if (Object.keys(updatedFields).length > 0) {
          contextUpdateUserData(updatedFields);
        }
        
      }
      
      return dados;
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
      throw error;
    }
  }, [contextUpdateUserData, contextUserData]);

  const uploadFoto = async (file: File): Promise<string> => {
    try {
      if (!validateImageSize(file)) {
        const compressedFile = await compressImage(file);
        if (!validateImageSize(compressedFile)) {
          throw new Error('Imagem muito grande. O tamanho máximo permitido é 1MB.');
        }
        file = compressedFile;
      }

      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Usuário não está logado');
      }
      
      const user = JSON.parse(userData);
      const token = user.token;
      const usuarioId = user.idUsuario;
      const tipoUsuario = user.tipo;
      const funcao = user.funcao;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('usuarioId', usuarioId.toString());

      const uploadEndpoint = `${resolvePerfilPath(tipoUsuario, funcao, 'foto')}?usuarioId=${usuarioId}`;
      const response = await fetch(buildBackendUrl(uploadEndpoint), {
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
      return buildBackendUrl(result.url);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw error;
    }
  };
  return {
    ...context,
    uploadFoto,
    fetchPerfil
  };
};

export { useUser };
