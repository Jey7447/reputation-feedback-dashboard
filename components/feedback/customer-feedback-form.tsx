"use client";

import { useEffect, useMemo, useState } from "react";

type FormData = {
  customer_first_name: string;
  location_name: string;
  job_reference: string;
  completed_at: string | null;
  expires_at: string;
  already_submitted: boolean;
  is_expired: boolean;
  is_available: boolean;
};

const ratingLabels = ["1", "2", "3", "4", "5"];

function RatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold text-slate-900">{label}</legend>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {ratingLabels.map((rating) => {
          const number = Number(rating);
          const selected = value === number;

          return (
            <button
              key={rating}
              type="button"
              aria-label={`${label}: ${rating} out of 5`}
              aria-pressed={selected}
              onClick={() => onChange(number)}
              className={`min-h-12 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                selected
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {rating}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>Very poor</span>
        <span>Excellent</span>
      </div>
    </fieldset>
  );
}

export function CustomerFeedbackForm({ token }: { token: string }) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState({
    overall: null as number | null,
    technician: null as number | null,
    facility: null as number | null,
    waitingTime: null as number | null,
  });
  const [category, setCategory] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/feedback/${token}`, { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Unable to load the form.");
        if (!cancelled) setForm(result.data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load the form.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const canSubmit = useMemo(
    () =>
      ratings.overall !== null &&
      ratings.technician !== null &&
      ratings.facility !== null &&
      ratings.waitingTime !== null &&
      !submitting,
    [ratings, submitting],
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please provide all four ratings before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallRating: ratings.overall,
          technicianRating: ratings.technician,
          facilityRating: ratings.facility,
          waitingTimeRating: ratings.waitingTime,
          feedbackCategory: category,
          comments,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "We could not submit your feedback.");

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not submit your feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Loading your feedback form…
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</div>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">144 Auto Repair</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Thank you for your feedback</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600">
            Your feedback has been submitted successfully. It will help us understand your experience and improve our service.
          </p>
        </section>
      </main>
    );
  }

  const unavailable = !form || form.already_submitted || form.is_expired || !form.is_available;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">144 Auto Repair</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">How was your visit?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Your feedback helps us understand what went well and where we can improve.
          </p>
        </header>

        {unavailable ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <h2 className="text-xl font-bold text-slate-950">
              {!form ? "Feedback form unavailable" : form.already_submitted ? "Feedback already submitted" : "Feedback link unavailable"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {!form
                ? "We could not find this feedback request."
                : form.already_submitted
                  ? "This feedback request has already been completed. Thank you."
                  : "This feedback link may have expired or is no longer available."}
            </p>
          </section>
        ) : (
          <>
            <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Service visit</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {form.customer_first_name ? `Hi ${form.customer_first_name},` : "Hello,"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{form.location_name} · Job {form.job_reference}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">1–5 ratings</span>
              </div>
            </section>

            <form onSubmit={submit} className="space-y-4">
              <RatingField label="Overall experience" value={ratings.overall} onChange={(value) => setRatings((current) => ({ ...current, overall: value }))} />
              <RatingField label="Technician service" value={ratings.technician} onChange={(value) => setRatings((current) => ({ ...current, technician: value }))} />
              <RatingField label="Facility" value={ratings.facility} onChange={(value) => setRatings((current) => ({ ...current, facility: value }))} />
              <RatingField label="Waiting time" value={ratings.waitingTime} onChange={(value) => setRatings((current) => ({ ...current, waitingTime: value }))} />

              <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <label htmlFor="category" className="text-sm font-semibold text-slate-900">What best describes your feedback?</label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a category (optional)</option>
                  <option value="service_quality">Service quality</option>
                  <option value="technician">Technician</option>
                  <option value="facility">Facility</option>
                  <option value="waiting_time">Waiting time</option>
                  <option value="communication">Communication</option>
                  <option value="pricing">Pricing</option>
                  <option value="vehicle_issue">Vehicle issue</option>
                  <option value="other">Other</option>
                </select>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <label htmlFor="comments" className="text-sm font-semibold text-slate-900">Tell us more <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  maxLength={2000}
                  rows={6}
                  placeholder="What went well? What could we improve?"
                  className="mt-3 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-2 text-right text-xs text-slate-400">{comments.length}/2000</p>
              </section>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting feedback…" : "Submit feedback"}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                Please review your ratings before submitting. Each feedback request can be submitted once.
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
