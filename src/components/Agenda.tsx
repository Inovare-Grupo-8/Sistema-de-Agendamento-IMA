import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TimeSlot from "./TimeSlot";

const Agenda = () => {
  const [appointments, setAppointments] = useState([
    { time: "09:00", name: "Ana Silva", type: "Psicologia", serviceType: "Atendimento Online", period: "Manhã" },
    { time: "10:30", name: "Carlos Souza", type: "Nutrição", serviceType: "Consulta Presencial", period: "Manhã" },
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

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#EDF2FB]">
      {notification && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow">
          {notification}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Sua Agenda</h1>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <TimeSlot
            key={appointment.time}
            appointment={appointment}
            onCancel={() => handleCancelAppointment(appointment.time)}
            onReschedule={() => handleOpenRescheduleModal(appointment)}
          />
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Consulta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={new Date()}
              onSelect={(date) => console.log(date)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleReschedule("10:00")}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agenda;