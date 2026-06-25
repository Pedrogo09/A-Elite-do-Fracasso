import { InputHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <motion.div
        className="flex flex-col text-sm text-slate-200"
        animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <input
            ref={ref}
            id={props.id || props.name}
            placeholder={props.placeholder || " "}
            className={`peer w-full bg-[#0a0a14] border ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-lg ${icon ? 'pl-10' : 'pl-4'} pr-4 pt-5 pb-2 text-white focus:ring-2 transition-all duration-300 placeholder-transparent outline-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${className}`}
            {...props}
          />
          
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors peer-focus:text-indigo-400">
              {icon}
            </div>
          )}

          {label && (
            <label
              htmlFor={props.id || props.name}
              className={`absolute ${icon ? 'left-10' : 'left-4'} top-3.5 text-gray-400 text-sm transition-all duration-200 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs cursor-text`}
            >
              {label}
            </label>
          )}
        </div>
        
        {error && (
          <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </motion.div>
    );
  }
);
Input.displayName = "Input";
