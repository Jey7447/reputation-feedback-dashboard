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

const sentimentStyles: Record<string, string> = {
  positive: "bg-emerald-50 text-emerald-700",
  neutral: "bg-slate-100 text-slate-600",
  negative: "bg-red-50 text-red-700",
};

const severityStyles: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

export function FeedbackList({ feedback }: { feedback: Feedback[] }) {
  const [query, setQuery] = useState("");
  const [sentiment, setSentiment] = useState("all");
  const [routing, setRouting] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feedback.filter((item) => {
      const matchesQuery =
        !q ||
        [item.comments, item.feedback_category, item.id]
          .some((value) => value?.toLowerCase().includes(q));
      const matchesSentiment = sentiment === "all" || item.sentiment === sentiment;
      const matchesRouting = routing === "all" || item.routing_status === routing;
      return matchesQuery && matchesSentiment && matchesRouting;
    });
  }, [feedback, query, sentiment, routing]);

  return (
    <>
      <div className="mb-5 grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:grid-cols-[minmax(0,1fr)_auto_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search comments, category, or feedback ID..."
          className="min-w-0 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm capitalize outline-none focus:border-blue-500">
          <option value="all">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <select value={routing} onChange={(e) => setRouting(e.target.value)} className="min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm capitalize outline-none focus:border-blue-500">
          <option value="all">All routing</option>
          {[...new Set(feedback.map((item) => item.routing_status))].map((status) => (
            <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Showing {filtered.length} of {feedback.length} feedback records</p>
        <p className="break-all text-xs text-slate-400">AI analysis is informational; routing remains human-controlled.</p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          No feedback matches the current filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <article key={item.id} className="min-w-0 p-4 sm:p-6">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-bold text-white">
                          {item.overall_rating}/5
                        </span>
                        {item.sentiment && (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${sentimentStyles[item.sentiment] ?? "bg-slate-100 text-slate-600"}`}>
                            {item.sentiment}
                          </span>
                        )}
                        {item.severity && (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${severityStyles[item.severity] ?? "bg-slate-100 text-slate-600"}`}>
                            {item.severity} severity
                          </span>
                        )}
                        <span className="max-w-full break-words rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                          {item.routing_status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-3 break-words [overflow-wrap:anywhere] text-sm leading-6 text-slate-800 sm:text-base sm:leading-7">
                        {item.comments || "No written comment."}
                      </p>
                      <div className="mt-3 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="break-words">{item.feedback_category || "Uncategorized"}</span>
                        <span className="break-all">{item.id}</span>
                        <span>{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "Date unavailable"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid min-w-0 grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
                    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Technician</p>
                      <p className="mt-1 font-semibold text-slate-800">{item.technician_rating}/5</p>
                    </div>
                    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Facility</p>
                      <p className="mt-1 font-semibold text-slate-800">{item.facility_rating}/5</p>
                    </div>
                    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Waiting time</p>
                      <p className="mt-1 font-semibold text-slate-800">{item.waiting_time_rating}/5</p>
                    </div>
                    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">AI confidence</p>
                      <p className="mt-1 font-semibold text-slate-800">{item.confidence_score ?? "—"}%</p>
                    </div>
                  </div>

                  {(item.sentiment_score !== null || item.severity_score !== null) && (
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      {item.sentiment_score !== null && <span>Sentiment score: <strong className="text-slate-700">{item.sentiment_score}/100</strong></span>}
                      {item.severity_score !== null && <span>Severity score: <strong className="text-slate-700">{item.severity_score}/100</strong></span>}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}