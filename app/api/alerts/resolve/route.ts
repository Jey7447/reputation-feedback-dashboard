import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alertId = body.alertId as string;

    if (!alertId) {
      return NextResponse.json({ error: "alertId is required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("resolve_manager_alert", {
      p_alert_id: alertId,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}