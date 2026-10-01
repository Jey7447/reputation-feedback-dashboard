import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const { supabase, response } = await requireAuthenticatedUser();
    if (response) return response;

    const { data, error } = await supabase
      .from("manager_alerts_dashboard")
      .select("*")
      .order("alert_created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: locations, error: locationsError } = await supabase
      .from("locations")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (locationsError) return NextResponse.json({ error: locationsError.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [], locations: (locations ?? []).map((item) => item.name) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load alerts." },
      { status: 500 },
    );
  }
}
