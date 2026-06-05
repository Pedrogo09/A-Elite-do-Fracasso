import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
      <div className="mb-4 flex items-center justify-between text-slate-200"> 
        <span className="text-sm uppercase tracking-[0.25em] text-slate-400">{title}</span>
        <div className="text-brand">{icon}</div>
      </div>
      <div className="text-3xl font-semibold text-slate-100">{value}</div>
      <p className="mt-3 text-sm text-slate-400">{description}</p>
    </div>
  );
}
