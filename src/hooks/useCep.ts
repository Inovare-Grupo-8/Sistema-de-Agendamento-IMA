import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { parseJsonSafe } from "@/lib/utils";

// Interface para resposta da API do ViaCEP
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Interface para retorno padronizado
interface EnderecoViaCep {
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export function useCep() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAddressByCep = async (
    cep: string
  ): Promise<EnderecoViaCep | null> => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, "");

    if (!cleanCep || cleanCep.length !== 8) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data: ViaCepResponse = await parseJsonSafe(response);

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado e tente novamente.",
          variant: "destructive",
        });
        setError("CEP não encontrado");
        return null;
      }

      // Mapear resposta do ViaCEP para formato esperado
      const enderecoMapeado: EnderecoViaCep = {
        rua: data.logradouro || "",
        numero: "", // Número deve ser preenchido pelo usuário
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
        cep: data.cep || "",
      };

      return enderecoMapeado;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "Erro ao buscar CEP",
        description:
          "Houve um problema ao buscar o endereço. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setError("Erro na requisição");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const formatCep = (value: string) => {
    // Remove caracteres não numéricos
    const onlyNumbers = value.replace(/\D/g, "");

    // Formata o CEP: 12345-678
    if (onlyNumbers.length <= 5) {
      return onlyNumbers;
    }

    return `${onlyNumbers.slice(0, 5)}-${onlyNumbers.slice(5, 8)}`;
  };

  return { fetchAddressByCep, loading, error, formatCep };
}
