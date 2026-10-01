"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LocationIcon } from "@/components/dashboard/location-icon";

type FeedbackRow = {
  id: string;
  overall_rating: number;
  sentiment: string | null;
  sentiment_score: number | null;
  severity: string | null;
  routing_status: string;
  comments: string | null;
  submitted_at: string | null;
  location_name: string;
};

type ResponseRow = {
  id: string;
  feedback_id: string;
  review_status: string;
};

type AlertRow = {
  alert_id: string;
  feedback_id: string;
  alert_type: string;
  alert_severity: string;
  alert_status: string;
  customer_name: string;
  job_reference: string;
  location_name: string;
};

type Props = {
  feedback: FeedbackRow[];
  responses: ResponseRow[];
  alerts: AlertRow[];
};

const routingLabels: Record<string, string> = {
  ready_to_post: "Ready to post",
  private_queue: "Private queue",
  manager_escalated: "Manager escalated",
  human_review: "Human review",
  processing: "Processing",
  pending_analysis: "Pending analysis",
};

const routingTone: Record<string, string> = {
  ready_to_post: "bg-emerald-50 text-emerald-700",
  private_queue: "bg-amber-50 text-amber-700",
  manager_escalated: "bg-red-50 text-red-700",
  human_review: "bg-blue-50 text-blue-700",
  processing: "bg-slate-100 text-slate-700",
  pending_analysis: "bg-slate-100 text-slate-600",
};

