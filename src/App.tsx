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
import { ProfileImageProvider } from "@/components/ProfileImageContext";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProfileImageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
