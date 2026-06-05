import api from "./api";
import { Appointment } from "../types";

export async function getMyAppointments() {
  const response = await api.get<Appointment[]>("/appointments/my");
  return response.data;
}

export async function createAppointment(payload: { service_id: number; date: string; time: string; notes?: string }) {
  const response = await api.post<Appointment>("/appointments", payload);
  return response.data;
}

export async function cancelAppointment(appointmentId: number) {
  const response = await api.delete<Appointment>(`/appointments/${appointmentId}/cancel`);
  return response.data;
}

export async function listAppointments(params: Record<string, unknown>) {
  const response = await api.get<Appointment[]>("/appointments", { params });
  return response.data;
}

export async function updateAppointmentStatus(appointmentId: number, status: string) {
  const response = await api.patch<Appointment>(`/appointments/${appointmentId}/status`, { status });
  return response.data;
}
