import { AlertPreview } from "@/components/dashboard/alert-preview";
import { StatCard } from "@/components/dashboard/stat-card";

const alerts = [
  {
    customer: "Sarah Wilson",
    job: "JOB-1008",
    type: "High severity",
    severity: "High",
    status: "Resolved",
  },
  {
    customer: "John Doe",
    job: "JOB-1007",
    type: "Repeat negative",
    severity: "High",
    status: "Pending",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Operations dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Reputation overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor customer sentiment, AI routing, response review, and manager escalations across locations.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Automation active
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total feedback" value="8" detail="All time" />
        <StatCard label="Positive" value="1" detail="12.5%" tone="success" />
        <StatCard label="Negative" value="6" detail="75%" tone="danger" />
        <StatCard label="Human review" value="1" detail="Needs review" tone="warning" />
        <StatCard label="Manager alerts" value="1" detail="Pending" tone="danger" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-950">Sentiment overview</h2>
            <p className="mt-1 text-sm text-slate-500">Current feedback distribution.</p>
          </div>

          <div className="space-y-5">
            {[
              ["Positive", 12.5, "bg-emerald-500"],
              ["Neutral", 12.5, "bg-slate-400"],
              ["Negative", 75, "bg-red-500"],
            ].map(([label, value, color]) => (
              <div key={label as string}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{label as string}</span>
                  <span className="text-slate-500">{value as number}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${color as string}`}
                    style={{ width: `${value as number}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Routing status</h2>
          <p className="mt-1 text-sm text-slate-500">Where feedback currently sits.</p>

          <div className="mt-6 space-y-3">
            {[
              ["Ready to post", "1", "bg-emerald-50 text-emerald-700"],
              ["Private queue", "4", "bg-slate-100 text-slate-700"],
              ["Manager escalated", "2", "bg-red-50 text-red-700"],
              ["Human review", "1", "bg-amber-50 text-amber-700"],
            ].map(([label, value, classes]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <AlertPreview alerts={alerts} />
      </section>
    </div>
  );
}