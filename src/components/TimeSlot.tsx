
import { Button } from "@/components/ui/button";

interface TimeSlotProps {
  time: string;
  name: string;
  type: string;
  period: string;
}

const TimeSlot = ({ time, name, type, period }: TimeSlotProps) => {
  return (
    <div className="px-4 py-3 bg-white flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-gray-900 font-medium">{time}</span>
        <span className="text-gray-700">{name}</span>
        <span className="text-gray-500">'{type}'</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant={period === "Tarde" ? "default" : "destructive"} 
          className="px-6"
        >
          Confirmar
        </Button>
        <Button 
          variant={period === "Tarde" ? "secondary" : "destructive"} 
          className="px-6"
        >
          Reagendar
        </Button>
        <Button 
          variant={period === "Tarde" ? "outline" : "destructive"} 
          className="px-6"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default TimeSlot;
