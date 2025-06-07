import { useEffect } from 'react';

interface Endereco {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
}

export interface AssistenteSocialInput {
    nome: string;
    sobrenome: string;
    crp: string;
    especialidade: string;
    telefone: string;
    email: string;
    senha?: string;
    bio?: string;
    endereco?: Endereco;
}

export interface AssistenteSocialOutput {
    idUsuario: number;
    nome: string;
    sobrenome: string;
    crp: string;
    especialidade: string;
    telefone: string;
    email: string;
    bio?: string;
    fotoUrl?: string;
    endereco?: Endereco;
}

export const useAssistenteSocial = () => {
    const fetchPerfil = async (): Promise<AssistenteSocialOutput> => {
        try {
            // Pegar dados do usuário logado do localStorage
            const userData = localStorage.getItem('userData');
            if (!userData) {
                throw new Error('Usuário não está logado');
            }
            
            const user = JSON.parse(userData);
            const usuarioId = user.idUsuario;
            
            if (!usuarioId) {
                throw new Error('ID do usuário não encontrado');
            }

            const response = await fetch(`http://localhost:8080/perfil/assistente-social?usuarioId=${usuarioId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar perfil');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            throw error;
        }
    };    const atualizarPerfil = async (dados: AssistenteSocialInput): Promise<AssistenteSocialOutput> => {
        try {
            // Pegar dados do usuário logado do localStorage
            const userData = localStorage.getItem('userData');
            if (!userData) {
                throw new Error('Usuário não está logado');
            }
            
            const user = JSON.parse(userData);
            const usuarioId = user.idUsuario;
            
            if (!usuarioId) {
                throw new Error('ID do usuário não encontrado');
            }

            const response = await fetch(`http://localhost:8080/perfil/assistente-social/dados-pessoais?usuarioId=${usuarioId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar perfil');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            throw error;
        }
    };

    return {
        fetchPerfil,
        atualizarPerfil
    };
};

export default useAssistenteSocial;
