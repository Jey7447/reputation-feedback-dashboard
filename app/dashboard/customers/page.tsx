"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type Job = {
  id: string;
  job_reference: string;
  completed_at: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  location_name: string;
  feedback_status: string;
};

type LocationOption = {
  id: string;
  name: string;
};

const feedbackStyles: Record<string, string> = {
  sent: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  not_created: "bg-slate-100 text-slate-600",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [locationId, setLocationId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingJobFor, setCreatingJobFor] = useState("");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [customersResponse, jobsResponse] = await Promise.all([
        fetch("/api/customers", { cache: "no-store" }),
        fetch("/api/jobs", { cache: "no-store" }),
      ]);

      const customersResult = await customersResponse.json();
      const jobsResult = await jobsResponse.json();

      if (!customersResponse.ok) {
        throw new Error(customersResult.error || "Unable to load customers.");
      }

      if (!jobsResponse.ok) {
        throw new Error(jobsResult.error || "Unable to load jobs.");
      }

      setCustomers(customersResult.data ?? []);
      setJobs(jobsResult.data ?? []);
      setLocations(jobsResult.locations ?? []);

      if (!locationId && jobsResult.locations?.length === 1) {
        setLocationId(jobsResult.locations[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers and jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createJob(customerId: string, selectedLocationId: string) {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        locationId: selectedLocationId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to create job.");
    }

    return result;
  }

  async function registerCustomerAndJob(event: FormEvent<HTMLFormElement>) {
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

    if (!locationId) {
      setError("Select a service location so the customer's first job can be created.");
      return;
    }

    setSaving(true);

    try {
      const customerResponse = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
        }),
      });

      const customerResult = await customerResponse.json();

      if (!customerResponse.ok) {
        throw new Error(customerResult.error || "Unable to register customer.");
      }

      const customer = customerResult.data as Customer;
      const jobResult = await createJob(customer.id, locationId);

      setMessage(
        customerResult.existing
          ? `Existing customer found. Job ${jobResult.data?.job_reference ?? "created"} was created successfully.`
          : `Customer registered and job ${jobResult.data?.job_reference ?? "created"} was created successfully.`,
      );

      setFullName("");
      setEmail("");
      setPhone("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the customer and job.");
    } finally {
      setSaving(false);
    }
  }

  async function createJobForCustomer(customer: Customer) {
    if (!locationId) {
      setError("Select a service location first.");
      return;
    }

    setError("");
    setMessage("");
    setCreatingJobFor(customer.id);

    try {
      const result = await createJob(customer.id, locationId);
      setMessage(`Job ${result.data?.job_reference ?? "created"} created for ${customer.full_name}.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the job.");
    } finally {
      setCreatingJobFor("");
    }
  }

  async function markCompleted(job: Job) {
    const confirmed = window.confirm(
      `Mark job ${job.job_reference} as completed? This will trigger a customer feedback request.`,
    );

    if (!confirmed) return;

    setBusyId(job.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: job.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to complete the job.");
      }

      setMessage(
        result.data?.feedback_triggered
          ? `Job ${job.job_reference} completed. Feedback request automation triggered.`
          : result.data?.message || `Job ${job.job_reference} completed.`,
      );

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete the job.");
      await loadData();
    } finally {
      setBusyId("");
    }
  }

  const visibleCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) =>
      [customer.full_name, customer.email ?? "", customer.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [customerSearch, customers]);

  const visibleJobs = useMemo(() => {
    if (filter === "open") return jobs.filter((job) => !job.completed_at);
    if (filter === "completed") return jobs.filter((job) => Boolean(job.completed_at));
    return jobs;
  }, [filter, jobs]);

  const openCount = jobs.filter((job) => !job.completed_at).length;
  const completedCount = jobs.length - openCount;

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden p-3 sm:p-5 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">Operations</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Customers & Jobs
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Register customers, create their service jobs, and manage previous customers and visits from one place.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Customers</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{customers.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Open jobs</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{openCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Completed</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{completedCount}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
          {message}
        </div>
      )}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">New customer</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Register customer & create first job</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            One form creates the customer and immediately creates their first service job with an automatic JOB reference.
          </p>
        </div>

        <form onSubmit={registerCustomerAndJob} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">First service location</span>
            <select
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={saving || locations.length === 0}
              className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? "Creating customer & job..." : "Create customer & job"}
            </button>

            {locations.length === 0 && !loading && (
              <p className="mt-2 text-xs text-amber-700">No active service locations are available.</p>
            )}
          </div>
        </form>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Customer history</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Previous customers</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search existing customers and create another service job without leaving this page.
            </p>
          </div>

          <input
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:w-72"
          />
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading customers...</p>
        ) : visibleCustomers.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            {customerSearch ? "No customers match your search." : "No customers found."}
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {visibleCustomers.map((customer) => (
              <article key={customer.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">{customer.full_name}</p>
                    <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                      {customer.email && <p className="break-words">{customer.email}</p>}
                      {customer.phone && <p className="break-words">{customer.phone}</p>}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Customer since {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => createJobForCustomer(customer)}
                    disabled={creatingJobFor === customer.id || locations.length === 0}
                    className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingJobFor === customer.id ? "Creating..." : "Create job"}
                  </button>
                </div>

                {creatingJobFor === customer.id && (
                  <p className="mt-2 text-xs text-slate-500">Using the selected service location above.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Service history</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Jobs</h2>
            <p className="mt-1 text-sm text-slate-500">Manage open and completed service visits from the same workspace.</p>
          </div>

          <div className="flex max-w-full flex-wrap gap-2">
            {(["all", "open", "completed"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                  filter === item
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading jobs...</p>
        ) : visibleJobs.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No jobs match this filter.</p>
        ) : (
          <div className="space-y-3">
            {visibleJobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">{job.job_reference}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        job.completed_at
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {job.completed_at ? "Completed" : "Open"}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        feedbackStyles[job.feedback_status] ?? feedbackStyles.not_created
                      }`}>
                        Feedback: {job.feedback_status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-sm font-medium text-slate-800">{job.customer_name}</p>
                    <p className="mt-1 break-words text-sm text-slate-500">
                      {job.location_name}
                      {job.customer_email ? ` · ${job.customer_email}` : ""}
                      {job.customer_phone ? ` · ${job.customer_phone}` : ""}
                    </p>
                    {job.completed_at && (
                      <p className="mt-2 text-xs text-slate-400">
                        Completed {new Date(job.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {job.completed_at ? (
                    <span className="inline-flex shrink-0 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-500">
                      Job completed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markCompleted(job)}
                      disabled={busyId === job.id}
                      className="w-full shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {busyId === job.id ? "Completing..." : "Mark job completed"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
