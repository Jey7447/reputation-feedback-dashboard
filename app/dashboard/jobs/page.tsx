"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Job = {
  id: string;
  job_reference: string;
  completed_at: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  location_name: string;
  feedback_status: string;
  feedback_sent_at: string | null;
};

type CustomerOption = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

type LocationOption = {
  id: string;
  name: string;
};

const filters = ["all", "open", "completed"] as const;

const feedbackStyles: Record<string, string> = {
  sent: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  not_created: "bg-slate-100 text-slate-600",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [jobReference, setJobReference] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/jobs", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load jobs.");
      setJobs(result.data ?? []);
      setCustomers(result.customers ?? []);
      setLocations(result.locations ?? []);
      if (!locationId && result.locations?.length === 1) {
        setLocationId(result.locations[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!customerId || !locationId || !jobReference.trim()) {
      setError("Customer, location, and job reference are required.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          locationId,
          jobReference: jobReference.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to create job.");
      }

      setMessage(`Job ${jobReference.trim()} created successfully.`);
      setJobReference("");
      setCustomerId("");
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create job.");
    } finally {
      setCreating(false);
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

      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete the job.");
      await loadJobs();
    } finally {
      setBusyId("");
    }
  }

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
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Jobs</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Create service visits and mark completed jobs to trigger customer feedback requests.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{openCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{completedCount}</p>
          </div>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">Create new job</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Select an existing customer and service location, then assign a unique job reference.
          </p>
        </div>

        <form onSubmit={createJob} className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Customer</span>
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}{customer.email ? ` — ${customer.email}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Location</span>
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

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Job reference</span>
            <input
              value={jobReference}
              onChange={(event) => setJobReference(event.target.value)}
              maxLength={100}
              required
              placeholder="e.g. JOB-2026-001"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </label>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={creating || customers.length === 0 || locations.length === 0}
              className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {creating ? "Creating..." : "Create job"}
            </button>
            {customers.length === 0 && !loading && (
              <p className="mt-2 text-xs text-amber-700">Register a customer before creating a job.</p>
            )}
            {locations.length === 0 && !loading && (
              <p className="mt-2 text-xs text-amber-700">No active service locations are available.</p>
            )}
          </div>
        </form>
      </section>

      <div className="mb-5 flex max-w-full flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              filter === item
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}
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

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading jobs...
        </div>
      ) : visibleJobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No jobs match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-950">{job.job_reference}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        job.completed_at
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {job.completed_at ? "Completed" : "Open"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        feedbackStyles[job.feedback_status] ?? feedbackStyles.not_created
                      }`}
                    >
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

                <div className="shrink-0">
                  {job.completed_at ? (
                    <span className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
                      Job completed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markCompleted(job)}
                      disabled={busyId === job.id}
                      className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {busyId === job.id ? "Completing..." : "Mark job completed"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
