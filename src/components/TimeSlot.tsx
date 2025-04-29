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
  onCancel: () => void;
  onReschedule: (time: string, date: Date, newTime: string) => void;
  renderRescheduleButton?: (onClick: () => void) => JSX.Element;
}

const TimeSlot = ({ appointment, onCancel, onReschedule, renderRescheduleButton }: TimeSlotProps) => {
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
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
    <div className="flex justify-between items-center p-4">
      <div>
        <p className="font-bold">{appointment.name}</p>
        <p className="text-sm text-gray-500">{appointment.type}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
        >
          Cancelar
        </button>
        {renderRescheduleButton ? (
          renderRescheduleButton(() => setIsRescheduleDialogOpen(true))
        ) : (
          <button
            onClick={() => setIsRescheduleDialogOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reagendar
          </button>
        )}
      </div>

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
