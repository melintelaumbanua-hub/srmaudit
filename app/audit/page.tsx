"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type ComplianceStatus = "Compliant" | "Partial" | "Non-Compliant" | "N/A";
type CSFFunction = "Identify" | "Protect" | "Detect" | "Respond" | "Recover";

interface ChecklistItem {
  id: string;
  controlId: string;
  function: CSFFunction;
  category: string;
  description: string;
  auditQuestion: string;
  status: ComplianceStatus;
  evidence: string;
  notes: string;
}

const statusConfig: Record<ComplianceStatus, { color: string; bg: string; border: string; dot: string }> = {
  Compliant:       { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30",  dot: "bg-green-400" },
  Partial:         { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  "Non-Compliant": { color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/30",   dot: "bg-rose-400" },
  "N/A":           { color: "text-slate-500",  bg: "bg-slate-500/10",  border: "border-slate-500/25",  dot: "bg-slate-500" },
};

const fnConfig: Record<CSFFunction, { color: string; bg: string }> = {
  Identify: { color: "text-sky-400",    bg: "bg-sky-500/10" },
  Protect:  { color: "text-teal-400",   bg: "bg-teal-500/10" },
  Detect:   { color: "text-yellow-400", bg: "bg-yellow-500/10" },
  Respond:  { color: "text-orange-400", bg: "bg-orange-500/10" },
  Recover:  { color: "text-rose-400",   bg: "bg-rose-500/10" },
};

const defaultChecklist: ChecklistItem[] = [
  // IDENTIFY
  { id: "C-001", controlId: "ID.AM-1", function: "Identify", category: "Asset Management", description: "Physical devices and systems are inventoried", auditQuestion: "Is there a complete and up-to-date inventory of all hardware and software assets?", status: "Compliant", evidence: "", notes: "" },
  { id: "C-002", controlId: "ID.AM-2", function: "Identify", category: "Asset Management", description: "Software platforms and applications are inventoried", auditQuestion: "Are all software applications documented with version and owner information?", status: "Partial", evidence: "", notes: "" },
  { id: "C-003", controlId: "ID.RA-1", function: "Identify", category: "Risk Assessment", description: "Asset vulnerabilities are identified and documented", auditQuestion: "Is there a formal vulnerability assessment process in place?", status: "Non-Compliant", evidence: "", notes: "" },
  { id: "C-004", controlId: "ID.GV-1", function: "Identify", category: "Governance", description: "Organizational cybersecurity policy is established", auditQuestion: "Is there a documented and approved cybersecurity policy?", status: "Compliant", evidence: "", notes: "" },
  // PROTECT
  { id: "C-005", controlId: "PR.AC-1", function: "Protect", category: "Access Control", description: "Identities and credentials are managed for authorized devices", auditQuestion: "Are strong password policies enforced (min 8 chars, complexity)?", status: "Compliant", evidence: "", notes: "" },
  { id: "C-006", controlId: "PR.AC-3", function: "Protect", category: "Access Control", description: "Remote access is managed", auditQuestion: "Is MFA enforced for all remote access and privileged accounts?", status: "Non-Compliant", evidence: "", notes: "" },
  { id: "C-007", controlId: "PR.AC-4", function: "Protect", category: "Access Control", description: "Access permissions are managed based on least privilege", auditQuestion: "Are users granted only the minimum permissions required for their role?", status: "Partial", evidence: "", notes: "" },
  { id: "C-008", controlId: "PR.DS-1", function: "Protect", category: "Data Security", description: "Data-at-rest is protected", auditQuestion: "Is sensitive data encrypted at rest using AES-256 or equivalent?", status: "Non-Compliant", evidence: "", notes: "" },
  { id: "C-009", controlId: "PR.DS-2", function: "Protect", category: "Data Security", description: "Data-in-transit is protected", auditQuestion: "Is TLS 1.2 or higher enforced for all data transmissions?", status: "Compliant", evidence: "", notes: "" },
  { id: "C-010", controlId: "PR.IP-1", function: "Protect", category: "Info Protection", description: "A baseline configuration of systems is maintained", auditQuestion: "Are hardening standards and secure baselines documented and applied?", status: "Partial", evidence: "", notes: "" },
  { id: "C-011", controlId: "PR.IP-4", function: "Protect", category: "Info Protection", description: "Backups of information are conducted and tested", auditQuestion: "Are regular backups performed, encrypted, and tested for restoration?", status: "Non-Compliant", evidence: "", notes: "" },
  { id: "C-012", controlId: "PR.MA-1", function: "Protect", category: "Maintenance", description: "Maintenance and repair of organizational assets is performed", auditQuestion: "Is there a patch management policy ensuring updates within 30 days?", status: "Partial", evidence: "", notes: "" },
  // DETECT
  { id: "C-013", controlId: "DE.AE-1", function: "Detect", category: "Anomalies & Events", description: "A baseline of network operations is established", auditQuestion: "Is network traffic baseline monitoring implemented?", status: "Partial", evidence: "", notes: "" },
  { id: "C-014", controlId: "DE.CM-1", function: "Detect", category: "Continuous Monitoring", description: "The network is monitored to detect potential cybersecurity events", auditQuestion: "Is an IDS/IPS or SIEM solution deployed and actively monitored?", status: "Non-Compliant", evidence: "", notes: "" },
  { id: "C-015", controlId: "DE.CM-3", function: "Detect", category: "Continuous Monitoring", description: "Personnel activity is monitored to detect cybersecurity events", auditQuestion: "Are user access logs collected and reviewed regularly?", status: "Compliant", evidence: "", notes: "" },
  { id: "C-016", controlId: "DE.DP-1", function: "Detect", category: "Detection Processes", description: "Roles and responsibilities for detection are defined", auditQuestion: "Are detection responsibilities clearly assigned to specific roles?", status: "Compliant", evidence: "", notes: "" },
  // RESPOND
  { id: "C-017", controlId: "RS.RP-1", function: "Respond", category: "Response Planning", description: "Response plan is executed during or after an incident", auditQuestion: "Is there a documented and tested incident response plan?", status: "Compliant", evidence: "", notes: "" },
  { id: "C-018", controlId: "RS.CO-1", function: "Respond", category: "Communications", description: "Personnel know their roles during incident response", auditQuestion: "Are incident response roles and escalation paths clearly communicated?", status: "Partial", evidence: "", notes: "" },
  { id: "C-019", controlId: "RS.AN-1", function: "Respond", category: "Analysis", description: "Notifications from detection systems are investigated", auditQuestion: "Is there a process for investigating and triaging security alerts?", status: "Non-Compliant", evidence: "", notes: "" },
  // RECOVER
  { id: "C-020", controlId: "RC.RP-1", function: "Recover", category: "Recovery Planning", description: "Recovery plan is executed during or after a cybersecurity incident", auditQuestion: "Is there a documented Business Continuity and Disaster Recovery plan?", status: "Partial", evidence: "", notes: "" },
  { id: "C-021", controlId: "RC.IM-1", function: "Recover", category: "Improvements", description: "Recovery plans incorporate lessons learned", auditQuestion: "Are post-incident reviews conducted and findings used to improve controls?", status: "N/A", evidence: "", notes: "" },
  { id: "C-022", controlId: "RC.CO-1", function: "Recover", category: "Communications", description: "Public relations are managed during recovery", auditQuestion: "Is there a communication plan for notifying stakeholders after an incident?", status: "N/A", evidence: "", notes: "" },
];

const statuses: ComplianceStatus[] = ["Compliant", "Partial", "Non-Compliant", "N/A"];
const functions: CSFFunction[] = ["Identify", "Protect", "Detect", "Respond", "Recover"];

export default function AuditChecklistPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [filterFn, setFilterFn] = useState<CSFFunction | "All">("All");
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function updateItem(id: string, field: keyof ChecklistItem, value: string) {
    setChecklist((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  const filtered = checklist.filter((item) => {
    const matchFn = filterFn === "All" || item.function === filterFn;
    const matchStatus = filterStatus === "All" || item.status === filterStatus;
    return matchFn && matchStatus;
  });

  const total = checklist.length;
  const compliant = checklist.filter((i) => i.status === "Compliant").length;
  const partial = checklist.filter((i) => i.status === "Partial").length;
  const nonCompliant = checklist.filter((i) => i.status === "Non-Compliant").length;
  const applicable = checklist.filter((i) => i.status !== "N/A").length;
  const compliancePct = applicable > 0 ? Math.round((compliant / applicable) * 100) : 0;

  const fnStats = functions.map((fn) => {
    const items = checklist.filter((i) => i.function === fn && i.status !== "N/A");
    const comp = items.filter((i) => i.status === "Compliant").length;
    return { fn, pct: items.length > 0 ? Math.round((comp / items.length) * 100) : 0, total: items.length, comp };
  });

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Audit" }, { label: "Audit Checklist" }]} />

        <div className="p-7 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center text-xl shadow-lg shadow-teal-500/20">✅</div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-white">Audit Checklist</h1>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">MODULE 6 · NIST CSF control audit — {total} controls</div>
              </div>
            </div>
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border ${compliancePct >= 85 ? "bg-green-500/10 border-green-500/30" : compliancePct >= 60 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
              <div className="text-[11px] text-slate-400">Overall Compliance</div>
              <div className={`text-[24px] font-bold font-mono ${compliancePct >= 85 ? "text-green-400" : compliancePct >= 60 ? "text-yellow-400" : "text-rose-400"}`}>{compliancePct}%</div>
              <div className={`text-[10px] font-semibold ${compliancePct >= 85 ? "text-green-400" : compliancePct >= 60 ? "text-yellow-400" : "text-rose-400"}`}>
                {compliancePct >= 85 ? "✅ Compliant" : compliancePct >= 60 ? "⚠️ Needs Improvement" : "❌ Non-Compliant"}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: "Total Controls", value: total, color: "text-sky-300", bar: "#0ea5e9", pct: 100 },
              { label: "Compliant", value: compliant, color: "text-green-400", bar: "#22c55e", pct: (compliant/total)*100 },
              { label: "Partial", value: partial, color: "text-yellow-400", bar: "#fbbf24", pct: (partial/total)*100 },
              { label: "Non-Compliant", value: nonCompliant, color: "text-rose-400", bar: "#f43f5e", pct: (nonCompliant/total)*100 },
              { label: "Score", value: `${compliancePct}%`, color: "text-teal-400", bar: "#14b8a6", pct: compliancePct },
            ].map((s) => (
              <div key={s.label} className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-4">
                <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-slate-500 mb-1.5">{s.label}</div>
                <div className={`text-[26px] font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="mt-2 h-[3px] bg-[#1e3158] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.bar }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_260px] gap-6">
            {/* LEFT — Checklist */}
            <div>
              {/* Filters */}
              <div className="flex gap-3 mb-4 flex-wrap">
                <div className="flex gap-1">
                  {(["All", ...functions] as const).map((fn) => (
                    <button key={fn} onClick={() => setFilterFn(fn as CSFFunction | "All")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all
                        ${filterFn === fn
                          ? fn === "All" ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                            : `${fnConfig[fn as CSFFunction].bg} border-current ${fnConfig[fn as CSFFunction].color}`
                          : "bg-[#0f1a2e] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                      {fn}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {(["All", ...statuses] as const).map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s as ComplianceStatus | "All")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all
                        ${filterStatus === s
                          ? s === "All" ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                            : `${statusConfig[s as ComplianceStatus].bg} ${statusConfig[s as ComplianceStatus].border} ${statusConfig[s as ComplianceStatus].color}`
                          : "bg-[#0f1a2e] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklist items */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#1e3158] flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-slate-200">NIST CSF Controls ({filtered.length})</div>
                </div>
                <div className="divide-y divide-[#1e3158]/50">
                  {filtered.map((item) => {
                    const sCfg = statusConfig[item.status];
                    const fCfg = fnConfig[item.function];
                    const expanded = expandedId === item.id;
                    return (
                      <div key={item.id}>
                        <div className="px-5 py-4 hover:bg-[#0d1526]/40 transition-colors cursor-pointer"
                          onClick={() => setExpandedId(expanded ? null : item.id)}>
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 mt-0.5">
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${fCfg.bg} ${fCfg.color}`}>
                                {item.function.slice(0,3).toUpperCase()}
                              </span>
                              <span className="text-[9px] font-mono text-slate-600">{item.controlId}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-semibold text-slate-200 mb-0.5">{item.description}</div>
                              <div className="text-[10px] text-slate-500">{item.category}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                                {item.status}
                              </span>
                              <span className="text-slate-500 text-sm">{expanded ? "▲" : "▼"}</span>
                            </div>
                          </div>
                        </div>

                        {expanded && (
                          <div className="px-5 pb-5 bg-[#0d1526]/30 border-t border-[#1e3158]/50">
                            <div className="pt-4">
                              {/* Audit question */}
                              <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-3.5 mb-4">
                                <div className="text-[9px] text-sky-400 font-semibold uppercase tracking-widest mb-1">Audit Question</div>
                                <div className="text-[12px] text-slate-300 leading-relaxed">{item.auditQuestion}</div>
                              </div>

                              {/* Status selector */}
                              <div className="mb-4">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Compliance Status</div>
                                <div className="flex gap-2">
                                  {statuses.map((s) => {
                                    const sc = statusConfig[s];
                                    return (
                                      <button key={s} onClick={() => updateItem(item.id, "status", s)}
                                        className={`flex-1 py-2 rounded-xl text-[11px] font-semibold border transition-all
                                          ${item.status === s ? `${sc.bg} ${sc.border} ${sc.color}` : "bg-[#111d35] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                                        {s}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Evidence & Notes */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Evidence Reference</label>
                                  <input
                                    value={item.evidence}
                                    onChange={(e) => updateItem(item.id, "evidence", e.target.value)}
                                    placeholder="e.g. Screenshot-001.png, Policy-v2.pdf"
                                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[11px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Auditor Notes</label>
                                  <input
                                    value={item.notes}
                                    onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                                    placeholder="Additional observations..."
                                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[11px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT — CSF Function breakdown */}
            <div className="space-y-4">
              {/* Compliance by function */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-5 py-4 border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">📊 By CSF Function</div>
                </div>
                <div className="p-5 space-y-4">
                  {fnStats.map(({ fn, pct, total: t, comp }) => {
                    const cfg = fnConfig[fn];
                    return (
                      <div key={fn}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[12px] font-semibold ${cfg.color}`}>{fn}</span>
                          <span className="text-[11px] font-mono text-slate-400">{comp}/{t} · {pct}%</span>
                        </div>
                        <div className="h-2 bg-[#1e3158] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: pct >= 80 ? "#22c55e" : pct >= 60 ? "#fbbf24" : "#f43f5e" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5">
                <div className="text-[12px] font-semibold text-slate-200 mb-3">📖 Status Guide</div>
                <div className="space-y-2.5">
                  {statuses.map((s) => {
                    const cfg = statusConfig[s];
                    const desc: Record<ComplianceStatus, string> = {
                      Compliant: "Control fully implemented with evidence",
                      Partial: "Control partially implemented",
                      "Non-Compliant": "Control missing or not implemented",
                      "N/A": "Control not applicable to this scope",
                    };
                    return (
                      <div key={s} className={`flex gap-2.5 p-2.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                        <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${cfg.dot}`} />
                        <div>
                          <div className={`text-[11px] font-semibold ${cfg.color}`}>{s}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{desc[s]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next */}
              <div className="bg-sky-500/5 border border-sky-500/20 rounded-[14px] p-4">
                <div className="text-[11px] font-semibold text-sky-300 mb-1">➡️ Next Steps</div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                  Upload evidence for each control, then generate the Audit Findings report.
                </p>
                <div className="space-y-1.5">
                  <button className="w-full py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors">
                    Upload Evidence →
                  </button>
                  <button className="w-full py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/25 text-[11px] font-semibold text-teal-400 hover:bg-teal-500/15 transition-colors">
                    Generate Findings →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
