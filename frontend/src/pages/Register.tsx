import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import * as authService from "../services/authService";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A password deve ter pelo menos 6 caracteres"),
  phone: z.string().optional(),
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
    } catch (error) {
      toast.error("Erro ao registar conta. Verifique os dados.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="mb-3 text-3xl font-semibold text-white">Registar</h1>
        <p className="mb-8 text-slate-400">Crie uma conta para gerir as suas marcações.</p>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nome" type="text" {...register("name")} error={errors.name?.message} />
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
          <Input label="Telefone" type="tel" {...register("phone")} error={errors.phone?.message} />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "A registar..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-brand hover:text-indigo-300">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
