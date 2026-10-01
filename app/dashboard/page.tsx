import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardAlerts, type DashboardAlert } from "@/lib/dashboard-data";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let alerts: DashboardAlert[] = [];
  let feedback: {
    id: string;
    overall_rating: number;
    sentiment: string | null;
    sentiment_score: number | null;
    severity: string | null;
    routing_status: string;
    comments: string | null;
    submitted_at: string | null;
    location_name: string;
  }[] = [];
  let responses: { id: string; feedback_id: string; review_status: string }[] = [];
  let dataError = "";

  try {
    const supabase = await createSupabaseServerClient();

    const [alertsResult, feedbackResult, responsesResult] = await Promise.all([
      getDashboardAlerts(),
      supabase
        .from("feedback")
        .select(
          "id, overall_rating, sentiment, sentiment_score, severity, routing_status, comments, submitted_at, feedback_requests!inner(visit_id, visits!inner(locations!inner(name)))",
        )
        .order("submitted_at", { ascending: false }),
      supabase
        .from("feedback_responses")
        .select("id, feedback_id, review_status"),
    ]);

    if (alertsResult) alerts = alertsResult;
    if (feedbackResult.error) throw new Error(feedbackResult.error.message);
    if (responsesResult.error) throw new Error(responsesResult.error.message);

    feedback = (feedbackResult.data ?? []).map((item: any) => ({
      id: item.id,
      overall_rating: item.overall_rating,
      sentiment: item.sentiment,
      sentiment_score: item.sentiment_score,
      severity: item.severity,
      routing_status: item.routing_status,
      comments: item.comments,
      submitted_at: item.submitted_at,
      location_name: item.feedback_requests?.visits?.locations?.name ?? "Unknown location",
    }));

    responses = responsesResult.data ?? [];
  } catch (error) {
    dataError = error instanceof Error ? error.message : "Unable to load dashboard data.";
  }

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 p-3 sm:p-5 md:p-8">
      {dataError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Dashboard data:</strong> {dataError}
        </div>
      ) : null}
      <OverviewDashboard feedback={feedback} responses={responses} alerts={alerts} />
    </div>
  );
}
