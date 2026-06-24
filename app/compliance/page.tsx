"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type CSFFunction = "Identify" | "Protect" | "Detect" | "Respond" | "Recover";
type Status = "Compliant" | "Partial" | "Non-Compliant" | "N/A";

interface Control {
  id: string;
  function: CSFFunction;
  description: string;
  status: Status;
}

const controls: Control[] = [
  { id: "ID.AM-1", function: "Identify", description: "Asset inventory maintained", status: "Compliant" },
  { id: "ID.AM-2", function: "Identify", description: "Software platforms inventoried", status: "Partial" },
  { id: "ID.RA-1", function: "Identify", description: "Vulnerabilities identified", status: "Non-Compliant" },
  { id: "ID.GV-1", function: "Identify", description: "Cybersecurity policy established", status: "Compliant" },
  { id: "PR.AC-1", function: "Protect", description: "Identity & credential management", status: "Compliant" },
  { id: "PR.AC-3", function: "Protect", description: "MFA for remote access", status: "Non-Compliant" },
  { id: "PR.AC-4", function: "Protect", description: "Least privilege access", status: "Partial" },
  { id: "PR.DS-1", function: "Protect", description: "Data-at-rest protection", status: "Non-Compliant" },
  { id: "PR.DS-2", function: "Protect", description: "Data-in-transit protection", status: "Compliant" },
  { id: "PR.IP-1", function: "Protect", description: "Secure configuration baseline", status: "Partial" },
  { id: "PR.IP-4", function: "Protect", description: "Backup management", status: "Non-Compliant" },
  { id: "PR.MA-1", function: "Protect", description: "Patch management", status: "Partial" },
  { id: "DE.AE-1", function: "Detect", description: "Network baseline monitoring", status: "Partial" },
  { id: "DE.CM-1", function: "Detect", description: "Network monitoring (IDS/SIEM)", status: "Non-Compliant" },
  { id: "DE.CM-3", function: "Detect", description: "Personnel activity logging", status: "Compliant" },
  { id: "DE.DP-1", function: "Detect", description: "Detection roles defined", status: "Compliant" },
  { id: "RS.RP-1", function: "Respond", description: "Incident response plan", status: "Compliant" },
  { id: "RS.CO-1", function: "Respond", description: "IR communication plan", status: "Partial" },
  { id: "RS.AN-1", function: "Respond", description: "Alert investigation process", status: "Non-Compliant" },
  { id: "RC.RP-1", function: "Recover", description: "BCP/DR plan documented", status: "Partial" },
  { id: "RC.IM-1", function: "Recover", description: "Post-incident improvements", status: "N/A" },
  { id: "RC.CO-1", function: "Recover", description: "Stakeholder communication", status: "N/A" },
];

