import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Appointment } from "../types";
import { Navbar } from "../components/Navbar";
import { AppointmentCard } from "../components/AppointmentCard";
import { getMyAppointments } from "../services/appointmentService";
import { Spinner } from "../components/ui/Spinner";
import { CalendarOff, History } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMyAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter((appointment) => appointment.status !== "cancelled" && appointment.status !== "completed");
  const history = appointments.filter((appointment) => appointment.status === "cancelled" || appointment.status === "completed").slice(0, 4);

  return (
    <main className="relative min-h-screen bg-[#0a0a14] px-4 py-8 sm:px-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-[float_18s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] animate-[float_15s_ease-in-out_infinite_reverse] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl z-10">
        <Navbar />
        
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-indigo-500/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(99,91,255,0.15)] flex flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-white">Próximas marcações</h2>
                <p className="text-sm text-slate-400 mt-1">Os seus agendamentos confirmados ou pendentes.</p>
              </div>
              <Link to="/book" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95">
                Nova marcação
              </Link>
            </div>
            
            {loading ? (
              <div className="py-20 flex justify-center"><Spinner /></div>
            ) : upcoming.length ? (
              <div className="grid gap-4 flex-1 content-start">
                {upcoming.slice(0, 3).map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
                {upcoming.length > 3 && (
                  <Link to="/my-appointments" className="text-center text-sm text-indigo-400 hover:text-indigo-300 py-2">
                    Ver todas as marcações ({upcoming.length})
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex-1 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 flex flex-col items-center justify-center text-center">
                <CalendarOff size={48} className="text-slate-500 mb-4" />
                <p className="text-white text-lg font-medium">Sem marcações próximas</p>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">Ainda não agendou nenhum serviço connosco. Comece por fazer a sua primeira reserva!</p>
                <Link to="/book" className="mt-6 inline-flex rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                  Fazer primeira marcação
                </Link>
              </div>
            )}
          </div>
          
          <div className="rounded-2xl border border-indigo-500/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(99,91,255,0.15)] flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-6">Histórico recente</h3>
            
            {loading ? (
              <div className="py-12 flex justify-center"><Spinner /></div>
            ) : history.length ? (
              <div className="relative pl-3 space-y-6 flex-1 border-l-2 border-white/5">
                {history.map((appointment, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={appointment.id} 
                    className="relative pl-6"
                  >
                    {/* Timeline dot */}
                    <span className="absolute left-[-31px] top-1.5 h-3 w-3 rounded-full bg-indigo-500 border-2 border-[#0a0a14]" />
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                         <span className="text-white font-medium">{appointment.service.name}</span>
                         <span className="text-xs text-slate-500">{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                         <span className={appointment.status === 'completed' ? 'text-blue-400' : 'text-red-400'}>
                            {appointment.status === 'completed' ? 'Concluída' : 'Cancelada'}
                         </span>
                         <span className="text-slate-500">&bull; €{appointment.service.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-70">
                 <History size={40} className="text-slate-600 mb-3" />
                 <p className="text-slate-400 font-medium">Ainda sem histórico</p>
                 <p className="text-slate-500 text-sm mt-1">Os seus serviços anteriores aparecerão aqui.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
