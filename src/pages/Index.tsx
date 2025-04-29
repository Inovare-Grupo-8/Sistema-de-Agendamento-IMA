import Agenda from "@/components/Agenda";
import ProfileForm from "@/components/ProfileForm";
import DisponibilizarHorario from "@/pages/DisponibilizarHorario";
import ProfileAssistido from "@/components/ProfileAssistido";
import AgendaAssistido from "@/components/AgendaAssistido";
import History from "@/components/History";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#EDF2FB] py-8">
      {/* <Agenda /> */}
      {/* <DisponibilizarHorario /> */}
      {/* <ProfileForm /> */}
      {/* <ProfileAssistido/> */}
      {/* <AgendaAssistido/> */}
      <History />
    </div>
  );
};

export default Index;