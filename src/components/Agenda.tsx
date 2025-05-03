import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sun, CloudMoon, Moon, User, Clock, Menu } from "lucide-react";
import { useState } from "react";
import TimeSlot from "./TimeSlot";
import { useProfileImage } from "@/components/useProfileImage";

const Agenda = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState([
    { time: "09:00", name: "Ana Silva", type: "Psicologia", serviceType: "Atendimento Online", period: "Manhã" },
    { time: "10:30", name: "Carlos Souza", type: "Nutrição", serviceType: "Consulta Presencial", period: "Manhã" },
    { time: "14:00", name: "Beatriz Lima", type: "Fisioterapia", serviceType: "Atendimento Online", period: "Tarde" },
    { time: "15:30", name: "João Pedro", type: "Psicologia", serviceType: "Consulta Presencial", period: "Tarde" },
    { time: "19:00", name: "Mariana Costa", type: "Psicologia", serviceType: "Atendimento Online", period: "Noite" },
    { time: "20:30", name: "Rafael Almeida", type: "Nutrição", serviceType: "Consulta Presencial", period: "Noite" },
  ]);

  const { profileImage } = useProfileImage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("profileData");
    return savedData ? JSON.parse(savedData) : { nome: "", sobrenome: "" };
  });

  const location = useLocation();

  const handleCancelAppointment = (time: string) => {
    setAppointments((prevAppointments) =>
      prevAppointments.filter((appointment) => appointment.time !== time)
    );
  };

  const handleRescheduleAppointment = (time: string, newDate: Date, newTime: string) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment.time === time
          ? { ...appointment, time: newTime, period: getPeriod(newTime) }
          : appointment
      )
    );
  };

  const getPeriod = (time: string) => {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 12) return "Manhã";
    if (hour < 18) return "Tarde";
    return "Noite";
  };

  const periods = [
    { period: "Manhã", Icon: Sun, timeRange: "09h-12h" },
    { period: "Tarde", Icon: CloudMoon, timeRange: "12h-18h" },
    { period: "Noite", Icon: Moon, timeRange: "19h-21h" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row text-base md:text-lg bg-[#EDF2FB]">
        {/* Botão de menu fora da sidebar quando fechada */}
        {!sidebarOpen && (
          <div className="w-full flex justify-start items-center gap-3 p-4 fixed top-0 left-0 z-30 bg-white/80 shadow-md backdrop-blur-md">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full bg-[#ED4231] text-white focus:outline-none shadow-md">
              <Menu className="w-7 h-7" />
            </button>
            <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow" />
            <span className="font-bold text-indigo-900 text-sm md:text-lg">{formData?.nome} {formData?.sobrenome}</span>
          </div>
        )}
        <div className={`transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'opacity-100 translate-x-0 w-4/5 max-w-xs md:w-72' : 'opacity-0 -translate-x-full w-0'}
          bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] shadow-2xl rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-hidden
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
          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB]">
            <span>&copy; {new Date().getFullYear()} Desenvolvido por Inovare</span>
            <div className="flex gap-2">
              <a href="https://inovare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ED4231]">Site</a>
              <a href="mailto:contato@inovare.com" className="underline hover:text-[#ED4231]">Contato</a>
            </div>
          </div>
        </div>
        <div className={`flex-1 w-full md:w-auto mt-20 md:mt-0 transition-all duration-500 ease-in-out px-2 md:px-0 ${sidebarOpen ? '' : 'ml-0'}`}>
          <header className="w-full flex items-center justify-between px-6 py-4 bg-white/80 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <img src={profileImage} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200" />
              <span className="font-bold text-indigo-900">{formData?.nome} {formData?.sobrenome}</span>
            </div>
            <button className="bg-[#ED4231] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#c32d22] transition-colors" aria-label="Sair">Sair</button>
          </header>
          <div className="h-20" />
          <div className="max-w-5xl mx-auto p-2 md:p-6 bg-[#EDF2FB]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Sua agenda</h1>
                <p className="text-gray-500 text-xs md:text-sm">Consulte a quantidade de atendimentos que você tem hoje</p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[200px] justify-start text-left font-normal">
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

            {!formData.nome && (
              <div className="p-4">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            )}

            <div className="space-y-4">
              {periods.map(({ period, Icon, timeRange }) => (
                <div key={period} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center px-2 md:px-4 py-2 border-b gap-2 sm:gap-0">
                    <div className="flex items-center">
                      <Icon color="#ED4231" className="w-5 h-5 mr-2" />
                      <span className="text-gray-600 text-sm md:text-base">{period}</span>
                    </div>
                    <span className="text-gray-400 text-xs md:text-sm ml-0 sm:ml-auto">{timeRange}</span>
                  </div>
                  <div className="divide-y">
                    {appointments
                      .filter((apt) => apt.period === period)
                      .map((appointment, idx) => (
                        <TimeSlot
                          key={`${appointment.time}-${idx}`}
                          appointment={appointment}
                          onCancel={() => handleCancelAppointment(appointment.time)}
                          onReschedule={handleRescheduleAppointment}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Agenda;
