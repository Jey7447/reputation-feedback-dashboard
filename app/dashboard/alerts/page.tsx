"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertActions } from "@/components/dashboard/alert-actions";
import { LocationIcon } from "@/components/dashboard/location-icon";

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
  pending: "bg-red-50 text-red-700 border-red-100",
  acknowledged: "bg-amber-50 text-amber-700 border-amber-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
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

  const locations = useMemo(
    () => Array.from(new Set(alerts.map((alert) => alert.location_name))).filter(Boolean).sort(),
    [alerts],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = alerts.filter((alert) => {
      const matchesQuery = !q || [alert.customer_name, alert.job_reference, alert.location_name, alert.alert_reason, alert.comments]
        .some((value) => value?.toLowerCase().includes(q));
      return (
        matchesQuery &&
        (filter === "all" || alert.alert_status === filter) &&
        (location === "all" || alert.location_name === location) &&
        (type === "all" || alert.alert_type === type) &&
        (severity === "all" || alert.alert_severity === severity)
      );
    });

    return [...rows].sort((a, b) => {
      if (sort === "severity") return (b.severity_score ?? -1) - (a.severity_score ?? -1);
      if (sort === "oldest") return new Date(a.alert_created_at).getTime() - new Date(b.alert_created_at).getTime();
      return new Date(b.alert_created_at).getTime() - new Date(a.alert_created_at).getTime();
    });
  }, [alerts, filter, location, type, severity, query, sort]);

  const actedCount = alerts.filter((alert) => alert.alert_status !== "pending").length;
  const actionedShare = alerts.length ? Math.round((actedCount / alerts.length) * 100) : 0;

  const reset = () => {
    setFilter("all");
    setLocation("all");
    setType("all");
    setSeverity("all");
    setQuery("");
    setSort("newest");
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden p-3 sm:p-5 md:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">Manager operations</p>
        <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Manager Alerts</h1>
        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-500">
          Track escalations from open to acknowledged to resolved, with branch, severity, and customer context in one place.
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

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,180px))]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer, job, branch, or alert reason..." className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="all">All branches</option>
            {locations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="all">All alert types</option>
            <option value="high_severity">High severity</option>
            <option value="repeat_negative">Repeat negative</option>
          </select>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="all">All severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="severity">Highest severity score</option>
          </select>
          <button onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Reset filters</button>
        </div>
      </section>

      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <LifecycleCard label="Open" value={counts.pending} detail="Needs manager action" tone="red" />
        <LifecycleCard label="Acknowledged" value={counts.acknowledged} detail="Manager has seen it" tone="amber" />
        <LifecycleCard label="Resolved" value={counts.resolved} detail="Action completed" tone="green" />
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">Showing {visible.length} of {alerts.length} alerts</p>
          <p className="mt-1 text-xs text-slate-400">{actionedShare}% of all alerts have been acknowledged or resolved.</p>
        </div>
        <button onClick={loadAlerts} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading alerts...</div>
        ) : visible.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No alerts match the current filters.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((alert) => (
              <article key={alert.alert_id} className="min-w-0 p-4 sm:p-6">
                <div className="flex min-w-0 flex-col gap-5">
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[alert.alert_status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {alert.alert_status === "pending" ? "OPEN" : alert.alert_status.toUpperCase()}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${alert.alert_severity === "high" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{alert.alert_severity} severity</span>
                        <h2 className="max-w-full break-words font-semibold text-slate-950">{alert.customer_name}</h2>
                        <span className="max-w-full break-all text-xs text-slate-400">{alert.job_reference}</span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                          <LocationIcon location={alert.location_name} className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{alert.location_name}</p>
                          <p className="text-xs text-slate-400">{alert.alert_type === "repeat_negative" ? "Repeat negative" : "High severity"} · {new Date(alert.alert_created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full shrink-0 lg:w-auto"><AlertActions alertId={alert.alert_id} status={alert.alert_status} onChanged={loadAlerts} /></div>
                  </div>

                  <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
                    <Info label="Overall rating" value={`${alert.overall_rating}/5`} />
                    <Info label="Sentiment" value={alert.sentiment ?? "—"} />
                    <Info label="Severity score" value={alert.severity_score === null ? "—" : `${alert.severity_score}/100`} />
                    <Info label="Response" value={alert.response_review_status?.replaceAll("_", " ") ?? "No response"} />
                  </div>

                  <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                    <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Why this alert exists</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-700">{alert.alert_reason}</p>
                    </section>
                    <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Customer feedback</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-700">{alert.comments || "No written customer comment."}</p>
                      {alert.feedback_category && <p className="mt-3 text-xs text-slate-400">Category: {alert.feedback_category}</p>}
                    </section>
                  </div>

                  {alert.response_draft && (
                    <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Generated response draft</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-700">{alert.response_draft}</p>
                      <p className="mt-3 text-xs text-slate-500">Review status: {alert.response_review_status?.replaceAll("_", " ") ?? "pending review"}</p>
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

function LifecycleCard({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: "red" | "amber" | "green" }) {
  const styles = { red: "bg-red-50 text-red-700 border-red-100", amber: "bg-amber-50 text-amber-700 border-amber-100", green: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-bold uppercase tracking-wider">{label}</p><p className="mt-1 text-3xl font-black">{value}</p><p className="mt-1 text-xs opacity-80">{detail}</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 break-words font-semibold capitalize text-slate-800">{value}</p></div>;
}
