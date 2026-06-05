import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";

export default function AdminLayout() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
