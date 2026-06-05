import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A password deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    try {
      await login(values.email, values.password);
      toast.success("Login bem-sucedido");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao iniciar sessão. Verifique as suas credenciais.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
        <h1 className="mb-3 text-3xl font-semibold text-white">Entrar</h1>
        <p className="mb-8 text-slate-400">Aceda ao seu painel de agendamento.</p>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "A carregar..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Ainda não tem conta?{' '}
          <Link to="/register" className="font-semibold text-brand hover:text-indigo-300">
            Registe-se
          </Link>
        </p>
      </div>
    </main>
  );
}
