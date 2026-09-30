"use client";

import { FormEvent, useEffect, useState } from "react";

type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/customers", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load customers.");
      }

      setCustomers(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function registerCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!fullName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError("Enter an email address or phone number.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to register customer.");
      }

      setMessage(result.message);
      setFullName("");
      setEmail("");
      setPhone("");
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden p-3 sm:p-5 md:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">
          Operations
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Customers
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Register customer contact details so their service visits and feedback requests can be managed from the dashboard.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">Register new customer</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Name is required. Add at least an email address or phone number.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">
              {message}
            </div>
          )}

          <form onSubmit={registerCustomer} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                maxLength={120}
                required
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone number</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={40}
                placeholder="+234 800 000 0000"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Registering..." : "Register customer"}
            </button>
          </form>
        </section>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recent customers</h2>
              <p className="mt-1 text-sm text-slate-500">The latest 50 customer records.</p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {customers.length}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading customers...</p>
          ) : customers.length === 0 ? (
            <p className="text-sm text-slate-500">No customers found.</p>
          ) : (
            <div className="space-y-3">
              {customers.map((customer) => (
                <article
                  key={customer.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-950">{customer.full_name}</p>
                  <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                    {customer.email && <p className="break-words">{customer.email}</p>}
                    {customer.phone && <p className="break-words">{customer.phone}</p>}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Registered {new Date(customer.created_at).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
