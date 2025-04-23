import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sun, CloudMoon, Moon } from "lucide-react";
import { useState } from "react";
import TimeSlot from "./TimeSlot";

const Agenda = () => {
  const [date, setDate] = useState<Date>(new Date("2025-04-04"));
  const [appointments, setAppointments] = useState([
    { time: "11:00", name: "Samuel Batista", type: "Psicologia", period: "Manhã", timeRange: "09h-12h" },
    { time: "13:00", name: "Samuel Batista", type: "Psicologia", period: "Tarde", timeRange: "13h-18h" },
    { time: "14:00", name: "Samuel Batista", type: "Psicologia", period: "Tarde", timeRange: "13h-18h" },
    { time: "15:00", name: "Samuel Batista", type: "Psicologia", period: "Tarde", timeRange: "13h-18h" },
    { time: "16:00", name: "Samuel Batista", type: "Psicologia", period: "Tarde", timeRange: "13h-18h" },
    { time: "21:00", name: "Samuel Batista", type: "Psicologia", period: "Noite", timeRange: "19h-21h" },
    { time: "22:00", name: "Samuel Batista", type: "Psicologia", period: "Noite", timeRange: "19h-21h" },
    { time: "23:00", name: "Samuel Batista", type: "Psicologia", period: "Noite", timeRange: "19h-21h" },
  ]);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelTime, setCancelTime] = useState<string | null>(null);
  const [isRescheduleSuccessDialogOpen, setIsRescheduleSuccessDialogOpen] = useState(false);

  const handleConfirm = (time, name, type) => {
    const period = periods.find(({ start, end }) => time >= start && time <= end)?.period;
    if (period) {
      setAppointments((prev) => [
        ...prev,
        { time, name, type, period, timeRange: `${period} (${time})` },
      ]);
    }
  };

  const handleReschedule = (time, newDate, newTime) => {
    setAppointments((prev) => {
      const updatedAppointments = prev.map((apt) => {
        if (apt.time === time) {
          // Determine the new period based on the updated time
          const newPeriod = periods.find(({ start, end }) => newTime >= start && newTime <= end)?.period;
          return { ...apt, time: newTime, date: format(newDate, "dd/MM/yyyy"), period: newPeriod };
        }
        return apt;
      });
      return updatedAppointments;
    });
    setIsRescheduleSuccessDialogOpen(true);
  };

  const handleCancel = (time) => {
    setCancelTime(time);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (cancelTime) {
      setAppointments((prev) => prev.filter((apt) => apt.time !== cancelTime));
      setCancelTime(null);
      setIsCancelDialogOpen(false);
    }
  };

  const periods = [
    { period: "Manhã", Icon: Sun, timeRange: "08h-12h", start: "08:00", end: "12:00" },
    { period: "Tarde", Icon: CloudMoon, timeRange: "12h01-18h", start: "12:01", end: "18:00" },
    { period: "Noite", Icon: Moon, timeRange: "18h01-00h", start: "18:01", end: "23:59" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#EDF2FB] rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sua agenda</h1>
          <p className="text-gray-500 text-sm">Consulte a quantidade de assistido que você tem hoje</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
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

      <div className="space-y-4 mt-6">
        {periods.map(({ period, Icon, timeRange, start, end }) => (
          <div key={period} className="bg-white rounded-lg overflow-hidden">
            <div className="flex items-center px-4 py-2 bg-white border-b">
              <Icon color="#ED4231" className="w-5 h-5 mr-2" />
              <span className="text-gray-600">{period}</span>
              <span className="text-gray-400 text-sm ml-auto">
                {timeRange}
              </span>
            </div>
            <div className="divide-y">
              {appointments
                .filter((apt) => apt.period === period) // Ensure appointments are filtered by the correct period
                .map((appointment, idx) => (
                  <TimeSlot
                    key={`${appointment.time}-${idx}`}
                    time={appointment.time}
                    name={appointment.name}
                    type={appointment.type}
                    period={period}
                    onConfirm={handleConfirm}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar consulta</DialogTitle>
          </DialogHeader>
          <p>Você tem certeza que deseja cancelar a consulta às {cancelTime}?</p>
          <DialogFooter>
            <Button variant="cancel" onClick={() => setIsCancelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancelar consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRescheduleSuccessDialogOpen} onOpenChange={setIsRescheduleSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consulta reagendada</DialogTitle>
          </DialogHeader>
          <p>A consulta foi reagendada com sucesso!</p>
          <DialogFooter>
            <Button onClick={() => setIsRescheduleSuccessDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agenda;