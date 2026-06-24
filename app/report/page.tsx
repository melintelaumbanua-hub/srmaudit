"use client";

import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const findings = [
  { id: "F-001", severity: "CRITICAL", title: "No MFA on Admin Panel", asset: "HR System", control: "PR.AC-7", recommendation: "Enable multi-factor authentication immediately on all admin interfaces." },
  { id: "F-002", severity: "HIGH", title: "SQL Injection in Employee Search", asset: "HR Database", control: "SI-10", recommendation: "Implement parameterized queries and input validation on all database interactions." },
  { id: "F-003", severity: "HIGH", title: "Backup Encryption Not Enforced", asset: "Cloud Storage", control: "SC-28", recommendation: "Enable AES-256 encryption for all backup files stored in cloud storage." },
  { id: "F-004", severity: "MEDIUM", title: "Audit Logging Incomplete", asset: "LMS Website", control: "AU-2", recommendation: "Configure comprehensive audit logging for all system access events." },
  { id: "F-005", severity: "LOW", title: "Outdated TLS 1.0 on Internal API", asset: "API Server", control: "SC-8", recommendation: "Upgrade TLS configuration to TLS 1.3 and disable legacy versions." },
];

const assets = [
  { name: "HR System", type: "Application", owner: "IT Department", location: "Cloud Server", criticality: "High" },
  { name: "HR Database", type: "Data", owner: "IT Department", location: "Cloud Server", criticality: "High" },
  { name: "LMS Website", type: "Application", owner: "Academic Dept", location: "Web Server", criticality: "High" },
  { name: "API Server", type: "Server", owner: "IT Department", location: "Internal Network", criticality: "Medium" },
  { name: "Cloud Storage", type: "Data", owner: "IT Department", location: "Cloud", criticality: "High" },
];

const complianceData = [
  { fn: "Identify", score: 90, color: "#14b8a6" },
  { fn: "Protect", score: 65, color: "#0ea5e9" },
  { fn: "Detect", score: 55, color: "#fbbf24" },
  { fn: "Respond", score: 80, color: "#a78bfa" },
  { fn: "Recover", score: 40, color: "#f43f5e" },
];

const sevColors: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#fb923c",
  MEDIUM: "#fbbf24",
  LOW: "#22c55e",
};

const overallScore = Math.round(complianceData.reduce((a, b) => a + b.score, 0) / complianceData.length);
const finalOpinion = overallScore >= 85 ? "Secure" : overallScore >= 60 ? "Acceptable Risk" : "Needs Immediate Action";
const opinionColor = overallScore >= 85 ? "#22c55e" : overallScore >= 60 ? "#fbbf24" : "#f43f5e";

