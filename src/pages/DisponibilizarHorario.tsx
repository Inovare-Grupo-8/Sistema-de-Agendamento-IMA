import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Sun, CloudMoon, Moon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import TimeSlotSection from "@/components/TimeSlotSection";
import AgendaSummary from "@/components/AgendaSummary";

const DisponibilizarHorario = () => {
  // Estado para armazenar a data selecionada
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Estado para armazenar o horário selecionado
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Estado para o primeiro mês a ser exibido (Abril de 2025)
  const [firstMonth, setFirstMonth] = useState<Date>(new Date(2025, 3, 1)); // Abril de 2025

  // Estado para o segundo mês a ser exibido (Maio de 2025)
  const [secondMonth, setSecondMonth] = useState<Date>(new Date(2025, 4, 1)); // Maio de 2025

  // Estado para controlar a abertura do modal de confirmação
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para controlar a abertura do modal de horário personalizado
  const [isCustomTimeModalOpen, setIsCustomTimeModalOpen] = useState(false);

  // Estado para armazenar o horário personalizado
  const [customTime, setCustomTime] = useState("");

  // Estado para mensagens de validação
  const [validationMessage, setValidationMessage] = useState("");

  // Função para salvar a data e o horário no localStorage
  const saveToLocalStorage = () => {
    if (selectedDate) {
      localStorage.setItem("selectedDate", selectedDate.toISOString());
    }
    if (selectedTime) {
      localStorage.setItem("selectedTime", selectedTime);
    }
  };

  // Carrega a data e o horário do localStorage ao montar o componente
  useEffect(() => {
    const storedDate = localStorage.getItem("selectedDate");
    const storedTime = localStorage.getItem("selectedTime");

    if (storedDate) {
      setSelectedDate(new Date(storedDate));
    }
    if (storedTime) {
      setSelectedTime(storedTime);
    }
  }, []);

  // Validação para impedir a seleção de datas passadas
  const handleDateSelect = (date: Date | undefined) => {
    if (date && date < new Date()) {
      setValidationMessage("Não é possível selecionar uma data que já passou.");
      setIsModalOpen(true);
      return;
    }
    setSelectedDate(date);
    setValidationMessage("");
  };

  // Função para selecionar o horário
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Função para navegar para o mês anterior
  const handlePreviousMonth = (monthIndex: number) => {
    if (monthIndex === 0) {
      const prevMonth = new Date(firstMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setFirstMonth(prevMonth);
    } else {
      const prevMonth = new Date(secondMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setSecondMonth(prevMonth);
    }
  };

  // Função para navegar para o próximo mês
  const handleNextMonth = (monthIndex: number) => {
    if (monthIndex === 0) {
      const nextMonth = new Date(firstMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setFirstMonth(nextMonth);
    } else {
      const nextMonth = new Date(secondMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setSecondMonth(nextMonth);
    }
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      setValidationMessage("Por favor, selecione uma data e um horário antes de confirmar.");
      setIsModalOpen(true);
      return;
    }
    saveToLocalStorage();
    setValidationMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setValidationMessage("");
    setIsModalOpen(false);
    setIsCustomTimeModalOpen(false);
  };

  const handleOtherTime = () => {
    setIsCustomTimeModalOpen(true);
  };

  // Validação para horários personalizados no formato correto e intervalo permitido
  const handleCustomTimeConfirm = () => {
    const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/; // Regex para validar formato HH:mm
    if (!customTime || !timeRegex.test(customTime)) {
      setValidationMessage("Por favor, insira um horário válido no formato HH:mm.");
      setIsCustomTimeModalOpen(true);
      return;
    }

    const [hours, minutes] = customTime.split(":").map(Number);
    if (hours < 6 || hours > 21 || (hours === 21 && minutes > 0)) {
      setValidationMessage("O horário deve estar entre 06:00 e 21:00.");
      setIsCustomTimeModalOpen(true);
      return;
    }

    if (selectedTime) {
      const [selectedHours] = selectedTime.split(":").map(Number);
      if (Math.abs(hours - selectedHours) < 1) {
        setValidationMessage("O intervalo entre os horários deve ser de pelo menos uma hora.");
        setIsCustomTimeModalOpen(true);
        return;
      }
    }

    setValidationMessage("");
    setSelectedTime(customTime);
    setIsCustomTimeModalOpen(false);
  };

  const periods = [
    { title: "Manhã", Icon: Sun, timeSlots: [
      "06h00", "06h30", "07h00", "07h30", 
      "08h00", "08h30", "09h00", "09h30", 
      "10h00", "10h30", "11h00", "11h30"
    ] },
    { title: "Tarde", Icon: CloudMoon, timeSlots: [
      "12h00", "12h30", "13h00", "13h30", 
      "14h00", "14h30", "15h00", "15h30", 
      "16h00", "16h30", "17h00", "17h30"
    ] },
    { title: "Noite", Icon: Moon, timeSlots: [
      "18h00", "18h30", "19h00", "19h30", 
      "20h00", "20h30", "21h00", "21h30"
    ] }
  ];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Disponibilizar horário</h1>
      
      <div className="flex flex-wrap gap-6">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Calendário de Abril */}
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm md:text-base">
                  {format(firstMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviousMonth(0)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNextMonth(0)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={firstMonth}
                  showOutsideDays={true}
                  className="p-0 pointer-events-auto"
                  locale={ptBR}
                />
              </CardContent>
            </Card>

            {/* Calendário de Maio */}
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm md:text-base">
                  {format(secondMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviousMonth(1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNextMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={secondMonth}
                  showOutsideDays={true}
                  className="p-0 pointer-events-auto"
                  locale={ptBR}
                />
              </CardContent>
            </Card>
          </div>

          {/* Seções de horários */}
          <div className="space-y-4">
            {periods.map(({ title, Icon, timeSlots }) => (
              <div key={title} className="bg-white rounded-lg overflow-hidden">
                <div className="flex items-center px-4 py-2 border-b">
                  <Icon color="#ED4231" className="w-5 h-5 mr-2" />
                  <span className="text-gray-600 font-semibold">{title}</span>
                </div>
                <TimeSlotSection 
                  title={title} 
                  timeSlots={timeSlots}
                  selectedTime={selectedTime}
                  onSelectTime={handleTimeSelect}
                />
              </div>
            ))}

            <Button 
              className="w-full bg-indigo-900 hover:bg-indigo-800 text-white py-6"
              onClick={handleOtherTime}
            >
              Outro horário
            </Button>
          </div>
        </div>

        <div className="w-full md:w-80 lg:w-[320px]">
          <AgendaSummary 
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="text-center flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirmação</DialogTitle>
          </DialogHeader>
          {validationMessage && (
            <p className="text-red-500 text-sm mb-4">{validationMessage}</p>
          )}
          <p className="text-sm text-gray-600 mb-4">
            Ao clicar em confirmar, você <span className="font-semibold">declara</span> que estará disponível no dia e horário.
          </p>
          <DialogFooter className="flex flex-col gap-2 w-full items-center">
            <Button className="bg-indigo-900 hover:bg-indigo-800 text-white py-2 w-3/4" onClick={closeModal}>
              Confirmar
            </Button>
            <Button variant="outline" className="py-2 w-3/4" onClick={closeModal}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomTimeModalOpen} onOpenChange={setIsCustomTimeModalOpen}>
        <DialogContent className="text-center flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Selecione um horário personalizado</DialogTitle>
          </DialogHeader>
          {validationMessage && (
            <p className="text-red-500 text-sm mb-4">{validationMessage}</p>
          )}
          <input
            type="time"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="border rounded p-2 w-3/4 mb-4"
          />
          <DialogFooter className="flex flex-col gap-2 w-full items-center">
            <Button className="bg-indigo-900 hover:bg-indigo-800 text-white py-2 w-3/4" onClick={handleCustomTimeConfirm}>
              Confirmar
            </Button>
            <Button variant="outline" className="py-2 w-3/4" onClick={() => setIsCustomTimeModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisponibilizarHorario;