import { LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/Button";

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const initials = user?.name?.substring(0, 2).toUpperCase() || "UT";

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/10 bg-white/[0.03] backdrop-blur-xl px-6 py-5 shadow-[0_10px_30px_-10px_rgba(99,91,255,0.15)]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
          {initials}
        </div>
        <div>
          <p className="text-sm text-slate-400">Bem-vindo,</p>
          <h1 className="text-xl font-semibold text-white">{user?.name ?? "Utilizador"}</h1>
        </div>
      </div>
      <button 
        onClick={logout} 
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}
