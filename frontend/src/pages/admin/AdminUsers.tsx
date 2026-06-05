import { FormEvent, useEffect, useMemo, useState } from "react";
import { User } from "../../types";
import { listUsers, deleteUser, toggleUserActive } from "../../services/userService";
import * as authService from "../../services/authService";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "sonner";

const roleOptions = ["all", "admin", "client"] as const;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<typeof roleOptions[number]>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const queryParams = useMemo(() => {
    return {
      page,
      size: 10,
      search: search || undefined,
      role: role !== "all" ? role : undefined,
    };
  }, [page, role, search]);

  useEffect(() => {
    setLoading(true);
    listUsers(queryParams)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [queryParams]);

  async function handleToggle(userId: number) {
    try {
      const updated = await toggleUserActive(userId);
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      toast.success("Estado atualizado");
    } catch {
      toast.error("Não foi possível atualizar o estado.");
    }
  }

  async function handleDelete(userId: number) {
    if (!window.confirm("Eliminar este utilizador?")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("Utilizador eliminado");
    } catch {
      toast.error("Erro ao eliminar utilizador.");
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      toast.success("Utilizador criado com sucesso");
      setForm({ name: "", email: "", password: "", phone: "" });
      listUsers(queryParams).then(setUsers);
    } catch {
      toast.error("Erro ao criar utilizador.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Utilizadores</h1>
            <p className="mt-2 text-slate-400">Gestão completa de utilizadores com filtros e ações.</p>
          </div>
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-[1fr_1fr]">
            <Input
              label="Nome"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <Input
              label="Telefone"
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <Button type="submit" className="sm:col-span-2">
              Criar utilizador
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Input label="Pesquisar" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as typeof roleOptions[number])}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-slate-400">Página {page}</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-4 text-left">Nome</th>
                <th className="px-4 py-4 text-left">Email</th>
                <th className="px-4 py-4 text-left">Telefone</th>
                <th className="px-4 py-4 text-left">Role</th>
                <th className="px-4 py-4 text-left">Estado</th>
                <th className="px-4 py-4 text-left">Registo</th>
                <th className="px-4 py-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center"><Spinner /></td></tr>
              ) : users.length ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">{user.name}</td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">{user.phone ?? "-"}</td>
                    <td className="px-4 py-4"><Badge variant={user.role === "admin" ? "info" : "default"}>{user.role}</Badge></td>
                    <td className="px-4 py-4"><Badge variant={user.is_active ? "success" : "danger"}>{user.is_active ? "Ativo" : "Inativo"}</Badge></td>
                    <td className="px-4 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4 space-x-2">
                      <Button variant="secondary" onClick={() => handleToggle(user.id)}>
                        {user.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(user.id)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Nenhum utilizador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
