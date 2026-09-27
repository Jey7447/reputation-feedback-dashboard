"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("dashboard-sidebar-collapsed") === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem("dashboard-sidebar-collapsed", String(next));
      return next;
    });
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside className={`relative hidden min-h-screen shrink-0 flex-col border-r border-slate-200 bg-white p-4 transition-[width] duration-200 lg:flex ${collapsed ? "w-24" : "w-72"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} px-2 py-3`}>
          <Link href="/dashboard" aria-label="144 Auto Repair dashboard" className="block min-w-0">
            <img
              src="https://raw.githubusercontent.com/Jey7447/reputation-feedback-dashboard/main/public/144-auto-repair-logo.webp"
              alt="144 Auto Repair"
              width={collapsed ? 64 : 190}
              height={collapsed ? 48 : 116}
              className={collapsed ? "h-12 w-16 object-contain" : "h-auto w-[190px] max-w-full"}
            />
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
            title={collapsed ? "Show sidebar" : "Hide sidebar"}
            className="absolute right-2 top-5 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="mt-5 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition ${collapsed ? "justify-center" : "gap-3"} ${isActive(link.href) ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
            >
              <span className="text-base">{link.label === "Overview" ? "⌂" : link.label === "Feedback" ? "▤" : link.label === "Manager Alerts" ? "!" : "✉"}</span>
              {!collapsed && <span className="min-w-0 truncate">{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={`mt-auto border-t border-slate-100 pt-4 ${collapsed ? "flex justify-center" : ""}`}>
          <SignOutButton />
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="min-w-0 flex-1">
            <img src="https://raw.githubusercontent.com/Jey7447/reputation-feedback-dashboard/main/public/144-auto-repair-logo.webp" alt="144 Auto Repair" width={150} height={92} className="h-12 w-auto max-w-full object-contain object-left sm:h-14" />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <span className="text-xl leading-none">{mobileOpen ? "×" : "☰"}</span>
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 pb-1 pt-3">
            <nav className="grid gap-1 sm:grid-cols-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
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