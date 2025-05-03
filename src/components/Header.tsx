import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useProfileImage } from "@/components/useProfileImage";

const Header = ({ nome = "Usuário", sobrenome = "", onLogout }: { nome?: string; sobrenome?: string; onLogout?: () => void }) => {
  const { theme = "light", setTheme = () => {} } = useTheme();
  const { profileImage } = useProfileImage();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white/80 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <img
          src={profileImage || "/image/perfilProfile.svg"}
          alt="Avatar"
          className="w-10 h-10 rounded-full border-2 border-[#ED4231] shadow hover:scale-105 transition-transform duration-200"
        />
        <span className="font-bold text-indigo-900">{nome} {sobrenome}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-800" />
          )}
        </button>
        <button
          className="bg-[#ED4231] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#c32d22] transition-colors"
          aria-label="Sair"
          onClick={onLogout}
        >
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
