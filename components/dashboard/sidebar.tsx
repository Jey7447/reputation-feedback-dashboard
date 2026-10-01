"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

const links = [
  { href: "/dashboard", label: "Overview", icon: "home" },
  { href: "/dashboard/customers", label: "Customers & Jobs", icon: "customers" },
  { href: "/dashboard/feedback", label: "Feedback", icon: "feedback" },
  { href: "/dashboard/visualize-data", label: "Visualize Data", icon: "visualize" },
  { href: "/dashboard/alerts", label: "Manager Alerts", icon: "alerts" },
  { href: "/dashboard/responses", label: "Response Queue", icon: "responses" },
] as const;

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  const common = { className: "h-[18px] w-[18px] shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home") return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></svg>;
  if (name === "customers") return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3.1 2.5-4.5 5.5-4.5s4.8 1.4 5.5 4.5" /><path d="M16 5.5a3 3 0 0 1 0 5.8" /><path d="M18 14.8c1.6.6 2.5 1.9 3 4.2" /></svg>;
  if (name === "feedback") return <svg {...common}><path d="M5 4h14v13H8l-3 3V4Z" /><path d="M8 8h8M8 12h5" /></svg>;
  if (name === "alerts") return <svg {...common}><path d="M12 3 21 20H3L12 3Z" /><path d="M12 9v5M12 17h.01" /></svg>;
  if (name === "visualize") return <svg {...common}><path d="M5 19V9M12 19V5M19 19v-8" /><path d="M3 19h18" /></svg>;
  return <svg {...common}><path d="M4 5h16v14H4z" /><path d="m4 7 8 6 8-6" /></svg>;
}

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

  const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside className={`relative hidden min-h-screen shrink-0 flex-col border-r border-slate-200 bg-white p-4 transition-[width] duration-200 lg:flex ${collapsed ? "w-24" : "w-72"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} px-2 py-3`}>
          <Link href="/dashboard" aria-label="144 Auto Repair — Reputation Intelligence Center" className="block min-w-0">
            <img src="/144-auto-repair-logo.svg" alt="144 Auto Repair" width={collapsed ? 64 : 190} height={collapsed ? 48 : 116} className={collapsed ? "h-12 w-16 object-contain" : "h-auto w-[190px] max-w-full"} />
          </Link>
          <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Show sidebar" : "Hide sidebar"} title={collapsed ? "Show sidebar" : "Hide sidebar"} className="absolute right-2 top-5 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">{collapsed ? "»" : "«"}</button>
        </div>

        {!collapsed && (
          <div className="mb-3 px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">Reputation Intelligence</p>
            <p className="mt-1 text-base font-black tracking-tight text-slate-950">144 AUTO REPAIR</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">Operations Center</p>
          </div>
        )}

        <nav className="mt-2 space-y-1.5">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} title={collapsed ? link.label : undefined} className={`group flex items-center rounded-xl px-3 py-3 text-sm transition ${collapsed ? "justify-center" : "gap-3"} ${active ? "bg-slate-950 font-bold text-white shadow-sm" : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-white/10 text-amber-300" : "bg-slate-50 text-slate-500 group-hover:text-slate-900"}`}><NavIcon name={link.icon} /></span>
                {!collapsed && <span className="min-w-0 truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`mt-auto border-t border-slate-100 pt-4 ${collapsed ? "flex justify-center" : ""}`}>
          {!collapsed && <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Operations</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-700">Multi-location reputation management</p></div>}
          <SignOutButton />
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="min-w-0 flex-1"><img src="/144-auto-repair-logo.svg" alt="144 Auto Repair" width={150} height={92} className="h-12 w-auto max-w-full object-contain object-left sm:h-14" /></Link>
          <button type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"><span className="text-xl leading-none">{mobileOpen ? "×" : "☰"}</span></button>
        </div>

        {mobileOpen && <div className="border-t border-slate-100 pb-1 pt-3"><nav className="grid gap-1 sm:grid-cols-2">{links.map((link) => { const active = isActive(link.href); return <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}><NavIcon name={link.icon} />{link.label}</Link>; })}</nav><div className="mt-2 border-t border-slate-100 pt-2"><SignOutButton /></div></div>}
      </header>
    </>
  );
}
