import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../store/appointmentStore";
import { listServices } from "../services/serviceService";
import { createAppointment } from "../services/appointmentService";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { toast } from "sonner";
import { Service } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, CalendarOff } from "lucide-react";

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const steps = ["Serviço", "Data e Hora", "Confirmação"];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
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
      .catch(() => toast.error("Erro ao carregar serviços."))
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

  const changeStep = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const handleBack = () => {
    if (step > 1) {
      changeStep(step - 1);
    } else {
      navigate("/dashboard");
    }
  };

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

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Escolha o serviço</h2>
            <p className="text-slate-400 mt-1 text-sm">Selecione o tratamento ou serviço que deseja agendar.</p>
          </div>
          {loading ? (
            <div className="py-12"><Spinner /></div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center flex flex-col items-center justify-center">
              <CalendarOff size={48} className="text-slate-500 mb-4" />
              <p className="text-slate-400 text-lg font-medium">Nenhum serviço disponível</p>
              <p className="text-slate-500 text-sm mt-1">Por favor, tente novamente mais tarde.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <motion.button
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedService(service);
                    changeStep(2);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all
                    ${selectedService?.id === service.id
                      ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,91,255,0.2)]"
                      : "border-white/10 bg-white/[0.02] hover:border-indigo-500/40"}`}
                >
                  <p className="font-semibold text-white">{service.name}</p>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-indigo-400 font-medium">€{service.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{service.duration_minutes} min</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (step === 2) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Escolha a data e hora</h2>
            <p className="text-slate-400 mt-1 text-sm">Quando gostaria de nos visitar para {selectedService?.name}?</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-200">
              Data
              <input
                type="date"
                value={dateValue}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </label>
            <label className="block text-sm text-slate-200">
              Hora
              <select
                value={selectedTime}
                onChange={(event) => setSelectedTime(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
              className="mt-2 h-28 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="Deseja informar algo ao prestador de serviço?"
            />
          </label>
          <div className="pt-4 flex justify-end">
             <Button
                disabled={!selectedDate || !selectedTime}
                onClick={() => changeStep(3)}
              >
                Continuar
              </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
           <h2 className="text-2xl font-semibold text-white">Pronto a confirmar!</h2>
           <p className="text-slate-400 mt-1 text-sm">Reveja os detalhes no resumo lateral e confirme.</p>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
              <Check size={32} />
            </div>
            <div>
              <p className="text-white font-medium text-lg">Tudo certo?</p>
              <p className="text-slate-400 text-sm mt-1">Clique em Confirmar Marcação na barra lateral para finalizar.</p>
            </div>
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a14] px-4 py-10 sm:px-6 sm:py-16 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl animate-[float_18s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_reverse] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          
          {/* Main Wizard Card */}
          <div className="rounded-2xl border border-indigo-500/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(99,91,255,0.15)] flex flex-col">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-gray-400 hover:text-indigo-400 transition-colors text-sm w-fit mb-6"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>

            {/* Stepper */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300
                      ${i + 1 < step ? "bg-indigo-500 text-white" : i + 1 === step ? "bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400" : "bg-white/5 text-gray-500"}`}
                  >
                    {i + 1 < step ? <Check size={14} /> : i + 1}
                  </motion.div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 w-8 sm:w-12 transition-colors duration-300 ${i + 1 < step ? "bg-indigo-500" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Resume Card */}
          <aside>
            <div className="rounded-2xl border border-indigo-500/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(99,91,255,0.15)] sticky top-6">
              <h3 className="text-xl font-semibold text-white">Resumo da marcação</h3>
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-400">Serviço</span>
                  <span className="font-medium text-white text-right">{summary?.service ?? "-"}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-400">Data</span>
                  <span className="font-medium text-white">{summary?.date ?? "-"}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-400">Hora</span>
                  <span className="font-medium text-white">{summary?.time ?? "-"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Total</span>
                  <motion.span 
                    key={summary?.total}
                    initial={{ scale: 1.2, color: "#a855f7" }}
                    animate={{ scale: 1, color: "#818cf8" }}
                    className="text-xl font-semibold text-indigo-400"
                  >
                    €{summary?.total ?? "0.00"}
                  </motion.span>
                </div>
                {summary?.notes && (
                  <div className="pt-2">
                     <span className="text-slate-400 block mb-1">Notas:</span>
                     <p className="text-xs text-slate-300 bg-white/5 p-2 rounded-lg">{summary.notes}</p>
                  </div>
                )}
              </div>
              
              <motion.button
                whileHover={isReady && !submitting ? { scale: 1.02 } : {}}
                whileTap={isReady && !submitting ? { scale: 0.98 } : {}}
                disabled={!isReady || submitting}
                onClick={handleSubmit}
                className="relative w-full overflow-hidden rounded-lg mt-8 py-3 font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    A confirmar...
                  </span>
                ) : (
                  "Confirmar marcação"
                )}
                {/* Shine effect */}
                {isReady && !submitting && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-[shine_1.5s_ease-in-out]" />
                )}
              </motion.button>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
