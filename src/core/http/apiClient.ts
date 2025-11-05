import axios, { AxiosError } from 'axios';
import { getToken } from '@/core/auth/authStorage';

// Central axios instance
// Base URL now comes from environment variable (configure in .env as VITE_API_BASE_URL)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Token provider indirection (can be swapped in tests)
let tokenGetter: () => string | null = () => getToken();

export function configureTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

apiClient.interceptors.request.use(cfg => {
  const token = tokenGetter();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiClient.interceptors.response.use(r => r, (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Emitir evento global para que AuthProvider trate (evita redirect direto aqui)
    document.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
  return Promise.reject(error);
});

export type { AxiosError };
