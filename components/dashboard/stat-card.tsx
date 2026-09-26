type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "danger" | "success" | "warning";
};

const tones = {
  default: "bg-slate-50 text-slate-700",
  danger: "bg-red-50 text-red-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
};

export function StatCard({ label, value, detail, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
          {detail}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}