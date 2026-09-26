import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ResponsesPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("feedback_responses")
    .select("id, feedback_id, response_draft, review_status, final_response, review_notes, reviewed_at, created_at")
    .order("created_at", { ascending: false });

  const responses = data ?? [];

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Human review</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Response Queue</h1>
        <p className="mt-2 text-sm text-slate-500">Review AI-generated response drafts before any customer-facing response is sent.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load response drafts: {error.message}
        </div>
      ) : responses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No response drafts are waiting in the queue.</div>
      ) : (
        <div className="space-y-4">
          {responses.map((response) => (
            <article key={response.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Feedback {response.feedback_id.slice(0, 8)}…</p>
                  <h2 className="mt-1 font-semibold text-slate-950">Response draft</h2>
                </div>
                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">{response.review_status.replaceAll("_", " ")}</span>
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{response.response_draft}</div>
              {response.final_response && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Final response</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{response.final_response}</p>
                </div>
              )}
              {response.review_notes && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Review notes</p>
                  <p className="mt-2 text-sm text-slate-600">{response.review_notes}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}