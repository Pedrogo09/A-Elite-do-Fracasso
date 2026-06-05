import api from "./api";
import { User } from "../types";

export interface UserListParams {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
}

export async function listUsers(params: UserListParams) {
  const response = await api.get<User[]>("/users", { params });
  return response.data;
}

export async function updateUser(userId: number, data: Partial<User>) {
  const response = await api.put<User>(`/users/${userId}`, data);
  return response.data;
}

export async function deleteUser(userId: number) {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
}

export async function toggleUserActive(userId: number) {
  const response = await api.patch<User>(`/users/${userId}/toggle-active`);
  return response.data;
}
