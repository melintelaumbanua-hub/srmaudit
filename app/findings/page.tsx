"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type StatusType = "Open" | "In Progress" | "Resolved";

interface Finding {
  id: string;
  severity: Severity;
  title: string;
  asset: string;
  control: string;
  fn: string;
  status: StatusType;
  date: string;
  assignee: string;
  desc?: string;
}

const initialFindings: Finding[] = [
  { id: "F-001", severity: "CRITICAL", title: "No MFA on Admin Panel", asset: "HR System", control: "PR.AC-7", fn: "Protect", status: "Open", date: "2026-08-01", assignee: "Ahmad", desc: "Admin portal accessible with single-factor credentials." },
  { id: "F-002", severity: "HIGH", title: "SQL Injection in Employee Search", asset: "HR Database", control: "SI-10", fn: "Protect", status: "In Progress", date: "2026-08-02", assignee: "Siti", desc: "Input fields unsanitized. Risk of database exfiltration." },
  { id: "F-003", severity: "HIGH", title: "Backup Encryption Not Enforced", asset: "Cloud Storage", control: "SC-28", fn: "Protect", status: "Open", date: "2026-08-02", assignee: "Ahmad", desc: "DB backups stored plaintext on cloud storage bucket." },
  { id: "F-004", severity: "MEDIUM", title: "Audit Logging Incomplete", asset: "LMS Website", control: "AU-2", fn: "Detect", status: "In Progress", date: "2026-08-03", assignee: "Rizky", desc: "System access events not captured." },
  { id: "F-005", severity: "LOW", title: "TLS 1.0 on Internal API", asset: "API Server", control: "SC-8", fn: "Protect", status: "Resolved", date: "2026-08-04", assignee: "Siti", desc: "TLS 1.0 still enabled. Upgrade to TLS 1.3 required." },
  { id: "F-006", severity: "HIGH", title: "Default Admin Credentials Active", asset: "Network Router", control: "PR.AC-1", fn: "Protect", status: "Open", date: "2026-08-05", assignee: "Ahmad", desc: "Factory credentials unchanged." },
  { id: "F-007", severity: "MEDIUM", title: "No Incident Response Plan", asset: "Organization", control: "RS.RP-1", fn: "Respond", status: "Open", date: "2026-08-05", assignee: "Rizky", desc: "No documented incident response procedure." },
  { id: "F-008", severity: "LOW", title: "Missing HTTPS on Internal Portal", asset: "HR Portal", control: "PR.DS-2", fn: "Protect", status: "Resolved", date: "2026-08-06", assignee: "Siti", desc: "Internal portal served over HTTP." },
];

