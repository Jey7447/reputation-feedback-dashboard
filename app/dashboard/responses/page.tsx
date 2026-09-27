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
};

const statusFilters = ["all", "pending_review", "approved", "rejected"] as const;

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
      setResponses((current) => current.map((entry) => entry.id === item.id ? result.data : entry));
      setMessage(reviewStatus === "approved" ? "Response approved. It remains under human control and is not sent automatically." : "Response rejected and marked for revision.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update response.");
    } finally {
      setBusyId("");
    }
  }

  const visible = filter === "all" ? responses : responses.filter((item) => item.review_status === filter);

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Human review</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Response Queue</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Review, edit, approve, or reject AI-generated response drafts. Nothing is automatically sent to a customer.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {statusFilters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter === item ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
            {item.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading response queue...</div> :
       visible.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No response drafts match this filter.</div> :
       <div className="space-y-4">
        {visible.map((item) => {
          const pending = item.review_status === "pending_review";
          return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Feedback {item.feedback_id.slice(0, 8)}…</p><h2 className="mt-1 font-semibold text-slate-950">Customer response draft</h2></div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${item.review_status === "approved" ? "bg-emerald-50 text-emerald-700" : item.review_status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{item.review_status.replaceAll("_", " ")}</span>
            </div>
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Response
              <textarea value={draftFor(item)} disabled={!pending || busyId === item.id} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: event.target.value }))} rows={5} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-75" />
            </label>
            {pending && <>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">Review note
                <textarea value={notes[item.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} rows={2} placeholder="Optional for approval; required for rejection." className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button disabled={busyId === item.id} onClick={() => updateResponse(item, "rejected")} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{busyId === item.id ? "Saving..." : "Reject"}</button>
                <button disabled={busyId === item.id} onClick={() => updateResponse(item, "approved")} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{busyId === item.id ? "Saving..." : "Approve"}</button>
              </div>
            </>}
            {item.final_response && item.review_status === "approved" && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Approved final response</p><p className="mt-2 text-sm leading-6 text-emerald-950">{item.final_response}</p></div>}
            {item.review_notes && <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Review notes</p><p className="mt-2 text-sm text-slate-600">{item.review_notes}</p></div>}
          </article>;
        })}
       </div>}
    </div>
  );
}