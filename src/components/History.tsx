import { useState } from "react";
import Modal from "@/components/ui/ModalRelato";

const History = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const handleOpenModal = (time: string) => {
    setSelectedAppointment(time); // Define o horário selecionado
    setIsModalOpen(true); // Abre o modal
  };

  const appointments = [
    { time: "09:00", name: "Ana Silva", type: "Psicologia", period: "Manhã" },
    { time: "10:30", name: "Carlos Souza", type: "Nutrição", period: "Manhã" },
    { time: "14:00", name: "Beatriz Lima", type: "Fisioterapia", period: "Tarde" },
    { time: "15:30", name: "João Pedro", type: "Psicologia", period: "Tarde" },
    { time: "19:00", name: "Mariana Costa", type: "Psicologia", period: "Noite" },
    { time: "20:30", name: "Rafael Almeida", type: "Nutrição", period: "Noite" },
  ];

  const periods = [
    { period: "Manhã", timeRange: "09h-12h" },
    { period: "Tarde", timeRange: "12h-18h" },
    { period: "Noite", timeRange: "19h-21h" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#EDF2FB]">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(report) => {
          console.log("Relatório enviado:", report, "para o horário:", selectedAppointment);
          setIsModalOpen(false);
        }}
      />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Seu histórico</h1>
      <div className="space-y-4">
        {periods.map(({ period, timeRange }) => (
          <div key={period} className="bg-white rounded-lg overflow-hidden">
            <div className="flex items-center px-4 py-2 border-b">
              <span className="text-gray-600 font-bold">{period}</span>
              <span className="text-gray-400 text-sm ml-auto">{timeRange}</span>
            </div>
            <div className="divide-y">
              {appointments
                .filter((apt) => apt.period === period)
                .map((appointment, idx) => (
                  <div
                    key={`${appointment.time}-${idx}`}
                    className="flex justify-between items-center px-4 py-2"
                  >
                    <div>
                      <p className="font-bold">{appointment.name}</p>
                      <p className="text-sm text-gray-500">{appointment.type}</p>
                    </div>
                    <button
                      onClick={() => handleOpenModal(appointment.time)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Relatar
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;