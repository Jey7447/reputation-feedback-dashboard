"use client";

import { useEffect, useMemo, useState } from "react";
import { LocationIcon } from "@/components/dashboard/location-icon";

type ResponseItem = {
  id: string;
  feedback_id: string;
  response_draft: string;
  review_status: string;
  final_response: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  feedback: {
    overall_rating: number;
    technician_rating: number;
    facility_rating: number;
    waiting_time_rating: number;
    feedback_category: string | null;
    comments: string | null;
    sentiment: string | null;
    severity: string | null;
    severity_score: number | null;
    confidence_score: number | null;
    routing_status: string;
    submitted_at: string | null;
    job_reference: string | null;
    location_name: string;
  } | null;
};

const statusFilters = ["all", "pending_review", "approved", "sent", "rejected"] as const;

const statusStyles: Record<string, string> = {
  pending_review: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  sent: "bg-emerald-50 text-emerald-700",
};

export default function ResponsesPage() {
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("all");
  const [location, setLocation] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [sentiment, setSentiment] = useState("all");
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadResponses() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/responses");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load response drafts.");
      setResponses(result.data ?? []);
      setAvailableLocations(result.locations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load response drafts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadResponses(); }, []);

  function draftFor(item: ResponseItem) {
    return editing[item.id] ?? item.response_draft;
  }

  async function updateResponse(item: ResponseItem, reviewStatus: "approved" | "rejected") {
    setBusyId(item.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/responses/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewStatus,
          finalResponse: draftFor(item),
          reviewNotes: notes[item.id] ?? "",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update response.");

      setResponses((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...result.data, feedback: entry.feedback }
            : entry,
        ),
      );

      setMessage(
        reviewStatus === "approved"
          ? "Response approved. Human approval is complete and the approved response is now queued for delivery."
          : "Response rejected and marked for revision.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update response.");
    } finally {
      setBusyId("");
    }
  }

  const locations = useMemo(() => availableLocations.filter(Boolean).sort(), [availableLocations]);

  const sentimentCounts = useMemo(() => ({
    all: responses.length,
    positive: responses.filter((item) => item.feedback?.sentiment === "positive").length,
    neutral: responses.filter((item) => item.feedback?.sentiment === "neutral").length,
    negative: responses.filter((item) => item.feedback?.sentiment === "negative").length,
  }), [responses]);

  const counts = useMemo(() => ({
    all: responses.length,
    pending_review: responses.filter((item) => item.review_status === "pending_review").length,
    approved: responses.filter((item) => item.review_status === "approved").length,
    sent: responses.filter((item) => item.review_status === "sent").length,
    rejected: responses.filter((item) => item.review_status === "rejected").length,
  }), [responses]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = responses.filter((item) => {
      const f = item.feedback;
      const matchesQuery = !q || [item.feedback_id, f?.comments, f?.feedback_category, f?.job_reference, f?.location_name].some((value) => value?.toLowerCase().includes(q));
      return matchesQuery && (filter === "all" || item.review_status === filter) && (location === "all" || f?.location_name === location) && (sentiment === "all" || f?.sentiment === sentiment);
    });
    return [...rows].sort((a, b) => {
      if (sort === "rating_high") return (b.feedback?.overall_rating ?? 0) - (a.feedback?.overall_rating ?? 0);
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [responses, filter, location, query, sort, sentiment]);

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden p-3 sm:p-5 md:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">Human review</p>
        <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Response Queue</h1>
        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-500">
          Review, edit, approve, or reject AI-generated drafts. Human approval is required before delivery; approved responses move through the delivery workflow.
        </p>
      </div>

      <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Approval → delivery</p>
              <p className="mt-1 text-sm text-slate-600">Every response follows the same human-controlled lifecycle.</p>
            </div>
            <p className="text-xs font-semibold text-slate-400">No automatic delivery before approval</p>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {[
            ["01", "Awaiting approval", "Review & edit", "pending_review"],
            ["02", "Approved", "Human approval complete", "approved"],
            ["03", "Sent", "Delivered to customer", "sent"],
            ["04", "Rejected", "Needs revision", "rejected"],
          ].map(([step, title, subtitle, key]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as (typeof statusFilters)[number])}
              className="group flex items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-slate-950 group-hover:text-white">{step}</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-900">{title} <span className="font-semibold text-slate-400">({counts[key as keyof typeof counts]})</span></span>
                <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {statusFilters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold capitalize sm:px-4 ${filter === item ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
          >
            {item === "all" ? "All" : item === "pending_review" ? "Awaiting approval" : item.replaceAll("_", " ")} <span className="ml-1 opacity-60">({counts[item]})</span>
          </button>
        ))}
      </div>

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Feedback sentiment</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["all", "positive", "neutral", "negative"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setSentiment(item)} className={`rounded-xl px-3 py-2.5 text-sm font-bold capitalize transition ${sentiment === item ? "bg-slate-950 text-white" : item === "positive" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : item === "negative" ? "bg-red-50 text-red-700 hover:bg-red-100" : item === "neutral" ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
              {item === "all" ? "All feedback" : item} <span className="ml-1 opacity-70">({sentimentCounts[item]})</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search branch, job, comment, or feedback ID..." className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="all">All branches</option>
            {locations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="rating_high">Highest rating</option>
          </select>
        </div>
      </section>

      {error && <div className="mb-4 max-w-full break-words rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</div>}
      {message && <div className="mb-4 max-w-full break-words rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">{message}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:p-8">Loading response queue...</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:p-8">No response drafts match this filter.</div>
      ) : (
        <div className="space-y-4">
          {visible.map((item) => {
            const pending = item.review_status === "pending_review";
            const feedback = item.feedback;

            return (
              <article key={item.id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-4 sm:p-6">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-all text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Feedback {item.feedback_id.slice(0, 8)}…
                      </p>
                      <h2 className="mt-1 break-words font-semibold text-slate-950">Customer response draft</h2>
                      {feedback && <div className="mt-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><LocationIcon location={feedback.location_name} className="h-5 w-5" /></span><div><p className="text-xs font-bold text-slate-800">{feedback.location_name}</p><p className="text-[11px] text-slate-400">{feedback.job_reference ?? "Job reference unavailable"}</p></div></div>}
                      <p className="mt-1 text-xs text-slate-400">
                        Created {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[item.review_status] ?? "bg-slate-100 text-slate-600"}`}>
                      {item.review_status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                {feedback && (
                  <div className="border-b border-slate-100 bg-slate-50 p-4 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-bold text-white">
                        {feedback.overall_rating}/5
                      </span>
                      {feedback.sentiment && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                          {feedback.sentiment}
                        </span>
                      )}
                      {feedback.severity && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${feedback.severity === "high" ? "bg-red-50 text-red-700" : feedback.severity === "medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                          {feedback.severity} severity
                        </span>
                      )}
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                        {feedback.routing_status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-3 break-words [overflow-wrap:anywhere] text-sm leading-6 text-slate-700">
                      {feedback.comments || "No written customer comment."}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-400">Technician</p><p className="mt-1 font-semibold text-slate-800">{feedback.technician_rating}/5</p></div>
                      <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-400">Facility</p><p className="mt-1 font-semibold text-slate-800">{feedback.facility_rating}/5</p></div>
                      <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-400">Waiting time</p><p className="mt-1 font-semibold text-slate-800">{feedback.waiting_time_rating}/5</p></div>
                      <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-400">AI confidence</p><p className="mt-1 font-semibold text-slate-800">{feedback.confidence_score ?? "—"}%</p></div>
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {pending ? "Editable response draft" : "Response draft"}
                    <textarea
                      value={draftFor(item)}
                      disabled={!pending || busyId === item.id}
                      onChange={(event) => setEditing((current) => ({ ...current, [item.id]: event.target.value }))}
                      rows={pending ? 6 : 5}
                      className="mt-2 min-h-32 w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-75"
                    />
                  </label>

                  {pending && (
                    <>
                      <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Review note
                        <textarea
                          value={notes[item.id] ?? ""}
                          onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                          rows={3}
                          placeholder="Optional for approval; required for rejection."
                          className="mt-2 min-h-20 w-full min-w-0 resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Before approval</p>
                        <p className="mt-1 text-xs leading-5 text-amber-800">Edit the draft if needed, then approve only when the final wording is ready. Approval is the gate that starts delivery.</p>
                      </div>
                      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          disabled={busyId === item.id}
                          onClick={() => updateResponse(item, "rejected")}
                          className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 sm:w-auto"
                        >
                          {busyId === item.id ? "Saving..." : "Reject"}
                        </button>
                        <button
                          disabled={busyId === item.id}
                          onClick={() => updateResponse(item, "approved")}
                          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
                        >
                          {busyId === item.id ? "Saving..." : "Approve & queue delivery"}
                        </button>
                      </div>
                    </>
                  )}

                  {item.final_response && (
                    <div className={`mt-4 min-w-0 rounded-xl border p-4 ${item.review_status === "sent" ? "border-emerald-100 bg-emerald-50" : "border-blue-100 bg-blue-50"}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${item.review_status === "sent" ? "text-emerald-700" : "text-blue-700"}`}>Approved final response</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-800">{item.final_response}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.review_status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                          {item.review_status === "sent" ? "Delivered to customer" : "Approved — awaiting delivery"}
                        </span>
                        {item.reviewed_at && <span className="text-xs text-slate-400">Reviewed {new Date(item.reviewed_at).toLocaleString()}</span>}
                      </div>
                    </div>
                  )}

                  {item.review_notes && (
                    <div className="mt-4 min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Review notes</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-600">{item.review_notes}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}