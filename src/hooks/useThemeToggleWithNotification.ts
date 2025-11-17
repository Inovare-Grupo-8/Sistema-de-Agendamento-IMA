import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/components/ui/sonner-toast";
import React from "react";

/**
 * Hook para alternar entre temas com notificação.
 * Fornece uma função que alterna o tema e mostra uma notificação de confirmação.
 */
export function useThemeToggleWithNotification() {
  const { theme = "light", setTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast(
      `Tema alterado para ${newTheme === "dark" ? "escuro" : "claro"}`,
      {
        icon: newTheme === "dark"
          ? React.createElement(Moon, { className: "w-5 h-5" })
          : React.createElement(Sun, { className: "w-5 h-5" }),
        className: "bg-card text-card-foreground",
        position: "top-center",
        duration: 2000
      }
    );
  }, [theme, setTheme]);

  return {
    theme,
    toggleTheme
  };
}
