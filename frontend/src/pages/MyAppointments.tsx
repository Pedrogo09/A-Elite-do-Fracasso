import { useEffect, useMemo, useState } from "react";
import { Appointment } from "../types";
import { getMyAppointments, cancelAppointment } from "../services/appointmentService";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { toast } from "sonner";

const statusOptions = ["all", "pending", "confirmed", "cancelled", "completed"] as const;

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<typeof statusOptions[number]>("all");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (selectedStatus === "all") return appointments;
    return appointments.filter((item) => item.status === selectedStatus);
  }, [appointments, selectedStatus]);

  useEffect(() => {
    setLoading(true);
    getMyAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: number) {
    setActionId(id);
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.map((item) => (item.id === id ? { ...item, status: "cancelled" } : item)));
      toast.success("Marcaçao cancelada");
    } catch (error) {
      toast.error("Não foi possível cancelar. Tente novamente.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-3xl font-semibold text-white">As minhas marcações</h1>
          <p className="mt-2 text-slate-400">Gerencie as suas marcações e cancele as que ainda não estão concluídas.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">Filtrar por estado:</label>
              <select
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as typeof statusOptions[number])}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-slate-400">Total: {filtered.length} marcações</p>
          </div>
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="py-12"><Spinner /></div>
            ) : filtered.length ? (
              filtered.map((appointment) => (
                <div key={appointment.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{appointment.service.name}</h2>
                      <p className="mt-2 text-slate-400">Cliente: {appointment.user.name}</p>
                    </div>
                    <Badge variant={appointment.status === "cancelled" ? "danger" : appointment.status === "confirmed" ? "info" : appointment.status === "completed" ? "success" : "warning"}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-300">
                    <span>Data: {appointment.date}</span>
                    <span>Hora: {appointment.time}</span>
                    <span>Preço: €{appointment.service.price.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {appointment.status === "pending" || appointment.status === "confirmed" ? (
                      <Button
                        variant="secondary"
                        disabled={actionId === appointment.id}
                        onClick={() => handleCancel(appointment.id)}
                      >
                        {actionId === appointment.id ? "A cancelar..." : "Cancelar marcação"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-10 text-center text-slate-400">
                Não existem marcações para mostrar.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
