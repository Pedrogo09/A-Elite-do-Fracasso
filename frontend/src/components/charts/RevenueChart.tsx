import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MonthlyRevenue } from "../../types";

interface Props {
  data: MonthlyRevenue[];
}

export function RevenueChart({ data }: Props) {
  return (
    <div className="h-72 rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Receita por mês</h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
