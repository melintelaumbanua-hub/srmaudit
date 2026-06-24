"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type ControlStatus = "Compliant" | "Partial" | "Non-Compliant" | "N/A";

const initialFindings = [
  { id: "F-001", severity: "CRITICAL" as Severity, title: "No Multi-Factor Authentication on Admin Panel", desc: "Admin portal accessible with single-factor credentials.", asset: "HR System", control: "PR.AC-7", fn: "Protect", status: "Open" as const },
  { id: "F-002", severity: "HIGH" as Severity, title: "SQL Injection in Employee Search Module", desc: "Input fields unsanitized. Risk of database exfiltration.", asset: "HR Database", control: "SI-10", fn: "Protect", status: "Open" as const },
  { id: "F-003", severity: "HIGH" as Severity, title: "Backup Encryption Not Enforced", desc: "DB backups stored plaintext on cloud storage bucket.", asset: "Cloud Storage", control: "SC-28", fn: "Protect", status: "Open" as const },
  { id: "F-004", severity: "MEDIUM" as Severity, title: "Audit Logging Incomplete", desc: "System access events not captured.", asset: "LMS Website", control: "AU-2", fn: "Detect", status: "Open" as const },
  { id: "F-005", severity: "LOW" as Severity, title: "Outdated TLS 1.0 on Internal API", desc: "TLS 1.0 still enabled. Upgrade to TLS 1.3 required.", asset: "API Server", control: "SC-8", fn: "Protect", status: "Open" as const },
];

const controls = [
  { id: "PR.AC-1", desc: "Identity & credential management", fn: "Protect", fnColor: "text-teal-400", status: "Compliant" as ControlStatus },
  { id: "PR.AC-7", desc: "MFA for critical systems", fn: "Protect", fnColor: "text-teal-400", status: "Non-Compliant" as ControlStatus },
  { id: "DE.AE-1", desc: "Baseline network operations", fn: "Detect", fnColor: "text-yellow-400", status: "Partial" as ControlStatus },
  { id: "RS.RP-1", desc: "Response plan execution", fn: "Respond", fnColor: "text-rose-400", status: "Compliant" as ControlStatus },
  { id: "RC.RP-1", desc: "Recovery plan execution", fn: "Recover", fnColor: "text-sky-400", status: "N/A" as ControlStatus },
  { id: "SC-28", desc: "Protection of data at rest", fn: "Protect", fnColor: "text-teal-400", status: "Non-Compliant" as ControlStatus },
];

const aiResponses: Record<string, string> = {
  default: "I can help you analyze controls, vulnerabilities, or generate findings. What would you like to explore?",
  mfa: "**MFA** adds a second identity layer. For your admin panel (F-001), enabling TOTP or hardware keys mitigates the Critical finding. Estimated fix: 1–2 days.",
  sql: "**SQL Injection** lets attackers steal your entire database by injecting code into search fields. Business impact: full HR data breach, regulatory fines. Fix: parameterized queries + input validation.",
  backup: "Unencrypted backups mean a stolen file = full data exposure. Enable **AES-256 at rest** on your cloud bucket and restrict access via IAM policies. Priority: HIGH.",
  report: "**Executive Summary (Draft):** Audit shows 72% compliance (Needs Improvement). Critical: MFA absence. High: SQL Injection, backup exposure. Recommend immediate remediation within 30 days.",
  xss: "**XSS** injects malicious scripts into your pages. Attackers can steal session cookies or deface the HR portal. Fix: Content Security Policy headers + output encoding.",
};

function getAIResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("mfa") || lower.includes("authentication")) return aiResponses.mfa;
  if (lower.includes("sql") || lower.includes("injection")) return aiResponses.sql;
  if (lower.includes("backup") || lower.includes("encrypt")) return aiResponses.backup;
  if (lower.includes("report") || lower.includes("summary")) return aiResponses.report;
  if (lower.includes("xss") || lower.includes("cross-site")) return aiResponses.xss;
  return aiResponses.default;
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    CRITICAL: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    MEDIUM: "bg-yellow-500/12 text-yellow-400 border-yellow-500/25",
    LOW: "bg-green-500/12 text-green-400 border-green-500/25",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono whitespace-nowrap ${map[severity]}`}>
      {severity}
    </span>
  );
}

function StatusChip({ status }: { status: ControlStatus }) {
  const map: Record<ControlStatus, string> = {
    Compliant: "bg-green-500/12 text-green-400",
    Partial: "bg-yellow-500/12 text-yellow-400",
    "Non-Compliant": "bg-rose-500/12 text-rose-400",
    "N/A": "bg-slate-500/15 text-slate-500",
  };
  const dot: Record<ControlStatus, string> = {
    Compliant: "bg-green-400",
    Partial: "bg-yellow-400",
    "Non-Compliant": "bg-rose-400",
    "N/A": "bg-slate-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

function KpiCard({ label, value, sub, icon, progress, color, delay = 0 }: {
  label: string; value: string; sub: string; icon: string;
  progress: number; color: string; delay?: number;
}) {
  const colors: Record<string, { val: string; bar: string; top: string }> = {
    blue:   { val: "text-sky-300",    bar: "#0ea5e9", top: "#0ea5e9" },
    teal:   { val: "text-teal-400",   bar: "#14b8a6", top: "#14b8a6" },
    orange: { val: "text-orange-400", bar: "#fb923c", top: "#fb923c" },
    red:    { val: "text-rose-400",   bar: "#f43f5e", top: "#f43f5e" },
    green:  { val: "text-green-400",  bar: "#22c55e", top: "#22c55e" },
  };
  const c = colors[color];
  return (
    <div className="relative bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5 overflow-hidden hover:border-[#243d6b] hover:-translate-y-0.5 transition-all" style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[14px]" style={{ background: `linear-gradient(90deg, ${c.top}, transparent)` }} />
      <div className="absolute right-4 top-4 text-xl opacity-10">{icon}</div>
      <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-slate-500 mb-2">{label}</div>
      <div className={`text-[32px] font-bold font-mono leading-none mb-1.5 ${c.val}`}>{value}</div>
      <div className="text-[11px] text-slate-500">{sub}</div>
      <div className="mt-3 h-[3px] bg-[#1e3158] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: c.bar }} />
      </div>
    </div>
  );
}

function RiskMatrix() {
  const matrix = [["C","C","C","C","H"],["C","C","C","H","M"],["C","C","H","M","L"],["C","H","M","L","L"],["H","M","L","L","L"]];
  const cellStyle: Record<string, string> = {
    C: "bg-rose-500/20 border-rose-500/35 text-rose-400",
    H: "bg-orange-500/20 border-orange-500/30 text-orange-400",
    M: "bg-yellow-500/15 border-yellow-500/25 text-yellow-400",
    L: "bg-green-500/12 border-green-500/25 text-green-400",
  };
  return (
    <div className="flex gap-2 items-start">
      <div className="text-[9px] text-slate-600 self-center mr-1" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>LIKELIHOOD ↑</div>
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-1">
          {matrix.map((row, ri) => row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} className={`aspect-square rounded-md border flex items-center justify-center text-[10px] font-bold font-mono cursor-pointer transition-all ${cellStyle[cell]} ${ri===0&&ci===2?"ring-2 ring-rose-400/60 scale-105":""}`}>{cell}</div>
          )))}
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] text-slate-600"><span>1 — Low</span><span>IMPACT →</span><span>5 — High</span></div>
      </div>
    </div>
  );
}

function ComplianceDonut() {
  const pct = 72;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[90px] h-[90px] flex-shrink-0">
        <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="#1e3158" strokeWidth="10" />
          <circle cx="45" cy="45" r={r} fill="none" stroke="#14b8a6" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[18px] font-bold font-mono text-teal-400">{pct}%</div>
          <div className="text-[9px] text-slate-600">Compliant</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {[{ label: "Compliant (14)", color: "bg-green-500" },{ label: "Partial (4)", color: "bg-yellow-500" },{ label: "Non-Compliant (3)", color: "bg-rose-500" },{ label: "N/A (2)", color: "bg-slate-600" }].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 text-[11px] text-slate-400">
            <div className={`w-2 h-2 rounded-sm ${color}`} />{label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[12px] text-slate-300 font-medium">{label}</span>
        <span className="text-[12px] font-mono font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#1e3158] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [findings, setFindings] = useState(initialFindings);
  const [showModal, setShowModal] = useState(false);
  const [newFinding, setNewFinding] = useState({
    title: "", desc: "", asset: "", control: "",
    fn: "Protect", severity: "HIGH" as Severity, assignee: "",
  });
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: "👋 Hello! I'm your AI Audit Assistant. Ask me about vulnerabilities, controls, or generating findings." },
  ]);
  const [aiInput, setAiInput] = useState("");

  function sendAI() {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setAiInput("");
    setTimeout(() => {
      setAiMessages((prev) => [...prev, { role: "ai", text: getAIResponse(userMsg) }]);
    }, 600);
  }

  function addFinding() {
    if (!newFinding.title || !newFinding.asset) return;
    const id = `F-${String(findings.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().slice(0, 10);
    setFindings((prev) => [...prev, { ...newFinding, id, status: "Open" as const, date: today }]);
    setNewFinding({ title: "", desc: "", asset: "", control: "", fn: "Protect", severity: "HIGH", assignee: "" });
    setShowModal(false);
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Audit" }, { label: "Human Resources Audit" }, { label: "Overview" }]} />
        <div className="p-7 flex-1">

          {/* Page Header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">🏢</div>
                <div>
                  <h1 className="text-[22px] font-bold tracking-tight text-white">Human Resources Audit</h1>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">AUDIT-2026-003 · NIST CSF · August 2026</div>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {["Overview", "Audit Type Details", "Scope & Planning", "Audit Results"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all border
                      ${activeTab === tab ? "text-sky-300 bg-sky-500/10 border-sky-500/25" : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-[#111d35]"}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push("/report")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold bg-[#111d35] border border-[#243d6b] text-slate-300 hover:text-white hover:border-sky-500 transition-all">
                📤 Export PDF
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all">
                ➕ New Finding
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <KpiCard label="Progress" value="72%" sub="2,400 of 3,300 pts" icon="📊" progress={72} color="blue" delay={0} />
            <KpiCard label="Unit Projects" value="3" sub="Active projects" icon="📁" progress={85} color="teal" delay={50} />
            <KpiCard label="Actions" value="20" sub="12 pending · 8 closed" icon="⚡" progress={55} color="orange" delay={100} />
            <KpiCard label="Exceedances" value="1" sub="Critical threshold" icon="🚨" progress={20} color="red" delay={150} />
            <KpiCard label="Measures" value="1" sub="KPI tracked" icon="📏" progress={90} color="green" delay={200} />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] hover:border-[#243d6b] transition-all">
              <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#1e3158]">
                <div className="text-[13px] font-semibold text-slate-200">📊 Compliance by NIST CSF Function</div>
                <button onClick={() => router.push("/audit")} className="text-[11px] text-sky-400 font-semibold hover:text-sky-300">View all →</button>
              </div>
              <div className="px-[22px] py-[18px]">
                <ProgressBar label="Identify" value={90} color="#14b8a6" />
                <ProgressBar label="Protect" value={65} color="#0ea5e9" />
                <ProgressBar label="Detect" value={55} color="#fbbf24" />
                <ProgressBar label="Respond" value={80} color="#a78bfa" />
                <ProgressBar label="Recover" value={40} color="#f43f5e" />
              </div>
            </div>
            <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] hover:border-[#243d6b] transition-all">
              <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#1e3158]">
                <div className="text-[13px] font-semibold text-slate-200">🎯 Risk Matrix (5×5)</div>
                <button onClick={() => router.push("/findings")} className="text-[11px] text-sky-400 font-semibold hover:text-sky-300">Details →</button>
              </div>
              <div className="px-[22px] py-[18px]">
                <RiskMatrix />
                <div className="flex gap-4 mt-3 flex-wrap">
                  {[{ label:"Critical (1)",cls:"text-rose-400 bg-rose-500/15 border-rose-500/30"},{ label:"High (3)",cls:"text-orange-400 bg-orange-500/12 border-orange-500/25"},{ label:"Medium (4)",cls:"text-yellow-400 bg-yellow-500/10 border-yellow-500/20"},{ label:"Low (12)",cls:"text-green-400 bg-green-500/10 border-green-500/20"}].map(({ label, cls }) => (
                    <div key={label} className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded border ${cls}`}>{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-[1fr_300px] gap-5 mb-5">
            <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] hover:border-[#243d6b] transition-all">
              <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#1e3158]">
                <div className="text-[13px] font-semibold text-slate-200">🔍 Latest Audit Findings</div>
                <button onClick={() => router.push("/findings")} className="text-[11px] text-sky-400 font-semibold hover:text-sky-300">View all ({findings.length}) →</button>
              </div>
              <div className="px-[22px] py-[14px]">
                {findings.map((f, i) => (
                  <div key={f.id} className={`flex gap-3 py-3.5 items-start ${i < findings.length - 1 ? "border-b border-[#1e3158]" : ""}`}>
                    <SeverityBadge severity={f.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-slate-200 mb-0.5">{f.title}</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</div>
                      <div className="text-[10px] font-mono text-slate-600 mt-1">Asset: {f.asset} · {f.control} · {f.fn}</div>
                    </div>
                    <button onClick={() => router.push("/findings")} className="text-slate-500 hover:text-slate-300 text-sm mt-0.5">›</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] hover:border-[#243d6b] transition-all">
                <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">📈 Compliance Score</div>
                </div>
                <div className="px-[22px] py-[18px]">
                  <ComplianceDonut />
                  <div className="mt-3 p-2.5 bg-yellow-500/8 border border-yellow-500/20 rounded-lg text-[11px] text-yellow-400">⚠️ Needs Improvement — target 85%</div>
                </div>
              </div>
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] hover:border-[#243d6b] transition-all">
                <div className="px-[22px] py-[18px] border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">⚡ Recent Activity</div>
                </div>
                <div className="px-[22px] py-[14px]">
                  {[
                    { dot: "bg-rose-500", text: "F-001 marked Critical", time: "2 mins ago" },
                    { dot: "bg-teal-500", text: "Evidence uploaded for AC-7", time: "18 mins ago" },
                    { dot: "bg-yellow-500", text: "SC-28 marked Partial", time: "1 hr ago" },
                    { dot: "bg-sky-500", text: "AI report draft generated", time: "3 hrs ago" },
                  ].map((act, i) => (
                    <div key={i} className="flex gap-3 py-2.5 border-b border-[#1e3158]/60 last:border-0 items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${act.dot}`} />
                      <div>
                        <div className="text-[12px] text-slate-400">{act.text}</div>
                        <div className="text-[10px] font-mono text-slate-600 mt-0.5">{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] hover:border-[#243d6b] transition-all">
              <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#1e3158]">
                <div className="text-[13px] font-semibold text-slate-200">✅ NIST CSF Control Checklist</div>
                <button onClick={() => router.push("/audit")} className="text-[11px] text-sky-400 font-semibold hover:text-sky-300">Full checklist →</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e3158]">
                    {["Control ID","Description","Function","Status"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-slate-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {controls.map((c) => (
                    <tr key={c.id} className="border-b border-[#1e3158]/50 last:border-0 hover:bg-[#0d1526]/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-sky-300">{c.id}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-300">{c.desc}</td>
                      <td className={`px-4 py-3 text-[11px] font-semibold ${c.fnColor}`}>{c.fn}</td>
                      <td className="px-4 py-3"><StatusChip status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Assistant */}
            <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] flex flex-col">
              <div className="flex items-center gap-3 px-[22px] py-4 border-b border-[#1e3158] bg-gradient-to-r from-sky-500/5 to-teal-500/5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-base">🤖</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-slate-200">AI Audit Assistant</div>
                  <div className="text-[10px] text-slate-500">Audit Advisor Mode</div>
                </div>
                <span className="text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-1 rounded-md">ACTIVE</span>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[240px]" style={{ scrollbarWidth: "thin" }}>
                {aiMessages.map((msg, i) => (
                  <div key={i}
                    className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-[12px] leading-relaxed
                      ${msg.role === "user" ? "ml-auto bg-sky-500/12 border border-sky-500/20 text-slate-200 rounded-br-sm" : "bg-[#132040] border border-[#1e3158] text-slate-300 rounded-bl-sm"}`}
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-300">$1</strong>').replace(/\n/g, "<br/>") }}
                  />
                ))}
              </div>
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {["Explain SQL Injection", "MFA setup guide", "Generate report"].map((p) => (
                  <button key={p} onClick={() => setAiInput(p)}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-[#243d6b] text-slate-500 hover:text-sky-300 hover:border-sky-500/40 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-[#1e3158] flex gap-2">
                <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendAI()}
                  placeholder="Ask about controls, risks, findings..."
                  className="flex-1 bg-[#111d35] border border-[#1e3158] rounded-lg px-3.5 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
                <button onClick={sendAI}
                  className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center text-sm hover:shadow-lg hover:shadow-sky-500/30 transition-all hover:scale-105">
                  ➤
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── NEW FINDING MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1a2e] border border-[#243d6b] rounded-[20px] w-full max-w-[500px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e3158]">
              <div className="text-[15px] font-bold text-white">➕ New Finding</div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 text-xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Finding Title *</label>
                <input value={newFinding.title} onChange={(e) => setNewFinding(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. No MFA on Admin Panel"
                  className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Description</label>
                <textarea value={newFinding.desc} onChange={(e) => setNewFinding(p => ({ ...p, desc: e.target.value }))}
                  placeholder="Describe the issue..." rows={3}
                  className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Affected Asset *</label>
                  <input value={newFinding.asset} onChange={(e) => setNewFinding(p => ({ ...p, asset: e.target.value }))}
                    placeholder="e.g. HR System"
                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Control ID</label>
                  <input value={newFinding.control} onChange={(e) => setNewFinding(p => ({ ...p, control: e.target.value }))}
                    placeholder="e.g. PR.AC-7"
                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Severity</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CRITICAL","HIGH","MEDIUM","LOW"] as Severity[]).map((s) => {
                    const colors: Record<Severity,string> = { CRITICAL:"border-rose-500/40 bg-rose-500/15 text-rose-400", HIGH:"border-orange-500/40 bg-orange-500/15 text-orange-400", MEDIUM:"border-yellow-500/40 bg-yellow-500/12 text-yellow-400", LOW:"border-green-500/40 bg-green-500/12 text-green-400" };
                    return (
                      <button key={s} onClick={() => setNewFinding(p => ({ ...p, severity: s }))}
                        className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${newFinding.severity === s ? colors[s] : "border-[#1e3158] text-slate-600 hover:border-[#243d6b]"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">NIST CSF Function</label>
                <div className="flex gap-2 flex-wrap">
                  {["Identify","Protect","Detect","Respond","Recover"].map((fn) => (
                    <button key={fn} onClick={() => setNewFinding(p => ({ ...p, fn }))}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${newFinding.fn === fn ? "bg-teal-500/12 text-teal-400 border-teal-500/25" : "border-[#1e3158] text-slate-600 hover:text-slate-400"}`}>
                      {fn}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Assign To</label>
                <input value={newFinding.assignee} onChange={(e) => setNewFinding(p => ({ ...p, assignee: e.target.value }))}
                  placeholder="e.g. Ahmad"
                  className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
              </div>
            </div>
            <div className="px-6 pb-5 pt-3 flex gap-2 border-t border-[#1e3158]">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#243d6b] text-slate-400 text-[13px] font-semibold hover:text-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={addFinding} disabled={!newFinding.title || !newFinding.asset}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white text-[13px] font-semibold hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                ➕ Add Finding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}