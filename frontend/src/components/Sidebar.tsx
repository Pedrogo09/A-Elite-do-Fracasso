import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, Wrench, BarChart4 } from "lucide-react";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Utilizadores", icon: Users },
  { to: "/admin/appointments", label: "Marcações", icon: CalendarDays },
  { to: "/admin/services", label: "Serviços", icon: Wrench },
  { to: "/admin/stats", label: "Estatísticas", icon: BarChart4 },
];

export function Sidebar() {
  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-950 px-5 py-6 text-slate-200">
      <div className="mb-10">
        <div className="text-brand text-2xl font-bold">AgendaApp</div>
        <p className="text-sm text-slate-400">Painel de administração</p>
      </div>
      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-brand/10 text-brand" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
