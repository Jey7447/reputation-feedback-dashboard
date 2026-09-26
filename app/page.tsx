import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <section className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-2xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Reputation Intelligence
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Feedback Intelligence Engine
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Monitor customer feedback, review AI routing, and manage escalated
            reputation issues from one place.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Open dashboard
        </Link>
      </section>
    </main>
  );
}