import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bell, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ProfileForm = () => {
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem("profileData");
        return savedData ? JSON.parse(savedData) : {
            nome: "jhe",
            sobrenome: "Batista",
            email: "samuel.ima@gmail.com",
            endereco: "Rua x",
            telefone: "(11)11111-1111",
            cidade: "São Paulo",
            uf: "SP",
            atividade: "Lorem Lorem Lorem",
            profileImage: "",
        };
    });

    useEffect(() => {
        localStorage.setItem("profileData", JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    const handleCancel = () => {
        const savedData = localStorage.getItem("profileData");
        if (savedData) {
            setFormData(JSON.parse(savedData));
        }
    };

    const [showModal, setShowModal] = useState(false);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Perfil</h1>
                <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 cursor-pointer text-[#ED4231]" />
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#ED4231]" />
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
                            <Input
                                type="text"
                                value={formData.nome}
                                readOnly
                                className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="sobrenome" className="block text-sm font-medium">
                                Sobrenome
                            </label>
                            <Input
                                type="text"
                                value={formData.sobrenome}
                                readOnly
                                className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] cursor-not-allowed"
                            />
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
                                className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] w-full px-4 py-2"
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
                                className="border border-[#ADADAD] border-solid border-2 rounded-[20px] bg-[#EDF2FB] w-full px-4 py-2"
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" type="button">
                                    Cancelar
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <div className="p-4">
                                    <h2 className="text-lg font-bold">Confirmação</h2>
                                    <p className="text-gray-600">Tem certeza de que deseja cancelar as mudanças?</p>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline" onClick={() => setShowModal(false)}>
                                            Não
                                        </Button>
                                        <Button className="bg-[#ED4231] text-white" onClick={handleCancel}>
                                            Sim
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type="submit" className="bg-[#1A1466] hover:bg-[#1a237e]/90">
                                    Salvar
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <div className="p-4">
                                    <h2 className="text-lg font-bold">Confirmação</h2>
                                    <p className="text-gray-600">Formulário salvo com sucesso!</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="relative flex flex-col items-center">
                    <img
                        src={formData.profileImage || "/image/perfilProfile.svg"}
                        alt="Profile"
                        className="rounded-full w-72 h-72 object-cover"
                    />
                    <label
                        htmlFor="upload-photo"
                        className="mt-4 bg-[#1A1466] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[#1a237e]/90"
                    >
                        Editar Foto
                    </label>
                    <input
                        type="file"
                        id="upload-photo"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    setFormData({ ...formData, profileImage: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                </div>
            </form>
        </div>
    );
};

export default ProfileForm;