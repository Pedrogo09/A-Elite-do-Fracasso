import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../store/appointmentStore";
import { listServices } from "../services/serviceService";
import { createAppointment } from "../services/appointmentService";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { toast } from "sonner";
import { Service } from "../types";

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const selectedService = useAppointmentStore((state) => state.selectedService);
  const selectedDate = useAppointmentStore((state) => state.selectedDate);
  const selectedTime = useAppointmentStore((state) => state.selectedTime);
  const notes = useAppointmentStore((state) => state.notes);
  const setSelectedService = useAppointmentStore((state) => state.setSelectedService);
  const setSelectedDate = useAppointmentStore((state) => state.setSelectedDate);
  const setSelectedTime = useAppointmentStore((state) => state.setSelectedTime);
  const setNotes = useAppointmentStore((state) => state.setNotes);
  const reset = useAppointmentStore((state) => state.reset);

  useEffect(() => {
    setLoading(true);
    listServices()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  const isReady = selectedService && selectedDate && selectedTime;
  const dateValue = selectedDate || new Date().toISOString().split("T")[0];

  const summary = useMemo(() => {
    if (!selectedService) return null;
    return {
      service: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      total: selectedService.price.toFixed(2),
      notes,
    };
  }, [selectedService, selectedDate, selectedTime, notes]);

  async function handleSubmit() {
    if (!isReady || !selectedService) return;
    setSubmitting(true);
    try {
      await createAppointment({
        service_id: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        notes,
      });
      toast.success("Marcaçao criada com sucesso");
      reset();
      navigate("/my-appointments");
    } catch (error) {
      toast.error("Erro ao criar marcação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-3xl font-semibold text-white">Nova Marcação</h1>
          <p className="mt-2 text-slate-400">Selecione serviço, data e hora para confirmar a sua marcação.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Passo {step} de 3</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Escolha o serviço</h2>
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                <span className={step >= 1 ? "text-brand" : ""}>1</span>
                <span>{" > "}</span>
                <span className={step >= 2 ? "text-brand" : ""}>2</span>
                <span>{" > "}</span>
                <span className={step >= 3 ? "text-brand" : ""}>3</span>
              </div>
            </div>
            {loading ? (
              <div className="py-12"><Spinner /></div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className={`rounded-3xl border p-5 text-left transition ${
                      selectedService?.id === service.id
                        ? "border-brand bg-slate-900 shadow-lg shadow-brand/20"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                      <span className="text-sm text-slate-400">{service.duration_minutes} min</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{service.description}</p>
                    <p className="mt-4 text-lg font-semibold text-slate-100">€{service.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            )}

            {step >= 2 && (
              <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="mb-4 text-xl font-semibold text-slate-100">Passo 2: Escolher data e hora</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm text-slate-200">
                    Data
                    <input
                      type="date"
                      value={dateValue}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </label>
                  <label className="block text-sm text-slate-200">
                    Hora
                    <select
                      value={selectedTime}
                      onChange={(event) => setSelectedTime(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                      <option value="">Selecione uma hora</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-6 block text-sm text-slate-200">
                  Notas adicionais
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="mt-2 h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    placeholder="Deseja informar algo ao prestador de serviço?"
                  />
                </label>
              </div>
            )}
          </Card>
          <aside className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold text-white">Resumo da marcação</h3>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <p>Serviço: {summary?.service ?? "-"}</p>
                <p>Data: {summary?.date ?? "-"}</p>
                <p>Hora: {summary?.time ?? "-"}</p>
                <p>Preço: €{summary?.total ?? "-"}</p>
                <p>Notas: {summary?.notes || "Sem notas"}</p>
              </div>
              <Button
                disabled={!isReady || submitting}
                onClick={handleSubmit}
                className="mt-6 w-full"
              >
                {submitting ? "A confirmar..." : "Confirmar marcação"}
              </Button>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
