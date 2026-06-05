import api from "./api";
import { StatsOverview, DailyCount, ServicePopularity, MonthlyRevenue, AppointmentsByStatus } from "../types";

export async function getOverview() {
  const response = await api.get<StatsOverview>("/stats/overview");
  return response.data;
}

export async function getAppointmentsPerDay(days = 30) {
  const response = await api.get<DailyCount[]>("/stats/appointments-per-day", { params: { days } });
  return response.data;
}

export async function getServicePopularity() {
  const response = await api.get<ServicePopularity[]>("/stats/service-popularity");
  return response.data;
}

export async function getRevenuePerMonth(months = 6) {
  const response = await api.get<MonthlyRevenue[]>("/stats/revenue-per-month", { params: { months } });
  return response.data;
}

export async function getAppointmentsByStatus() {
  const response = await api.get<AppointmentsByStatus>("/stats/appointments-by-status");
  return response.data;
}
