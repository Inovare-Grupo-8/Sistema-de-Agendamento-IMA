import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DisponibilizarHorario from "./pages/DisponibilizarHorario";
import Agenda from "@/components/Agenda";
import AgendaUser from "@/components/AgendaUser";
import Home from "@/components/Home";
import HomeUser from "@/components/HomeUser";
import Historico from "@/components/Historico";
import HistoricoUser from "@/components/HistoricoUser";
import ProfileForm from "@/components/ProfileForm";
import ProfileFormUser from "@/components/ProfileFormUser";
import TelaLogin from "@/components/TelaLogin";
import { ProfileImageProvider } from "@/components/ProfileImageContext";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { UserNavigationProvider } from "@/contexts/UserNavigationContext";
import AgendarHorarioUser from "@/components/AgendarHorarioUser";
import { CompletarCadastroUsuarioAssistido } from "./components/CompletarCadastroUsuarioAssistido";
import AssistenteSocial from "@/components/AssistenteSocial";
import ProfileFormAssistenteSocial from "@/components/ProfileFormAssistenteSocial";
import CadastroVoluntario from "@/components/CadastroVoluntario";
import PagamentoUser from "@/components/PagamentoUser";
import { UserProvider } from "@/contexts/UserContext";
import { ProfessionalProvider } from "@/contexts/ProfessionalContext";
import { CompletarCadastroVoluntario } from "@/components/CompletarCadastroVoluntario";
import { ClassificacaoUsuarios } from "@/components/ClassificacaoUsuarios";
import CadastroAssistenteSocial from "@/components/CadastroAssistenteSocial";
import AuthGuard from "@/components/AuthGuard";

const queryClient = new QueryClient();

const App = () => {
  // Carrega o script VLibras apenas uma vez
  useEffect(() => {
    if (document.getElementById("vlibras-plugin-script")) return;
    setTimeout(() => {
      const script = document.createElement("script");
      script.id = "vlibras-plugin-script";
      script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
      script.async = true;
      script.onload = () => {
        // @ts-expect-error: VLibras is not typed in the global window object
        if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app');
      };
      document.body.appendChild(script);
    }, 500); // Pequeno delay para garantir que o DOM está pronto
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ProfileImageProvider>
            <UserProvider>
              <ProfessionalProvider>
                <Router>
                  <AuthGuard>
                    <UserNavigationProvider>
                      <Routes>
                        {/* Rotas públicas - acessíveis sem login */}
                        <Route path="/login" element={<TelaLogin />} />                      
                        <Route path="/cadastro" element={<TelaLogin />} />
                        <Route path="/completar-cadastro-usuario" element={<CompletarCadastroUsuarioAssistido />} />
                        <Route path="/completar-cadastro-voluntario" element={<CompletarCadastroVoluntario />} />
                      
                      {/* Rotas protegidas - exigem autenticação */}
                      {/* Rotas do usuário */}
                      <Route path="/home-user" element={<ProtectedRoute><HomeUser /></ProtectedRoute>} />
                      <Route path="/agenda-user" element={<ProtectedRoute><AgendaUser /></ProtectedRoute>} />
                      <Route path="/historico-user" element={<ProtectedRoute><HistoricoUser /></ProtectedRoute>} />
                      <Route path="/agendar-horario-user" element={<ProtectedRoute><AgendarHorarioUser /></ProtectedRoute>} />
                      <Route path="/profile-form-user" element={<ProtectedRoute><ProfileFormUser /></ProtectedRoute>} />
                      <Route path="/pagamento-user" element={<ProtectedRoute><PagamentoUser /></ProtectedRoute>} />

                      {/* Rotas do profissional */}
                      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                      <Route path="/disponibilizar-horario" element={<ProtectedRoute><DisponibilizarHorario /></ProtectedRoute>} />
                      <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
                      <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
                      <Route path="/profile-form" element={<ProtectedRoute><ProfileForm /></ProtectedRoute>} />                      

                      {/* Rotas da assistente social */}
                      <Route path="/assistente-social" element={<ProtectedRoute><AssistenteSocial /></ProtectedRoute>} />
                      <Route path="/profile-form-assistente-social" element={<ProtectedRoute><ProfileFormAssistenteSocial /></ProtectedRoute>} />
                      <Route path="/cadastro-assistente" element={<ProtectedRoute><CadastroAssistenteSocial /></ProtectedRoute>} />
                      <Route path="/cadastro-voluntario" element={<ProtectedRoute><CadastroVoluntario /></ProtectedRoute>} />
                      <Route path="/classificacao-usuarios" element={<ProtectedRoute><ClassificacaoUsuarios /></ProtectedRoute>} />                      {/* Redirecionamento para a home do usuário como fallback */}
                      <Route path="/" element={<ProtectedRoute><TelaLogin /></ProtectedRoute>} />
                      {/* Rota padrão para página não encontrada */}
                      <Route path="*" element={<NotFound />} />                      </Routes>
                    </UserNavigationProvider>
                  </AuthGuard>
                </Router>
              </ProfessionalProvider>
            </UserProvider>
          </ProfileImageProvider>
        </TooltipProvider>
        {/* Foco visual customizado global */}
        <style>{`
          :focus-visible {
            outline: 3px solid #ED4231 !important;
            outline-offset: 2px;
            box-shadow: 0 0 0 2px #fff, 0 0 0 4px #ED4231;
            transition: outline 0.2s, box-shadow 0.2s;
          }
        `}</style>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;