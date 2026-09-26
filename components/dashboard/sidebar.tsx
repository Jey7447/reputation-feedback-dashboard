"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: "⌂" },
  { href: "/dashboard/feedback", label: "Feedback", icon: "◉" },
  { href: "/dashboard/alerts", label: "Manager Alerts", icon: "!" },
  { href: "/dashboard/responses", label: "Response Queue", icon: "↗" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
          RI
        </div>
        <div>
          <p className="font-bold text-slate-950">Reputation IQ</p>
          <p className="text-xs text-slate-500">Feedback Intelligence</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
        {navigation.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-slate-100 p-5 lg:block">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            System
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">Automation active</p>
          <p className="mt-1 text-xs text-slate-500">Supabase + n8n</p>
        </div>
      </div>
    </aside>
  );
}