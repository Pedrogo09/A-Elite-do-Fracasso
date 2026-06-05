import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface AdminRouteProps {
  component: ReactElement;
}

export default function AdminRoute({ component }: AdminRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return component;
}
