"use client";

import { useEffect, useMemo, useState } from "react";
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
  comments: string | null;
  feedback_category: string | null;
  response_draft: string | null;
};

const filters = ["all", "pending", "acknowledged", "resolved"] as const;

const statusStyles: Record<string, string> = {
  pending: "bg-red-50 text-red-700",
  acknowledged: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

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

  const counts = useMemo(() => ({
    all: alerts.length,
    pending: alerts.filter((alert) => alert.alert_status === "pending").length,
    acknowledged: alerts.filter((alert) => alert.alert_status === "acknowledged").length,
    resolved: alerts.filter((alert) => alert.alert_status === "resolved").length,
  }), [alerts]);

  const visible = filter === "all"
    ? alerts
    : alerts.filter((alert) => alert.alert_status === filter);

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden p-3 sm:p-5 md:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">Manager operations</p>
        <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Manager Alerts</h1>
        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-500">
          Review escalated customer issues, understand the underlying feedback, and move alerts through the lifecycle.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["pending", "acknowledged", "resolved", "all"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`min-w-0 rounded-2xl border p-4 text-left shadow-sm transition sm:p-5 ${filter === status ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${filter === status ? "text-slate-300" : "text-slate-400"}`}>
              {status === "all" ? "All alerts" : status}
            </p>
            <p className="mt-1 text-2xl font-bold">{counts[status]}</p>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 max-w-full break-words rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          Showing {visible.length} {filter === "all" ? "" : filter} alert{visible.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={loadAlerts}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-5 text-sm text-slate-500 sm:p-8">Loading alerts...</div>
        ) : visible.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 sm:p-8">No alerts match this filter.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((alert) => (
              <article key={alert.alert_id} className="min-w-0 p-4 sm:p-6">
                <div className="flex min-w-0 flex-col gap-5">
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="max-w-full break-words font-semibold text-slate-950">{alert.customer_name}</h2>
                        <span className="max-w-full break-all text-xs text-slate-400">{alert.job_reference}</span>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${alert.alert_severity === "high" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                          {alert.alert_severity}
                        </span>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[alert.alert_status] ?? "bg-slate-100 text-slate-600"}`}>
                          {alert.alert_status}
                        </span>
                      </div>
                      <p className="mt-2 break-words text-sm text-slate-500">
                        {alert.location_name} · {alert.alert_type === "repeat_negative" ? "Repeat negative" : "High severity"}
                      </p>
                    </div>

                    <div className="w-full shrink-0 lg:w-auto">
                      <AlertActions alertId={alert.alert_id} status={alert.alert_status} onChanged={loadAlerts} />
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Overall rating</p>
                      <p className="mt-1 font-semibold text-slate-800">{alert.overall_rating}/5</p>
                    </div>
                    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Sentiment</p>
                      <p className="mt-1 break-words font-semibold capitalize text-slate-800">{alert.sentiment ?? "—"}</p>
                    </div>
                    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Severity score</p>
                      <p className="mt-1 font-semibold text-slate-800">{alert.severity_score ?? "—"}/100</p>
                    </div>
                    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Created</p>
                      <p className="mt-1 break-words font-semibold text-slate-800">{new Date(alert.alert_created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                    <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Why this alert exists</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-700">{alert.alert_reason}</p>
                    </section>

                    <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Customer feedback</p>
                      <p className="mt-2 break-words [overflow-wrap:anywhere] text-sm leading-6 text-slate-700">
                        {alert.comments || "No written customer comment."}
                      </p>
                      {alert.feedback_category && (
                        <p className="mt-3 break-words text-xs text-slate-400">Category: {alert.feedback_category}</p>
                      )}
                    </section>
                  </div>

                  {alert.response_draft && (
                    <section className="min-w-0 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Generated response draft</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-700">{alert.response_draft}</p>
                      <p className="mt-3 text-xs text-slate-500">
                        Review status: {alert.response_review_status?.replaceAll("_", " ") ?? "pending review"}
                      </p>
                    </section>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}