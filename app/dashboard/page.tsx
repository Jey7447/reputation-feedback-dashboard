import Link from "next/link";
import { AlertPreview } from "@/components/dashboard/alert-preview";
import { StatCard } from "@/components/dashboard/stat-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardAlerts, type DashboardAlert } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let alerts: DashboardAlert[] = [];
  let feedback: {
    id: string;
    overall_rating: number;
    sentiment: string | null;
    severity: string | null;
    routing_status: string;
    comments: string | null;
    submitted_at: string | null;
  }[] = [];
  let pendingResponses = 0;
  let dataError = "";

  try {
    const supabase = await createSupabaseServerClient();
    const [alertsResult, feedbackResult, responsesResult] = await Promise.all([
      getDashboardAlerts(),
      supabase
        .from("feedback")
        .select("id, overall_rating, sentiment, severity, routing_status, comments, submitted_at")
        .order("submitted_at", { ascending: false }),
      supabase
        .from("feedback_responses")
        .select("id", { count: "exact", head: true })
        .eq("review_status", "pending_review"),
    ]);

    if (alertsResult) alerts = alertsResult;
    if (feedbackResult.error) throw new Error(feedbackResult.error.message);
    if (responsesResult.error) throw new Error(responsesResult.error.message);

    feedback = feedbackResult.data ?? [];
    pendingResponses = responsesResult.count ?? 0;
  } catch (error) {
    dataError = error instanceof Error ? error.message : "Unable to load dashboard data.";
  }

  const averageRating = feedback.length
    ? (feedback.reduce((sum, item) => sum + item.overall_rating, 0) / feedback.length).toFixed(1)
    : "—";
  const negativeCount = feedback.filter((item) => item.sentiment === "negative").length;
  const positiveCount = feedback.filter((item) => item.sentiment === "positive").length;
  const neutralCount = feedback.filter((item) => item.sentiment === "neutral").length;
  const pendingAlerts = alerts.filter((alert) => alert.alert_status === "pending").length;
  const attentionCount = pendingAlerts + pendingResponses;

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 p-3 sm:p-5 md:p-8">
      <header className="mb-6 flex min-w-0 flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-end">
        <div>
          <p className="text-base font-bold uppercase tracking-wider text-slate-950 sm:text-lg">144 Auto Repair</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-blue-600">Operations dashboard</p>
          <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Reputation overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor customer sentiment, service quality, AI routing, response review, and manager escalations.
          </p>
        </div>
        <div className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm md:w-auto md:shrink-0">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          {dataError ? "Data error" : "Database connected"}
        </div>
      </header>

      {dataError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Dashboard data:</strong> {dataError}
        </div>
      )}

      <section className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
        <StatCard label="Feedback" value={String(feedback.length)} detail="Total records" />
        <StatCard label="Average rating" value={averageRating} detail="Out of 5" />
        <StatCard label="Negative feedback" value={String(negativeCount)} detail="Needs monitoring" tone="danger" />
        <StatCard label="Pending alerts" value={String(pendingAlerts)} detail="Manager action" tone="warning" />
        <StatCard label="Pending responses" value={String(pendingResponses)} detail="Human review" tone="success" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">Sentiment distribution</h2>
              <p className="mt-1 break-words text-sm text-slate-500">Current feedback across all available records.</p>
            </div>
            <span className="text-sm font-semibold text-slate-500">{feedback.length} total</span>
          </div>
          <div className="mt-6 space-y-4">
            {[
              ["Positive", positiveCount, "bg-emerald-500"],
              ["Neutral", neutralCount, "bg-slate-400"],
              ["Negative", negativeCount, "bg-red-500"],
            ].map(([label, count, color]) => {
              const numericCount = Number(count);
              const width = feedback.length ? Math.max((numericCount / feedback.length) * 100, numericCount ? 4 : 0) : 0;
              return (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-slate-500">{numericCount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-semibold text-slate-950">Needs attention</h2>
          <p className="mt-1 text-sm text-slate-500">Items requiring human review.</p>
          <div className="mt-5 space-y-3">
            <Link href="/dashboard/alerts" className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50">
              <span><span className="block text-sm font-semibold text-slate-800">Manager alerts</span><span className="text-xs text-slate-500">Pending escalation work</span></span>
              <span className="text-lg font-bold text-red-600">{pendingAlerts}</span>
            </Link>
            <Link href="/dashboard/responses" className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50">
              <span><span className="block text-sm font-semibold text-slate-800">Response drafts</span><span className="text-xs text-slate-500">Awaiting human review</span></span>
              <span className="text-lg font-bold text-amber-600">{pendingResponses}</span>
            </Link>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total action items</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{attentionCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex min-w-0 flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-950">Recent feedback</h2>
              <p className="mt-1 break-words text-sm text-slate-500">Latest customer submissions.</p>
            </div>
            <Link href="/dashboard/feedback" className="shrink-0 self-start text-sm font-semibold text-blue-600 hover:text-blue-700 sm:self-auto">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {feedback.slice(0, 5).map((item) => (
              <div key={item.id} className="flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
                <div className="min-w-0 max-w-full">
                  <p className="break-words [overflow-wrap:anywhere] text-sm font-medium leading-6 text-slate-800">{item.comments || "No written comment."}</p>
                  <p className="mt-1 break-words text-xs text-slate-400">{item.sentiment ?? "Unanalyzed"} · {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "No date"}</p>
                </div>
                <span className="shrink-0 self-start rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700 sm:self-auto">{item.overall_rating}/5</span>
              </div>
            ))}
          </div>
        </div>

        <AlertPreview
          alerts={alerts.slice(0, 5).map((alert) => ({
            customer: alert.customer_name,
            job: alert.job_reference,
            type: alert.alert_type === "repeat_negative" ? "Repeat negative" : "High severity",
            severity: alert.alert_severity,
            status: alert.alert_status,
          }))}
        />
      </section>
    </div>
  );
}