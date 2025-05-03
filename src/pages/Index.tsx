import { Routes, Route } from "react-router-dom";
import Agenda from "@/components/Agenda";
import ProfileForm from "@/components/ProfileForm";
import DisponibilizarHorario from "@/pages/DisponibilizarHorario";
import NotFound from "./NotFound";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#EDF2FB] py-8">
      <Routes>
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/profile-form" element={<ProfileForm />} />
        <Route path="/disponibilizar-horario" element={<DisponibilizarHorario />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default Index;