export function OverviewDashboard({ feedback, responses, alerts }: Props) {
  const locations = useMemo(
    () => ["All locations", ...Array.from(new Set(feedback.map((item) => item.location_name))).filter(Boolean).sort()],
    [feedback],
  );
  const [location, setLocation] = useState("All locations");

  const filteredFeedback = useMemo(
    () => location === "All locations" ? feedback : feedback.filter((item) => item.location_name === location),
    [feedback, location],
  );

  const filteredIds = useMemo(() => new Set(filteredFeedback.map((item) => item.id)), [filteredFeedback]);
  const filteredResponses = useMemo(
    () => responses.filter((item) => filteredIds.has(item.feedback_id)),
    [responses, filteredIds],
  );
  const filteredAlerts = useMemo(
    () => location === "All locations" ? alerts : alerts.filter((item) => item.location_name === location),
    [alerts, location],
  );

  const total = filteredFeedback.length;
  const positive = filteredFeedback.filter((item) => item.sentiment === "positive").length;
  const neutral = filteredFeedback.filter((item) => item.sentiment === "neutral").length;
  const negative = filteredFeedback.filter((item) => item.sentiment === "negative").length;
  const ready = filteredFeedback.filter((item) => item.routing_status === "ready_to_post").length;
  const privateQueue = filteredFeedback.filter((item) => item.routing_status === "private_queue").length;
  const escalated = filteredFeedback.filter((item) => item.routing_status === "manager_escalated").length;
  const pendingResponses = filteredResponses.filter((item) => item.review_status === "pending_review").length;
  const approvedResponses = filteredResponses.filter((item) => item.review_status === "approved").length;
  const sentResponses = filteredResponses.filter((item) => item.review_status === "sent").length;
  const openAlerts = filteredAlerts.filter((item) => item.alert_status === "pending").length;
  const actedAlerts = filteredAlerts.filter((item) => item.alert_status !== "pending").length;
  const avgSentiment = filteredFeedback.filter((item) => item.sentiment_score !== null).length
    ? Math.round(filteredFeedback.filter((item) => item.sentiment_score !== null).reduce((sum, item) => sum + (item.sentiment_score ?? 0), 0) / filteredFeedback.filter((item) => item.sentiment_score !== null).length)
    : null;
  const avgRating = total ? (filteredFeedback.reduce((sum, item) => sum + item.overall_rating, 0) / total).toFixed(1) : "—";

  const maxSentiment = Math.max(1, positive, neutral, negative);
  const maxRouting = Math.max(1, ready, privateQueue, escalated);
  const branchRows = useMemo(() => {
    const names = Array.from(new Set(feedback.map((item) => item.location_name))).filter(Boolean).sort();
    return names.map((name) => {
      const rows = feedback.filter((item) => item.location_name === name);
      const branchPositive = rows.filter((item) => item.sentiment === "positive").length;
      const branchNegative = rows.filter((item) => item.sentiment === "negative").length;
      const branchReady = rows.filter((item) => item.routing_status === "ready_to_post").length;
      const branchPrivate = rows.filter((item) => item.routing_status === "private_queue").length;
      const branchEscalated = rows.filter((item) => item.routing_status === "manager_escalated").length;
      const scoreRows = rows.filter((item) => item.sentiment_score !== null);
      return {
        name,
        total: rows.length,
        positive: branchPositive,
        negative: branchNegative,
        ready: branchReady,
        privateQueue: branchPrivate,
        escalated: branchEscalated,
        avgScore: scoreRows.length ? Math.round(scoreRows.reduce((sum, item) => sum + (item.sentiment_score ?? 0), 0) / scoreRows.length) : null,
      };
    });
  }, [feedback]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">144 Auto Repair</p>
          <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">Reputation Command Center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            A live operating view of customer sentiment, routing, response work, and branch-level reputation.
          </p>
        </div>
        <div className="w-full lg:w-64">
          <label htmlFor="overview-location" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Branch view</label>
          <select
            id="overview-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-white outline-none focus:border-white"
          >
            {locations.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Feedback received" value={total} detail="All submissions" />
        <Metric label="Average rating" value={avgRating} detail="Out of 5" />
        <Metric label="Sentiment score" value={avgSentiment === null ? "—" : avgSentiment} detail="AI score / 100" />
        <Metric label="Open alerts" value={openAlerts} detail="Manager action" danger={openAlerts > 0} />
        <Metric label="Pending responses" value={pendingResponses} detail="Human review" warning={pendingResponses > 0} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Sentiment at a glance" subtitle={location === "All locations" ? "All branches combined" : location}>
          <BarRow label="Positive" value={positive} max={maxSentiment} tone="bg-emerald-500" />
          <BarRow label="Neutral" value={neutral} max={maxSentiment} tone="bg-slate-400" />
          <BarRow label="Negative" value={negative} max={maxSentiment} tone="bg-red-500" />
          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniStat label="Positive" value={positive} />
            <MiniStat label="Neutral" value={neutral} />
            <MiniStat label="Negative" value={negative} />
          </div>
        </Panel>

        <Panel title="Routing pipeline" subtitle="Where analyzed feedback ended up">
          <BarRow label="Ready to post" value={ready} max={maxRouting} tone="bg-emerald-500" />
          <BarRow label="Private queue" value={privateQueue} max={maxRouting} tone="bg-amber-500" />
          <BarRow label="Manager escalated" value={escalated} max={maxRouting} tone="bg-red-500" />
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Human review: <strong className="text-slate-900">{filteredFeedback.filter((item) => item.routing_status === "human_review").length}</strong>
            <span className="mx-2 text-slate-300">·</span>
            Pending analysis: <strong className="text-slate-900">{filteredFeedback.filter((item) => item.routing_status === "pending_analysis").length}</strong>
          </div>
        </Panel>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Branch performance</h2>
            <p className="mt-1 text-sm text-slate-500">A compact reputation snapshot for every location.</p>
          </div>
          <Link href="/dashboard/feedback" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View feedback</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branchRows.map((branch) => (
            <button
              key={branch.name}
              type="button"
              onClick={() => setLocation(branch.name)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <LocationIcon location={branch.name} className="h-7 w-7" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-950">{branch.name}</h3>
                    <p className="text-xs text-slate-500">{branch.total} feedback record{branch.total === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {branch.avgScore === null ? "—" : `${branch.avgScore}/100`}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-emerald-50 p-2"><span className="block text-emerald-600">Ready</span><strong className="text-emerald-800">{branch.ready}</strong></div>
                <div className="rounded-lg bg-amber-50 p-2"><span className="block text-amber-600">Private</span><strong className="text-amber-800">{branch.privateQueue}</strong></div>
                <div className="rounded-lg bg-red-50 p-2"><span className="block text-red-600">Escalated</span><strong className="text-red-800">{branch.escalated}</strong></div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${branch.total ? (branch.positive / branch.total) * 100 : 0}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{branch.positive} positive · {branch.negative} negative</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Response pipeline" subtitle="Human-controlled customer response lifecycle">
          <div className="grid grid-cols-3 gap-2">
            <PipelineStep label="Pending review" value={pendingResponses} tone="bg-amber-50 text-amber-700" />
            <PipelineStep label="Approved" value={approvedResponses} tone="bg-blue-50 text-blue-700" />
            <PipelineStep label="Sent" value={sentResponses} tone="bg-emerald-50 text-emerald-700" />
          </div>
          <Link href="/dashboard/responses" className="mt-4 block rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Open response queue →
          </Link>
        </Panel>

        <Panel title="Alert activity" subtitle="Manager intervention status">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Open" value={openAlerts} />
            <MiniStat label="Acted on" value={actedAlerts} />
          </div>
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Actioned share</span>
              <span className="font-bold text-slate-950">{filteredAlerts.length ? Math.round((actedAlerts / filteredAlerts.length) * 100) : 0}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-slate-800" style={{ width: `${filteredAlerts.length ? (actedAlerts / filteredAlerts.length) * 100 : 0}%` }} />
            </div>
          </div>
          <Link href="/dashboard/alerts" className="mt-4 block rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Open manager alerts →
          </Link>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Latest feedback" subtitle={location === "All locations" ? "Most recent submissions across branches" : `Most recent from ${location}`}>
          <div className="divide-y divide-slate-100">
            {filteredFeedback.slice(0, 6).map((item) => (
              <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">{item.overall_rating}/5</div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-800">{item.comments || "No written comment."}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{item.location_name}</span>
                    <span>·</span>
                    <span>{item.sentiment ?? "Unanalyzed"}</span>
                    {item.sentiment_score !== null && <><span>·</span><span>{item.sentiment_score}/100</span></>}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${routingTone[item.routing_status] ?? "bg-slate-100 text-slate-600"}`}>
                  {routingLabels[item.routing_status] ?? item.routing_status}
                </span>
              </div>
            ))}
            {!filteredFeedback.length && <p className="py-4 text-sm text-slate-500">No feedback matches this branch.</p>}
          </div>
        </Panel>

        <Panel title="Manager alerts" subtitle={location === "All locations" ? "Latest alert activity" : `Alerts for ${location}`}>
          <div className="divide-y divide-slate-100">
            {filteredAlerts.slice(0, 6).map((alert) => (
              <div key={alert.alert_id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${alert.alert_status === "pending" ? "bg-red-500" : "bg-emerald-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{alert.alert_type === "repeat_negative" ? "Repeat negative" : "High severity"} · {alert.customer_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{alert.location_name} · {alert.job_reference}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${alert.alert_status === "pending" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {alert.alert_status === "pending" ? "Open" : alert.alert_status}
                </span>
              </div>
            ))}
            {!filteredAlerts.length && <p className="py-4 text-sm text-slate-500">No alerts for this branch.</p>}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Metric({ label, value, detail, danger, warning }: { label: string; value: string | number; detail: string; danger?: boolean; warning?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black tracking-tight ${danger ? "text-red-600" : warning ? "text-amber-600" : "text-slate-950"}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function BarRow({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-950">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function PipelineStep({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-xl p-4 ${tone}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
