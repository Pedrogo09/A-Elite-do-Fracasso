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
    <div className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-indigo-400 font-medium">{appointment.service.name}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{appointment.user.name}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold
          ${appointment.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
            appointment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
            appointment.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
            'bg-red-500/10 text-red-400 border border-red-500/20'}`}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
        <span className="flex items-center gap-1.5"><span className="text-slate-500">Data:</span> {appointment.date}</span>
        <span className="flex items-center gap-1.5"><span className="text-slate-500">Hora:</span> {appointment.time}</span>
        <span className="flex items-center gap-1.5"><span className="text-slate-500">Preço:</span> €{appointment.service.price.toFixed(2)}</span>
      </div>
      {appointment.notes && (
        <div className="mt-4 bg-white/5 p-3 rounded-lg">
           <p className="text-xs text-slate-400 leading-relaxed"><span className="font-medium text-slate-300">Notas:</span> {appointment.notes}</p>
        </div>
      )}
    </div>
  );
}
