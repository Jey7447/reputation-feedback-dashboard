"use client";

import { useMemo, useState } from "react";
import { LocationIcon } from "@/components/dashboard/location-icon";

type FeedbackRow = {
  id: string;
  overall_rating: number;
  sentiment: string | null;
  sentiment_score: number | null;
  severity: string | null;
  routing_status: string;
  submitted_at: string | null;
  location_name: string;
};

type Props = {
  locations: { id: string; name: string }[];
  feedback: FeedbackRow[];
};

export function DataVisualizationDashboard({ locations, feedback }: Props) {
  const [branch, setBranch] = useState("All locations");
  const [view, setView] = useState<"sentiment" | "routing" | "ratings">("sentiment");

  const filtered = useMemo(
    () => branch === "All locations" ? feedback : feedback.filter((row) => row.location_name === branch),
    [feedback, branch],
  );

  const summary = useMemo(() => {
    const positive = filtered.filter((r) => r.sentiment === "positive").length;
    const neutral = filtered.filter((r) => r.sentiment === "neutral").length;
    const negative = filtered.filter((r) => r.sentiment === "negative").length;
    const scored = filtered.filter((r) => r.sentiment_score !== null);
    const avgScore = scored.length ? Math.round(scored.reduce((s, r) => s + (r.sentiment_score ?? 0), 0) / scored.length) : null;
    const avgRating = filtered.length ? (filtered.reduce((s, r) => s + r.overall_rating, 0) / filtered.length).toFixed(1) : "—";
    const highSeverity = filtered.filter((r) => r.severity === "high").length;
    const ready = filtered.filter((r) => r.routing_status === "ready_to_post").length;
    const privateQueue = filtered.filter((r) => r.routing_status === "private_queue").length;
    const escalated = filtered.filter((r) => r.routing_status === "manager_escalated").length;
    return { positive, neutral, negative, avgScore, avgRating, highSeverity, ready, privateQueue, escalated };
  }, [filtered]);

  const branchData = useMemo(() => locations.map(({ name }) => {
    const rows = feedback.filter((r) => r.location_name === name);
    const positive = rows.filter((r) => r.sentiment === "positive").length;
    const neutral = rows.filter((r) => r.sentiment === "neutral").length;
    const negative = rows.filter((r) => r.sentiment === "negative").length;
    const scores = rows.filter((r) => r.sentiment_score !== null);
    const score = scores.length ? Math.round(scores.reduce((s, r) => s + (r.sentiment_score ?? 0), 0) / scores.length) : null;
    return {
      name, total: rows.length, positive, neutral, negative, score,
      ready: rows.filter((r) => r.routing_status === "ready_to_post").length,
      privateQueue: rows.filter((r) => r.routing_status === "private_queue").length,
      escalated: rows.filter((r) => r.routing_status === "manager_escalated").length,
    };
  }), [locations, feedback]);

  const ratingData = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: filtered.filter((r) => r.overall_rating === rating).length,
  }));
  const maxRating = Math.max(1, ...ratingData.map((r) => r.count));

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white">
        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">144 Auto Repair</span>
              <span className="text-xs text-slate-400">Analytics</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Visualize Data</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Compare branch performance, sentiment, ratings, AI routing, and operational workload visually.</p>
          </div>
          <div className="w-full lg:w-64">
            <label htmlFor="viz-branch" className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Branch comparison</label>
            <select id="viz-branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-white outline-none focus:border-amber-400">
              <option>All locations</option>
              {locations.map((item) => <option key={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid border-t border-white/10 sm:grid-cols-4">
          <HeroStat label="Feedback" value={filtered.length} />
          <HeroStat label="Avg rating" value={summary.avgRating} />
          <HeroStat label="Sentiment score" value={summary.avgScore === null ? "—" : summary.avgScore} />
          <HeroStat label="High severity" value={summary.highSeverity} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Positive" value={summary.positive} tone="emerald" detail="Customer sentiment" />
        <StatCard label="Neutral" value={summary.neutral} tone="slate" detail="Customer sentiment" />
        <StatCard label="Negative" value={summary.negative} tone="red" detail="Customer sentiment" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">Interactive analysis</h2>
            <p className="mt-1 text-sm text-slate-500">{branch === "All locations" ? "All active branches" : branch}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["sentiment", "routing", "ratings"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setView(item)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${view === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {item === "sentiment" ? "Sentiment by branch" : item === "routing" ? "Routing by branch" : "Rating distribution"}
              </button>
            ))}
          </div>
        </div>

        {view === "sentiment" && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
              <Legend color="bg-emerald-500" label="Positive" /><Legend color="bg-slate-400" label="Neutral" /><Legend color="bg-red-500" label="Negative" />
            </div>
            {branchData.length ? branchData.map((row) => (
              <button key={row.name} type="button" onClick={() => setBranch(row.name)} className="block w-full text-left">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-bold text-slate-800"><LocationIcon location={row.name} className="h-5 w-5 shrink-0" /><span className="truncate">{row.name}</span></span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">{row.total} total</span>
                </div>
                <div className="flex h-8 overflow-hidden rounded-lg bg-slate-100">
                  <Segment value={row.positive} total={row.total} tone="bg-emerald-500" />
                  <Segment value={row.neutral} total={row.total} tone="bg-slate-400" />
                  <Segment value={row.negative} total={row.total} tone="bg-red-500" />
                </div>
              </button>
            )) : <Empty />}
          </div>
        )}

        {view === "routing" && (
          <div className="mt-6 space-y-5">
            {branchData.length ? branchData.map((row) => {
              const total = row.ready + row.privateQueue + row.escalated;
              return (
                <button key={row.name} type="button" onClick={() => setBranch(row.name)} className="block w-full text-left">
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-slate-800">{row.name}</span>
                    <span className="text-xs text-slate-500">{total} routed</span>
                  </div>
                  <div className="flex h-8 overflow-hidden rounded-lg bg-slate-100">
                    <Segment value={row.ready} total={total} tone="bg-emerald-500" />
                    <Segment value={row.privateQueue} total={total} tone="bg-amber-500" />
                    <Segment value={row.escalated} total={total} tone="bg-red-500" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500"><span>Ready {row.ready}</span><span>Private {row.privateQueue}</span><span>Escalated {row.escalated}</span></div>
                </button>
              );
            }) : <Empty />}
          </div>
        )}

        {view === "ratings" && (
          <div className="mt-6">
            <div className="flex h-64 items-end gap-3 border-b border-slate-200 px-2">
              {ratingData.map((row) => (
                <div key={row.rating} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-bold text-slate-600">{row.count}</span>
                  <div className="w-full max-w-16 rounded-t-xl bg-slate-900 transition-all" style={{ height: `${Math.max(4, (row.count / maxRating) * 190)}px` }} />
                  <span className="text-sm font-black text-slate-950">{row.rating}★</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">Distribution of customer ratings in the selected branch view.</p>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Sentiment score by branch" subtitle="Average AI sentiment score out of 100. Empty branches remain visible.">
          <div className="space-y-4">
            {branchData.map((row) => (
              <button key={row.name} type="button" onClick={() => setBranch(row.name)} className="w-full text-left">
                <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="font-semibold text-slate-700">{row.name}</span><span className="font-black text-slate-950">{row.score === null ? "—" : row.score}</span></div>
                <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-slate-800 transition-all" style={{ width: `${row.score ?? 0}%` }} /></div>
              </button>
            ))}
            {!branchData.length && <Empty />}
          </div>
        </Panel>

        <Panel title="Operational routing mix" subtitle="How analyzed feedback is currently distributed.">
          <div className="grid gap-3 sm:grid-cols-3">
            <RouteCard label="Ready to post" value={summary.ready} tone="emerald" />
            <RouteCard label="Private queue" value={summary.privateQueue} tone="amber" />
            <RouteCard label="Manager escalated" value={summary.escalated} tone="red" />
          </div>
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">Handled without escalation</span><strong>{filtered.length ? Math.round(((summary.ready + summary.privateQueue) / filtered.length) * 100) : 0}%</strong></div>
            <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-slate-800" style={{ width: `${filtered.length ? Math.min(100, ((summary.ready + summary.privateQueue) / filtered.length) * 100) : 0}%` }} /></div>
          </div>
        </Panel>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold">What this view helps answer</h2><p className="mt-1 text-sm text-slate-400">Use the branch selector and chart tabs to investigate the operation.</p></div>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300">{filtered.length} feedback records in view</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Insight text="Which branches receive more positive, neutral, or negative feedback?" />
          <Insight text="Where is feedback being routed for private handling or escalation?" />
          <Insight text="How are customer ratings distributed across the operation?" />
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return <div className="border-white/10 px-5 py-4 first:border-r sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}
function StatCard({ label, value, tone, detail }: { label: string; value: number; tone: "emerald" | "slate" | "red"; detail: string }) {
  const styles = { emerald: "bg-emerald-50 text-emerald-700", slate: "bg-slate-100 text-slate-700", red: "bg-red-50 text-red-700" };
  return <div className={`rounded-2xl border border-slate-200 p-4 ${styles[tone]}`}><p className="text-xs font-black uppercase tracking-wider">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-1 text-xs opacity-75">{detail}</p></div>;
}
function Segment({ value, total, tone }: { value: number; total: number; tone: string }) {
  return total > 0 ? <div className={`h-full ${tone}`} style={{ width: `${(value / total) * 100}%` }} title={`${value} records`} /> : null;
}
function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>;
}
function RouteCard({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "red" }) {
  const styles = { emerald: "bg-emerald-50 text-emerald-800", amber: "bg-amber-50 text-amber-800", red: "bg-red-50 text-red-800" };
  return <div className={`rounded-xl p-4 ${styles[tone]}`}><p className="text-xs font-bold">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}
function Insight({ text }: { text: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-medium leading-6 text-slate-300">{text}</div>;
}
function Empty() {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">No data available for this view yet.</div>;
}
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{children}</div>;
}