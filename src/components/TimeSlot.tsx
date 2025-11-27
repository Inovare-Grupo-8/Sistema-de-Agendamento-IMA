import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
import {
  Clock,
  User,
  Calendar as CalendarIcon,
  Video,
  MapPin,
} from "lucide-react";
import { useState } from "react";

interface Appointment {
  time: string;
  name: string;
  type: string;
  serviceType: string;
  period: string;
  status: "confirmed" | "pending" | "cancelled";
  priority?: "high" | "medium" | "low";
}

interface TimeSlotProps {
  appointment: Appointment;
  onCancel: (time: string) => void;
  onReschedule: (time: string, date: Date, newTime: string) => void;
  highlight?: boolean;
}

const TimeSlot = ({
  appointment,
  onCancel,
  onReschedule,
  highlight,
}: TimeSlotProps) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      onReschedule(appointment.time, selectedDate, selectedTime);
      setIsRescheduleDialogOpen(false);
    }
  };

  const statusColors = {
    confirmed:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const statusLabels = {
    confirmed: "Confirmado",
    pending: "Pendente",
    cancelled: "Cancelado",
  };

  return (
    <div
      className={`p-4 transition-all duration-300 ${
        highlight
          ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500"
          : "hover:bg-gray-50 dark:hover:bg-[#23272F]/50"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/* Informações principais */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Clock className="w-5 h-5 text-[#ED4231]" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {appointment.time}
            </span>
            <Badge
              className={`${
                statusColors[appointment.status]
              } px-3 py-1 rounded-full text-xs font-medium`}
            >
              {statusLabels[appointment.status]}
            </Badge>
            {highlight && (
              <Badge className="bg-[#ED4231] text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                Próximo
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {appointment.name}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              {appointment.serviceType.toLowerCase().includes("online") ? (
                <Video className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {appointment.serviceType}
            </span>
            <span>{appointment.type}</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsRescheduleDialogOpen(true)}
            className="flex-1 md:flex-none border-[#ED4231] text-[#ED4231] hover:bg-[#ED4231] hover:text-white transition-colors"
          >
            Reagendar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsCancelDialogOpen(true)}
            className="flex-1 md:flex-none bg-red-600 hover:bg-red-700"
          >
            Cancelar
          </Button>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar consulta</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja cancelar a consulta de{" "}
              {appointment.name} às {appointment.time}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsCancelDialogOpen(false);
                onCancel(appointment.time);
              }}
            >
              Cancelar consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar consulta</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e horário para a consulta de{" "}
              {appointment.name}
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
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(false)}
            >
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
