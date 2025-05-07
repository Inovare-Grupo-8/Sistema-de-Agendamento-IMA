import { Routes, Route } from "react-router-dom";
import Agenda from "@/components/Agenda";
import TelaLogin from "@/components/TelaLogin";
import ProfileForm from "@/components/ProfileForm";
import DisponibilizarHorario from "@/pages/DisponibilizarHorario";
import NotFound from "./NotFound";
import Header from "@/components/Header";
import { useState } from "react";

const Index = () => {
  // Exemplo de dados do usuário
  const [user, setUser] = useState({ nome: "Samuel", sobrenome: "Batista" });

  const handleLogout = () => {
    // Aqui você pode limpar o localStorage, redirecionar, etc.
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#EDF2FB] py-8">
      <Header nome={user.nome} sobrenome={user.sobrenome} onLogout={handleLogout} />
      <div className="pt-24"> {/* Espaço para o header fixo */}
        <Routes>
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/profile-form" element={<ProfileForm />} />
          <Route path="/disponibilizar-horario" element={<DisponibilizarHorario />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<TelaLogin/>}></Route>
        </Routes>
      </div>
    </div>
  );
};

export default Index;