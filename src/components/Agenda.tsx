
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sun, CloudMoon, Moon } from "lucide-react";
import { useState } from "react";
import TimeSlot from "./TimeSlot";

const Agenda = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [appointments] = useState([
    { time: "11:00", name: "George MacQueen", type: "Psicologia", serviceType: "Atendimento Online", period: "Manhã" },
    { time: "13:00", name: "George MacQueen", type: "Psicologia", serviceType: "Atendimento Online", period: "Tarde" },
    { time: "13:00", name: "George MacQueen", type: "Psicologia", serviceType: "Atendimento Online", period: "Tarde" },
    { time: "13:00", name: "George MacQueen", type: "Psicologia", serviceType: "Atendimento Online", period: "Tarde" },
    { time: "13:00", name: "George MacQueen", type: "Psicologia", serviceType: "Atendimento Online", period: "Tarde" },
    { time: "13:00", name: "George MacQueen", type: "Psicologia", serviceType: "Atendimento Online", period: "Noite" },
    { time: "13:00", name: "George MacQueen", type: "Psicologia", serviceType: "Atendimento Online", period: "Noite" },
    { time: "13:00", name: "George MacQueen", type: "Psicologia", serviceType: "Atendimento Online", period: "Noite" },
  ]);

  const periods = [
    { period: "Manhã", Icon: Sun, timeRange: "09h-12h" },
    { period: "Tarde", Icon: CloudMoon, timeRange: "12h-18h" },
    { period: "Noite", Icon: Moon, timeRange: "19h-21h" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#EDF2FB]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sua agenda</h1>
          <p className="text-gray-500 text-sm">Consulte a quantidade de atendimentos que você tem hoje</p>
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
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agenda;
