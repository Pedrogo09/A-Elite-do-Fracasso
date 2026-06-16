import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "default";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand";
  const variants: Record<string, string> = {
    primary: "bg-brand text-white hover:bg-indigo-500",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    ghost: "bg-transparent text-slate-100 hover:bg-slate-800",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
    default: "bg-slate-700 text-slate-100 hover:bg-slate-600",
  };
  const cls = `${base} ${variants[variant] ?? variants.default} ${className}`;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
