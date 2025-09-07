// Composition root: instancia dependências e expõe serviços prontos à UI
// Durante a migração, importe daqui na UI para reduzir acoplamento.

// Exemplo de cliente HTTP simples (pode ser trocado por axios configurado)
export class HttpClient {
  constructor(private baseUrl: string) {}
  get<T = unknown>(url: string, init?: RequestInit) {
    return fetch(`${this.baseUrl}${url}`, { ...init, method: 'GET' }).then(r => r.json() as Promise<T>);
  }
  post<T = unknown>(url: string, body?: unknown, init?: RequestInit) {
    return fetch(`${this.baseUrl}${url}`, {
      ...init,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json() as Promise<T>);
  }
}

export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
};

export const http = new HttpClient(env.API_BASE_URL);

// Ponto para instanciar repositories/serviços e exportar para a UI:
import { AppointmentHttpRepository } from '@infrastructure/repositories/AppointmentHttpRepository';
import { AppointmentService } from '@application/services/AppointmentService';

const appointmentRepo = new AppointmentHttpRepository();
export const appointmentService = new AppointmentService(appointmentRepo);
