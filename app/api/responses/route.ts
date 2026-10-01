import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const { supabase, response } = await requireAuthenticatedUser();
    if (response) return response;

    const { data: responses, error } = await supabase
      .from("feedback_responses")
      .select("id, feedback_id, response_draft, review_status, final_response, review_notes, reviewed_at, created_at")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const feedbackIds = (responses ?? []).map((item) => item.feedback_id);
    const { data: feedbackRows, error: feedbackError } = feedbackIds.length
      ? await supabase
          .from("feedback")
          .select(
            "id, overall_rating, technician_rating, facility_rating, waiting_time_rating, feedback_category, comments, sentiment, severity, severity_score, confidence_score, routing_status, submitted_at, feedback_requests!inner(visits!inner(job_reference, locations!inner(name)))",
          )
          .in("id", feedbackIds)
      : { data: [], error: null };

    if (feedbackError) return NextResponse.json({ error: feedbackError.message }, { status: 400 });

    const feedbackById = new Map(
      (feedbackRows ?? []).map((item: any) => [
        item.id,
        {
          overall_rating: item.overall_rating,
          technician_rating: item.technician_rating,
          facility_rating: item.facility_rating,
          waiting_time_rating: item.waiting_time_rating,
          feedback_category: item.feedback_category,
          comments: item.comments,
          sentiment: item.sentiment,
          severity: item.severity,
          severity_score: item.severity_score,
          confidence_score: item.confidence_score,
          routing_status: item.routing_status,
          submitted_at: item.submitted_at,
          job_reference: item.feedback_requests?.visits?.job_reference ?? null,
          location_name: item.feedback_requests?.visits?.locations?.name ?? "Unknown location",
        },
      ]),
    );

    const data = (responses ?? []).map((item) => ({
      ...item,
      feedback: feedbackById.get(item.feedback_id) ?? null,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load responses." },
      { status: 500 },
    );
  }
}
