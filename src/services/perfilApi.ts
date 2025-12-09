import axios from "axios";
import { getBackendBaseUrl } from "@/lib/utils";

const API_BASE_URL = getBackendBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const userData = localStorage.getItem("userData");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try { localStorage.clear(); } catch {}
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const perfilApi = {
  async getDadosPessoaisVoluntario(usuarioId: number) {
    const resp = await api.get(`/perfil/voluntario/dados-pessoais`, { params: { usuarioId } });
    return resp.data;
  },
  async patchDadosPessoaisVoluntario(usuarioId: number, payload: { email?: string; telefone?: string }) {
    const resp = await api.patch(`/perfil/voluntario/dados-pessoais`, payload, { params: { usuarioId } });
    return resp.data;
  },
  async getDadosProfissionaisVoluntario(usuarioId: number) {
    const resp = await api.get(`/perfil/voluntario/dados-profissionais`, { params: { usuarioId } });
    return resp.data;
  },
  async patchDadosProfissionaisVoluntario(usuarioId: number, payload: { funcao: string; registroProfissional?: string; biografiaProfissional?: string; especialidade?: string; especialidades?: string[] }) {
    const body = { ...payload, especialidades: payload.especialidades ?? [] };
    const resp = await api.patch(`/perfil/voluntario/dados-profissionais`, body, { params: { usuarioId } });
    return resp.data;
  },
  async getEnderecoVoluntario(usuarioId: number) {
    const resp = await api.get(`/perfil/voluntario/endereco`, { params: { usuarioId } });
    return resp.data;
  },
  async putEnderecoVoluntario(usuarioId: number, payload: { cep: string; numero: string; complemento?: string }) {
    const resp = await api.put(`/perfil/voluntario/endereco`, payload, { params: { usuarioId } });
    return resp.data;
  },
  async uploadFotoVoluntario(usuarioId: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    const resp = await api.post(`/perfil/voluntario/foto`, form, {
      params: { usuarioId },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return resp.data;
  },
  async getAssistentePerfil() {
    const resp = await api.get(`/assistentes-sociais/perfil`);
    return resp.data;
  },
  async getDadosPessoaisAssistente(usuarioId: number) {
    const resp = await api.get(`/perfil/assistente-social/dados-pessoais`, { params: { usuarioId } });
    return resp.data;
  },
  async patchDadosPessoaisAssistente(usuarioId: number, payload: { email?: string; telefone?: string; nome?: string; sobrenome?: string; dataNascimento?: string; genero?: string }) {
    const resp = await api.patch(`/perfil/assistente-social/dados-pessoais`, payload, { params: { usuarioId } });
    return resp.data;
  },
  async patchDadosProfissionaisAssistente(usuarioId: number, payload: { crp?: string; especialidade?: string; bio?: string }) {
    const body = {
      funcao: "ASSISTENCIA_SOCIAL",
      registroProfissional: payload.crp ?? "",
      biografiaProfissional: payload.bio ?? "",
      especialidade: payload.especialidade ?? "",
      especialidades: [],
    };
    const resp = await api.patch(`/perfil/assistente-social/dados-profissionais`, body, { params: { usuarioId } });
    return resp.data;
  },
  async getEnderecoAssistente(usuarioId: number) {
    const resp = await api.get(`/perfil/assistente-social/endereco`, { params: { usuarioId } });
    return resp.data;
  },
  async putEnderecoAssistente(usuarioId: number, payload: { cep: string; numero: string; complemento?: string }) {
    const resp = await api.put(`/perfil/assistente-social/endereco`, payload, { params: { usuarioId } });
    return resp.data;
  },
  async uploadFotoAssistente(usuarioId: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    const resp = await api.post(`/perfil/assistente-social/foto`, form, { params: { usuarioId }, headers: { "Content-Type": "multipart/form-data" } });
    return resp.data;
  },
};

export default perfilApi;
