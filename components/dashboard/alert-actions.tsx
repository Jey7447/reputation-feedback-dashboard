"use client";

import { useState } from "react";

export function AlertActions({ alertId, status, onChanged }: { alertId: string; status: string; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(url: string, body: object) {
    setBusy(true); setError("");
    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update alert.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update alert.");
    } finally { setBusy(false); }
  }

  return (
    <div className="w-full sm:w-auto">
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
        {status === "pending" && (
          <button disabled={busy} onClick={() => run("/api/alerts/acknowledge", { alertId, acknowledgedBy: "Dashboard Manager" })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:w-auto">
            {busy ? "Working..." : "Acknowledge"}
          </button>
        )}
        {status === "acknowledged" && (
          <button disabled={busy} onClick={() => run("/api/alerts/resolve", { alertId })} className="w-full rounded-lg bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:w-auto">
            {busy ? "Working..." : "Resolve"}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-left text-xs text-red-600 sm:max-w-xs sm:text-right">{error}</p>}
    </div>
  );
}