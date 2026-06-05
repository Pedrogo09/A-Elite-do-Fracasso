import axios, { AxiosError } from "axios";
import { refreshToken as refreshTokenService } from "./authService";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agendaapp_accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;
      const refreshToken = localStorage.getItem("agendaapp_refreshToken");
      if (refreshToken) {
        try {
          const response = await refreshTokenService({ refresh_token: refreshToken });
          localStorage.setItem("agendaapp_accessToken", response.access_token);
          localStorage.setItem("agendaapp_refreshToken", response.refresh_token);
          useAuthStore.setState({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            user: response.user,
            isAdmin: response.user.role === "admin",
          });
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
          }
          return api(originalRequest);
        } catch (_err) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      }
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
