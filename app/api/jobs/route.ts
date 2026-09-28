import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type FeedbackRequestRelation =
  | { status: string; sent_at: string | null }
  | { status: string; sent_at: string | null }[]
  | null;

type JobRow = {
  id: string;
  job_reference: string;
  completed_at: string | null;
  customers: { full_name: string; email: string | null; phone: string | null };
  locations: { name: string };
  feedback_requests: FeedbackRequestRelation;
};

function getFeedbackRequest(request: FeedbackRequestRelation) {
  if (!request) return null;
  return Array.isArray(request) ? request[0] ?? null : request;
}

export async function GET() {
  try {
    const { supabase, response } = await requireAuthenticatedUser();
    if (response) return response;

    const { data, error } = await supabase
      .from("visits")
      .select("id, job_reference, completed_at, customers!inner(full_name, email, phone), locations!inner(name), feedback_requests(status, sent_at)")
      .order("completed_at", { ascending: false, nullsFirst: true })
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const jobs = ((data ?? []) as unknown as JobRow[]).map((job) => {
      const feedbackRequest = getFeedbackRequest(job.feedback_requests);

      return {
        id: job.id,
        job_reference: job.job_reference,
        completed_at: job.completed_at,
        customer_name: job.customers.full_name,
        customer_email: job.customers.email,
        customer_phone: job.customers.phone,
        location_name: job.locations.name,
        feedback_status: feedbackRequest?.status ?? "not_created",
        feedback_sent_at: feedbackRequest?.sent_at ?? null,
      };
    });

    return NextResponse.json({ data: jobs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load jobs." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, response } = await requireAuthenticatedUser();
    if (response) return response;

    const body = await request.json();
    const visitId = typeof body.visitId === "string" ? body.visitId : "";

    if (!visitId) {
      return NextResponse.json({ error: "A visit ID is required." }, { status: 400 });
    }

    const { data: visit, error: visitError } = await supabase
      .from("visits")
      .select("id, job_reference, completed_at, customers!inner(full_name, email, phone)")
      .eq("id", visitId)
      .maybeSingle();

    if (visitError) return NextResponse.json({ error: visitError.message }, { status: 400 });
    if (!visit) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    const customer = Array.isArray(visit.customers) ? visit.customers[0] : visit.customers;

    if (!customer?.email && !customer?.phone) {
      return NextResponse.json(
        { error: "This customer has no email address or phone number for a feedback request." },
        { status: 400 },
      );
    }

    if (visit.completed_at) {
      return NextResponse.json({
        data: {
          visit_id: visit.id,
          job_reference: visit.job_reference,
          completed_at: visit.completed_at,
          already_completed: true,
          feedback_request_created: false,
          message: "This job is already marked as completed.",
        },
      });
    }

    const { data: completion, error: completionError } = await supabase.rpc("mark_visit_completed", {
      p_visit_id: visit.id,
    });

    if (completionError) {
      return NextResponse.json({ error: completionError.message }, { status: 400 });
    }

    const completed = Array.isArray(completion) ? completion[0] : completion;

    const { data: feedbackRequest, error: feedbackRequestError } = await supabase
      .from("feedback_requests")
      .select("id, status, channel")
      .eq("visit_id", completed.visit_id)
      .maybeSingle();

    if (feedbackRequestError) {
      return NextResponse.json(
        { error: "The job was completed, but the feedback request could not be confirmed." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        visit_id: completed.visit_id,
        job_reference: completed.job_reference,
        completed_at: completed.completed_at,
        already_completed: false,
        feedback_request_created: Boolean(feedbackRequest),
        feedback_request_status: feedbackRequest?.status ?? null,
        feedback_request_channel: feedbackRequest?.channel ?? null,
        message: feedbackRequest
          ? "Job completed and feedback request queued."
          : "Job completed. No feedback request was created because no customer contact method was available.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete the job." },
      { status: 500 },
    );
  }
}
