import { FormEvent, useEffect, useState } from "react";
import { Service } from "../../types";
import { listServices, createService, updateService, deleteService } from "../../services/serviceService";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "sonner";

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", duration_minutes: 30, price: 0, is_active: true });
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    listServices().then(setServices).finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setSelectedServiceId(null);
    setForm({ name: "", description: "", duration_minutes: 30, price: 0, is_active: true });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (selectedServiceId) {
        const updated = await updateService(selectedServiceId, form);
        setServices((prev) => prev.map((item) => (item.id === selectedServiceId ? updated : item)));
        toast.success("Serviço atualizado");
      } else {
        const created = await createService(form);
        setServices((prev) => [created, ...prev]);
        toast.success("Serviço criado");
      }
      resetForm();
    } catch {
      toast.error("Erro ao salvar serviço.");
    }
  }

  async function handleEdit(service: Service) {
    setSelectedServiceId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active,
    });
  }

  async function handleRemove(serviceId: number) {
    if (!window.confirm("Eliminar este serviço?")) return;
    try {
      await deleteService(serviceId);
      setServices((prev) => prev.filter((item) => item.id !== serviceId));
      toast.success("Serviço eliminado");
    } catch {
      toast.error("Erro ao eliminar serviço.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-3xl font-semibold text-white">Serviços</h1>
        <p className="mt-2 text-slate-400">Gerencie serviços, preços e disponibilidade.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">Serviços ativos</h2>
            <span className="text-sm text-slate-400">{services.length} itens</span>
          </div>
          {loading ? (
            <div className="py-12"><Spinner /></div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                      <p className="mt-2 text-slate-400">{service.description}</p>
                    </div>
                    <Badge variant={service.is_active ? "success" : "danger"}>
                      {service.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <span>Duração: {service.duration_minutes} min</span>
                    <span>Preço: €{service.price.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => handleEdit(service)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleRemove(service.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold text-white">{selectedServiceId ? "Editar serviço" : "Novo serviço"}</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Nome" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            <label className="block text-sm text-slate-200">
              Descrição
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="mt-2 h-24 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Duração (min)"
                type="number"
                value={form.duration_minutes}
                onChange={(event) => setForm((prev) => ({ ...prev, duration_minutes: Number(event.target.value) }))}
              />
              <Input
                label="Preço"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand focus:ring-brand"
              />
              <label htmlFor="is_active" className="text-sm text-slate-200">Serviço ativo</label>
            </div>
            <Button type="submit" className="w-full">
              {selectedServiceId ? "Atualizar serviço" : "Criar serviço"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
