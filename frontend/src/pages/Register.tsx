import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
import * as authService from "../services/authService";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A password deve ter pelo menos 6 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterForm) {
    try {
      await authService.register(values);
      toast.success("Conta criada com sucesso. Faça login.");
      navigate("/login");
    } catch (error: any) {
      console.log("Erro da API:", error.response?.data);
      const errorMsg = error.response?.data?.detail || "Erro ao registar conta. Verifique os dados.";
      toast.error(errorMsg);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#0a0a14] px-4 py-10 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-[float_18s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_reverse]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl border border-indigo-500/10 bg-white/[0.03] backdrop-blur-xl p-10 shadow-[0_20px_60px_-15px_rgba(99,91,255,0.25)]"
      >
        <h1 className="mb-3 text-3xl font-semibold text-white">Registar</h1>
        <p className="mb-8 text-slate-400">Crie uma conta para gerir as suas marcações.</p>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nome" type="text" icon={<User size={18} />} {...register("name")} error={errors.name?.message} />
          <Input label="Email" type="email" icon={<Mail size={18} />} {...register("email")} error={errors.email?.message} />
          <PasswordInput label="Password" icon={<Lock size={18} />} {...register("password")} error={errors.password?.message} />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="relative w-full overflow-hidden rounded-lg mt-6 py-3 font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 transition-shadow hover:shadow-indigo-500/40 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                A registar...
              </span>
            ) : (
              "Criar conta"
            )}
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-[shine_1.5s_ease-in-out]" />
          </motion.button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-brand hover:text-indigo-300">
            Entrar
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
