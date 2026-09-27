"use client";

import { useMemo, useState } from "react";

type Feedback = {
  id: string;
  overall_rating: number;
  technician_rating: number;
  facility_rating: number;
  waiting_time_rating: number;
  feedback_category: string | null;
  comments: string | null;
  sentiment: string | null;
  sentiment_score: number | null;
  severity: string | null;
  severity_score: number | null;
  confidence_score: number | null;
  routing_status: string;
  submitted_at: string | null;
};

export function FeedbackList({ feedback }: { feedback: Feedback[] }) {
  const [query, setQuery] = useState("");
  const [sentiment, setSentiment] = useState("all");
  const [routing, setRouting] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feedback.filter((item) => {
      const matchesQuery = !q || [item.comments, item.feedback_category, item.id].some((value) => value?.toLowerCase().includes(q));
      const matchesSentiment = sentiment === "all" || item.sentiment === sentiment;
      const matchesRouting = routing === "all" || item.routing_status === routing;
      return matchesQuery && matchesSentiment && matchesRouting;
    });
  }, [feedback, query, sentiment, routing]);

  return (
    <>
      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search comments, category, or feedback ID..." className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm capitalize outline-none focus:border-blue-500">
          <option value="all">All sentiment</option><option value="positive">Positive</option><option value="neutral">Neutral</option><option value="negative">Negative</option>
        </select>
        <select value={routing} onChange={(e) => setRouting(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm capitalize outline-none focus:border-blue-500">
          <option value="all">All routing</option>
          {[...new Set(feedback.map((item) => item.routing_status))].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
        </select>
      </div>

      <p className="mb-3 text-sm text-slate-500">Showing {filtered.length} of {feedback.length} feedback records</p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No feedback matches the current filters.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <article key={item.id} className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">{item.overall_rating}/5 overall</span>
                      {item.sentiment && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">{item.sentiment}</span>}
                      {item.severity && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-700">{item.severity} severity</span>}
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{item.routing_status.replaceAll("_", " ")}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{item.comments || "No written comment."}</p>
                    <p className="mt-3 text-xs text-slate-400">{item.feedback_category || "Uncategorized"} · {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "Date unavailable"}</p>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div><p className="text-xs text-slate-400">Technician</p><p className="font-semibold">{item.technician_rating}/5</p></div>
                    <div><p className="text-xs text-slate-400">Facility</p><p className="font-semibold">{item.facility_rating}/5</p></div>
                    <div><p className="text-xs text-slate-400">Sentiment score</p><p className="font-semibold">{item.sentiment_score ?? "—"}</p></div>
                    <div><p className="text-xs text-slate-400">Confidence</p><p className="font-semibold">{item.confidence_score ?? "—"}</p></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}