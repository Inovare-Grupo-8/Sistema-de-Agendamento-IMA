
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sun, CloudMoon, Moon } from "lucide-react";
import { useState } from "react";
import TimeSlot from "./TimeSlot";

const Agenda = () => {
  const [date, setDate] = useState<Date>(new Date("2025-04-04"));

  const appointments = [
    { time: "11:00", name: "Samuel Batista", type: "Psicologia", period: "Manhã", timeRange: "09h-12h" },
    { time: "13:00", name: "Samuel Batista", type: "Psicologia", period: "Tarde", timeRange: "13h-18h" },
    { time: "14:00", name: "Samuel Batista", type: "Psicologia", period: "Tarde", timeRange: "13h-18h" },
    { time: "15:00", name: "Samuel Batista", type: "Psicologia", period: "Tarde", timeRange: "13h-18h" },
    { time: "16:00", name: "Samuel Batista", type: "Psicologia", period: "Tarde", timeRange: "13h-18h" },
    { time: "21:00", name: "Samuel Batista", type: "Psicologia", period: "Noite", timeRange: "19h-21h" },
    { time: "22:00", name: "Samuel Batista", type: "Psicologia", period: "Noite", timeRange: "19h-21h" },
    { time: "23:00", name: "Samuel Batista", type: "Psicologia", period: "Noite", timeRange: "19h-21h" },
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
        {[
          { period: "Manhã", Icon: Sun, timeRange: "09h-12h" },
          { period: "Tarde", Icon: CloudMoon, timeRange: "13h-18h" },
          { period: "Noite", Icon: Moon, timeRange: "19h-21h" }
        ].map(({ period, Icon, timeRange }) => (
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
                .filter((apt) => apt.period === period)
                .map((appointment, idx) => (
                  <TimeSlot
                    key={`${appointment.time}-${idx}`}
                    time={appointment.time}
                    name={appointment.name}
                    type={appointment.type}
                    period={period}
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
