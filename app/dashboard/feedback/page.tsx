import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("id, overall_rating, technician_rating, facility_rating, waiting_time_rating, feedback_category, comments, sentiment, sentiment_score, severity, severity_score, confidence_score, routing_status, submitted_at")
    .order("submitted_at", { ascending: false });

  const feedback = data ?? [];

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Customer intelligence</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Feedback</h1>
        <p className="mt-2 text-sm text-slate-500">Review customer ratings, AI analysis, and routing status.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load feedback: {error.message}
        </div>
      ) : feedback.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No feedback records found.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {feedback.map((item) => (
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
    </div>
  );
}