"use client";

import { useMemo, useState } from "react";
import { LocationIcon } from "@/components/dashboard/location-icon";

type Feedback = {
  id: string; overall_rating: number; technician_rating: number; facility_rating: number; waiting_time_rating: number;
  feedback_category: string | null; comments: string | null; sentiment: string | null; sentiment_score: number | null;
  severity: string | null; severity_score: number | null; confidence_score: number | null; routing_status: string;
  submitted_at: string | null; location_name: string; response_status: string;
};

const sentimentStyles: Record<string, string> = {
  positive: "bg-emerald-50 text-emerald-700", neutral: "bg-slate-100 text-slate-600", negative: "bg-red-50 text-red-700",
};
const severityStyles: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700", medium: "bg-amber-50 text-amber-700", high: "bg-red-50 text-red-700",
};
const routingStyles: Record<string, string> = {
  ready_to_post: "bg-emerald-50 text-emerald-700", private_queue: "bg-amber-50 text-amber-700",
  manager_escalated: "bg-red-50 text-red-700", human_review: "bg-blue-50 text-blue-700",
  processing: "bg-slate-100 text-slate-700", pending_analysis: "bg-slate-100 text-slate-600",
};
const responseStyles: Record<string, string> = {
  pending_review: "bg-amber-50 text-amber-700", approved: "bg-blue-50 text-blue-700",
  sent: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700", not_created: "bg-slate-100 text-slate-500",
};
const routingLabels: Record<string, string> = {
  ready_to_post: "Ready to post", private_queue: "Private queue", manager_escalated: "Manager escalated",
  human_review: "Human review", processing: "Processing", pending_analysis: "Pending analysis",
};
const responseLabels: Record<string, string> = {
  pending_review: "Awaiting approval", approved: "Approved", sent: "Sent", rejected: "Rejected", not_created: "No response",
};

