"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: "📊", label: "Dashboard" },
      { href: "/organization", icon: "🏢", label: "Organization" },
      { icon: "📈", label: "Compliance Score", href: "/compliance" },
      { icon: "🤖", label: "AI Assistant",      href: "/ai-assistant" },
      { icon: "📄", label: "Report Generator",  href: "/report" },
    ],
  },
  {
    label: "Risk Assessment",
    items: [
      { href: "/assets", icon: "📦", label: "Asset Inventory" },
      { href: "/vulnerabilities", icon: "⚠️", label: "Threats & Vuln", badge: "7", badgeColor: "red" },
      
    ],
  },
  {
    label: "Security Audit",
    items: [
      { href: "/audit", icon: "✅", label: "Audit Checklist" },
      { href: "/evidence", icon: "📎", label: "Evidence", badge: "3", badgeColor: "blue" },
      { href: "/findings", icon: "🔍", label: "Audit Findings" },
      { href: "/compliance", icon: "📈", label: "Compliance Score" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/ai-assistant", icon: "🤖", label: "AI Assistant" },
      { href: "/report", icon: "📄", label: "Report Generator" },
      { href: "/users", icon: "👥", label: "User Management" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[240px] bg-[#0d1526] border-r border-[#1e3158] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#1e3158] flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-lg">
          🛡️
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight text-white">SRMAudit</div>
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">GRC Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
        {navGroups.map((group) => (
          <div key={group.label} className="px-3 pt-4 pb-1">
            <div className="text-[9px] font-semibold tracking-[2px] uppercase text-slate-600 px-2 mb-1.5">
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium mb-0.5 transition-all
                    ${isActive
                      ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#111d35] border border-transparent"
                    }`}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      ${item.badgeColor === "red"
                        ? "bg-rose-500 text-white"
                        : "bg-sky-500/20 text-sky-300"
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#1e3158]">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#111d35] cursor-pointer hover:bg-[#132040] transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[13px] font-bold text-white">
            SA
          </div>
          <div>
            <div className="text-[12px] font-semibold text-slate-200">Senior Auditor</div>
            <div className="text-[10px] text-slate-500">Admin · NIST CSF</div>
          </div>
          <span className="ml-auto text-slate-500 text-sm">⚙️</span>
        </div>
      </div>
    </aside>
  );
}