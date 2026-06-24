"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: "📊", label: "Dashboard", href: "/dashboard" },
  { icon: "🏢", label: "Organization", href: "/organization" },
  { icon: "🗄️", label: "Assets", href: "/assets" },
  { icon: "🔍", label: "Vulnerabilities", href: "/vulnerabilities" },
  { icon: "📋", label: "Audit", href: "/audit" },
  { icon: "📁", label: "Findings", href: "/findings" },
  { icon: "📄", label: "Report", href: "/report" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#0a0f1e] border-r border-[#1e3158] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1e3158]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-sm shadow-lg shadow-sky-500/25">
            🛡️
          </div>
          <div>
            <div className="text-[14px] font-bold text-white">SRMAudit</div>
            <div className="text-[9px] text-slate-500 font-mono">NIST CSF · 2026</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-slate-600 px-3 mb-2">
          Main Menu
        </div>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group
                ${active
                  ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-[#111d35] border border-transparent"
                }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-[#1e3158]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-slate-200 truncate">Auditor</div>
            <div className="text-[10px] text-slate-500 truncate">auditor@test.com</div>
          </div>
          <Link href="/login" className="text-slate-600 hover:text-slate-300 text-sm transition-colors">
            ↩
          </Link>
        </div>
      </div>
    </aside>
  );
}
