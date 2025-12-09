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

import { useState, useCallback } from "react";

export const useVoluntario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type VoluntarioCacheValue =
    | DadosPessoaisVoluntario
    | DadosProfissionaisVoluntario
    | EnderecoVoluntario
    | null;

  // ✅ Cache para evitar chamadas repetidas
  const [cache, setCache] = useState<Map<string, VoluntarioCacheValue>>(
    new Map()
  );

  // Função para mapear valores do backend para nomes dos enums
  const mapBackendValueToEnum = (backendValue: string): string => {
    const mapping: Record<string, string> = {
      Juridica: "JURIDICA",
      Psicologia: "PSICOLOGIA",
      Psicopedagogia: "PSICOPEDAGOGIA",
      "Assistencia Social": "ASSISTENCIA_SOCIAL",
      Contabil: "CONTABIL",
      Financeira: "FINANCEIRA",
      Pediatria: "PEDIATRIA",
      Fisioterapia: "FISIOTERAPIA",
      Quiropraxia: "QUIROPRAXIA",
      Nutricao: "NUTRICAO",
    };
    return mapping[backendValue] || backendValue;
  };

  // Função para mapear enum para texto legível
  const mapEnumToText = (enumValue: string): string => {
    const mapping: Record<string, string> = {
      JURIDICA: "Jurídica",
      PSICOLOGIA: "Psicologia",
      PSICOPEDAGOGIA: "Psicopedagogia",
      ASSISTENCIA_SOCIAL: "Assistência Social",
      CONTABIL: "Contábil",
      FINANCEIRA: "Financeira",
      PEDIATRIA: "Pediatria",
      FISIOTERAPIA: "Fisioterapia",
      QUIROPRAXIA: "Quiropraxia",
      NUTRICAO: "Nutrição",
    };
    return mapping[enumValue] || "";
  };

  // Função para buscar dados pessoais do voluntário
  const buscarDadosPessoais =
    useCallback(async (): Promise<DadosPessoaisVoluntario | null> => {
      // ✅ Verificar cache primeiro
      if (cache.has("dadosPessoais")) {
        return cache.get("dadosPessoais") as DadosPessoaisVoluntario | null;
      }

      if (loading) return null; // ✅ Evitar chamadas simultâneas

      try {
        setLoading(true);
        setError(null);

        const userData = localStorage.getItem("userData");
        if (!userData) {
          throw new Error("Usuário não está logado");
        }

        const user = JSON.parse(userData);
        const usuarioId = user.idUsuario || user.id;

        if (!usuarioId) {
          throw new Error("ID do usuário não encontrado");
        }

        const base = import.meta.env.VITE_URL_BACKEND || "/api";
        const response = await fetch(
          `${base}/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token || ""}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar dados pessoais");
        }

        const dados = (await response.json()) as DadosPessoaisVoluntario;

        // ✅ Salvar no cache
        setCache((prev) => {
          const next = new Map(prev);
          next.set("dadosPessoais", dados);
          return next;
        });

        return dados;
      } catch (error) {
        console.error("Erro ao buscar dados pessoais:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        return null;
      } finally {
        setLoading(false);
      }
    }, [loading, cache]);

  // Função para atualizar dados pessoais do voluntário
  const atualizarDadosPessoais = async (
    dados: DadosPessoaisVoluntario
  ): Promise<DadosPessoaisVoluntario> => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("Usuário não está logado");
      }

      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;

      if (!usuarioId) {
        throw new Error("ID do usuário não encontrado");
      }

      const base = import.meta.env.VITE_URL_BACKEND || "/api";
      const payload = {
        email: dados.email,
        telefone: dados.telefone,
      };
      const response = await fetch(
        `${base}/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro ao atualizar dados pessoais: ${response.status}`);
      }

      const result = await response.json();

      // Atualizar localStorage com mudança de email
      const updatedUser = {
        ...user,
        email: result.email ?? user.email,
      };
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      return {
        ...dados,
        email: result.email ?? dados.email,
        telefone: result.telefone ?? dados.telefone,
      };
    } catch (error) {
      console.error("Erro ao atualizar dados pessoais:", error);
      throw error;
    }
  };

  // Função para buscar dados profissionais do voluntário
  const buscarDadosProfissionais =
    useCallback(async (): Promise<DadosProfissionaisVoluntario | null> => {
      // ✅ Verificar cache primeiro
      if (cache.has("dadosProfissionais")) {
        return cache.get(
          "dadosProfissionais"
        ) as DadosProfissionaisVoluntario | null;
      }

      if (loading) return null; // ✅ Evitar chamadas simultâneas

      try {
        setLoading(true);
        setError(null);

        const userData = localStorage.getItem("userData");
        if (!userData) {
          throw new Error("Usuário não está logado");
        }

        const user = JSON.parse(userData);
        const usuarioId = user.idUsuario || user.id;

        if (!usuarioId) {
          throw new Error("ID do usuário não encontrado");
        }

        // Os dados profissionais vêm junto com os dados pessoais
        const base = import.meta.env.VITE_URL_BACKEND || "/api";
        const response = await fetch(
          `${base}/perfil/voluntario/dados-pessoais?usuarioId=${usuarioId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token || ""}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar dados profissionais");
        }

        const dadosCompletos = await response.json();

        // Extrair apenas os dados profissionais
        const dadosProfissionais: DadosProfissionaisVoluntario = {
          funcao: mapBackendValueToEnum(dadosCompletos.especialidade || ""),
          registroProfissional: dadosCompletos.crp || "",
          biografiaProfissional: dadosCompletos.bio || "",
        };

        // ✅ Salvar no cache
        setCache((prev) => {
          const next = new Map(prev);
          next.set("dadosProfissionais", dadosProfissionais);
          return next;
        });

        return dadosProfissionais;
      } catch (error) {
        console.error("Erro ao buscar dados profissionais:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        return null;
      } finally {
        setLoading(false);
      }
    }, [loading, cache]);

  // Função para atualizar dados profissionais do voluntário
  const atualizarDadosProfissionais = async (
    dados: DadosProfissionaisVoluntario
  ): Promise<DadosProfissionaisVoluntario> => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("Usuário não está logado");
      }

      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;

      if (!usuarioId) {
        throw new Error("ID do usuário não encontrado");
      }

      // Mapear os dados para o formato esperado pelo backend
      const dadosBackend = {
        funcao: dados.funcao,
        registroProfissional: dados.registroProfissional,
        biografiaProfissional: dados.biografiaProfissional,
      };

      const base = import.meta.env.VITE_URL_BACKEND || "/api";
      const response = await fetch(
        `${base}/perfil/voluntario/dados-profissionais?usuarioId=${usuarioId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
          body: JSON.stringify(dadosBackend),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(
          `Erro ao atualizar dados profissionais: ${response.status}`
        );
      }

      // O backend retorna status 204 (No Content) para indicar sucesso
      // Retornar os dados originais já que a atualização foi bem-sucedida
      return dados;
    } catch (error) {
      console.error("Erro ao atualizar dados profissionais:", error);
      throw error;
    }
  };

  // Função para buscar endereço do voluntário
  const buscarEndereco = async (): Promise<EnderecoVoluntario> => {
    // ✅ Verificar cache primeiro
    const cacheKey = "endereco";
    const cachedEndereco = cache.get(cacheKey) as
      | EnderecoVoluntario
      | undefined;
    if (cachedEndereco) {
      console.log("📦 [useVoluntario] Retornando endereço do cache");
      return cachedEndereco;
    }

    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("Usuário não está logado");
      }

      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;

      if (!usuarioId) {
        throw new Error("ID do usuário não encontrado");
      }

      const base = import.meta.env.VITE_URL_BACKEND || "/api";
      const response = await fetch(
        `${base}/perfil/voluntario/endereco?usuarioId=${usuarioId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
        }
      );

      if (!response.ok) {
        // Se for 404, retornar endereço vazio em vez de erro
        if (response.status === 404) {
          console.log("Endereço não cadastrado ainda, retornando vazio");
          return {
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            uf: "",
            cep: "",
          };
        }
        throw new Error("Erro ao buscar endereço");
      }

      const enderecoOutput = await response.json();

      // Mapear EnderecoOutput do backend para EnderecoVoluntario
      const endereco: EnderecoVoluntario = {
        logradouro: enderecoOutput.logradouro || "",
        numero: enderecoOutput.numero || "",
        complemento: enderecoOutput.complemento || "",
        bairro: enderecoOutput.bairro || "",
        cidade: enderecoOutput.localidade || "", // ✅ CORREÇÃO: usar localidade do backend
        uf: enderecoOutput.uf || "",
        cep: enderecoOutput.cep || "",
      };

      // ✅ Salvar no cache
      setCache((prev) => new Map(prev).set(cacheKey, endereco));

      return endereco;
    } catch (error) {
      // Se for erro de rede (backend offline), retornar endereço vazio
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.info(
          "ℹ️ [useVoluntario] Backend offline, retornando endereço vazio"
        );
        return {
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          uf: "",
          cep: "",
        };
      }
      console.error("Erro ao buscar endereço:", error);
      throw error;
    }
  };

  // Função para atualizar endereço do voluntário
  const atualizarEndereco = async (
    endereco: EnderecoVoluntario
  ): Promise<EnderecoVoluntario> => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("Usuário não está logado");
      }

      const user = JSON.parse(userData);
      const usuarioId = user.idUsuario || user.id;

      if (!usuarioId) {
        throw new Error("ID do usuário não encontrado");
      }

      // Enviar apenas os campos que a API espera
      const enderecoData = {
        cep: endereco.cep.replace(/\D/g, ""), // Remove formatação do CEP
        numero: endereco.numero,
        complemento: endereco.complemento,
      };

      const base = import.meta.env.VITE_URL_BACKEND || "/api";
      const response = await fetch(
        `${base}/perfil/voluntario/endereco?usuarioId=${usuarioId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
          body: JSON.stringify(enderecoData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro ao atualizar endereço: ${response.status}`);
      }

      // ✅ Limpar cache do endereço após atualização
      setCache((prev) => {
        const newCache = new Map(prev);
        newCache.delete("endereco");
        return newCache;
      });

      // Retornar o endereço original já que a API não retorna os dados completos
      return endereco;
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error);
      throw error;
    }
  };

  // Função para fazer upload da foto de perfil
  const uploadFoto = async (file: File): Promise<string> => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("Usuário não está logado");
      }

      const user = JSON.parse(userData);
      const token = user.token;
      const usuarioId = user.idUsuario || user.id;

      if (!usuarioId) {
        throw new Error("ID do usuário não encontrado");
      }

      // Verificar se a foto não é muito grande (máximo 1MB)
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("A foto é muito grande. Tamanho máximo permitido: 1MB");
      }

      const formData = new FormData();
      formData.append("file", file);

      const base = import.meta.env.VITE_URL_BACKEND || "/api";
      const response = await fetch(
        `${base}/perfil/voluntario/foto?usuarioId=${usuarioId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro ao fazer upload da foto: ${response.status}`);
      }

      const result = await response.json();

      // Construir URL completa da foto
      const photoUrl = result.url
        ? result.url.startsWith("http")
          ? result.url
          : `${import.meta.env.VITE_URL_BACKEND}${result.url}`
        : (() => {
            throw new Error("Resposta do upload não retornou URL da foto");
          })();

      return photoUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      throw error;
    }
  };

  return {
    buscarDadosPessoais,
    atualizarDadosPessoais,
    buscarDadosProfissionais,
    atualizarDadosProfissionais,
    buscarEndereco,
    atualizarEndereco,
    mapEnumToText,
    uploadFoto,
    loading,
    error,
    clearCache: () => setCache(new Map()), // ✅ Função para limpar cache
  };
};

export default useVoluntario;
