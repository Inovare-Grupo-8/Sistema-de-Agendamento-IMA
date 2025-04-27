import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bell, User } from "lucide-react";
import { useState } from "react";

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        nome: "Samuel",
        sobrenome: "Batista",
        email: "samuel.ima@gmail.com",
        endereco: "Rua x",
        telefone: "(11)11111-1111",
        cidade: "São Paulo",
        uf: "SP",
        atividade: "Lorem Lorem Lorem",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Perfil</h1>
                <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 cursor-pointer" />
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="nome" className="block text-sm font-medium">
                                Nome
                            </label>
                            <Select defaultValue={formData.nome}>
                                <option value={formData.nome}>{formData.nome}</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="sobrenome" className="block text-sm font-medium">
                                Sobrenome
                            </label>
                            <Select defaultValue={formData.sobrenome}>
                                <option value={formData.sobrenome}>{formData.sobrenome}</option>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="endereco" className="block text-sm font-medium">
                            Endereço
                        </label>
                        <Input
                            type="text"
                            value={formData.endereco}
                            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                            className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="telefone" className="block text-sm font-medium">
                            Telefone/WhatsApp
                        </label>
                        <Input
                            type="tel"
                            value={formData.telefone}
                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                            className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="cidade" className="block text-sm font-medium">
                                Cidade
                            </label>
                            <select
                                defaultValue={formData.cidade}
                                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] w-full"
                            >
                                <option value="São Paulo">São Paulo</option>
                                <option value="Rio de Janeiro">Rio de Janeiro</option>
                                <option value="Belo Horizonte">Belo Horizonte</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="uf" className="block text-sm font-medium">
                                UF
                            </label>
                            <select
                                defaultValue={formData.uf}
                                onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                                className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] w-full"
                            >
                                <option value="SP">SP</option>
                                <option value="RJ">RJ</option>
                                <option value="MG">MG</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="atividade" className="block text-sm font-medium">
                            Atividade a se cedida como voluntariado:
                        </label>
                        <Textarea
                            value={formData.atividade}
                            onChange={(e) => setFormData({ ...formData, atividade: e.target.value })}
                            className="border border-[#ADADAD] border-solid border-2 rounded-[20px] min-h-[100px] bg-[#EDF2FB]"
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" type="button">
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-[#1a237e] hover:bg-[#1a237e]/90">
                            Salvar
                        </Button>
                    </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                    <img
                        src="/image/perfilProfile.svg" 
                        alt="Profile"
                        className="rounded-full w-72 h-72 object-cover"
                    />
                </div>
            </form>
        </div>
    );
};

export default ProfileForm;