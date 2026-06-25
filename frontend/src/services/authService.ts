import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const client = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshPayload {
  refresh_token: string;
}

export async function login(payload: LoginPayload) {
  const response = await client.post("/auth/login", payload);
  return response.data;
}

export async function register(payload: { name: string; email: string; password: string }) {
  const response = await client.post("/auth/register", payload);
  return response.data;
}

export async function refreshToken(payload: RefreshPayload) {
  const response = await client.post("/auth/refresh", payload);
  return response.data;
}

export function logout() {
  localStorage.removeItem("agendaapp_accessToken");
  localStorage.removeItem("agendaapp_refreshToken");
  localStorage.removeItem("agendaapp_user");
}