export default function ReportPage() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  async function exportPDF() {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const element = reportRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0f1e",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`SRMAudit_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      setGenerated(true);
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Tools" }, { label: "Report Generator" }]} />

        <div className="p-7 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">
                📄
              </div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-white">Report Generator</h1>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">MODULE 11 · Security Audit Report · NIST CSF</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {generated && (
                <div className="flex items-center gap-1.5 text-[11px] text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                  ✅ PDF Downloaded!
                </div>
              )}
              <button
                onClick={exportPDF}
                disabled={generating}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {generating ? (
                  <><span className="animate-spin">⏳</span> Generating...</>
                ) : (
                  <><span>📥</span> Export PDF</>
                )}
              </button>
            </div>
          </div>

          {/* Preview notice */}
          <div className="mb-4 p-3 bg-sky-500/8 border border-sky-500/20 rounded-lg text-[12px] text-sky-400 flex items-center gap-2">
            👁️ Preview laporan di bawah ini — klik <strong>Export PDF</strong> untuk download
          </div>

          {/* ══ REPORT CONTENT ══ */}
          <div ref={reportRef} className="bg-[#0a0f1e] rounded-xl overflow-hidden">

            {/* Cover */}
            <div className="bg-gradient-to-br from-[#0d1526] to-[#0f1a2e] border border-[#1e3158] rounded-xl mb-4 p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "linear-gradient(#1e3158 1px, transparent 1px), linear-gradient(90deg, #1e3158 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-sky-500/25">🛡️</div>
                <div className="text-[28px] font-bold text-white mb-1 tracking-tight">Security Audit Report</div>
                <div className="text-[14px] text-sky-400 font-semibold mb-4">Human Resources Department</div>
                <div className="flex items-center justify-center gap-6 text-[12px] text-slate-500">
                  <span>📅 August 2026</span>
                  <span>·</span>
                  <span>🏛️ NIST CSF Framework</span>
                  <span>·</span>
                  <span>🔖 AUDIT-2026-003</span>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-bold"
                  style={{ borderColor: opinionColor + "50", color: opinionColor, background: opinionColor + "15" }}>
                  Final Opinion: {finalOpinion}
                </div>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <Section title="1. Executive Summary" icon="📋">
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Overall Compliance", value: `${overallScore}%`, color: "#14b8a6" },
                  { label: "Total Findings", value: findings.length, color: "#0ea5e9" },
                  { label: "Critical Issues", value: findings.filter(f => f.severity === "CRITICAL").length, color: "#f43f5e" },
                  { label: "Assets Audited", value: assets.length, color: "#a78bfa" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#111d35] border border-[#1e3158] rounded-xl p-4 text-center">
                    <div className="text-[28px] font-bold font-mono mb-1" style={{ color }}>{value}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#111d35] border border-[#1e3158] rounded-xl p-4 text-[12px] text-slate-400 leading-relaxed">
                This security audit was conducted on the Human Resources Department systems using the NIST Cybersecurity Framework (CSF).
                The audit identified <strong className="text-slate-200">{findings.length} findings</strong> including{" "}
                <strong className="text-rose-400">{findings.filter(f=>f.severity==="CRITICAL").length} Critical</strong>,{" "}
                <strong className="text-orange-400">{findings.filter(f=>f.severity==="HIGH").length} High</strong>,{" "}
                <strong className="text-yellow-400">{findings.filter(f=>f.severity==="MEDIUM").length} Medium</strong>, and{" "}
                <strong className="text-green-400">{findings.filter(f=>f.severity==="LOW").length} Low</strong> severity issues.
                Overall compliance stands at <strong className="text-teal-400">{overallScore}%</strong>, which is categorized as{" "}
                <strong style={{ color: opinionColor }}>{finalOpinion}</strong>.
                Immediate remediation is required for Critical and High severity findings.
              </div>
            </Section>

            {/* Section 2: Scope */}
            <Section title="2. Scope of Audit" icon="🎯">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Organization", value: "University HR Department" },
                  { label: "Audit Period", value: "August 1–7, 2026" },
                  { label: "Framework", value: "NIST Cybersecurity Framework (CSF)" },
                  { label: "Auditor", value: "Senior Auditor — SRMAudit Team" },
                  { label: "System Type", value: "Web Application + Cloud Infrastructure" },
                  { label: "Audit ID", value: "AUDIT-2026-003" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[12px] bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-200 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Section 3: Methodology */}
            <Section title="3. Methodology" icon="⚙️">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { fn: "Identify", icon: "🔎", desc: "Asset & risk identification" },
                  { fn: "Protect", icon: "🛡️", desc: "Safeguard implementation" },
                  { fn: "Detect", icon: "📡", desc: "Anomaly detection" },
                  { fn: "Respond", icon: "⚡", desc: "Incident response" },
                  { fn: "Recover", icon: "🔄", desc: "Recovery planning" },
                ].map(({ fn, icon, desc }) => (
                  <div key={fn} className="bg-[#111d35] border border-[#1e3158] rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-[12px] font-bold text-sky-300">{fn}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed bg-[#111d35] border border-[#1e3158] rounded-xl p-4">
                This audit follows the <strong className="text-sky-300">NIST Cybersecurity Framework (CSF)</strong> which organizes security controls into five core functions.
                Each control was evaluated through document review, system testing, and evidence verification.
                Risk scores were calculated using the formula: <strong className="text-teal-400">Risk = Likelihood × Impact</strong>.
              </p>
            </Section>

            {/* Section 4: Asset List */}
            <Section title="4. Asset List" icon="📦">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e3158]">
                    {["Asset Name", "Type", "Owner", "Location", "Criticality"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-slate-500 px-3 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a, i) => (
                    <tr key={i} className="border-b border-[#1e3158]/50 last:border-0">
                      <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-200">{a.name}</td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-400">{a.type}</td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-400">{a.owner}</td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-400">{a.location}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.criticality === "High" ? "bg-rose-500/15 text-rose-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                          {a.criticality}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Section 5: Risk Assessment */}
            <Section title="5. Risk Assessment" icon="🎯">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-slate-500 mb-3 uppercase tracking-widest font-semibold">Risk by Severity</div>
                  <div className="space-y-2">
                    {(["CRITICAL","HIGH","MEDIUM","LOW"] as const).map((sev) => {
                      const count = findings.filter(f => f.severity === sev).length;
                      const pct = (count / findings.length) * 100;
                      return (
                        <div key={sev}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span style={{ color: sevColors[sev] }} className="font-semibold">{sev}</span>
                            <span className="text-slate-500 font-mono">{count} finding{count !== 1 ? "s" : ""}</span>
                          </div>
                          <div className="h-2 bg-[#1e3158] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: sevColors[sev] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-3 uppercase tracking-widest font-semibold">Risk Matrix Summary</div>
                  <div className="grid grid-cols-5 gap-1">
                    {["C","C","C","H","M","C","C","H","M","L","C","H","M","L","L","H","M","L","L","L","M","L","L","L","L"].map((cell, i) => {
                      const colors: Record<string, string> = { C: "bg-rose-500/25 text-rose-400", H: "bg-orange-500/20 text-orange-400", M: "bg-yellow-500/15 text-yellow-400", L: "bg-green-500/12 text-green-400" };
                      return (
                        <div key={i} className={`aspect-square rounded flex items-center justify-center text-[9px] font-bold ${colors[cell]}`}>{cell}</div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Section>

            {/* Section 6: Compliance */}
            <Section title="6. Compliance Result" icon="📈">
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-[48px] font-bold font-mono text-teal-400">{overallScore}%</div>
                  <div className="text-[11px] text-slate-500">Overall Score</div>
                  <div className="mt-2 px-3 py-1 rounded-full text-[11px] font-bold border inline-block"
                    style={{ color: opinionColor, borderColor: opinionColor + "40", background: opinionColor + "15" }}>
                    {finalOpinion}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {complianceData.map(({ fn, score, color }) => (
                    <div key={fn}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300 font-medium">{fn}</span>
                        <span className="font-mono font-semibold" style={{ color }}>{score}%</span>
                      </div>
                      <div className="h-2 bg-[#1e3158] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Section 7: Findings */}
            <Section title="7. Audit Findings" icon="🔍">
              <div className="space-y-3">
                {findings.map((f) => (
                  <div key={f.id} className="bg-[#111d35] border border-[#1e3158] rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-mono font-bold text-sky-300 mt-0.5">{f.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono"
                        style={{ color: sevColors[f.severity], borderColor: sevColors[f.severity] + "50", background: sevColors[f.severity] + "15" }}>
                        {f.severity}
                      </span>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-white mb-1">{f.title}</div>
                        <div className="text-[11px] text-slate-500 mb-2 font-mono">Asset: {f.asset} · Control: {f.control}</div>
                        <div className="text-[11px] text-sky-300/80 bg-sky-500/5 border border-sky-500/15 rounded-lg px-3 py-2">
                          🤖 <strong>Recommendation:</strong> {f.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Section 8: AI Recommendations */}
            <Section title="8. AI Recommendations" icon="🤖">
              <div className="space-y-2">
                {[
                  { priority: "IMMEDIATE", text: "Enable MFA on all administrative interfaces within 48 hours to prevent unauthorized access.", color: "#f43f5e" },
                  { priority: "HIGH", text: "Implement parameterized queries across all database interaction points to eliminate SQL injection risk.", color: "#fb923c" },
                  { priority: "HIGH", text: "Encrypt all backup files using AES-256 and enforce strict bucket access policies in cloud storage.", color: "#fb923c" },
                  { priority: "MEDIUM", text: "Configure comprehensive audit logging for all system events to enable incident detection and forensics.", color: "#fbbf24" },
                  { priority: "LOW", text: "Upgrade TLS configuration to 1.3 on all internal APIs and disable deprecated protocol versions.", color: "#22c55e" },
                ].map(({ priority, text, color }, i) => (
                  <div key={i} className="flex gap-3 bg-[#111d35] border border-[#1e3158] rounded-lg p-3">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0 mt-0.5 h-fit"
                      style={{ color, background: color + "20", border: `1px solid ${color}40` }}>
                      {priority}
                    </span>
                    <span className="text-[12px] text-slate-400 leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Section 9: Final Opinion */}
            <Section title="9. Final Audit Opinion" icon="⚖️">
              <div className="text-center py-6 border border-[#1e3158] rounded-xl bg-[#111d35]">
                <div className="text-[14px] text-slate-500 mb-3 uppercase tracking-widest font-semibold">Final Audit Opinion</div>
                <div className="text-[42px] font-bold mb-3" style={{ color: opinionColor }}>{finalOpinion}</div>
                <div className="text-[12px] text-slate-400 max-w-lg mx-auto leading-relaxed px-4">
                  {finalOpinion === "Needs Immediate Action"
                    ? "Critical vulnerabilities have been identified that pose immediate risk to organizational data and systems. Immediate remediation is required before the next audit cycle."
                    : finalOpinion === "Acceptable Risk"
                    ? "The organization demonstrates reasonable security controls with some gaps that should be addressed within the next 90 days to improve overall compliance posture."
                    : "The organization demonstrates strong security controls across all NIST CSF functions. Continue monitoring and maintain current security practices."}
                </div>
                <div className="mt-5 flex items-center justify-center gap-6 text-[11px] text-slate-600">
                  <span>Auditor: Senior Auditor</span>
                  <span>·</span>
                  <span>Date: August 7, 2026</span>
                  <span>·</span>
                  <span>SRMAudit Platform v1.0</span>
                </div>
              </div>
            </Section>

          </div>
        </div>
      </main>
    </div>
  );
}

// ── Section wrapper ──
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-xl mb-4 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e3158] bg-[#111d35]">
        <span className="text-base">{icon}</span>
        <span className="text-[14px] font-bold text-white">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}