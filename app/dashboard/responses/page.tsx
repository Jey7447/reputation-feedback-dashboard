"use client";

import { useEffect, useState } from "react";

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
  } | null;
};

const statusFilters = ["all", "pending_review", "approved", "rejected"] as const;

const statusStyles: Record<string, string> = {
  pending_review: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export default function ResponsesPage() {
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("all");
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
        current.map((entry) => entry.id === item.id ? result.data : entry),
      );

      setMessage(
        reviewStatus === "approved"
          ? "Response approved. It remains under human control and is not sent automatically."
          : "Response rejected and marked for revision.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update response.");
    } finally {
      setBusyId("");
    }
  }

  const visible = filter === "all"
    ? responses
    : responses.filter((item) => item.review_status === filter);

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden p-3 sm:p-5 md:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">Human review</p>
        <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Response Queue</h1>
        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-500">
          Review, edit, approve, or reject AI-generated response drafts. Nothing is automatically sent to a customer.
        </p>
      </div>

      <div className="mb-5 flex max-w-full flex-wrap gap-2">
        {statusFilters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold capitalize sm:px-4 ${filter === item ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
          >
            {item.replaceAll("_", " ")}
          </button>
        ))}
      </div>

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
                          {busyId === item.id ? "Saving..." : "Approve"}
                        </button>
                      </div>
                    </>
                  )}

                  {item.final_response && item.review_status === "approved" && (
                    <div className="mt-4 min-w-0 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Approved final response</p>
                      <p className="mt-2 break-words text-sm leading-6 text-emerald-950">{item.final_response}</p>
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