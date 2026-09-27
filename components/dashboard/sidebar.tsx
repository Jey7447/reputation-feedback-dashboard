"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/feedback", label: "Feedback" },
  { href: "/dashboard/alerts", label: "Manager Alerts" },
  { href: "/dashboard/responses", label: "Response Queue" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="px-3 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Reputation Intelligence</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Operations</h2>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive(link.href) ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-4">
          <SignOutButton />
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-blue-600 sm:text-xs">Reputation Intelligence</p>
            <p className="font-bold text-slate-950">Operations</p>
          </Link>
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <span className="text-xl leading-none">{open ? "×" : "☰"}</span>
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-100 pb-1 pt-3">
            <nav className="grid gap-1 sm:grid-cols-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold ${isActive(link.href) ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 border-t border-slate-100 pt-2">
              <SignOutButton />
            </div>
          </div>
        )}
      </header>
    </>
  );
}