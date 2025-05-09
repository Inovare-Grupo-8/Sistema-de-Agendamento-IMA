import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DisponibilizarHorario from "./pages/DisponibilizarHorario";
import Agenda from "@/components/Agenda";
import ProfileForm from "@/components/ProfileForm";
import TelaLogin from "@/components/TelaLogin";
import { ProfileImageProvider } from "@/components/ProfileImageContext";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [vlibrasActive, setVlibrasActive] = useState(true);

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

  // Mostra/oculta o avatar VLibras via CSS
  useEffect(() => {
    const vlibrasEl = document.querySelector(".vw-access-button");
    if (vlibrasEl) {
      (vlibrasEl as HTMLElement).style.display = vlibrasActive ? "block" : "none";
    }
  }, [vlibrasActive]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ProfileImageProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<DisponibilizarHorario />} />
                <Route path="/disponibilizar-horario" element={<DisponibilizarHorario />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/profile-form" element={<ProfileForm />} />
                <Route path="/not-found" element={<NotFound />} />
                <Route path="/login" element={<TelaLogin />} />
                {/* Adicione outras rotas aqui */}
                {/* Rota padrão para página não encontrada */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ProfileImageProvider>
          {/* Botão de acessibilidade VLibras */}
          <button
            onClick={() => setVlibrasActive((prev) => !prev)}
            className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-[#1A1466] text-white shadow-lg hover:bg-[#23272F] focus:outline-none focus:ring-2 focus:ring-[#ED4231]"
            aria-label={vlibrasActive ? "Desativar VLibras" : "Ativar VLibras"}
            title={vlibrasActive ? "Desativar VLibras" : "Ativar VLibras"}
          >
            {vlibrasActive ? "VLibras: ON" : "VLibras: OFF"}
          </button>
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
