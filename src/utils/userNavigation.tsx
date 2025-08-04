import React from "react";
import { Home, Calendar, History, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

export interface UserNavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// URLs para os componentes principais de navegação
export const appUrls = {
  // Componentes voltados para profissionais
  professional: {
    home: "/home",
    agenda: "/agenda",
    historico: "/historico",
    disponibilizarHorario: "/disponibilizar-horario",
    profileForm: "/profile-form",
  },
  // Componentes voltados para pacientes
  user: {
    home: "/home-user",
    agenda: "/agenda-user",
    historico: "/historico-user",
    agendarConsulta: "/agendar-horario-user", // Verificar se este é o nome correto do arquivo
    profileForm: "/profile-form-user",
  },
  
  // Mensagens de assistência em português
  mensagens: {
    semResultados: "Nenhum resultado encontrado",
    carregando: "Carregando...",
    erro: "Ocorreu um erro. Tente novamente.",
    sucesso: "Operação realizada com sucesso!",
    confirmacao: "Tem certeza que deseja continuar?",
    voltar: "Voltar para a página inicial",
    ajuda: "Precisa de ajuda?",
    duvidas: "Entre em contato com o suporte",
    logout: "Deseja realmente sair do sistema?",
    paginaAtual: "Página atual",
  }
};

export const userNavigationItems: Record<string, UserNavigationItem> = {
  home: {
    path: appUrls.user.home,
    label: "Home",
    icon: <Home className="w-6 h-6" color="#ED4231" />,
  },
  agenda: {
    path: appUrls.user.agenda,
    label: "Minhas Consultas",
    icon: <Calendar className="w-6 h-6" color="#ED4231" />,
  },
  historico: {
    path: appUrls.user.historico,
    label: "Histórico",
    icon: <History className="w-6 h-6" color="#ED4231" />,
  },
  agendar: {
    path: appUrls.user.agendarConsulta,
    label: "Agendar Consulta",
    icon: <Clock className="w-6 h-6" color="#ED4231" />,
  },
  perfil: {
    path: appUrls.user.profileForm,
    label: "Editar Perfil",
    icon: <User className="w-6 h-6" color="#ED4231" />,
  },
};

export const professionalNavigationItems: Record<string, UserNavigationItem> = {
  home: {
    path: appUrls.professional.home,
    label: "Home",
    icon: <Home className="w-6 h-6" color="#ED4231" />,
  },
  agenda: {
    path: appUrls.professional.agenda,
    label: "Agenda",
    icon: <Calendar className="w-6 h-6" color="#ED4231" />,
  },
  historico: {
    path: appUrls.professional.historico,
    label: "Histórico",
    icon: <History className="w-6 h-6" color="#ED4231" />,
  },
  disponibilizar: {
    path: appUrls.professional.disponibilizarHorario,
    label: "Disponibilizar Horário",
    icon: <Clock className="w-6 h-6" color="#ED4231" />,
  },
  perfil: {
    path: appUrls.professional.profileForm,
    label: "Editar Perfil",
    icon: <User className="w-6 h-6" color="#ED4231" />,
  },
};

export const getUserNavigationPath = (currentPath: string) => {
  const currentNavItem = Object.values(userNavigationItems).find(
    (item) => item.path === currentPath
  );

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
      <Link
        to="/home-user"
        className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <Home className="h-3.5 w-3.5 text-[#ED4231]" />
      </Link>
      <span className="mx-1">/</span>
      <span className="text-gray-900 dark:text-gray-200 font-medium">
        {currentNavItem?.label || "Página atual"}
      </span>
    </div>
  );
};

export const renderUserSidebar = (location: { pathname: string }) => {
  return Object.values(userNavigationItems).map((item) => (
    <Link
      key={item.path}
      to={item.path}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${
        location.pathname === item.path
          ? "bg-[#EDF2FB] border-l-4 border-[#ED4231]"
          : ""
      }`}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  ));
};

// Helper function to check if a path belongs to professional routes
export const isProfessionalPath = (path: string): boolean => {
  return Object.values(appUrls.professional).includes(path);
};

// Helper function to check if a path belongs to user routes
export const isUserPath = (path: string): boolean => {
  return Object.values(appUrls.user).includes(path);
};

// Helper function to get the corresponding user path from a professional path
export const getUserPathFromProfessionalPath = (
  professionalPath: string
): string => {
  const pathKey = Object.entries(appUrls.professional).find(
    ([, path]) => path === professionalPath
  )?.[0];
  return pathKey
    ? appUrls.user[pathKey as keyof typeof appUrls.user]
    : appUrls.user.home;
};

// Helper function to get the corresponding professional path from a user path
export const getProfessionalPathFromUserPath = (userPath: string): string => {
  const pathKey = Object.entries(appUrls.user).find(
    ([, path]) => path === userPath
  )?.[0];
  return pathKey
    ? appUrls.professional[pathKey as keyof typeof appUrls.professional]
    : appUrls.professional.home;
};
