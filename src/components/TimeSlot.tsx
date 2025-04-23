import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";

interface TimeSlotProps {
  time: string;
  name: string;
  type: string;
  period: string;
  onConfirm: (time: string) => void;
  onReschedule: (time: string, newDate: Date, newTime: string) => void;
  onCancel: (time: string) => void;
}

const TimeSlot = ({ time, name, type, period, onConfirm, onReschedule, onCancel }: TimeSlotProps) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  const handleConfirm = () => {
    onConfirm(time);
    setIsConfirmDialogOpen(false);
  };

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      console.log("Rescheduling with:", { time, selectedDate, selectedTime }); // Debugging log
      onReschedule(time, selectedDate, selectedTime);
      setIsRescheduleDialogOpen(false);
    } else {
      console.log("Missing selectedDate or selectedTime", { selectedDate, selectedTime }); // Debugging log
    }
  };

  const handleCancel = () => {
    onCancel(time);
    setIsCancelDialogOpen(false);
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00"
  ];

  return (
    <div className="px-4 py-3 bg-white flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-gray-900 font-medium">{time}</span>
        <span className="text-gray-700">{name}</span>
        <span className="text-gray-500">'{type}'</span>
      </div>
      <div className="flex items-center space-x-2">
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="confirm" 
              className="px-6"
            >
              Confirmar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar consulta</DialogTitle>
              <DialogDescription>
                Você confirma a consulta de {name} às {time}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="reschedule" 
              className="px-6"
            >
              Reagendar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reagendar consulta</DialogTitle>
              <DialogDescription>
                Escolha uma nova data e horário para a consulta de {name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex flex-col space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto"
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
                disabled={!selectedDate || !selectedTime}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="cancel" 
              className="px-6"
            >
              Cancelar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar consulta</DialogTitle>
              <DialogDescription>
                Você tem certeza que deseja cancelar a consulta de {name} às {time}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Voltar
              </Button>
              <Button variant="destructive" onClick={handleCancel}>
                Cancelar consulta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TimeSlot;
