import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      supabase,
      user: null,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  return { supabase, user: data.user, response: null };
}
