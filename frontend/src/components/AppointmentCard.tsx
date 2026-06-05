import { Appointment } from "../types";
import { Badge } from "./ui/Badge";

const statusMap: Record<Appointment["status"], string> = {
  pending: "warning",
  confirmed: "info",
  cancelled: "danger",
  completed: "success",
};

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{appointment.service.name}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{appointment.user.name}</h3>
        </div>
        <Badge variant={statusMap[appointment.status]}>{appointment.status}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
        <span>Data: {appointment.date}</span>
        <span>Hora: {appointment.time}</span>
        <span>Preço: €{appointment.service.price.toFixed(2)}</span>
      </div>
      {appointment.notes ? <p className="mt-4 text-sm text-slate-300">Notas: {appointment.notes}</p> : null}
    </div>
  );
}
