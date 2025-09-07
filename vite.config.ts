import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


export default defineConfig(() => ({

  server: {
    host: "::",
    port: 3030,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
  "@": path.resolve(__dirname, "./src"),
  "@domain": path.resolve(__dirname, "./src/domain"),
  "@application": path.resolve(__dirname, "./src/application"),
  "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
  "@presentation": path.resolve(__dirname, "./src/presentation"),
  "@shared": path.resolve(__dirname, "./src/shared"),
  "@composition": path.resolve(__dirname, "./src/composition"),
    },
  },
}));