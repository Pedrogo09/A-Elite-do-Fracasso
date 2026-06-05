import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  component: ReactElement;
}

export default function ProtectedRoute({ component }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? component : <Navigate to="/login" replace />;
}
