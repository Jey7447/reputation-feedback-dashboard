import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: responses, error } = await supabase
      .from("feedback_responses")
      .select("id, feedback_id, response_draft, review_status, final_response, review_notes, reviewed_at, created_at")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const feedbackIds = (responses ?? []).map((item) => item.feedback_id);

    const { data: feedbackRows, error: feedbackError } = feedbackIds.length
      ? await supabase
          .from("feedback")
          .select("id, overall_rating, technician_rating, facility_rating, waiting_time_rating, feedback_category, comments, sentiment, severity, severity_score, confidence_score, routing_status, submitted_at")
          .in("id", feedbackIds)
      : { data: [], error: null };

    if (feedbackError) {
      return NextResponse.json({ error: feedbackError.message }, { status: 400 });
    }

    const feedbackById = new Map((feedbackRows ?? []).map((item) => [item.id, item]));

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