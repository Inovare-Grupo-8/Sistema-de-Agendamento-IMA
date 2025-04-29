import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sun, CloudMoon, Moon } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import TimeSlot from "./TimeSlot";

const History = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [appointments, setAppointments] = useState([
    { time: "09:00", name: "Ana Silva", type: "Psicologia", serviceType: "Atendimento Online", period: "Manhã" },
    { time: "10:30", name: "Carlos Souza", type: "Nutrição", serviceType: "Consulta Presencial", period: "Manhã" },
    { time: "14:00", name: "Beatriz Lima", type: "Fisioterapia", serviceType: "Atendimento Online", period: "Tarde" },
    { time: "15:30", name: "João Pedro", type: "Psicologia", serviceType: "Consulta Presencial", period: "Tarde" },
    { time: "19:00", name: "Mariana Costa", type: "Psicologia", serviceType: "Atendimento Online", period: "Noite" },
    { time: "20:30", name: "Rafael Almeida", type: "Nutrição", serviceType: "Consulta Presencial", period: "Noite" },
  ]);

  const handleCancelAppointment = (time: string) => {
    setAppointments((prevAppointments) =>
      prevAppointments.filter((appointment) => appointment.time !== time)
    );
    setIsModalOpen(true);
  };

  const handleRescheduleAppointment = (time: string, newDate: Date, newTime: string) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment.time === time
          ? { ...appointment, time: newTime, period: getPeriod(newTime) }
          : appointment
      )
    );
  };

  const getPeriod = (time: string) => {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 12) return "Manhã";
    if (hour < 18) return "Tarde";
    return "Noite";
  };

  const periods = [
    { period: "Manhã", Icon: Sun, timeRange: "09h-12h" },
    { period: "Tarde", Icon: CloudMoon, timeRange: "12h-18h" },
    { period: "Noite", Icon: Moon, timeRange: "19h-21h" },
  ];

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={(report) => {
    console.log("Relatório enviado:", report, "para o horário:", selectedAppointment);
    setIsModalOpen(false);
  }}
/>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seu histórico</h1>
          <p className="text-gray-500 text-sm">Consulte o histórico de atendimentos realizadas</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4 text-[#ED4231]" />
              {format(date, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        {periods.map(({ period, Icon, timeRange }) => (
          <div key={period} className="bg-white rounded-lg overflow-hidden">
            <div className="flex items-center px-4 py-2 border-b">
              <Icon color="#ED4231" className="w-5 h-5 mr-2" />
              <span className="text-gray-600">{period}</span>
              <span className="text-gray-400 text-sm ml-auto">{timeRange}</span>
            </div>
            <div className="divide-y">
              {appointments
                .filter((apt) => apt.period === period)
                .map((appointment, idx) => (
                  <TimeSlot
                    key={`${appointment.time}-${idx}`}
                    appointment={appointment}
                    onCancel={() => handleCancelAppointment(appointment.time)}
                    onReschedule={(time) => handleRescheduleAppointment(time, date, "newTime")}
                    renderRescheduleButton={(onClick) => (
                      <button
                        onClick={onClick}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Confirmar
                      </button>
                    )}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