const fnConfig: Record<CSFFunction, { color: string; bg: string; border: string; bar: string }> = {
  Identify: { color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/25",    bar: "#0ea5e9" },
  Protect:  { color: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/25",   bar: "#14b8a6" },
  Detect:   { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25", bar: "#fbbf24" },
  Respond:  { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25", bar: "#fb923c" },
  Recover:  { color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/25",   bar: "#f43f5e" },
};

const statusConfig: Record<Status, { color: string; bg: string; border: string; dot: string; score: number }> = {
  "Compliant":     { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/25",  dot: "bg-green-400",  score: 1 },
  "Partial":       { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25", dot: "bg-yellow-400", score: 0.5 },
  "Non-Compliant": { color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/25",   dot: "bg-rose-400",   score: 0 },
  "N/A":           { color: "text-slate-500",  bg: "bg-slate-500/10",  border: "border-slate-500/20",  dot: "bg-slate-500",  score: 0 },
};

const functions: CSFFunction[] = ["Identify", "Protect", "Detect", "Respond", "Recover"];

function calcFnScore(fn: CSFFunction, list: Control[]) {
  const items = list.filter((c) => c.function === fn && c.status !== "N/A");
  if (!items.length) return { pct: 0, compliant: 0, partial: 0, nonCompliant: 0, total: 0 };
  const compliant = items.filter((c) => c.status === "Compliant").length;
  const partial = items.filter((c) => c.status === "Partial").length;
  const nonCompliant = items.filter((c) => c.status === "Non-Compliant").length;
  const score = items.reduce((s, c) => s + statusConfig[c.status].score, 0);
  return { pct: Math.round((score / items.length) * 100), compliant, partial, nonCompliant, total: items.length };
}

function getVerdict(pct: number) {
  if (pct >= 85) return { label: "Compliant", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: "✅" };
  if (pct >= 60) return { label: "Needs Improvement", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "⚠️" };
  return { label: "Non-Compliant", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: "❌" };
}

export default function ComplianceScorePage() {
  const [list, setList] = useState<Control[]>(controls);
  const [selectedFn, setSelectedFn] = useState<CSFFunction | "All">("All");

  const applicable = list.filter((c) => c.status !== "N/A");
  const totalScore = applicable.reduce((s, c) => s + statusConfig[c.status].score, 0);
  const overallPct = applicable.length ? Math.round((totalScore / applicable.length) * 100) : 0;
  const verdict = getVerdict(overallPct);

  const compliantCount = list.filter((c) => c.status === "Compliant").length;
  const partialCount = list.filter((c) => c.status === "Partial").length;
  const nonCompliantCount = list.filter((c) => c.status === "Non-Compliant").length;

  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - overallPct / 100);

  const filtered = selectedFn === "All" ? list : list.filter((c) => c.function === selectedFn);

  function updateStatus(id: string, status: Status) {
    setList((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Audit" }, { label: "Compliance Score" }]} />
        <div className="p-7 flex-1">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-teal-500 to-sky-600 flex items-center justify-center text-xl shadow-lg shadow-teal-500/20">📈</div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-white">Compliance Score</h1>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">MODULE 8 · Compliance % = Compliant ÷ Applicable × 100</div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_340px] gap-6">
            {/* LEFT */}
            <div className="space-y-5">
              {/* Function breakdown */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-6 py-4 border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">📊 Score by NIST CSF Function</div>
                </div>
                <div className="p-6 space-y-5">
                  {functions.map((fn) => {
                    const s = calcFnScore(fn, list);
                    const cfg = fnConfig[fn];
                    return (
                      <div key={fn}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[12px] font-bold ${cfg.color}`}>{fn}</span>
                            <span className="text-[10px] text-slate-500">{s.compliant}/{s.total} compliant</span>
                          </div>
                          <span className={`font-mono text-[16px] font-bold ${cfg.color}`}>{s.pct}%</span>
                        </div>
                        <div className="h-3 bg-[#1e3158] rounded-full overflow-hidden flex">
                          <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${s.total ? (s.compliant/s.total)*100 : 0}%` }} />
                          <div className="h-full bg-yellow-500 transition-all duration-700" style={{ width: `${s.total ? (s.partial/s.total)*100 : 0}%` }} />
                          <div className="h-full bg-rose-500 transition-all duration-700" style={{ width: `${s.total ? (s.nonCompliant/s.total)*100 : 0}%` }} />
                        </div>
                        <div className="flex gap-4 mt-1.5 text-[9px] text-slate-500 font-mono">
                          <span className="text-green-400">{s.compliant} compliant</span>
                          <span className="text-yellow-400">{s.partial} partial</span>
                          <span className="text-rose-400">{s.nonCompliant} non-compliant</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Control list */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-6 py-4 border-b border-[#1e3158] flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-slate-200">🔧 Control Status ({filtered.length})</div>
                  <div className="flex gap-1">
                    {(["All", ...functions] as const).map((fn) => (
                      <button key={fn} onClick={() => setSelectedFn(fn as CSFFunction | "All")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all
                          ${selectedFn === fn
                            ? fn === "All" ? "bg-sky-500/10 border-sky-500/25 text-sky-300"
                              : `${fnConfig[fn as CSFFunction].bg} ${fnConfig[fn as CSFFunction].border} ${fnConfig[fn as CSFFunction].color}`
                            : "bg-[#111d35] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                        {fn === "All" ? "All" : fn.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-[#1e3158]/50">
                  {filtered.map((ctrl) => {
                    const sCfg = statusConfig[ctrl.status];
                    const fCfg = fnConfig[ctrl.function];
                    return (
                      <div key={ctrl.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-[#0d1526]/40 transition-colors">
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${fCfg.bg} ${fCfg.color} flex-shrink-0`}>
                          {ctrl.function.slice(0, 3).toUpperCase()}
                        </span>
                        <span className="font-mono text-[11px] text-sky-300 flex-shrink-0 w-[80px]">{ctrl.id}</span>
                        <span className="text-[12px] text-slate-300 flex-1">{ctrl.description}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          {(["Compliant", "Partial", "Non-Compliant", "N/A"] as Status[]).map((s) => {
                            const sc = statusConfig[s];
                            return (
                              <button key={s} onClick={() => updateStatus(ctrl.id, s)}
                                className={`px-2 py-1 rounded-lg text-[9px] font-semibold border transition-all
                                  ${ctrl.status === s ? `${sc.bg} ${sc.border} ${sc.color}` : "bg-[#111d35] border-[#1e3158] text-slate-600 hover:text-slate-400"}`}>
                                {s === "Non-Compliant" ? "Non-C" : s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {/* Big donut */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-6">
                <div className="text-[13px] font-semibold text-slate-200 mb-5">🎯 Overall Compliance</div>
                <div className="flex flex-col items-center">
                  <div className="relative w-[140px] h-[140px] mb-5">
                    <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                      <circle cx="70" cy="70" r={r} fill="none" stroke="#1e3158" strokeWidth="14" />
                      <circle cx="70" cy="70" r={r} fill="none"
                        stroke={overallPct >= 85 ? "#22c55e" : overallPct >= 60 ? "#fbbf24" : "#f43f5e"}
                        strokeWidth="14" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`text-[32px] font-bold font-mono ${verdict.color}`}>{overallPct}%</div>
                      <div className="text-[9px] text-slate-500">Compliance</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${verdict.bg} ${verdict.border} mb-4`}>
                    <span className="text-lg">{verdict.icon}</span>
                    <span className={`text-[13px] font-bold ${verdict.color}`}>{verdict.label}</span>
                  </div>
                  <div className="w-full space-y-2">
                    {[
                      { label: "Compliant", value: compliantCount, color: "bg-green-400" },
                      { label: "Partial", value: partialCount, color: "bg-yellow-400" },
                      { label: "Non-Compliant", value: nonCompliantCount, color: "bg-rose-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${color}`} />
                          <span className="text-slate-400">{label}</span>
                        </div>
                        <span className="font-mono font-semibold text-slate-300">{value} / {list.filter(c => c.status !== "N/A").length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formula */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5">
                <div className="text-[12px] font-semibold text-slate-200 mb-3">🧮 Formula</div>
                <div className="bg-[#111d35] border border-[#1e3158] rounded-xl p-4 text-center mb-3">
                  <div className="text-[13px] font-bold font-mono text-teal-300">Compliance %</div>
                  <div className="text-[11px] text-slate-500 mt-1">= (Compliant ÷ Applicable) × 100</div>
                  <div className="text-[10px] text-slate-600 mt-1">Partial = 0.5 weight · N/A excluded</div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { range: "≥ 85%", label: "Compliant", color: "text-green-400" },
                    { range: "60–84%", label: "Needs Improvement", color: "text-yellow-400" },
                    { range: "< 60%", label: "Non-Compliant", color: "text-rose-400" },
                  ].map(({ range, label, color }) => (
                    <div key={range} className="flex justify-between text-[11px]">
                      <span className="font-mono text-slate-500">{range}</span>
                      <span className={`font-semibold ${color}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="bg-teal-500/5 border border-teal-500/20 rounded-[14px] p-4">
                <div className="text-[11px] font-semibold text-teal-300 mb-1">💡 Tip</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Update control statuses inline. Score recalculates in real-time. Target 85%+ for a passing audit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
