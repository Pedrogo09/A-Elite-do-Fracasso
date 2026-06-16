import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2 text-sm text-slate-200">
        {label ? (
          <label htmlFor={props.id || props.name} className="font-medium">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={props.id || props.name}
          className={`w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
          {...props}
        />
        {error ? <span className="text-sm text-rose-400">{error}</span> : null}
      </div>
    );
  }
);
Input.displayName = "Input";
