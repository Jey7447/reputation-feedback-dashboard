type Alert = {
  customer: string;
  job: string;
  type: string;
  severity: string;
  status: string;
};

export function AlertPreview({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex min-w-0 flex-col gap-2 border-b border-slate-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="font-semibold text-slate-950">Manager Alerts</h2>
          <p className="mt-1 text-sm text-slate-500">Issues requiring human attention.</p>
        </div>
        <a href="/dashboard/alerts" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View all
        </a>
      </div>

      <div className="divide-y divide-slate-100">
        {alerts.map((alert) => (
          <div key={alert.job} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="break-words [overflow-wrap:anywhere] font-semibold text-slate-900">{alert.customer}</p>
                <span className="break-words [overflow-wrap:anywhere] text-xs text-slate-400">{alert.job}</span>
              </div>
              <p className="mt-1 break-words text-sm text-slate-500">{alert.type}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {alert.severity}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {alert.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}