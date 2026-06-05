import api from "./api";
import { Service } from "../types";

export async function listServices() {
  const response = await api.get<Service[]>("/services");
  return response.data;
}

export async function createService(payload: { name: string; description: string; duration_minutes: number; price: number; is_active: boolean }) {
  const response = await api.post<Service>("/services", payload);
  return response.data;
}

export async function updateService(serviceId: number, data: Partial<Service>) {
  const response = await api.put<Service>(`/services/${serviceId}`, data);
  return response.data;
}

export async function deleteService(serviceId: number) {
  const response = await api.delete(`/services/${serviceId}`);
  return response.data;
}
