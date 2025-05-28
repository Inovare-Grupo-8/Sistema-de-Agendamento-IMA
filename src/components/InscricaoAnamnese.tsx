import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function InscricaoAnamnese() {
    const [formData, setFormData] = useState({
        nomeCompleto: "",
        telefone: "",
        idade: "",
        email: "",
        endereco: "",
        areaOrientacao: "",
        profissao: "",
        preferenciaAtendimento: "",
        comoSoube: "",
        sugestaoOutraArea: "",
    });

    const [errors, setErrors] = useState({
        nomeCompleto: "",
        telefone: "",
        idade: "",
        email: "",
        endereco: "",
        areaOrientacao: "",
        profissao: "",
        preferenciaAtendimento: "",
        comoSoube: "",
    });

    const validateForm = () => {
        const newErrors = {
            nomeCompleto: "",
            telefone: "",
            idade: "",
            email: "",
            endereco: "",
            areaOrientacao: "",
            profissao: "",
            preferenciaAtendimento: "",
            comoSoube: "",
        };

        let isValid = true;

        // Validação do nome
        if (!formData.nomeCompleto.trim()) {
            newErrors.nomeCompleto = "Nome é obrigatório";
            isValid = false;
        } else if (formData.nomeCompleto.length < 3) {
            newErrors.nomeCompleto = "Nome deve ter no mínimo 3 caracteres";
            isValid = false;
        }

        // Validação do telefone
        const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
        if (!formData.telefone) {
            newErrors.telefone = "Telefone é obrigatório";
            isValid = false;
        } else if (!phoneRegex.test(formData.telefone)) {
            newErrors.telefone = "Telefone inválido";
            isValid = false;
        }

        // Validação do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email é obrigatório";
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email inválido";
            isValid = false;
        }

        // Outras validações
        if (!formData.idade) newErrors.idade = "Idade é obrigatória";
        if (!formData.endereco) newErrors.endereco = "Endereço é obrigatório";
        if (!formData.areaOrientacao) newErrors.areaOrientacao = "Área é obrigatória";
        if (!formData.profissao) newErrors.profissao = "Profissão é obrigatória";
        if (!formData.preferenciaAtendimento) newErrors.preferenciaAtendimento = "Preferência é obrigatória";
        if (!formData.comoSoube) newErrors.comoSoube = "Este campo é obrigatório";

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            console.log("Formulário válido:", formData);
            // Adicione aqui a lógica de envio do formulário
        } else {
            console.log("Formulário com erros:", errors);
        }
    };

    return (
        <div className="w-full">
            <div className="bg-white dark:bg-[#23272F] shadow-md border-b border-[#EDF2FB] dark:border-[#23272F] p-6">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <img src="image/LogoIMA.png" alt="Logo Mãos Amigas" className="h-16 w-auto" />
                        <h1 className="text-2xl font-semibold text-navy-700 dark:text-white">
                            Inscrição de Atendimento Mãos Amigas
                        </h1>
                    </div>
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col space-y-8 items-stretch">
                        {/* Primeira linha: Nome, Telefone, Idade */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div className="md:col-span-3">
                                <Label htmlFor="nomeCompleto">Nome Completo <span className="text-red-500">*</span></Label>
                                <Input
                                    id="nomeCompleto"
                                    value={formData.nomeCompleto}
                                    onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                                    placeholder="Francine Elkinelton"
                                    className={cn("w-full mt-2", errors.nomeCompleto && "border-red-500")}
                                    required
                                />
                                {errors.nomeCompleto && (
                                    <p className="text-sm text-red-500 mt-1">{errors.nomeCompleto}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="telefone">Telefone <span className="text-red-500">*</span></Label>
                                <InputMask
                                    mask="(99) 99999-9999"
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    placeholder="(11) 98765-4321"
                                    className={cn(
                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                        "mt-2",
                                        errors.telefone && "border-red-500"
                                    )} required
                                />
                                {errors.telefone && (
                                    <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>
                                )}
                            </div>

                            <div className="md:col-span-1">
                                <Label htmlFor="idade">Idade <span className="text-red-500">*</span></Label>
                                <Input
                                    id="idade"
                                    type="number"
                                    value={formData.idade}
                                    onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                                    placeholder="52"
                                    className={cn("w-full mt-2", errors.idade && "border-red-500")}
                                    required
                                />
                                {errors.idade && (
                                    <p className="text-sm text-red-500 mt-1">{errors.idade}</p>
                                )}
                            </div>
                        </div>

                        {/* Segunda linha: Email e Endereço */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div className="md:col-span-4">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="jhenifer.lima@gmail.com"
                                    className={cn("w-full mt-2", errors.email && "border-red-500")}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="endereco">Endereço <span className="text-red-500">*</span></Label>
                                <Input
                                    id="endereco"
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    placeholder="Rua x, nº, bairro"
                                    className={cn("w-full mt-2", errors.endereco && "border-red-500")}
                                    required
                                />
                                {errors.endereco && (
                                    <p className="text-sm text-red-500 mt-1">{errors.endereco}</p>
                                )}
                            </div>
                        </div>

                        {/* Área de Orientação */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div className="md:col-span-6">
                                <Label htmlFor="areaOrientacao">
                                    Área que gostaria de receber orientação <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.areaOrientacao}
                                    onValueChange={(value) => setFormData({ ...formData, areaOrientacao: value })}
                                >
                                    <SelectTrigger className="w-full mt-2">
                                        <SelectValue placeholder="Selecione uma área" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        <SelectItem value="juridica">ORIENTAÇÃO JURÍDICA (CIVIL, TRABALHISTA, CRIMINAL, FAMILIAR)</SelectItem>
                                        <SelectItem value="financeira">ORIENTAÇÃO FINANCEIRA (CONTROLE DE GASTOS, APRENDER A INVESTIR...)</SelectItem>
                                        <SelectItem value="psicopedagogica">ORIENTAÇÃO PSICOPEDAGOGICA (DIFICULDADE EM APRENDIZAGEM NA ESCOLA)</SelectItem>
                                        <SelectItem value="contabil">ORIENTAÇÃO CONTÁBIL (DÚVIDAS PARA FINS DE APOSENTADORIA, FISCAL, SOCIETÁRIA, ...)</SelectItem>
                                        <SelectItem value="psicologica">ORIENTAÇÃO PSICOLÓGICA</SelectItem>
                                        <SelectItem value="medica">ORIENTAÇÃO MÉDICA/PEDIATRICA (ATENDIMENTO AMBULATORIAL BÁSICO)</SelectItem>
                                        <SelectItem value="mentoria">ORIENTAÇÃO E TRANSIÇÃO DE CARREIRA PROFISSIONAL - MENTORIA</SelectItem>
                                        <SelectItem value="empresarial">ORIENTAÇÃO EMPRESARIAL</SelectItem>
                                        <SelectItem value="curriculo">ORIENTAÇÃO NA ELABORAÇÃO DE CURRÍCULO</SelectItem>
                                        <SelectItem value="odontologica">ORIENTAÇÃO/ AVALIAÇÃO ODONTOLÓGICA</SelectItem>
                                        <SelectItem value="fisioterapeuta">ORIENTAÇÃO FISIOTERAPEUTA</SelectItem>
                                        <SelectItem value="artesanato">OFICINA DE ARTESANATO</SelectItem>
                                        <SelectItem value="veicular">ORIENTAÇÃO - DESPACHANTE VEICULAR</SelectItem>
                                        <SelectItem value="redesSocias">ORIENTAÇÃO - REDES SOCIAIS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Profissão e Preferência de Atendimento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="profissao">Profissão <span className="text-red-500">*</span></Label>
                                <Input
                                    id="profissao"
                                    value={formData.profissao}
                                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                                    placeholder="Desempregada"
                                    className={cn("w-full mt-2", errors.profissao && "border-red-500")}
                                    required
                                />
                                {errors.profissao && (
                                    <p className="text-sm text-red-500 mt-1">{errors.profissao}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="preferenciaAtendimento">
                                    Preferência de atendimento <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.preferenciaAtendimento}
                                    onValueChange={(value) => setFormData({ ...formData, preferenciaAtendimento: value })}
                                >
                                    <SelectTrigger className="w-full mt-2">
                                        <SelectValue placeholder="Selecione uma preferência" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="presencial">Presencial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Como soube e Sugestão */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="comoSoube">Como soube do projeto <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.comoSoube}
                                    onValueChange={(value) => setFormData({ ...formData, comoSoube: value })}
                                >
                                    <SelectTrigger className="w-full mt-2">
                                        <SelectValue placeholder="Selecione uma opção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="internet">Internet</SelectItem>
                                        <SelectItem value="redes-sociais">Redes Sociais</SelectItem>
                                        <SelectItem value="indicacao">Indicação Amigo</SelectItem>
                                        <SelectItem value="igreja">Igreja</SelectItem>
                                        <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="sugestaoOutraArea">Sugestão de outra área</Label>
                                <Input
                                    id="sugestaoOutraArea"
                                    value={formData.sugestaoOutraArea}
                                    onChange={(e) => setFormData({ ...formData, sugestaoOutraArea: e.target.value })}
                                    placeholder="Nenhuma"
                                    className="w-full mt-2"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4 pt-8 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormData({
                                    nomeCompleto: "",
                                    telefone: "",
                                    idade: "",
                                    email: "",
                                    endereco: "",
                                    areaOrientacao: "",
                                    profissao: "",
                                    preferenciaAtendimento: "",
                                    comoSoube: "",
                                    sugestaoOutraArea: "",
                                })}
    className="px-8 h-10 border-gray-300 text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"                            >
                                Limpar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-navy-700 hover:bg-navy-800 text-white px-8 h-10 bg-[#ED4231] "
                            >
                                Enviar
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                Os campos marcados com <span className="text-red-500 font-medium">*</span> são de preenchimento obrigatório
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}