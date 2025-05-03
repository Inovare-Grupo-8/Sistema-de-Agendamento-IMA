import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaSummaryProps {
  selectedDate?: Date;
  selectedTime: string;
  onConfirm: () => void;
  onCancel: () => void;
  highlight?: boolean;
}

const AgendaSummary = ({ 
  selectedDate, 
  selectedTime,
  onConfirm,
  onCancel,
  highlight = false
}: AgendaSummaryProps) => {
  const formattedDate = selectedDate 
    ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) 
    : "22/05/2025"; // Valor padrão conforme a imagem

  return (
    <Card className={`w-full ${highlight ? 'ring-2 ring-[#ED4231] ring-offset-2' : ''}`}>
      <CardHeader className="pb-0">
        <CardTitle className="text-center text-xl">Resumo</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Especialidade:</span>
            <span>Psicologia</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Profissional:</span>
            <span>Dra Paula</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Data:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Horário:</span>
            <span>{selectedTime || "15:00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Modo:</span>
            <span>Online</span>
          </div>
        </div>

        <Separator />

        <div className="p-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>R$ XX,XX</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Descontos:</span>
            <span>R$ XX,XX</span>
          </div>
        </div>

        <Separator />

        <div className="p-4">
          <div className="flex justify-between mb-4">
            <span className="font-medium">TOTAL:</span>
            <span>R$ XX,XX</span>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-red-500 hover:bg-red-600 text-white" 
              onClick={onConfirm}
            >
              Confirmar agenda
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgendaSummary;