import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Sun, CloudMoon, Moon, Calendar as CalendarIcon, User, Clock, Menu } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import TimeSlotSection from "@/components/TimeSlotSection";
import AgendaSummary from "@/components/AgendaSummary";
import { toast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useProfileImage } from "@/components/ProfileImageContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import CustomTimeModal from "../components/CustomTimeModal";

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

  const { profileImage } = useProfileImage();

  // Estado para controlar a abertura/fechamento da sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("profileData");
    return savedData ? JSON.parse(savedData) : { nome: "", sobrenome: "" };
  });

  const location = useLocation();

  // Estado para controlar o estado de loading
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setTimeout(() => {
      saveToLocalStorage();
      setValidationMessage("");
      setIsModalOpen(false);
      setIsLoading(false);

      // Exibe notificação de sucesso
      toast({
        title: "Sucesso!",
        description: `Horário disponibilizado com sucesso: ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}`,
        variant: "default",
        duration: 4000,
      });
    }, 1200);
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
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row text-lg md:text-xl bg-[#EDF2FB]">
        {/* Botão de menu fora da sidebar quando fechada */}
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 shadow-md backdrop-blur-md">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </button>
            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
            <span className="font-bold text-indigo-900">{formData?.nome} {formData?.sobrenome}</span>
          </div>
        )}
        <div className={`transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
          bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden
          fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB]`
        }>
          {/* Botão de menu dentro da sidebar quando aberta (mobile/desktop) */}
          <div className="w-full flex justify-start mb-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src={profileImage} alt="Logo" className="w-16 h-16 rounded-full border-4 border-[#EDF2FB] shadow" />
            <span className="font-extrabold text-xl text-indigo-900 tracking-wide">{formData?.nome} {formData?.sobrenome}</span>
          </div>
          <SidebarMenu className="gap-4">
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/agenda' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to="/agenda" className="flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6" color="#ED4231" />
                      <span>Agenda</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent>
                  Veja sua agenda de atendimentos
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/disponibilizar-horario' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to="/disponibilizar-horario" className="flex items-center gap-3">
                      <Clock className="w-6 h-6" color="#ED4231" />
                      <span>Disponibilizar Horário</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent>
                  Disponibilize novos horários para atendimento
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${location.pathname === '/profile-form' ? 'bg-[#EDF2FB] border-l-4 border-[#ED4231]' : ''}`}>
                    <Link to="/profile-form" className="flex items-center gap-3">
                      <User className="w-6 h-6" color="#ED4231" />
                      <span>Editar Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent>
                  Edite seu perfil e foto
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
          {/* Loader de exemplo para feedback visual */}
          {!formData.nome && (
            <div className="p-4">
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          )}
          {/* Footer com links úteis */}
          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB]">
            <span>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</span>
            <div className="flex gap-2">
              <a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">Site</a>
              <a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a>
            </div>
          </div>
        </div>
        <div className={`flex-1 w-full md:w-auto mt-4 md:mt-0 transition-all duration-500 ease-in-out ${sidebarOpen ? '' : 'ml-0'}`}>
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/80 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200" />
              <span className="font-bold text-indigo-900 text-base md:text-lg">{formData?.nome} {formData?.sobrenome}</span>
            </div>
            <button className="bg-[#ED4231] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#c32d22] transition-colors" aria-label="Sair">Sair</button>
          </header>
          <div className="h-20" />
          <div className="max-w-5xl mx-auto w-full px-2 sm:px-4 md:px-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Disponibilizar horário</h1>
            <p className="text-gray-500 text-sm md:text-base mb-6 text-center">Escolha uma data e horário para disponibilizar</p>
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Coluna da esquerda: calendário e horários */}
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                <Card className="rounded-2xl shadow-lg p-0">
                  <CardHeader className="flex flex-row items-center justify-between py-3 bg-[#f8fafc] rounded-t-2xl">
                    <CardTitle className="text-base md:text-lg">
                      {selectedDate ? format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR }) : format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full flex justify-center items-center p-2 sm:p-4">
                      <div className="w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          showOutsideDays={true}
                          className="w-full min-h-[340px] sm:min-h-[380px] md:min-h-[420px] rounded-xl border border-[#EDF2FB] bg-white shadow-sm text-sm sm:text-base md:text-lg"
                          locale={ptBR}
                          aria-label="Calendário para selecionar data"
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  {periods.map(({ title, Icon, timeSlots }) => (
                    <div key={title} className="bg-white rounded-lg overflow-hidden">
                      <div className="flex items-center px-4 py-2 border-b">
                        <Icon color="#ED4231" className="w-5 h-5 mr-2" aria-label={`Ícone do período ${title}`} />
                        <span className="text-gray-600 font-semibold">{title}</span>
                      </div>
                      <TimeSlotSection 
                        title={title} 
                        timeSlots={timeSlots}
                        selectedTime={selectedTime}
                        onSelectTime={handleTimeSelect}
                        highlightColor={title === 'Manhã' ? 'bg-yellow-100' : title === 'Tarde' ? 'bg-blue-100' : 'bg-indigo-100'}
                        animateSelection
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Coluna da direita: resumo */}
              <div className="w-full lg:w-80 lg:max-w-xs flex-shrink-0 mt-6 lg:mt-0 flex flex-col gap-4">
                <AgendaSummary 
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  highlight={!!selectedDate && !!selectedTime}
                />
                <Button 
                  className={`w-full bg-indigo-900 hover:bg-indigo-800 text-white py-6 mt-2 transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleOtherTime}
                  aria-label="Selecionar outro horário"
                  disabled={isLoading}
                >
                  {isLoading ? 'Carregando...' : 'Outro horário'}
                </Button>
              </div>
            </div>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="text-center flex flex-col items-center">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Confirmação</DialogTitle>
              </DialogHeader>
              {validationMessage && (
                <p className="text-red-500 text-sm mb-4" role="alert">{validationMessage}</p>
              )}
              <p className="text-sm text-gray-600 mb-4">
                Ao clicar em confirmar, você <span className="font-semibold">declara</span> que estará disponível no dia e horário.
              </p>
              <DialogFooter className="flex flex-col gap-2 w-full items-center">
                <Button className="bg-indigo-900 hover:bg-indigo-800 text-white py-2 w-3/4" onClick={closeModal} aria-label="Confirmar seleção">
                  Confirmar
                </Button>
                <Button variant="outline" className="py-2 w-3/4" onClick={closeModal} aria-label="Cancelar seleção">
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de horário personalizado como componente separado */}
          <CustomTimeModal
            open={isCustomTimeModalOpen}
            onOpenChange={setIsCustomTimeModalOpen}
            customTime={customTime}
            setCustomTime={setCustomTime}
            validationMessage={validationMessage}
            onConfirm={handleCustomTimeConfirm}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DisponibilizarHorario;