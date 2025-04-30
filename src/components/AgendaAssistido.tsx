import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TimeSlot from "./TimeSlot";

const AgendaAssistido = () => {
  const [appointments, setAppointments] = useState([
    { time: "14:00", name: "Beatriz Lima", type: "Fisioterapia", serviceType: "Atendimento Online", period: "Tarde" },
    { time: "15:30", name: "João Pedro", type: "Psicologia", serviceType: "Consulta Presencial", period: "Tarde" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleCancelAppointment = (time: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.time !== time));
    setNotification("Agendamento cancelado com sucesso!");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenRescheduleModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleReschedule = (newTime: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.time === selectedAppointment.time ? { ...apt, time: newTime } : apt
      )
    );
    setIsModalOpen(false);
    setNotification("Horário reagendado com sucesso!");
    setTimeout(() => setNotification(null), 3000);
  };

  const periods = [
    { period: "Manhã", timeRange: "09h-12h" },
    { period: "Tarde", timeRange: "12h-18h" },
    { period: "Noite", timeRange: "19h-21h" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#EDF2FB]">
      {notification && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow">
          {notification}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Agenda do Assistido</h1>
      <div className="space-y-4">
        {periods.map(({ period, timeRange }) => (
          <div key={period} className="bg-white rounded-lg overflow-hidden">
            <div className="flex items-center px-4 py-2 border-b bg-gray-100">
              <span className="text-gray-600 font-bold">{period}</span>
              <span className="text-gray-400 text-sm ml-auto">{timeRange}</span>
            </div>
            <div className="divide-y">
              {appointments
                .filter((apt) => apt.period === period)
                .map((appointment) => (
                  <TimeSlot
                    key={appointment.time}
                    appointment={appointment}
                    onCancel={() => handleCancelAppointment(appointment.time)}
                    onReschedule={() => handleOpenRescheduleModal(appointment)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Consulta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Button onClick={() => handleReschedule("16:00")}>Confirmar</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaAssistido;