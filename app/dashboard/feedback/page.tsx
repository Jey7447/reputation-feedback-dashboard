import { FeedbackList } from "@/components/dashboard/feedback-list";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("id, overall_rating, technician_rating, facility_rating, waiting_time_rating, feedback_category, comments, sentiment, sentiment_score, severity, severity_score, confidence_score, routing_status, submitted_at")
    .order("submitted_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Customer intelligence</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Feedback</h1>
        <p className="mt-2 text-sm text-slate-500">Search and filter customer ratings, AI analysis, and routing status.</p>
      </div>
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Unable to load feedback: {error.message}</div>
      ) : (
        <FeedbackList feedback={data ?? []} />
      )}
    </div>
  );
}