function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    CRITICAL: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    HIGH:     "bg-orange-500/15 text-orange-400 border-orange-500/30",
    MEDIUM:   "bg-yellow-500/12 text-yellow-400 border-yellow-500/25",
    LOW:      "bg-green-500/12 text-green-400 border-green-500/25",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono whitespace-nowrap ${map[severity]}`}>
      {severity}
    </span>
  );
}

const statusColors: Record<StatusType, string> = {
  "Open":        "bg-rose-500/12 text-rose-400 border-rose-500/25",
  "In Progress": "bg-sky-500/12 text-sky-400 border-sky-500/25",
  "Resolved":    "bg-green-500/12 text-green-400 border-green-500/25",
};

const fnOptions = ["Identify", "Protect", "Detect", "Respond", "Recover"];

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [filterStatus, setFilterStatus] = useState<"All" | StatusType>("All");
  const [filterSev, setFilterSev] = useState<"All" | Severity>("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newFinding, setNewFinding] = useState({
    title: "",
    desc: "",
    asset: "",
    control: "",
    fn: "Protect",
    severity: "HIGH" as Severity,
    assignee: "",
  });

  const filtered = findings.filter((f) => {
    if (filterStatus !== "All" && f.status !== filterStatus) return false;
    if (filterSev !== "All" && f.severity !== filterSev) return false;
    return true;
  });

  const selectedFinding = findings.find((f) => f.id === selected);

  function addFinding() {
    if (!newFinding.title || !newFinding.asset) return;
    const id = `F-${String(findings.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().slice(0, 10);
    setFindings((prev) => [...prev, {
      ...newFinding,
      id,
      status: "Open",
      date: today,
    }]);
    setNewFinding({ title: "", desc: "", asset: "", control: "", fn: "Protect", severity: "HIGH", assignee: "" });
    setShowModal(false);
  }

  function updateStatus(id: string, status: StatusType) {
    setFindings((prev) => prev.map((f) => f.id === id ? { ...f, status } : f));
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Security Audit" }, { label: "Audit Findings" }]} />

        <div className="p-7 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">🔍</div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-white">Audit Findings</h1>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">{findings.length} total findings · AUDIT-2026-003</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold bg-[#111d35] border border-[#243d6b] text-slate-300 hover:text-white hover:border-sky-500 transition-all">
                📤 Export
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all">
                ➕ New Finding
              </button>
            </div>
          </div>

          {/* Summary chips */}
          <div className="flex gap-3 mb-6">
            {[
              { label: "Critical", sev: "CRITICAL", color: "border-rose-500/30 bg-rose-500/8 text-rose-400" },
              { label: "High",     sev: "HIGH",     color: "border-orange-500/30 bg-orange-500/8 text-orange-400" },
              { label: "Medium",   sev: "MEDIUM",   color: "border-yellow-500/30 bg-yellow-500/8 text-yellow-400" },
              { label: "Low",      sev: "LOW",      color: "border-green-500/30 bg-green-500/8 text-green-400" },
            ].map(({ label, sev, color }) => (
              <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-semibold ${color}`}>
                <span className="font-mono text-xl font-bold">{findings.filter(f => f.severity === sev).length}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className={`grid gap-5 ${selectedFinding ? "grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
            {/* Table */}
            <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden">
              <div className="flex items-center justify-between px-[22px] py-[14px] border-b border-[#1e3158]">
                <div className="text-[13px] font-semibold text-slate-200">🔍 All Findings</div>
                <div className="flex gap-1.5">
                  {(["All", "Open", "In Progress", "Resolved"] as ("All" | StatusType)[]).map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`text-[11px] px-3 py-1 rounded-lg font-medium transition-all border
                        ${filterStatus === s ? "bg-sky-500/12 text-sky-300 border-sky-500/25" : "text-slate-500 border-transparent hover:text-slate-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-[22px] py-2.5 border-b border-[#1e3158] flex gap-1.5 items-center">
                <span className="text-[10px] text-slate-600 mr-1">Severity:</span>
                {(["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as ("All" | Severity)[]).map((s) => (
                  <button key={s} onClick={() => setFilterSev(s)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all border
                      ${filterSev === s ? "bg-sky-500/12 text-sky-300 border-sky-500/25" : "text-slate-600 border-transparent hover:text-slate-400"}`}>
                    {s}
                  </button>
                ))}
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e3158]">
                    {["ID", "Severity", "Finding", "Asset", "Control", "Function", "Status", "Assignee"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-slate-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id}
                      onClick={() => setSelected(selected === f.id ? null : f.id)}
                      className={`border-b border-[#1e3158]/50 last:border-0 cursor-pointer transition-colors
                        ${selected === f.id ? "bg-sky-500/5" : "hover:bg-[#0d1526]/50"}`}>
                      <td className="px-4 py-3 font-mono text-[11px] text-sky-300">{f.id}</td>
                      <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                      <td className="px-4 py-3 text-[12px] text-slate-200 max-w-[200px] truncate">{f.title}</td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{f.asset}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{f.control}</td>
                      <td className="px-4 py-3 text-[11px] text-teal-400">{f.fn}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[f.status]}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{f.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-600 text-[13px]">No findings match the selected filters.</div>
              )}
            </div>

            {/* Detail panel */}
            {selectedFinding && (
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden self-start">
                <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">📋 Finding Detail</div>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
                </div>
                <div className="px-[22px] py-[18px]">
                  <div className="mb-4">
                    <span className="font-mono text-[11px] text-sky-300">{selectedFinding.id}</span>
                    <div className="text-[15px] font-bold text-white mt-1 mb-2">{selectedFinding.title}</div>
                    <SeverityBadge severity={selectedFinding.severity} />
                  </div>

                  {selectedFinding.desc && (
                    <div className="bg-[#111d35] border border-[#1e3158] rounded-lg p-3 mb-4 text-[12px] text-slate-400 leading-relaxed">
                      {selectedFinding.desc}
                    </div>
                  )}

                  <div className="space-y-2.5 mb-5">
                    {[
                      { label: "Affected Asset",    value: selectedFinding.asset },
                      { label: "Control Reference", value: selectedFinding.control },
                      { label: "NIST CSF Function", value: selectedFinding.fn },
                      { label: "Assigned To",       value: selectedFinding.assignee },
                      { label: "Date Identified",   value: selectedFinding.date },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-[12px] border-b border-[#1e3158]/50 pb-2 last:border-0">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-200 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Update status */}
                  <div className="mb-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">Update Status</div>
                    <div className="flex gap-2">
                      {(["Open", "In Progress", "Resolved"] as StatusType[]).map((s) => (
                        <button key={s} onClick={() => updateStatus(selectedFinding.id, s)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all
                            ${selectedFinding.status === s ? statusColors[s] : "border-[#1e3158] text-slate-600 hover:text-slate-400"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-sky-500/5 border border-sky-500/15 rounded-lg p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-sky-500 mb-2">🤖 AI Recommendation</div>
                    <p className="text-[12px] text-sky-300/80 leading-relaxed">
                      Enable multi-factor authentication and review access control policies. Implement automated monitoring to detect future anomalies.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── ADD FINDING MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1a2e] border border-[#243d6b] rounded-[20px] w-full max-w-[500px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e3158]">
              <div className="text-[15px] font-bold text-white">➕ New Finding</div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 text-xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Finding Title *</label>
                <input
                  value={newFinding.title}
                  onChange={(e) => setNewFinding(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. No MFA on Admin Panel"
                  className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Description</label>
                <textarea
                  value={newFinding.desc}
                  onChange={(e) => setNewFinding(p => ({ ...p, desc: e.target.value }))}
                  placeholder="Describe the issue..."
                  rows={3}
                  className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors resize-none"
                />
              </div>

              {/* Asset + Control */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Affected Asset *</label>
                  <input
                    value={newFinding.asset}
                    onChange={(e) => setNewFinding(p => ({ ...p, asset: e.target.value }))}
                    placeholder="e.g. HR System"
                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Control ID</label>
                  <input
                    value={newFinding.control}
                    onChange={(e) => setNewFinding(p => ({ ...p, control: e.target.value }))}
                    placeholder="e.g. PR.AC-7"
                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Severity</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as Severity[]).map((s) => {
                    const colors: Record<Severity, string> = {
                      CRITICAL: "border-rose-500/40 bg-rose-500/15 text-rose-400",
                      HIGH:     "border-orange-500/40 bg-orange-500/15 text-orange-400",
                      MEDIUM:   "border-yellow-500/40 bg-yellow-500/12 text-yellow-400",
                      LOW:      "border-green-500/40 bg-green-500/12 text-green-400",
                    };
                    return (
                      <button key={s} onClick={() => setNewFinding(p => ({ ...p, severity: s }))}
                        className={`py-2 rounded-lg text-[11px] font-bold border transition-all
                          ${newFinding.severity === s ? colors[s] : "border-[#1e3158] text-slate-600 hover:border-[#243d6b]"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Function */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">NIST CSF Function</label>
                <div className="flex gap-2 flex-wrap">
                  {fnOptions.map((fn) => (
                    <button key={fn} onClick={() => setNewFinding(p => ({ ...p, fn }))}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all
                        ${newFinding.fn === fn ? "bg-teal-500/12 text-teal-400 border-teal-500/25" : "border-[#1e3158] text-slate-600 hover:text-slate-400"}`}>
                      {fn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Assign To</label>
                <input
                  value={newFinding.assignee}
                  onChange={(e) => setNewFinding(p => ({ ...p, assignee: e.target.value }))}
                  placeholder="e.g. Ahmad"
                  className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="px-6 pb-5 pt-3 flex gap-2 border-t border-[#1e3158]">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#243d6b] text-slate-400 text-[13px] font-semibold hover:text-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={addFinding}
                disabled={!newFinding.title || !newFinding.asset}
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