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
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <p className="min-w-0 break-words text-sm font-medium text-slate-500">{label}</p>
        <span className={`max-w-full break-words rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
          {detail}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}