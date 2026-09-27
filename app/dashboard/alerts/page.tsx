"use client";

import { useEffect, useState } from "react";
import { AlertActions } from "@/components/dashboard/alert-actions";

type Alert = {
  alert_id: string;
  feedback_id: string;
  alert_type: string;
  alert_severity: string;
  alert_status: string;
  alert_reason: string;
  customer_name: string;
  job_reference: string;
  location_name: string;
  overall_rating: number;
  sentiment: string | null;
  feedback_severity: string | null;
  severity_score: number | null;
  routing_status: string;
  response_review_status: string | null;
  alert_created_at: string;
};

const filters = ["all", "pending", "acknowledged", "resolved"] as const;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlerts() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/alerts");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load alerts.");
      setAlerts(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load alerts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAlerts(); }, []);

  const visible = filter === "all" ? alerts : alerts.filter((alert) => alert.alert_status === filter);

  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden p-3 sm:p-5 md:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">Manager operations</p>
        <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Manager Alerts</h1>
        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-500">Review escalated customer issues and move them through the alert lifecycle.</p>
      </div>

      <div className="mb-5 flex max-w-full flex-wrap gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold capitalize sm:px-4 ${filter === item ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
            {item}
          </button>
        ))}
      </div>

      {error && <div className="mb-5 max-w-full break-words rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</div>}

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-5 text-sm text-slate-500 sm:p-8">Loading alerts...</div>
        ) : visible.length === 0 ? (
          <div className="p-5 text-sm text-slate-500 sm:p-8">No alerts match this filter.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((alert) => (
              <article key={alert.alert_id} className="min-w-0 p-4 sm:p-6">
                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h2 className="max-w-full break-words font-semibold text-slate-950">{alert.customer_name}</h2>
                      <span className="max-w-full break-all text-xs text-slate-400">{alert.job_reference}</span>
                      <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{alert.alert_severity}</span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{alert.alert_status}</span>
                    </div>
                    <p className="mt-2 break-words text-sm text-slate-500">{alert.location_name} · {alert.alert_type === "repeat_negative" ? "Repeat negative" : "High severity"}</p>
                    <p className="mt-4 max-w-3xl break-words text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">{alert.alert_reason}</p>
                  </div>
                  <div className="w-full shrink-0 lg:w-auto">
                    <AlertActions alertId={alert.alert_id} status={alert.alert_status} onChanged={loadAlerts} />
                  </div>
                </div>

                <div className="mt-5 grid min-w-0 grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4 sm:gap-3">
                  <div className="min-w-0"><p className="text-xs text-slate-400">Overall rating</p><p className="mt-1 break-words font-semibold text-slate-800">{alert.overall_rating}/5</p></div>
                  <div className="min-w-0"><p className="text-xs text-slate-400">Sentiment</p><p className="mt-1 break-words font-semibold capitalize text-slate-800">{alert.sentiment ?? "—"}</p></div>
                  <div className="min-w-0"><p className="text-xs text-slate-400">Severity score</p><p className="mt-1 break-words font-semibold text-slate-800">{alert.severity_score ?? "—"}</p></div>
                  <div className="min-w-0"><p className="text-xs text-slate-400">Created</p><p className="mt-1 break-words font-semibold text-slate-800">{new Date(alert.alert_created_at).toLocaleString()}</p></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}