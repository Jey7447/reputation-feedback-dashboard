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

  useEffect(() => {
    loadAlerts();
  }, []);

  const visible = filter === "all" ? alerts : alerts.filter((alert) => alert.alert_status === filter);

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Manager operations</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Manager Alerts</h1>
        <p className="mt-2 text-sm text-slate-500">Review escalated customer issues and move them through the alert lifecycle.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter === item ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
            {item}
          </button>
        ))}
      </div>

      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading alerts...</div>
        ) : visible.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No alerts match this filter.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((alert) => (
              <article key={alert.alert_id} className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-950">{alert.customer_name}</h2>
                      <span className="text-xs text-slate-400">{alert.job_reference}</span>
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{alert.alert_severity}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{alert.alert_status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{alert.location_name} · {alert.alert_type === "repeat_negative" ? "Repeat negative" : "High severity"}</p>
                    <p className="mt-4 max-w-3xl leading-7 text-slate-700">{alert.alert_reason}</p>
                  </div>
                  <AlertActions alertId={alert.alert_id} status={alert.alert_status} onChanged={loadAlerts} />
                </div>

                <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
                  <div><p className="text-xs text-slate-400">Overall rating</p><p className="mt-1 font-semibold text-slate-800">{alert.overall_rating}/5</p></div>
                  <div><p className="text-xs text-slate-400">Sentiment</p><p className="mt-1 font-semibold capitalize text-slate-800">{alert.sentiment ?? "—"}</p></div>
                  <div><p className="text-xs text-slate-400">Severity score</p><p className="mt-1 font-semibold text-slate-800">{alert.severity_score ?? "—"}</p></div>
                  <div><p className="text-xs text-slate-400">Created</p><p className="mt-1 font-semibold text-slate-800">{new Date(alert.alert_created_at).toLocaleString()}</p></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}