import { useEffect, useMemo, useState } from "react";
import { getAppointmentsPerDay, getServicePopularity, getRevenuePerMonth } from "../../services/statsService";
import { DailyCount, MonthlyRevenue, ServicePopularity } from "../../types";
import { AppointmentsPerDayChart } from "../../components/charts/AppointmentsPerDayChart";
import { ServicePopularityChart } from "../../components/charts/ServicePopularityChart";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

const periodOptions = [7, 30, 90] as const;

export default function AdminStats() {
  const [period, setPeriod] = useState<typeof periodOptions[number]>(30);
  const [appointments, setAppointments] = useState<DailyCount[]>([]);
  const [services, setServices] = useState<ServicePopularity[]>([]);
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [appointmentsData, servicesData, revenueData] = await Promise.all([
          getAppointmentsPerDay(period),
          getServicePopularity(),
          getRevenuePerMonth(6),
        ]);
        setAppointments(appointmentsData);
        setServices(servicesData);
        setRevenue(revenueData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [period]);

  const csvData = useMemo(() => {
    const header = ["Serviço", "Marcações"];
    const rows = services.map((item) => [item.service_name, item.count.toString()]);
    return [header, ...rows].map((row) => row.join(",")).join("\n");
  }, [services]);

  function handleExport() {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "top-servicos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Estatísticas</h1>
          <p className="mt-2 text-slate-400">Análises profundas para o desempenho do seu negócio.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {periodOptions.map((option) => (
            <Button key={option} variant={option === period ? "primary" : "secondary"} onClick={() => setPeriod(option)}>
              Últimos {option} dias
            </Button>
          ))}
          <Button variant="ghost" onClick={handleExport}>
            Exportar CSV
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center"><Spinner /></div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <AppointmentsPerDayChart data={appointments} />
          </Card>
          <Card>
            <ServicePopularityChart data={services} />
          </Card>
          <Card>
            <RevenueChart data={revenue} />
          </Card>
          <Card>
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Top serviços mais agendados</h2>
              <div className="space-y-3 text-slate-300">
                {services.slice(0, 6).map((item) => (
                  <div key={item.service_name} className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <p>{item.service_name}</p>
                    <span className="text-sm text-slate-400">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
