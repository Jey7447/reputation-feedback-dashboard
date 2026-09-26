import { AlertPreview } from "@/components/dashboard/alert-preview";
import { StatCard } from "@/components/dashboard/stat-card";
import { getDashboardAlerts } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let alerts = [];
  let dataError = "";

  try {
    alerts = await getDashboardAlerts();
  } catch (error) {
    dataError = error instanceof Error ? error.message : "Unable to load dashboard data.";
  }

  const pendingAlerts = alerts.filter((alert) => alert.alert_status === "pending").length;

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
          {dataError ? "Database setup required" : "Database connected"}
        </div>
      </header>

      {dataError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Database connection:</strong> {dataError}
          <p className="mt-1 text-red-600">
            Add the Supabase values from .env.example to your local environment.
          </p>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Manager alerts" value={String(alerts.length)} detail="All alerts" />
        <StatCard label="Pending alerts" value={String(pendingAlerts)} detail="Needs action" tone="danger" />
        <StatCard label="High severity" value={String(alerts.filter((a) => a.alert_severity === "high").length)} detail="Alerts" tone="warning" />
        <StatCard label="Repeat negative" value={String(alerts.filter((a) => a.alert_type === "repeat_negative").length)} detail="Escalations" tone="danger" />
        <StatCard label="Resolved" value={String(alerts.filter((a) => a.alert_status === "resolved").length)} detail="Completed" tone="success" />
      </section>

      <section className="mt-6">
        <AlertPreview
          alerts={alerts.slice(0, 5).map((alert) => ({
            customer: alert.customer_name,
            job: alert.job_reference,
            type: alert.alert_type === "repeat_negative" ? "Repeat negative" : "High severity",
            severity: alert.alert_severity,
            status: alert.alert_status,
          }))}
        />
      </section>
    </div>
  );
}