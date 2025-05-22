import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Calendar, Clock, Users, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

export function DashboardInsights() {
  // Dados simulados
  const stats = {
    consultasRealizadas: 128,
    consultasCanceladas: 12,
    taxaComparecimento: 91.4,
    mediaConsultasDiarias: 8.5,
    totalPacientes: 75,
    novosPacientes: 12,
    tendencia: {
      crescimento: 15.3,
      direcao: 'up' as const
    },
    comparacaoMesAnterior: {
      consultasRealizadas: 8.2,
      cancelamentos: -3.5,
      novosPacientes: 22.1
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Insights do Mês</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Consultas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.consultasRealizadas}</div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                <span className={`text-xs font-medium ${stats.comparacaoMesAnterior.consultasRealizadas > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.comparacaoMesAnterior.consultasRealizadas > 0 ? '+' : ''}
                  {stats.comparacaoMesAnterior.consultasRealizadas}%
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">vs. mês anterior</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Taxa de Comparecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.taxaComparecimento}%</div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                <span className={`text-xs font-medium ${stats.comparacaoMesAnterior.cancelamentos < 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.comparacaoMesAnterior.cancelamentos < 0 ? '+' : ''}
                  {Math.abs(stats.comparacaoMesAnterior.cancelamentos)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.consultasCanceladas} cancelamentos
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalPacientes}</div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-xs font-medium text-green-500">
                  +{stats.novosPacientes} novos
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Crescimento de {stats.comparacaoMesAnterior.novosPacientes}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tendência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {stats.tendencia.direcao === 'up' ? '+' : '-'}{stats.tendencia.crescimento}%
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-gray-500 mr-1" />
                <span className={`text-xs font-medium ${stats.tendencia.direcao === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.tendencia.direcao === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Media de {stats.mediaConsultasDiarias} consultas/dia
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Outras visualizações podem ser adicionadas aqui */}
    </div>
  );
}
