import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
  Heart,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Props interface
interface ClassificacaoUsuariosProps {
  onUsuarioClassificado?: () => void;
}

// Interface para dados completos do usuário conforme novo backend
interface UsuarioCompleto {
  id: number;
  email: string;
  tipo: string;
  dataCadastro: string;
  // Dados da Ficha (podem ser null se não completaram segunda fase)
  nome?: string;
  sobrenome?: string;
  cpf?: string | null;
  dataNascimento?: string | null; // Data em formato ISO
  rendaMinima?: number | null;
  rendaMaxima?: number | null;
  genero?: string | null;
  areaInteresse?: string | null;
  profissao?: string | null;

  // Dados do Endereço
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;

  // Telefones
  telefones?: Array<{
    numero: string;
    tipo: string;
  }>;
}

export function ClassificacaoUsuarios({
  onUsuarioClassificado,
}: ClassificacaoUsuariosProps) {
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] =
    useState<UsuarioCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClassificando, setIsClassificando] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const mountedRef = useRef(false);

  // Carregar usuários não classificados
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    carregarUsuariosNaoClassificados();
  }, []);

  const carregarUsuariosNaoClassificados = async () => {
    try {
      setIsLoading(true);
      const userDataRaw = localStorage.getItem("userData");
      const authToken = localStorage.getItem("auth_token");
      const token = (() => {
        if (authToken) return authToken;
        if (!userDataRaw) return "";
        try {
          const u = JSON.parse(userDataRaw);
          return u.token || "";
        } catch {
          return "";
        }
      })();
      const response = await fetch(
        `${import.meta.env.VITE_URL_BACKEND}/usuarios/nao-classificados`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        console.error(
          "Erro ao carregar usuários não classificados:",
          response.status
        );
      }
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const classificarUsuario = async (
    id: number,
    tipo: "aprovar" | "rejeitar"
  ) => {
    try {
      setIsClassificando(true);

      if (tipo === "rejeitar") {
        // Se rejeitado, pode usar endpoint de exclusão ou apenas remover da lista
        // Por enquanto, apenas remove da lista local
        setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));
        setDialogAberto(false);
        setUsuarioSelecionado(null);

        if (onUsuarioClassificado) {
          onUsuarioClassificado();
        }
        return;
      }

      // Se aprovado, determinar se é gratuidade ou valor social baseado na renda
      const usuario = usuarios.find((u) => u.id === id);
      const SALARIO_MINIMO = 1518.0;
      const LIMITE_GRATUIDADE = SALARIO_MINIMO * 3; // Até 3 salários = gratuidade

      // Determinar endpoint baseado na renda
      let endpoint = "gratuidade"; // Padrão
      if (
        usuario &&
        usuario.rendaMaxima !== null &&
        usuario.rendaMaxima !== undefined
      ) {
        // Se renda máxima for maior que 3 salários mínimos, é valor social
        if (usuario.rendaMaxima > LIMITE_GRATUIDADE) {
          endpoint = "valor-social";
        }
      }

      const userDataRaw = localStorage.getItem("userData");
      const authToken = localStorage.getItem("auth_token");
      const token = (() => {
        if (authToken) return authToken;
        if (!userDataRaw) return "";
        try {
          const u = JSON.parse(userDataRaw);
          return u.token || "";
        } catch {
          return "";
        }
      })();
      const response = await fetch(
        `${
          import.meta.env.VITE_URL_BACKEND
        }/usuarios/classificar/${endpoint}/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remover o usuário da lista após classificação
        setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));
        setDialogAberto(false);
        setUsuarioSelecionado(null);

        // Notificar componente pai se callback foi fornecido
        if (onUsuarioClassificado) {
          onUsuarioClassificado();
        }
      } else {
        console.error("Erro ao classificar usuário:", response.status);
      }
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
    } finally {
      setIsClassificando(false);
    }
  };

  const abrirDetalhes = (usuario: UsuarioCompleto) => {
    setUsuarioSelecionado(usuario);
    setDialogAberto(true);
  };
  const formatarData = (dataISO: string | null | undefined) => {
    if (!dataISO) return "Não informado";
    try {
      return format(new Date(dataISO), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };
  const formatarRenda = (
    rendaMinima?: number | null,
    rendaMaxima?: number | null
  ) => {
    // Se temos os valores de faixa salarial, usar eles diretamente
    if (
      rendaMinima !== null &&
      rendaMinima !== undefined &&
      rendaMaxima !== null &&
      rendaMaxima !== undefined
    ) {
      const SALARIO_MINIMO = 1518; // Valor atualizado do salário mínimo

      const formatarValor = (valor: number) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor); // Determinar a faixa baseada nos valores mínimo e máximo
      if (rendaMaxima <= SALARIO_MINIMO) {
        return (
          <span>
            Até 1 salário mínimo
            <br />({formatarValor(rendaMinima)} - {formatarValor(rendaMaxima)})
          </span>
        );
      } else if (rendaMaxima <= SALARIO_MINIMO * 2) {
        return (
          <span>
            1 a 2 salários mínimos
            <br />({formatarValor(rendaMinima)} - {formatarValor(rendaMaxima)})
          </span>
        );
      } else if (rendaMaxima <= SALARIO_MINIMO * 3) {
        return (
          <span>
            2 a 3 salários mínimos
            <br />({formatarValor(rendaMinima)} - {formatarValor(rendaMaxima)})
          </span>
        );
      } else if (rendaMaxima <= SALARIO_MINIMO * 5) {
        return (
          <span>
            3 a 5 salários mínimos
            <br />({formatarValor(rendaMinima)} - {formatarValor(rendaMaxima)})
          </span>
        );
      } else if (rendaMaxima <= SALARIO_MINIMO * 10) {
        return (
          <span>
            5 a 10 salários mínimos
            <br />({formatarValor(rendaMinima)} - {formatarValor(rendaMaxima)})
          </span>
        );
      } else if (rendaMaxima <= SALARIO_MINIMO * 20) {
        return (
          <span>
            10 a 20 salários mínimos
            <br />({formatarValor(rendaMinima)} - {formatarValor(rendaMaxima)})
          </span>
        );
      } else if (rendaMinima > SALARIO_MINIMO * 20) {
        return (
          <span>
            Acima de 20 salários mínimos
            <br />
            (acima de {formatarValor(rendaMinima)})
          </span>
        );
      } else {
        return `Prefere não informar`;
      }
    }

    return "Não informado";
  };
  const formatarCPF = (cpf: string | null | undefined) => {
    if (!cpf) return "Não informado";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarTelefone = (telefone: { numero: string; tipo: string }) => {
    return `${telefone.numero} (${telefone.tipo})`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED4231] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Carregando usuários...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {usuarios.length} pendente{usuarios.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {usuarios.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nenhum usuário pendente de classificação
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Todos os usuários foram classificados ou não há novos cadastros.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {usuarios.map((usuario) => (
            <Card
              key={usuario.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>{" "}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {usuario.nome || "Nome não informado"}{" "}
                        {usuario.sobrenome || ""}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {usuario.email}
                        </span>
                        {usuario.dataNascimento && (
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatarData(usuario.dataNascimento)}
                          </span>
                        )}
                        {(usuario.rendaMinima || usuario.rendaMaxima) && (
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatarRenda(
                              usuario.rendaMinima,
                              usuario.rendaMaxima
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => abrirDetalhes(usuario)}
                      variant="outline"
                      size="sm"
                    >
                      Ver Detalhes
                    </Button>
                    <Button
                      onClick={() => classificarUsuario(usuario.id, "aprovar")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                      disabled={isClassificando}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => classificarUsuario(usuario.id, "rejeitar")}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                      disabled={isClassificando}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para detalhes do usuário */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Detalhes do Usuário</span>
            </DialogTitle>
            <DialogDescription>
              Informações completas para análise de classificação
            </DialogDescription>
          </DialogHeader>

          {usuarioSelecionado && (
            <div className="space-y-6">
              {" "}
              {/* Informações Pessoais */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Nome Completo
                    </label>
                    <p className="font-medium">
                      {usuarioSelecionado.nome || "Não informado"}{" "}
                      {usuarioSelecionado.sobrenome || ""}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Email
                    </label>
                    <p className="font-medium">{usuarioSelecionado.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      CPF
                    </label>
                    <p className="font-medium">
                      {formatarCPF(usuarioSelecionado.cpf)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Data de Nascimento
                    </label>
                    <p className="font-medium">
                      {formatarData(usuarioSelecionado.dataNascimento)}
                    </p>
                  </div>
                  {usuarioSelecionado.genero && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Gênero
                      </label>
                      <p className="font-medium">{usuarioSelecionado.genero}</p>
                    </div>
                  )}
                  {usuarioSelecionado.profissao && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Profissão
                      </label>
                      <p className="font-medium">
                        {usuarioSelecionado.profissao}
                      </p>
                    </div>
                  )}
                </div>
              </div>{" "}
              {/* Informações Financeiras */}{" "}
              {(usuarioSelecionado.rendaMinima ||
                usuarioSelecionado.rendaMaxima) && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Informações Financeiras
                  </h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Renda Mensal
                    </label>
                    <p className="font-medium text-lg">
                      {formatarRenda(
                        usuarioSelecionado.rendaMinima,
                        usuarioSelecionado.rendaMaxima
                      )}
                    </p>
                  </div>
                </div>
              )}
              {/* Área de Orientação */}
              {usuarioSelecionado.areaInteresse && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Área de Interesse
                  </h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Área de Orientação Desejada
                    </label>
                    <p className="font-medium">
                      {usuarioSelecionado.areaInteresse}
                    </p>
                  </div>
                </div>
              )}
              {/* Endereço */}
              {usuarioSelecionado.logradouro && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Endereço
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-medium">
                      {usuarioSelecionado.logradouro},{" "}
                      {usuarioSelecionado.numero}
                      {usuarioSelecionado.complemento &&
                        ` - ${usuarioSelecionado.complemento}`}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {usuarioSelecionado.bairro}, {usuarioSelecionado.cidade} -{" "}
                      {usuarioSelecionado.uf}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      CEP: {usuarioSelecionado.cep}
                    </p>
                  </div>
                </div>
              )}
              {/* Telefone */}
              {usuarioSelecionado.telefones &&
                usuarioSelecionado.telefones.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Contato
                    </h3>
                    <div className="space-y-2">
                      {usuarioSelecionado.telefones.map((telefone, index) => (
                        <p key={index} className="font-medium">
                          {formatarTelefone(telefone)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}{" "}
              {/* Alerta para cadastro incompleto */}
              {(!usuarioSelecionado.nome ||
                !usuarioSelecionado.cpf ||
                !usuarioSelecionado.dataNascimento ||
                (!usuarioSelecionado.rendaMinima &&
                  !usuarioSelecionado.rendaMaxima)) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Cadastro Incompleto
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          Este usuário pode ser que não completou a segunda fase
                          do cadastro e algumas informações podem estar em
                          falta. Se desejar entrar em contato com esse usuario,
                          você assistente social pode ajudar a completar o
                          cadastro antes da classificação.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Botões de Ação */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  onClick={() => setDialogAberto(false)}
                  variant="outline"
                  disabled={isClassificando}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() =>
                    classificarUsuario(usuarioSelecionado.id, "rejeitar")
                  }
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isClassificando}
                >
                  {isClassificando ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Rejeitar (Valor Social)
                </Button>
                <Button
                  onClick={() =>
                    classificarUsuario(usuarioSelecionado.id, "aprovar")
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isClassificando}
                >
                  {isClassificando ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Aprovar (Gratuidade)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClassificacaoUsuarios;
