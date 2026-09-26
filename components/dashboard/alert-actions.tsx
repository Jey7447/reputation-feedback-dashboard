"use client";

import { useState } from "react";

export function AlertActions({
  alertId,
  status,
  onChanged,
}: {
  alertId: string;
  status: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function acknowledge() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, acknowledgedBy: "Dashboard Manager" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to acknowledge alert.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to acknowledge alert.");
    } finally {
      setBusy(false);
    }
  }

  async function resolve() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to resolve alert.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resolve alert.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {status === "pending" && (
          <button disabled={busy} onClick={acknowledge} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {busy ? "Working..." : "Acknowledge"}
          </button>
        )}
        {status === "acknowledged" && (
          <button disabled={busy} onClick={resolve} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            {busy ? "Working..." : "Resolve"}
          </button>
        )}
      </div>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}