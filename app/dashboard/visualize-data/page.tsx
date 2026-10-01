import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataVisualizationDashboard } from "@/components/dashboard/data-visualization-dashboard";

export const dynamic = "force-dynamic";

export default async function VisualizeDataPage() {
  const supabase = await createSupabaseServerClient();

  const [feedbackResult, locationsResult] = await Promise.all([
    supabase.from("feedback").select("id, overall_rating, sentiment, sentiment_score, severity, routing_status, submitted_at, feedback_requests!inner(visit_id, visits!inner(locations!inner(name)))").order("submitted_at", { ascending: false }),
    supabase.from("locations").select("id, name").eq("is_active", true).order("name"),
  ]);

  const dataError = feedbackResult.error?.message ?? locationsResult.error?.message ?? "";
  const feedback = (feedbackResult.data ?? []).map((item: any) => ({
    id: item.id,
    overall_rating: item.overall_rating,
    sentiment: item.sentiment,
    sentiment_score: item.sentiment_score,
    severity: item.severity,
    routing_status: item.routing_status,
    submitted_at: item.submitted_at,
    location_name: item.feedback_requests?.visits?.locations?.name ?? "Unknown location",
  }));

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 p-3 sm:p-5 md:p-8">
      {dataError ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><strong>Visualization data:</strong> {dataError}</div> : null}
      <DataVisualizationDashboard locations={locationsResult.data ?? []} feedback={feedback} />
    </div>
  );
}
