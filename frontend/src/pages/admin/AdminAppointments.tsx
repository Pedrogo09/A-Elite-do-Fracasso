import { useEffect, useState } from "react";
import { Appointment, Service } from "../../types";
import { listAppointments, cancelAppointment, updateAppointmentStatus } from "../../services/appointmentService";
import { listServices } from "../../services/serviceService";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "sonner";

const statusOptions = ["all", "pending", "confirmed", "cancelled", "completed"] as const;

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState<typeof statusOptions[number]>("all");
  const [serviceId, setServiceId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([listAppointments({ status: status !== "all" ? status : undefined, service_id: serviceId || undefined }), listServices()])
      .then(([appointmentsData, servicesData]) => {
        setAppointments(appointmentsData);
        setServices(servicesData);
      })
      .finally(() => setLoading(false));
  }, [status, serviceId]);

  async function handleCancel(id: number) {
    setActionId(id);
    try {
      const appointment = await cancelAppointment(id);
      setAppointments((prev) => prev.map((item) => (item.id === id ? appointment : item)));
      toast.success("Marcaçao cancelada");
    } catch {
      toast.error("Erro ao cancelar marcação.");
    } finally {
      setActionId(null);
    }
  }

  async function handleUpdateStatus(id: number, newStatus: string) {
    setActionId(id);
    try {
      const appointment = await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) => prev.map((item) => (item.id === id ? appointment : item)));
      toast.success("Estado atualizado");
    } catch {
      toast.error("Erro ao atualizar estado.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-3xl font-semibold text-white">Marcações</h1>
        <p className="mt-2 text-slate-400">Filtre e gerencie as marcações da clínica.</p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof statusOptions[number])}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value ? Number(event.target.value) : "")}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="">Todos os serviços</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="py-12"><Spinner /></div>
          ) : appointments.length ? (
            appointments.map((appointment) => (
              <div key={appointment.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{appointment.user.name}</h3>
                    <p className="text-slate-400">{appointment.service.name}</p>
                  </div>
                  <Badge variant={appointment.status === "cancelled" ? "danger" : appointment.status === "confirmed" ? "info" : appointment.status === "completed" ? "success" : "warning"}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-300">
                  <span>Data: {appointment.date}</span>
                  <span>Hora: {appointment.time}</span>
                  <span>Serviço: {appointment.service.name}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <select
                    value={appointment.status}
                    onChange={(event) => handleUpdateStatus(appointment.id, event.target.value)}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="cancelled">cancelled</option>
                    <option value="completed">completed</option>
                  </select>
                  <Button variant="secondary" disabled={actionId === appointment.id} onClick={() => handleCancel(appointment.id)}>
                    {actionId === appointment.id ? "A cancelar..." : "Cancelar"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-10 text-center text-slate-400">
              Nenhuma marcação encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
