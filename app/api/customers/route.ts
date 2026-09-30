import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export async function GET() {
  try {
    const { supabase, response } = await requireAuthenticatedUser();
    if (response) return response;

    const { data, error } = await supabase
      .from("customers")
      .select("id, full_name, email, phone, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: (data ?? []) as Customer[] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load customers." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, response } = await requireAuthenticatedUser();
    if (response) return response;

    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!fullName) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Enter an email address or phone number." },
        { status: 400 },
      );
    }

    if (fullName.length > 120) {
      return NextResponse.json({ error: "Customer name is too long." }, { status: 400 });
    }

    if (email.length > 254) {
      return NextResponse.json({ error: "Email address is too long." }, { status: 400 });
    }

    if (phone.length > 40) {
      return NextResponse.json({ error: "Phone number is too long." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("register_customer", {
      p_full_name: fullName,
      p_email: email || null,
      p_phone: phone || null,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Unable to register customer." },
        { status: 400 },
      );
    }

    const customer = Array.isArray(data) ? data[0] : data;

    if (!customer) {
      return NextResponse.json(
        { error: "Customer registration did not return a result." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: customer,
        existing: Boolean(customer.was_existing),
        message: customer.was_existing
          ? "A customer with that email or phone number already exists."
          : "Customer registered successfully.",
      },
      { status: customer.was_existing ? 200 : 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to register customer." },
      { status: 500 },
    );
  }
}
