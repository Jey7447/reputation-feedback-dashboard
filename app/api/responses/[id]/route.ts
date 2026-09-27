import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["pending_review", "approved", "rejected", "sent"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const reviewStatus = body.reviewStatus as string;
    const finalResponse = typeof body.finalResponse === "string" ? body.finalResponse.trim() : null;
    const reviewNotes = typeof body.reviewNotes === "string" ? body.reviewNotes.trim() : null;

    if (!allowedStatuses.has(reviewStatus)) {
      return NextResponse.json({ error: "Invalid review status." }, { status: 400 });
    }

    if (reviewStatus === "approved" && !finalResponse) {
      return NextResponse.json({ error: "An approved response must contain a final response." }, { status: 400 });
    }

    if (reviewStatus === "rejected" && !reviewNotes) {
      return NextResponse.json({ error: "Please add a review note when rejecting a draft." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("feedback_responses")
      .update({
        review_status: reviewStatus,
        final_response: reviewStatus === "approved" ? finalResponse : null,
        review_notes: reviewNotes,
        reviewed_at: reviewStatus === "pending_review" ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, feedback_id, response_draft, review_status, final_response, review_notes, reviewed_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update response." },
      { status: 500 },
    );
  }
}