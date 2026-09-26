import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardAlert = {
  alert_id: string;
  feedback_id: string;
  alert_type: string;
  alert_severity: string;
  alert_status: string;
  customer_name: string;
  job_reference: string;
  location_name: string;
  overall_rating: number;
  sentiment: string | null;
  feedback_severity: string | null;
  severity_score: number | null;
  routing_status: string;
  response_review_status: string | null;
  alert_created_at: string;
};

export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("manager_alerts_dashboard")
    .select(
      "alert_id,feedback_id,alert_type,alert_severity,alert_status,customer_name,job_reference,location_name,overall_rating,sentiment,feedback_severity,severity_score,routing_status,response_review_status,alert_created_at"
    )
    .order("alert_created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DashboardAlert[];
}