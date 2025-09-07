import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

http.interceptors.response.use(
  (resp) => resp,
  (err) => {
    // Centralize aqui tratamento de erros, logs, refresh token, etc.
    return Promise.reject(err);
  }
);
