import { FeedbackList } from "@/components/dashboard/feedback-list";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("feedback")
    .select(
      "id, overall_rating, technician_rating, facility_rating, waiting_time_rating, feedback_category, comments, sentiment, sentiment_score, severity, severity_score, confidence_score, routing_status, submitted_at, feedback_requests!inner(visits!inner(locations!inner(name))), feedback_responses(review_status)",
    )
    .order("submitted_at", { ascending: false });

  const feedback = (data ?? []).map((item: any) => ({
    id: item.id,
    overall_rating: item.overall_rating,
    technician_rating: item.technician_rating,
    facility_rating: item.facility_rating,
    waiting_time_rating: item.waiting_time_rating,
    feedback_category: item.feedback_category,
    comments: item.comments,
    sentiment: item.sentiment,
    sentiment_score: item.sentiment_score,
    severity: item.severity,
    severity_score: item.severity_score,
    confidence_score: item.confidence_score,
    routing_status: item.routing_status,
    submitted_at: item.submitted_at,
    location_name: item.feedback_requests?.visits?.locations?.name ?? "Unknown location",
    response_status: item.feedback_responses?.[0]?.review_status ?? "not_created",
  }));

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden p-3 sm:p-5 md:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">Customer intelligence</p>
        <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Feedback intelligence</h1>
        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-500">
          Search every customer submission by branch, sentiment, severity, routing destination, and response delivery stage.
        </p>
      </div>
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Unable to load feedback: {error.message}</div>
      ) : (
        <FeedbackList feedback={feedback} />
      )}
    </div>
  );
}
