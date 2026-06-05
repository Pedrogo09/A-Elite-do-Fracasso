import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="space-y-2 text-sm text-slate-200">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        className={`w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
        {...props}
      />
      {error ? <span className="text-sm text-rose-400">{error}</span> : null}
    </label>
  );
}
