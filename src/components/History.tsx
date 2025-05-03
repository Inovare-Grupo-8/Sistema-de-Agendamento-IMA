import { useState } from "react";
import Modal from "@/components/ui/ModalRelato";

const History = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<string | null>(null);
  const [confirmedAppointments, setConfirmedAppointments] = useState<string[]>([]);

  const handleOpenModal = (time: string) => {
    setSelectedAppointment(time);
    setIsModalOpen(true);
  };

  const handleOpenConfirmModal = (time: string) => {
    setAppointmentToConfirm(time);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAppointment = () => {
    if (appointmentToConfirm) {
      setConfirmedAppointments((prev) => [...prev, appointmentToConfirm]);
      setIsConfirmModalOpen(false);
      setAppointmentToConfirm(null);
    }
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
      {/* Modal para Relatar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(report) => {
          console.log("Relatório enviado:", report, "para o horário:", selectedAppointment);
          setIsModalOpen(false);
        }}
      >
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Relatar Consulta</h2>
          <p>Descreva o que aconteceu na consulta às {selectedAppointment}.</p>
          {/* Adicione o formulário de relato aqui */}
        </div>
      </Modal>

      {/* Modal para Confirmar */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onSubmit={handleConfirmAppointment}
      >
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Confirmar Consulta</h2>
          <p>Tem certeza de que deseja confirmar que a consulta às {appointmentToConfirm} aconteceu?</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmAppointment}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

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
                    <div className="flex items-center gap-2">
                      {!confirmedAppointments.includes(appointment.time) && (
                        <button
                          onClick={() => handleOpenConfirmModal(appointment.time)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Confirmar
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(appointment.time)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Relatar
                      </button>
                    </div>
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