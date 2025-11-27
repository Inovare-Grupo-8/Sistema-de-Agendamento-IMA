import { Routes, Route } from "react-router-dom";
import Agenda from "@/components/Agenda";
import TelaLogin from "@/components/TelaLogin";
import ProfileForm from "@/components/ProfileForm";
import DisponibilizarHorario from "@/pages/DisponibilizarHorario";
import ProfileFormUser from "@/components/ProfileFormUser";
import NotFound from "./NotFound";
import Header from "@/components/Header";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, logout } = useAuth();
  const nome = useMemo(() => {
    const ls = localStorage.getItem("userData");
    if (ls) {
      try {
        const u = JSON.parse(ls);
        return u.nome || user?.nome || "Usuário";
      } catch (e) {
        return user?.nome || "Usuário";
      }
    }
    return user?.nome || "Usuário";
  }, [user?.nome]);
  const sobrenome = useMemo(() => {
    const ls = localStorage.getItem("userData");
    if (ls) {
      try {
        const u = JSON.parse(ls);
        return u.sobrenome || user?.sobrenome || "";
      } catch (e) {
        return user?.sobrenome || "";
      }
    }
    return user?.sobrenome || "";
  }, [user?.sobrenome]);

  return (
    <div className="min-h-screen bg-[#EDF2FB] py-8">
      <Header nome={nome} sobrenome={sobrenome} onLogout={logout} />
      <div className="pt-24">
        {" "}
        {/* Espaço para o header fixo */}
        <Routes>
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/profile-form" element={<ProfileForm />} />
          <Route
            path="/disponibilizar-horario"
            element={<DisponibilizarHorario />}
          />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<TelaLogin />} />
          <Route path="/profile-form-user" element={<ProfileFormUser />} />
          {/* Adicione outras rotas aqui */}
        </Routes>
      </div>
    </div>
  );
};

export default Index;
