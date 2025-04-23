
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface TimeSlotProps {
  time: string;
  name: string;
  type: string;
  period: string;
}

const TimeSlot = ({ time, name, type, period }: TimeSlotProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirm = () => {
    // Add confirm logic here
    setIsDialogOpen(false);
  };

  return (
    <div className="px-4 py-3 bg-white flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-gray-900 font-medium">{time}</span>
        <span className="text-gray-700">{name}</span>
        <span className="text-gray-500">'{type}'</span>
      </div>
      <div className="flex items-center space-x-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant={period === "Tarde" ? "default" : "destructive"} 
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
