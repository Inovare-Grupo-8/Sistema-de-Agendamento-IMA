import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Appointment {
  time: string;
  name: string;
  type: string;
  serviceType: string;
  period: string;
}

interface TimeSlotProps {
  appointment: Appointment;
  onCancel: (time: string) => void;
  onReschedule: (time: string, date: Date, newTime: string) => void;
  highlight?: boolean;
}

const TimeSlot = ({ appointment, onCancel, onReschedule, highlight }: TimeSlotProps) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00"
  ];

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      onReschedule(appointment.time, selectedDate, selectedTime);
      setIsRescheduleDialogOpen(false);
    }
  };

  return (
    <div className={`px-4 py-3 flex items-center justify-between ${highlight ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-green-400 bg-green-50 dark:bg-green-900/30 transition-all duration-300' : ''}`}>
      <div className="grid grid-cols-4 gap-4 flex-1">
        <span className="text-gray-900 dark:text-[#f8fafc] font-semibold">{appointment.time}</span>
        <span className="text-gray-700 dark:text-[#a5b4fc] font-semibold">{appointment.name}</span>
        <span className="text-gray-600 dark:text-[#cbd5e1]">{appointment.type}</span>
        <span className="text-gray-500 dark:text-[#cbd5e1]">{appointment.serviceType}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="destructive"
          onClick={() => setIsCancelDialogOpen(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          Cancelar
        </Button>
        <Button 
          variant="secondary"
          onClick={() => setIsRescheduleDialogOpen(true)}
          className="bg-[#1A1466] hover:bg-[#13104d]"
        >
          Reagendar
        </Button>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar consulta</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja cancelar a consulta de {appointment.name} às {appointment.time}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={() => { setIsCancelDialogOpen(false); onCancel(appointment.time); }}>
              Cancelar consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar consulta</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e horário para a consulta de {appointment.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <Select onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleReschedule}
              className="bg-[#1A1466] hover:bg-[#13104d]"
              disabled={!selectedDate || !selectedTime}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeSlot;
