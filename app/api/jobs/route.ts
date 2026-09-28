import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type JobRow = {
  id: string;
  job_reference: string;
  completed_at: string | null;
  customers: { full_name: string; email: string | null; phone: string | null };
  locations: { name: string };
  feedback_requests: { status: string; sent_at: string | null }[] | null;
};

function getFeedbackStatus(requests: JobRow["feedback_requests"]) {
  if (!requests?.length) return "not_created";
  return requests[0]?.status ?? "not_created";
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

    const jobs = ((data ?? []) as unknown as JobRow[]).map((job) => ({
      id: job.id,
      job_reference: job.job_reference,
      completed_at: job.completed_at,
      customer_name: job.customers.full_name,
      customer_email: job.customers.email,
      customer_phone: job.customers.phone,
      location_name: job.locations.name,
      feedback_status: getFeedbackStatus(job.feedback_requests),
      feedback_sent_at: job.feedback_requests?.[0]?.sent_at ?? null,
    }));

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
    const { supabase, response, user } = await requireAuthenticatedUser();
    if (response) return response;

    const body = await request.json();
    const visitId = typeof body.visitId === "string" ? body.visitId : "";

    if (!visitId) {
      return NextResponse.json({ error: "A visit ID is required." }, { status: 400 });
    }

    const { data: visit, error: visitError } = await supabase
      .from("visits")
      .select("id, job_reference, completed_at, customers!inner(full_name, email, phone), locations!inner(name)")
      .eq("id", visitId)
      .maybeSingle();

    if (visitError) return NextResponse.json({ error: visitError.message }, { status: 400 });
    if (!visit) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    const customer = Array.isArray(visit.customers) ? visit.customers[0] : visit.customers;
    const location = Array.isArray(visit.locations) ? visit.locations[0] : visit.locations;

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
          feedback_triggered: false,
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
    const webhookUrl = process.env.N8N_JOB_COMPLETED_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_JOB_COMPLETED_WEBHOOK_SECRET;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          error: "The job was marked completed, but the feedback automation is not configured yet.",
          data: {
            visit_id: completed.visit_id,
            job_reference: completed.job_reference,
            completed_at: completed.completed_at,
            feedback_triggered: false,
          },
        },
        { status: 503 },
      );
    }

    const channel = customer.email ? "email" : "sms";

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookSecret ? { "x-webhook-secret": webhookSecret } : {}),
      },
      body: JSON.stringify({
        visit_id: completed.visit_id,
        job_reference: completed.job_reference,
        completed_at: completed.completed_at,
        channel,
        customer_name: customer.full_name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        location_name: location?.name ?? null,
        triggered_by: user?.email ?? user?.id ?? "authenticated-user",
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        {
          error: "The job was marked completed, but the feedback automation could not be triggered.",
          data: {
            visit_id: completed.visit_id,
            job_reference: completed.job_reference,
            completed_at: completed.completed_at,
            feedback_triggered: false,
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      data: {
        visit_id: completed.visit_id,
        job_reference: completed.job_reference,
        completed_at: completed.completed_at,
        already_completed: false,
        feedback_triggered: true,
        channel,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete the job." },
      { status: 500 },
    );
  }
}
