import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, forwardRef } from "react";
import { Input, InputProps } from "./Input";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} {...props} ref={ref} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 transition-colors z-10"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={visible ? "visible" : "hidden"}
            initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
            transition={{ duration: 0.18 }}
            className="block"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
