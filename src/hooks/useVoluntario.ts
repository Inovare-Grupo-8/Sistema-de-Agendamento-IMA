export interface DadosPessoaisVoluntario {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
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
    buscarEndereco,
    atualizarEndereco
  };
};

export default useVoluntario;
