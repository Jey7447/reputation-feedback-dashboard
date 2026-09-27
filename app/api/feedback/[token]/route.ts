import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validToken(token: string) {
  return uuidPattern.test(token);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!validToken(token)) {
      return NextResponse.json({ error: "Invalid feedback link." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_feedback_form_by_token", {
      p_token: token,
    });

    if (error) return NextResponse.json({ error: "Unable to load this feedback form." }, { status: 400 });

    const form = Array.isArray(data) ? data[0] : data;

    if (!form) {
      return NextResponse.json({ error: "This feedback link is invalid." }, { status: 404 });
    }

    return NextResponse.json({ data: form });
  } catch {
    return NextResponse.json({ error: "Unable to load this feedback form." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!validToken(token)) {
      return NextResponse.json({ error: "Invalid feedback link." }, { status: 400 });
    }

    const body = await request.json();
    const ratings = [
      body.overallRating,
      body.technicianRating,
      body.facilityRating,
      body.waitingTimeRating,
    ];

    if (ratings.some((value) => typeof value !== "number" || value < 1 || value > 5)) {
      return NextResponse.json({ error: "Please provide a rating from 1 to 5 for every rating." }, { status: 400 });
    }

    const category = typeof body.feedbackCategory === "string" ? body.feedbackCategory : "";
    const comments = typeof body.comments === "string" ? body.comments : "";

    if (comments.length > 2000) {
      return NextResponse.json({ error: "Comments must be 2,000 characters or fewer." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("submit_customer_feedback", {
      p_token: token,
      p_overall_rating: body.overallRating,
      p_technician_rating: body.technicianRating,
      p_facility_rating: body.facilityRating,
      p_waiting_time_rating: body.waitingTimeRating,
      p_feedback_category: category,
      p_comments: comments,
    });

    if (error) {
      const message = error.message.includes("invalid, expired, or has already been used")
        ? "This feedback link is invalid, expired, or has already been used."
        : "We could not submit your feedback. Please try again.";

      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ data: result }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not submit your feedback. Please try again." }, { status: 500 });
  }
}
