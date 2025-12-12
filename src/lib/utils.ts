import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidTime(time: string): boolean {
  return /^([01]?\d|2[0-3]):([0-5]\d)$/.test(time);
}

export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado.";
}

const BACKEND_URL_REGEX = /^https?:\/\//i;

const normalizeBase = (base: string): string => {
  if (!base) {
    return "";
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const normalizePath = (path: string): string => {
  if (!path) {
    return "";
  }
  return path.startsWith("/") ? path : `/${path}`;
};

export function getBackendBaseUrl(): string {
  const rawEnv =
    typeof import.meta.env.VITE_URL_BACKEND !== "undefined"
      ? String(import.meta.env.VITE_URL_BACKEND)
      : "";
  const envTrim = rawEnv.trim();
  const isInvalid = !envTrim || envTrim === "undefined" || envTrim === "null";
  const rawBase = isInvalid ? "/api" : envTrim;
  return normalizeBase(rawBase);
}

export function buildBackendUrl(path: string | null | undefined): string {
  if (!path) {
    return getBackendBaseUrl();
  }

  if (BACKEND_URL_REGEX.test(path)) {
    return path;
  }

  const base = getBackendBaseUrl();
  const normalizedPath = normalizePath(path);
  return `${base}${normalizedPath}`;
}

const normalizeString = (value: string | null | undefined): string =>
  (value ?? "").toString().trim();

export function resolvePerfilSegment(
  tipoUsuario?: string | null,
  funcao?: string | null
): string {
  const tipo = normalizeString(tipoUsuario).toLowerCase();
  const func = normalizeString(funcao).toUpperCase();

  if (tipo === "administrador") {
    return "administrador";
  }

  if (tipo === "voluntario" || tipo === "voluntário") {
    if (func === "ASSISTENCIA_SOCIAL" || func === "ASSISTÊNCIA_SOCIAL") {
      return "assistente-social";
    }
    return "voluntario";
  }

  if (tipo === "assistente_social" || tipo === "assistente-social") {
    return "assistente-social";
  }

  // Tipos associados ao usuário assistido
  if (
    tipo === "assistido" ||
    tipo === "usuario" ||
    tipo === "usuário" ||
    tipo === "valor_social" ||
    tipo === "valor-social" ||
    tipo === "gratuidade"
  ) {
    return "assistido";
  }

  // Fallback seguro
  return "assistido";
}

export function resolvePerfilPath(
  tipoUsuario?: string | null,
  funcao?: string | null,
  suffix: string = "dados-pessoais"
): string {
  const segment = resolvePerfilSegment(tipoUsuario, funcao);
  return `/perfil/${segment}/${suffix}`;
}

export async function parseJsonSafe(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Resposta não é JSON (status ${
        response.status
      }). Conteúdo inicial: ${text.slice(0, 200)}`
    );
  }
  return response.json();
}
