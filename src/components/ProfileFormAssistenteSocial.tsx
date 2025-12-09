import { Button } from "@/components/ui/button";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProfileImage } from "@/components/useProfileImage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import perfilApi from "@/services/perfilApi";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { ArrowLeft } from "lucide-react";

type DadosPessoais = { nome: string; sobrenome: string; email: string; telefone: string; dataNascimento?: string; genero?: string };
type DadosProfissionaisAS = { crp: string; especialidade: string; bio?: string };
type EnderecoAS = { rua: string; numero: string; complemento?: string; bairro?: string; cidade?: string; estado?: string; cep: string };

export default function ProfileFormAssistenteSocial() {
  const navigate = useNavigate();
  const { profileImage, setProfileImage } = useProfileImage();
  const [loading, setLoading] = useState(false);

  const userId = (() => {
    const stored = localStorage.getItem("userData");
    if (!stored) return undefined;
    try { const u = JSON.parse(stored); return Number(u.idUsuario); } catch { return undefined; }
  })();

  const [initialEmail, setInitialEmail] = useState<string>("");

  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoais>({ nome: "", sobrenome: "", email: "", telefone: "", dataNascimento: "", genero: "" });
  const [dadosProfissionais, setDadosProfissionais] = useState<DadosProfissionaisAS>({ crp: "", especialidade: "", bio: "" });
  const [endereco, setEndereco] = useState<EnderecoAS>({ rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!userId) throw new Error("Usuário inválido");
        const perf = await perfilApi.getAssistentePerfil();
        setDadosPessoais({ nome: perf.nome || "", sobrenome: perf.sobrenome || "", email: perf.email || "", telefone: perf.telefone || "", dataNascimento: perf.dataNascimento || "", genero: perf.genero || "" });
        setInitialEmail(perf.email || "");
        setDadosProfissionais({ crp: perf.crp || "", especialidade: perf.especialidade || "", bio: perf.bio || "" });
        const end = await perfilApi.getEnderecoAssistente(userId);
        setEndereco({ rua: end?.logradouro || "", numero: end?.numero || "", complemento: end?.complemento || "", bairro: end?.bairro || "", cidade: end?.localidade || end?.cidade || "", estado: end?.uf || end?.estado || "", cep: end?.cep || "" });
        if (perf.fotoUrl) setProfileImage(perf.fotoUrl);
      } catch (e) {
        toast({ title: "Erro ao carregar", description: "Não foi possível carregar seu perfil.", variant: "destructive" });
      }
    };
    load();
  }, [userId, setProfileImage]);

  const handleSaveDadosPessoais = async () => {
    setLoading(true);
    try {
      if (!userId) throw new Error("Usuário inválido");
      await perfilApi.patchDadosPessoaisAssistente(userId, { email: dadosPessoais.email, telefone: dadosPessoais.telefone, nome: dadosPessoais.nome, sobrenome: dadosPessoais.sobrenome, dataNascimento: dadosPessoais.dataNascimento, genero: dadosPessoais.genero });
      toast({ title: "Dados atualizados", description: "Seus dados pessoais foram atualizados." });
      const before = (initialEmail || "").trim().toLowerCase();
      const after = (dadosPessoais.email || "").trim().toLowerCase();
      if (before && after && before !== after) {
        localStorage.clear();
        navigate("/login");
        return;
      }
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Falha ao atualizar dados pessoais.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDadosProfissionais = async () => {
    setLoading(true);
    try {
      if (!userId) throw new Error("Usuário inválido");
      const res = await perfilApi.patchDadosProfissionaisAssistente(userId, { crp: dadosProfissionais.crp, especialidade: dadosProfissionais.especialidade, bio: dadosProfissionais.bio });
      setDadosProfissionais({ crp: res?.crp ?? dadosProfissionais.crp, especialidade: res?.especialidade ?? dadosProfissionais.especialidade, bio: res?.bio ?? dadosProfissionais.bio });
      toast({ title: "Dados profissionais atualizados", description: "Informações profissionais atualizadas." });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Falha ao atualizar dados profissionais.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEndereco = async () => {
    setLoading(true);
    try {
      if (!userId) throw new Error("Usuário inválido");
      await perfilApi.putEnderecoAssistente(userId, { cep: (endereco.cep || "").replace(/\D/g, ""), numero: endereco.numero, complemento: endereco.complemento });
      toast({ title: "Endereço atualizado", description: "Seu endereço foi atualizado." });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Falha ao atualizar endereço.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedImage(f);
      const r = new FileReader();
      r.onloadend = () => setImagePreview(r.result as string);
      r.readAsDataURL(f);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedImage) {
      toast({ title: "Nenhuma foto", description: "Selecione uma foto." });
      return;
    }
    setLoading(true);
    try {
      if (!userId) throw new Error("Usuário inválido");
      const resp = await perfilApi.uploadFotoAssistente(userId, selectedImage);
      const url = resp?.urlFoto || resp?.url || resp?.fotoUrl || "";
      if (url) setProfileImage(url);
      setSelectedImage(null);
      setImagePreview(null);
      toast({ title: "Foto atualizada", description: "Sua foto foi atualizada com sucesso." });
    } catch (error) {
      toast({ title: "Erro ao atualizar foto", description: "Falha ao enviar foto.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
          <main className="flex-1 w-full md:w-auto pt-20 md:pt-24">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <Button onClick={() => navigate("/assistente-social")} variant="ghost" className="p-2 rounded-full" aria-label="Voltar">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100">Editar Perfil</h1>
                <p className="text-base text-gray-500 dark:text-gray-400">Atualize suas informações</p>
              </div>
            </div>

            <Tabs defaultValue="pessoal" className="w-full">
              <TabsList className="mb-6 flex flex-wrap md:flex-nowrap w-full gap-2 md:gap-0">
                <TabsTrigger value="pessoal" className="flex-1">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="profissional" className="flex-1">Dados Profissionais</TabsTrigger>
                <TabsTrigger value="endereco" className="flex-1">Endereço</TabsTrigger>
                <TabsTrigger value="foto" className="flex-1">Foto de Perfil</TabsTrigger>
              </TabsList>

              <TabsContent value="pessoal">
                <Card className="bg-white dark:bg-[#23272F]">
                  <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>Atualize suas informações pessoais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome *</Label>
                        <Input id="nome" name="nome" value={dadosPessoais.nome} onChange={(e)=>setDadosPessoais({...dadosPessoais, nome:e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sobrenome">Sobrenome *</Label>
                        <Input id="sobrenome" name="sobrenome" value={dadosPessoais.sobrenome} onChange={(e)=>setDadosPessoais({...dadosPessoais, sobrenome:e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" value={dadosPessoais.email} onChange={(e)=>setDadosPessoais({...dadosPessoais, email:e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input id="telefone" name="telefone" value={dadosPessoais.telefone} onChange={(e)=>setDadosPessoais({...dadosPessoais, telefone:e.target.value})} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Button onClick={handleSaveDadosPessoais} disabled={loading} className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90">{loading ? "Salvando..." : "Salvar Dados Pessoais"}</Button>
                    <Button onClick={()=>navigate("/assistente-social")} disabled={loading} variant="outline" className="flex-1">Cancelar</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="profissional">
                <Card className="bg-white dark:bg-[#23272F]">
                  <CardHeader>
                    <CardTitle>Dados Profissionais</CardTitle>
                    <CardDescription>Atualize suas informações profissionais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="crp">CRP *</Label>
                        <Input id="crp" name="crp" value={dadosProfissionais.crp} onChange={(e)=>setDadosProfissionais({...dadosProfissionais, crp:e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="especialidade">Especialidade *</Label>
                        <Input id="especialidade" name="especialidade" value={dadosProfissionais.especialidade} onChange={(e)=>setDadosProfissionais({...dadosProfissionais, especialidade:e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia Profissional</Label>
                      <textarea id="bio" name="bio" value={dadosProfissionais.bio} onChange={(e)=>setDadosProfissionais({...dadosProfissionais, bio:e.target.value})} rows={4} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Button onClick={handleSaveDadosProfissionais} disabled={loading} className="ml-auto bg-[#ED4231] hover:bg-[#ED4231]/90">{loading ? "Salvando..." : "Salvar Dados Profissionais"}</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="endereco">
                <Card className="bg-white dark:bg-[#23272F]">
                  <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                    <CardDescription>Atualize seu endereço</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="rua">Logradouro *</Label>
                        <Input id="rua" name="rua" value={endereco.rua} onChange={(e)=>setEndereco({...endereco, rua:e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número *</Label>
                        <Input id="numero" name="numero" value={endereco.numero} onChange={(e)=>setEndereco({...endereco, numero:e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input id="complemento" name="complemento" value={endereco.complemento || ""} onChange={(e)=>setEndereco({...endereco, complemento:e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro *</Label>
                        <Input id="bairro" name="bairro" value={endereco.bairro || ""} onChange={(e)=>setEndereco({...endereco, bairro:e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade *</Label>
                        <Input id="cidade" name="cidade" value={endereco.cidade || ""} onChange={(e)=>setEndereco({...endereco, cidade:e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">UF *</Label>
                        <Input id="estado" name="estado" value={endereco.estado || ""} onChange={(e)=>setEndereco({...endereco, estado:e.target.value})} maxLength={2} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input id="cep" name="cep" value={endereco.cep || ""} onChange={(e)=>setEndereco({...endereco, cep:e.target.value})} placeholder="00000-000" maxLength={9} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Button onClick={handleSaveEndereco} disabled={loading} className="ml-auto bg-[#ED4231] hover:bg-[#ED4231]/90">{loading ? "Salvando..." : "Salvar Endereço"}</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="foto">
                <Card className="bg-white dark:bg-[#23272F]">
                  <CardHeader>
                    <CardTitle>Foto de Perfil</CardTitle>
                    <CardDescription>Atualize sua foto de perfil profissional</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <ProfileAvatar profileImage={imagePreview || profileImage} name={`${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim() || "Assistente Social"} size="w-32 h-32" className="border-4 border-[#ED4231]" />
                      </div>
                      <div className="w-full max-w-md">
                        <Label htmlFor="photo-upload" className="flex items-center justify-center w-full px-4 py-2 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Selecionar foto</Label>
                        <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        <p className="text-xs text-gray-500 mt-2 text-center">Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Button onClick={handleSavePhoto} disabled={loading || !selectedImage} className="flex-1 bg-[#ED4231] hover:bg-[#ED4231]/90">{loading ? "Enviando..." : "Salvar Foto"}</Button>
                    <Button onClick={()=>navigate("/assistente-social")} disabled={loading} variant="outline" className="flex-1">Cancelar</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Erro na ProfileFormAssistenteSocial", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-white dark:bg-[#23272F]">
            <CardHeader>
              <CardTitle>Falha ao carregar</CardTitle>
              <CardDescription>
                Ocorreu um erro nesta página. Tente recarregar.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
              <Button onClick={() => window.location.reload()}>Recarregar</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
