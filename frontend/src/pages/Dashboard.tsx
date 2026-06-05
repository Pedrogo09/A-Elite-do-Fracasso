import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Appointment } from "../types";
import { Navbar } from "../components/Navbar";
import { AppointmentCard } from "../components/AppointmentCard";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getMyAppointments } from "../services/appointmentService";
import { Spinner } from "../components/ui/Spinner";

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMyAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter((appointment) => appointment.status !== "cancelled");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Bem-vindo ao seu painel</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Próximas marcações</h2>
              </div>
              <Link to="/book" className="inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
                Nova marcação
              </Link>
            </div>
            {loading ? (
              <div className="py-12"><Spinner /></div>
            ) : upcoming.length ? (
              <div className="grid gap-4">{upcoming.slice(0, 3).map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}</div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center text-slate-400">
                Não existem marcações próximas. Comece por reservar um serviço.
              </div>
            )}
          </Card>
          <Card>
            <h3 className="text-xl font-semibold text-slate-100">Histórico recente</h3>
            <div className="mt-6 space-y-4">
              {appointments.slice(0, 4).map((appointment) => (
                <div key={appointment.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <span>{appointment.service.name}</span>
                    <span>{appointment.date}</span>
                  </div>
                  <p className="mt-2 text-slate-400">Estado: {appointment.status}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
