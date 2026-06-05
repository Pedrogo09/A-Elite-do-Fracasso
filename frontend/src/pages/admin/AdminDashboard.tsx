import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { StatsCard } from "../../components/StatsCard";
import { AppointmentsPerDayChart } from "../../components/charts/AppointmentsPerDayChart";
import { ServicePopularityChart } from "../../components/charts/ServicePopularityChart";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { getAppointmentsByStatus, getAppointmentsPerDay, getOverview, getRevenuePerMonth, getServicePopularity } from "../../services/statsService";
import { DailyCount, MonthlyRevenue, ServicePopularity } from "../../types";
import { Spinner } from "../../components/ui/Spinner";

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#38bdf8",
  cancelled: "#f97316",
  completed: "#34d399",
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState({ total_users: 0, total_appointments: 0, total_revenue: 0, appointments_today: 0 });
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<DailyCount[]>([]);
  const [servicePopularity, setServicePopularity] = useState<ServicePopularity[]>([]);
  const [revenuePerMonth, setRevenuePerMonth] = useState<MonthlyRevenue[]>([]);
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [overviewData, appointmentsData, serviceData, revenueData, statusData] = await Promise.all([
          getOverview(),
          getAppointmentsPerDay(30),
          getServicePopularity(),
          getRevenuePerMonth(6),
          getAppointmentsByStatus(),
        ]);
        setOverview(overviewData);
        setAppointmentsPerDay(appointmentsData);
        setServicePopularity(serviceData);
        setRevenuePerMonth(revenueData);
        setStatusData(Object.entries(statusData).map(([name, value]) => ({ name, value } as { name: string; value: number })),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-4">
        <StatsCard title="Utilizadores" value={overview.total_users} description="Total de utilizadores registados" icon="👥" />
        <StatsCard title="Marcações Hoje" value={overview.appointments_today} description="Atendimentos confirmados para hoje" icon="📅" />
        <StatsCard title="Marcações Mês" value={overview.total_appointments} description="Marcações nos últimos 30 dias" icon="🗓️" />
        <StatsCard title="Receita" value={`€${overview.total_revenue.toFixed(2)}`} description="Receita estimada" icon="💰" />
      </div>
      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center"><Spinner /></div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="grid gap-6">
            <AppointmentsPerDayChart data={appointmentsPerDay} />
            <ServicePopularityChart data={servicePopularity} />
          </div>
          <div className="grid gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Marcações por status</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} fill="#6366f1" label />
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name] ?? "#6366f1"} />
                  ))}
                  <Tooltip />
                  <Legend payload={statusData.map((entry) => ({ id: entry.name, type: "square", value: `${entry.name} (${entry.value})`, color: statusColors[entry.name] ?? "#6366f1" }))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <RevenueChart data={revenuePerMonth} />
          </div>
        </div>
      )}
    </div>
  );
}
