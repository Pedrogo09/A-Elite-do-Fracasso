import { LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/Button";

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-5 shadow-lg shadow-slate-950/20">
      <div>
        <p className="text-sm text-slate-400">Bem-vindo,</p>
        <h1 className="text-2xl font-semibold text-slate-100">{user?.name ?? "Utilizador"}</h1>
      </div>
      <Button variant="secondary" onClick={logout} className="inline-flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}
