import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


export default defineConfig(() => ({
  base: '/Sistema-de-Agendamento-IMA/',
  server: {
    host: "::",
    port: 3030,
    historyApiFallback: true,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));