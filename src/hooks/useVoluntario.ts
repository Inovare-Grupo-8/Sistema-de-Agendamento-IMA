export interface DadosPessoaisVoluntario {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
}

export interface DadosProfissionaisVoluntario {
  funcao: string;
  registroProfissional: string;
  biografiaProfissional: string;
}

export interface EnderecoVoluntario {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export const useVoluntario = () => {
  
  // Função para mapear valores do backend para nomes dos enums
  const mapBackendValueToEnum = (backendValue: string): string => {
    const mapping: Record<string, string> = {
      'Juridica': 'JURIDICA',
      'Psicologia': 'PSICOLOGIA', 
      'Psicopedagogia': 'PSICOPEDAGOGIA',
      'Assistencia Social': 'ASSISTENCIA_SOCIAL',
      'Contabil': 'CONTABIL',
      'Financeira': 'FINANCEIRA',
      'Pediatria': 'PEDIATRIA',
      'Fisioterapia': 'FISIOTERAPIA',
      'Quiropraxia': 'QUIROPRAXIA',
      'Nutricao': 'NUTRICAO'
    };
    return mapping[backendValue] || backendValue;
  };

  // Função para buscar dados pessoais do voluntário
  const buscarDadosPessoais = async (): Promise<DadosPessoaisVoluntario> => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Usuário não está logado');
      }
      
      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado');
      }

      const response = await fetch(`http://localhost:8080/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados pessoais');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dados pessoais:', error);
      throw error;
    }
  };

  // Função para atualizar dados pessoais do voluntário
  const atualizarDadosPessoais = async (dados: DadosPessoaisVoluntario): Promise<DadosPessoaisVoluntario> => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Usuário não está logado');
      }
      
      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado');
      }

      const response = await fetch(`http://localhost:8080/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || ''}`
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
      if (result.email && result.email !== user.email) {
        const updatedUser = { ...user, email: result.email };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao atualizar dados pessoais:', error);
      throw error;
    }
  };

  // Função para buscar dados profissionais do voluntário
  const buscarDadosProfissionais = async (): Promise<DadosProfissionaisVoluntario> => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Usuário não está logado');
      }
      
      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado');
      }

      // Os dados profissionais vêm junto com os dados pessoais
      const response = await fetch(`http://localhost:8080/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados profissionais');
      }

      const dadosCompletos = await response.json();
      
      // Extrair apenas os dados profissionais
      const dadosProfissionais: DadosProfissionaisVoluntario = {
        funcao: mapBackendValueToEnum(dadosCompletos.especialidade || ''),
        registroProfissional: dadosCompletos.crp || '',
        biografiaProfissional: dadosCompletos.bio || ''
      };
      
      return dadosProfissionais;
    } catch (error) {
      console.error('Erro ao buscar dados profissionais:', error);
      throw error;
    }
  };

  // Função para atualizar dados profissionais do voluntário
  const atualizarDadosProfissionais = async (dados: DadosProfissionaisVoluntario): Promise<DadosProfissionaisVoluntario> => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Usuário não está logado');
      }
      
      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado');
      }

      // Mapear os dados para o formato esperado pelo backend
      const dadosBackend = {
        funcao: dados.funcao,
        registroProfissional: dados.registroProfissional,
        biografiaProfissional: dados.biografiaProfissional
      };

      const response = await fetch(`http://localhost:8080/perfil/voluntario/dados-profissionais?usuarioId=${usuarioId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || ''}`
        },
        body: JSON.stringify(dadosBackend)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Erro ao atualizar dados profissionais: ${response.status}`);
      }

      // O backend retorna status 204 (No Content) para indicar sucesso
      // Retornar os dados originais já que a atualização foi bem-sucedida
      return dados;
    } catch (error) {
      console.error('Erro ao atualizar dados profissionais:', error);
      throw error;
    }
  };

  // Função para buscar endereço do voluntário
  const buscarEndereco = async (): Promise<EnderecoVoluntario> => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Usuário não está logado');
      }
      
      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado');
      }

      const response = await fetch(`http://localhost:8080/perfil/voluntario/endereco?usuarioId=${usuarioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar endereço');
      }

      const enderecoOutput = await response.json();
      
      // Mapear EnderecoOutput do backend para EnderecoVoluntario
      const endereco: EnderecoVoluntario = {
        logradouro: enderecoOutput.logradouro || '',
        numero: enderecoOutput.numero || '',
        complemento: enderecoOutput.complemento || '',
        bairro: enderecoOutput.bairro || '',
        cidade: enderecoOutput.localidade || '', // ✅ CORREÇÃO: usar localidade do backend
        uf: enderecoOutput.uf || '',
        cep: enderecoOutput.cep || ''
      };
      
      return endereco;
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      throw error;
    }
  };

  // Função para atualizar endereço do voluntário
  const atualizarEndereco = async (endereco: EnderecoVoluntario): Promise<EnderecoVoluntario> => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Usuário não está logado');
      }
      
      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;
      
      if (!usuarioId) {
        throw new Error('ID do usuário não encontrado');
      }

      // Enviar apenas os campos que a API espera
      const enderecoData = {
        cep: endereco.cep.replace(/\D/g, ''), // Remove formatação do CEP
        numero: endereco.numero,
        complemento: endereco.complemento
      };

      const response = await fetch(`http://localhost:8080/perfil/voluntario/endereco?usuarioId=${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || ''}`
        },
        body: JSON.stringify(enderecoData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Erro ao atualizar endereço: ${response.status}`);
      }

      // Retornar o endereço original já que a API não retorna os dados completos
      return endereco;
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw error;
    }
  };

  return {
    buscarDadosPessoais,
    atualizarDadosPessoais,
    buscarDadosProfissionais,
    atualizarDadosProfissionais,
    buscarEndereco,
    atualizarEndereco
  };
};

export default useVoluntario;
