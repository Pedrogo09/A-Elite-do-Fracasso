import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variants: Record<string, string> = {
  default: "bg-slate-800 text-slate-200",
  success: "bg-emerald-500/15 text-emerald-300",
  warning: "bg-amber-500/15 text-amber-300",
  danger: "bg-rose-500/15 text-rose-300",
  info: "bg-sky-500/15 text-sky-300",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}>{children}</span>;
}
