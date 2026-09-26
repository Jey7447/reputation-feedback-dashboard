import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alertId = body.alertId as string;
    const acknowledgedBy = body.acknowledgedBy as string;

    if (!alertId || !acknowledgedBy) {
      return NextResponse.json({ error: "alertId and acknowledgedBy are required." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
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