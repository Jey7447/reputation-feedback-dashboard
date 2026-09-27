import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alertId = body.alertId as string;

    if (!alertId) {
      return NextResponse.json({ error: "alertId is required." }, { status: 400 });
    }

    const { supabase, user, response } = await requireAuthenticatedUser();
    if (response) return response;

    const acknowledgedBy =
      user?.email ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      "Authenticated manager";

    const { data, error } = await supabase.rpc("acknowledge_manager_alert", {
      p_alert_id: alertId,
      p_acknowledged_by: acknowledgedBy,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