export function FeedbackList({ feedback, locations: availableLocations }: { feedback: Feedback[]; locations: string[] }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [sentiment, setSentiment] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [routing, setRouting] = useState("all");
  const [responseStatus, setResponseStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const locations = useMemo(() => Array.from(new Set(availableLocations)).filter(Boolean).sort(), [availableLocations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = feedback.filter((item) => {
      const matchesQuery = !q || [item.comments, item.feedback_category, item.id, item.location_name].some((value) => value?.toLowerCase().includes(q));
      return matchesQuery && (location === "all" || item.location_name === location) &&
        (sentiment === "all" || item.sentiment === sentiment) && (severity === "all" || item.severity === severity) &&
        (routing === "all" || item.routing_status === routing) && (responseStatus === "all" || item.response_status === responseStatus);
    });
    return [...rows].sort((a, b) => {
      if (sort === "rating_high") return b.overall_rating - a.overall_rating;
      if (sort === "rating_low") return a.overall_rating - b.overall_rating;
      if (sort === "sentiment_high") return (b.sentiment_score ?? -1) - (a.sentiment_score ?? -1);
      if (sort === "sentiment_low") return (a.sentiment_score ?? 101) - (b.sentiment_score ?? 101);
      return new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime();
    });
  }, [feedback, query, location, sentiment, severity, routing, responseStatus, sort]);

  const sentimentCounts = useMemo(() => ({
    all: feedback.length, positive: feedback.filter((item) => item.sentiment === "positive").length,
    neutral: feedback.filter((item) => item.sentiment === "neutral").length, negative: feedback.filter((item) => item.sentiment === "negative").length,
  }), [feedback]);

  const activeFilterCount = [location !== "all", sentiment !== "all", severity !== "all", routing !== "all", responseStatus !== "all", Boolean(query.trim())].filter(Boolean).length;

  const resetFilters = () => {
    setQuery(""); setLocation("all"); setSentiment("all"); setSeverity("all"); setRouting("all"); setResponseStatus("all"); setSort("newest");
  };

  return (
    <>
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Feedback intelligence</p><p className="mt-1 text-sm font-semibold text-slate-700">Filter the operating queue by sentiment, branch, severity, routing, or response stage.</p></div>
          {activeFilterCount > 0 && <button type="button" onClick={resetFilters} className="shrink-0 text-xs font-bold text-blue-600 hover:text-blue-700">Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}</button>}
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["all", "positive", "neutral", "negative"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setSentiment(item)} className={`rounded-xl px-3 py-2.5 text-sm font-bold capitalize transition ${sentiment === item ? "bg-slate-950 text-white shadow-sm" : item === "positive" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : item === "negative" ? "bg-red-50 text-red-700 hover:bg-red-100" : item === "neutral" ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
              {item === "all" ? "All feedback" : item} <span className="ml-1 opacity-70">({sentimentCounts[item]})</span>
            </button>
          ))}
        </div>

        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,180px))]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search comments, category, branch, or feedback ID..." className="min-w-0 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"><option value="all">All branches</option>{locations.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm capitalize outline-none focus:border-blue-500"><option value="all">All sentiment</option><option value="positive">Positive</option><option value="neutral">Neutral</option><option value="negative">Negative</option></select>
          <select value={routing} onChange={(e) => setRouting(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"><option value="all">All routing</option>{Object.entries(routingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm capitalize outline-none focus:border-blue-500"><option value="all">All severity</option><option value="low">Low severity</option><option value="medium">Medium severity</option><option value="high">High severity</option></select>
          <select value={responseStatus} onChange={(e) => setResponseStatus(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"><option value="all">All response status</option>{Object.entries(responseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"><option value="newest">Newest first</option><option value="rating_high">Highest rating</option><option value="rating_low">Lowest rating</option><option value="sentiment_high">Highest sentiment score</option><option value="sentiment_low">Lowest sentiment score</option></select>
          <button type="button" onClick={resetFilters} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Reset filters</button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-600">Showing <span className="text-slate-950">{filtered.length}</span> of {feedback.length} feedback records</p>
        <p className="text-xs text-slate-400">Every record shows its branch, AI analysis, routing stage, and response lifecycle.</p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">⌕</div>
          <p className="mt-4 font-bold text-slate-900">No feedback matches these filters</p>
          <p className="mt-1 text-sm text-slate-500">Try another branch, sentiment, routing stage, or search term.</p>
          {activeFilterCount > 0 && <button type="button" onClick={resetFilters} className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800">Clear filters</button>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-black text-white">{item.overall_rating}/5</span>
                    {item.sentiment && <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${sentimentStyles[item.sentiment] ?? "bg-slate-100 text-slate-600"}`}>{item.sentiment}</span>}
                    {item.severity && <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${severityStyles[item.severity] ?? "bg-slate-100 text-slate-600"}`}>{item.severity} severity</span>}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${routingStyles[item.routing_status] ?? "bg-slate-100 text-slate-600"}`}>{routingLabels[item.routing_status] ?? item.routing_status.replaceAll("_", " ")}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "Date unavailable"}</span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><LocationIcon location={item.location_name} className="h-6 w-6" /></span>
                      <div className="min-w-0"><p className="truncate text-sm font-black text-slate-950">{item.location_name}</p><p className="text-xs text-slate-400">{item.feedback_category || "Uncategorized"} · <span className="break-all">{item.id}</span></p></div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-100 bg-white">
                      <div className="p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Customer feedback</p><p className="mt-2 break-words text-sm leading-6 text-slate-800 sm:text-base sm:leading-7">{item.comments || "No written comment."}</p></div>
                    </div>
                  </div>

                  <div className="w-full shrink-0 xl:w-72">
                    <div className={`rounded-xl border p-4 ${responseStyles[item.response_status] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">Response delivery</p>
                      <p className="mt-1 text-sm font-black">{responseLabels[item.response_status] ?? item.response_status}</p>
                      <p className="mt-1 text-xs leading-5 opacity-80">{item.response_status === "sent" ? "Approved response delivered." : item.response_status === "approved" ? "Approved and waiting for delivery." : item.response_status === "pending_review" ? "Human approval required." : item.response_status === "rejected" ? "Draft rejected." : "No response draft exists."}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-5 sm:grid-cols-4">
                  <Score label="Technician" value={`${item.technician_rating}/5`} />
                  <Score label="Facility" value={`${item.facility_rating}/5`} />
                  <Score label="Waiting time" value={`${item.waiting_time_rating}/5`} />
                  <Score label="AI confidence" value={item.confidence_score === null ? "—" : `${item.confidence_score}%`} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.sentiment_score !== null && <ScorePill label="Sentiment" value={`${item.sentiment_score}/100`} />}
                  {item.severity_score !== null && <ScorePill label="Severity" value={`${item.severity_score}/100`} />}
                  <ScorePill label="Routing" value={routingLabels[item.routing_status] ?? item.routing_status} />
                  <ScorePill label="Response" value={responseLabels[item.response_status] ?? item.response_status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function Score({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>;
}
function ScorePill({ label, value }: { label: string; value: string }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{label}: <span className="text-slate-900">{value}</span></span>;
}
