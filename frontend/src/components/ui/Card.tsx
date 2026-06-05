import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <div className={`rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/20 ${className}`}>{children}</div>;
}
