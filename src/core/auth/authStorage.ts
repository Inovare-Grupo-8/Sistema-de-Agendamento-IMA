const USER_DATA_KEY = 'userData';

export type StoredUser = {
  idUsuario: number;
  nome?: string;
  email?: string;
  tipo?: string;
  funcao?: string;
  token?: string;
};

export function getUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getUser()?.token ?? null;
}

export function setUser(user: StoredUser) {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(USER_DATA_KEY);
}

export { USER_DATA_KEY };
