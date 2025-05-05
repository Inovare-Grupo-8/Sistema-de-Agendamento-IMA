import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

interface CustomTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customTime: string;
  setCustomTime: (value: string) => void;
  validationMessage: string;
  onConfirm: () => void;
}

const CustomTimeModal: React.FC<CustomTimeModalProps> = ({
  open,
  onOpenChange,
  customTime,
  setCustomTime,
  validationMessage,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Selecione um horário personalizado</DialogTitle>
        </DialogHeader>
        {validationMessage && (
          <p className="text-red-500 text-sm mb-4" role="alert">{validationMessage}</p>
        )}
        <Input
          type="time"
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
          className="border rounded p-2 w-3/4 mb-4"
          aria-label="Campo para inserir horário personalizado"
        />
        <DialogFooter className="flex flex-col gap-2 w-full items-center">
          <Button className="bg-indigo-900 hover:bg-indigo-800 text-white py-2 w-3/4" onClick={onConfirm} aria-label="Confirmar horário personalizado">
            Confirmar
          </Button>
          <Button variant="outline" className="py-2 w-3/4" onClick={() => onOpenChange(false)} aria-label="Cancelar horário personalizado">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTimeModal;
