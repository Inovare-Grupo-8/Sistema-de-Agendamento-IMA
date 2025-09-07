import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUserNavigationPath } from "@/utils/userNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, Clock, Activity, TrendingUp, Eye, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { appointmentService } from "@composition/root";
import ErrorMessage from "./ErrorMessage";

interface ConsultasSummary {
  hoje: number;
  semana: number;
  mes: number;
}

const ConsultasUser = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estado para as estatísticas das consultas
  const [consultasSummary, setConsultasSummary] = useState<ConsultasSummary>({
    hoje: 0,
    semana: 0,
    mes: 0
  });

  // Carregar dados das consultas via API
  useEffect(() => {
    const loadConsultaStats = async () => {
      setLoading(true);
      setError("");
      
      try {
  // Buscar dados de consultas usando serviço de aplicação (composição)
  const consultaStats = await appointmentService.getStats('assistido');
        
        setConsultasSummary({
          hoje: consultaStats.hoje,
          semana: consultaStats.semana,
          mes: consultaStats.mes
        });
          } catch (err: unknown) {
        console.error('Erro ao carregar dados das consultas:', err);
        const message = typeof err === 'object' && err && 'message' in (err as Record<string, unknown>)
          ? String((err as { message?: unknown }).message)
          : 'Erro ao carregar dados das consultas';
        setError(message);
        
        // Manter dados zerados em caso de erro
        setConsultasSummary({
          hoje: 0,
          semana: 0,
          mes: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadConsultaStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pt-24 md:pt-10">
      {/* Add breadcrumb navigation at the top of the content */}
      {getUserNavigationPath(location.pathname)}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-2">
          Minhas Consultas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral completa das suas consultas e estatísticas
        </p>
      </div>

      {/* Error handling */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card Hoje */}
        <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Clock className="w-5 h-5 text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Consultas agendadas para hoje</p>
                </TooltipContent>
              </Tooltip>
              Hoje
            </CardTitle>
            <CardDescription>Consultas de hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {consultasSummary.hoje}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {consultasSummary.hoje === 1 ? 'consulta agendada' : 'consultas agendadas'}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Card Semana */}
        <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <CalendarIcon className="w-5 h-5 text-green-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Consultas agendadas para esta semana</p>
                </TooltipContent>
              </Tooltip>
              Esta Semana
            </CardTitle>
            <CardDescription>Consultas da semana atual</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {consultasSummary.semana}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {consultasSummary.semana === 1 ? 'consulta agendada' : 'consultas agendadas'}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Card Mês */}
        <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none transition-transform duration-300 hover:scale-[1.02] hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TrendingUp className="w-5 h-5 text-amber-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total de consultas agendadas para este mês</p>
                </TooltipContent>
              </Tooltip>
              Este Mês
            </CardTitle>
            <CardDescription>Consultas do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                  {consultasSummary.mes}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {consultasSummary.mes === 1 ? 'consulta agendada' : 'consultas agendadas'}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions Card */}
        <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#ED4231]" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>Acesse rapidamente as funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link 
              to="/agendar-consulta" 
              className="block w-full p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-300">Agendar Nova Consulta</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Reserve uma nova consulta</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/historico-user" 
              className="block w-full p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-300">Ver Histórico</h3>
                  <p className="text-sm text-green-700 dark:text-green-400">Consulte seu histórico completo</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Summary Information Card */}
        <Card className="bg-white dark:bg-[#23272F] border-[#EDF2FB] dark:border-[#444857] shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#ED4231]" />
              Resumo Geral
            </CardTitle>
            <CardDescription>Informações importantes sobre suas consultas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <span className="text-sm font-medium">Total geral:</span>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {consultasSummary.hoje + consultasSummary.semana + consultasSummary.mes} consultas
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>• Mantenha suas consultas organizadas</p>
                  <p>• Receba lembretes automáticos</p>
                  <p>• Acesse seu histórico a qualquer momento</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional content can be added here in the future */}
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          Desenvolvido com ❤️ para melhor gestão das suas consultas
        </p>
      </div>
    </div>
  );
};

export default ConsultasUser;
