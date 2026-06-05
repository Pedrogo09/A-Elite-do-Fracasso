export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "client";
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  user: User;
  service: Service;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
}

export interface StatsOverview {
  total_users: number;
  total_appointments: number;
  total_revenue: number;
  appointments_today: number;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface ServicePopularity {
  service_name: string;
  count: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface AppointmentsByStatus {
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}
