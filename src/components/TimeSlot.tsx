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
}

const TimeSlot = ({ appointment, onCancel, onReschedule }: TimeSlotProps) => {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-b">
      <div className="grid grid-cols-4 gap-4 flex-1">
        <span className="text-gray-900 font-bold">{appointment.time}</span>
        <span className="text-gray-700">{appointment.name}</span>
        <span className="text-gray-600">{appointment.type}</span>
        <span className="text-gray-500">{appointment.serviceType}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCancel(appointment.time)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cancelar
        </button>
        <button
          onClick={() => onReschedule(appointment.time)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Reagendar
        </button>
      </div>
    </div>
  );
};

export default TimeSlot;