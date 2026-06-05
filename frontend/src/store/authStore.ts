import { create } from "zustand";
import { User } from "../types";
import * as authService from "../services/authService";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshTokenAction: () => Promise<void>;
}

const storedUser = localStorage.getItem("agendaapp_user");
const storedAccessToken = localStorage.getItem("agendaapp_accessToken");
const storedRefreshToken = localStorage.getItem("agendaapp_refreshToken");

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
  isAuthenticated: Boolean(storedAccessToken),
  isAdmin: storedUser ? JSON.parse(storedUser).role === "admin" : false,
  login: async (email, password) => {
    const response = await authService.login({ email, password });
    localStorage.setItem("agendaapp_accessToken", response.access_token);
    localStorage.setItem("agendaapp_refreshToken", response.refresh_token);
    localStorage.setItem("agendaapp_user", JSON.stringify(response.user));
    set({
      user: response.user,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      isAuthenticated: true,
      isAdmin: response.user.role === "admin",
    });
  },
  logout: () => {
    authService.logout();
    localStorage.removeItem("agendaapp_accessToken");
    localStorage.removeItem("agendaapp_refreshToken");
    localStorage.removeItem("agendaapp_user");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },
  refreshTokenAction: async () => {
    const refreshToken = localStorage.getItem("agendaapp_refreshToken");
    if (!refreshToken) {
      throw new Error("Refresh token não encontrado");
    }
    const response = await authService.refreshToken({ refresh_token: refreshToken });
    localStorage.setItem("agendaapp_accessToken", response.access_token);
    localStorage.setItem("agendaapp_refreshToken", response.refresh_token);
    set({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      isAuthenticated: true,
      user: response.user,
      isAdmin: response.user.role === "admin",
    });
  },
}));
