"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type Likelihood = "Rare" | "Unlikely" | "Possible" | "Likely" | "Almost Certain";
type Impact = "Insignificant" | "Minor" | "Moderate" | "Major" | "Catastrophic";
type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface Vulnerability {
  id: string;
  name: string;
  category: string;
  assetId: string;
  assetName: string;
  likelihood: Likelihood;
  impact: Impact;
  riskScore: number;
  riskLevel: RiskLevel;
  description: string;
  auditItem: string;
}

const likelihoodScore: Record<Likelihood, number> = {
  "Rare": 1, "Unlikely": 2, "Possible": 3, "Likely": 4, "Almost Certain": 5,
};
const impactScore: Record<Impact, number> = {
  "Insignificant": 1, "Minor": 2, "Moderate": 3, "Major": 4, "Catastrophic": 5,
};

function getRiskLevel(score: number): RiskLevel {
  if (score >= 16) return "Critical";
  if (score >= 9) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

const vulnLibrary = [
  // Injection
  { id: "V001", name: "SQL Injection", category: "Injection", impact: "Major" as Impact, description: "Unsanitized SQL queries allow database manipulation.", auditItem: "Verify parameterized queries and input validation are enforced on all DB interactions." },
  { id: "V002", name: "Command Injection", category: "Injection", impact: "Catastrophic" as Impact, description: "OS commands executed via user input.", auditItem: "Verify no user input is passed directly to system shell commands." },
  { id: "V003", name: "LDAP Injection", category: "Injection", impact: "Major" as Impact, description: "LDAP queries manipulated via user input.", auditItem: "Verify LDAP input is properly escaped and validated." },
  // Broken Auth
  { id: "V004", name: "Weak Password Policy", category: "Broken Authentication", impact: "Major" as Impact, description: "No complexity requirements for passwords.", auditItem: "Verify password policy enforces minimum 8 characters and complexity requirements." },
  { id: "V005", name: "No Account Lockout", category: "Broken Authentication", impact: "Moderate" as Impact, description: "Unlimited login attempts allow brute force.", auditItem: "Verify account lockout triggers after 5 failed login attempts." },
  { id: "V006", name: "Session Hijacking", category: "Broken Authentication", impact: "Major" as Impact, description: "Session tokens exposed or predictable.", auditItem: "Verify session tokens are random, HttpOnly, and expire correctly." },
  // Sensitive Data
  { id: "V007", name: "No HTTPS / TLS", category: "Sensitive Data Exposure", impact: "Major" as Impact, description: "Data transmitted in plaintext over HTTP.", auditItem: "Verify TLS certificate installed and HTTPS enforced on all endpoints." },
  { id: "V008", name: "Weak Encryption", category: "Sensitive Data Exposure", impact: "Major" as Impact, description: "Outdated or weak encryption algorithms in use.", auditItem: "Verify AES-256 or equivalent encryption is used for sensitive data at rest." },
  { id: "V009", name: "Exposed Database Backup", category: "Sensitive Data Exposure", impact: "Catastrophic" as Impact, description: "Backup files accessible without authentication.", auditItem: "Verify database backups are encrypted and access is restricted to authorized personnel." },
  // Access Control
  { id: "V010", name: "IDOR", category: "Access Control Failures", impact: "Major" as Impact, description: "Direct object references allow unauthorized access.", auditItem: "Verify all object references are validated against user permissions." },
  { id: "V011", name: "Privilege Escalation", category: "Access Control Failures", impact: "Catastrophic" as Impact, description: "Users can elevate their own privileges.", auditItem: "Verify role-based access control is enforced server-side." },
  // Misconfiguration
  { id: "V012", name: "Default Credentials", category: "Security Misconfiguration", impact: "Catastrophic" as Impact, description: "Systems using default admin passwords.", auditItem: "Verify all default credentials are changed on all systems and devices." },
  { id: "V013", name: "Directory Listing Enabled", category: "Security Misconfiguration", impact: "Minor" as Impact, description: "Web server exposes directory contents.", auditItem: "Verify directory listing is disabled on all web servers." },
  { id: "V014", name: "Exposed Admin Panel", category: "Security Misconfiguration", impact: "Major" as Impact, description: "Admin interfaces publicly accessible.", auditItem: "Verify admin panels are restricted by IP allowlist or VPN." },
  { id: "V015", name: "Open Unnecessary Ports", category: "Security Misconfiguration", impact: "Moderate" as Impact, description: "Unused ports and services exposed.", auditItem: "Verify firewall rules block all ports not required for business operations." },
  // XSS/CSRF
  { id: "V016", name: "Cross-Site Scripting (XSS)", category: "Cross-Site Attacks", impact: "Major" as Impact, description: "Malicious scripts injected into web pages.", auditItem: "Verify Content Security Policy headers and output encoding are implemented." },
  { id: "V017", name: "Cross-Site Request Forgery (CSRF)", category: "Cross-Site Attacks", impact: "Moderate" as Impact, description: "Unauthorized actions performed on behalf of users.", auditItem: "Verify CSRF tokens are validated on all state-changing requests." },
  // Logging
  { id: "V018", name: "No Audit Logs", category: "Logging & Monitoring Failure", impact: "Moderate" as Impact, description: "System access and events not logged.", auditItem: "Verify audit logging is enabled and captures authentication, access, and error events." },
  // Software
  { id: "V019", name: "Outdated Server Software", category: "Dependency & Software Issues", impact: "Major" as Impact, description: "Servers running vulnerable software versions.", auditItem: "Verify patch management process ensures software is updated within 30 days of release." },
];

const assets = [
  { id: "A-001", name: "Student Information System" },
  { id: "A-002", name: "HR Database" },
  { id: "A-003", name: "LMS Website" },
  { id: "A-004", name: "Internal Network Switch" },
  { id: "A-005", name: "API Server" },
];

const categories = [...new Set(vulnLibrary.map((v) => v.category))];

const riskConfig: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  Critical: { color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/30" },
  High:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  Medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  Low:      { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/25" },
};

const matrixColor = (score: number) => {
  if (score >= 16) return "bg-rose-500/25 border-rose-500/40 text-rose-300";
  if (score >= 9)  return "bg-orange-500/20 border-orange-500/35 text-orange-300";
  if (score >= 4)  return "bg-yellow-500/15 border-yellow-500/30 text-yellow-300";
  return "bg-green-500/12 border-green-500/25 text-green-300";
};

export default function VulnerabilitiesPage() {
  const [findings, setFindings] = useState<Vulnerability[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [selectedVulns, setSelectedVulns] = useState<string[]>([]);
  const [likelihoodMap, setLikelihoodMap] = useState<Record<string, Likelihood>>({});
  const [filterCategory, setFilterCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const likelihoods: Likelihood[] = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
  const impacts: Impact[] = ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"];

  function toggleVuln(id: string) {
    setSelectedVulns((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function handleAnalyze() {
    if (!selectedAsset || selectedVulns.length === 0) return;
    const asset = assets.find((a) => a.id === selectedAsset);
    if (!asset) return;
    const newFindings: Vulnerability[] = selectedVulns.map((vid) => {
      const vuln = vulnLibrary.find((v) => v.id === vid)!;
      const likelihood = likelihoodMap[vid] || "Possible";
      const ls = likelihoodScore[likelihood];
      const is = impactScore[vuln.impact];
      const score = ls * is;
      return {
        id: `F-${Date.now()}-${vid}`,
        name: vuln.name,
        category: vuln.category,
        assetId: asset.id,
        assetName: asset.name,
        likelihood,
        impact: vuln.impact,
        riskScore: score,
        riskLevel: getRiskLevel(score),
        description: vuln.description,
        auditItem: vuln.auditItem,
      };
    });
    setFindings((prev) => {
      const filtered = prev.filter((f) => f.assetId !== selectedAsset);
      return [...filtered, ...newFindings];
    });
    setStep(1);
    setSelectedVulns([]);
    setLikelihoodMap({});
  }

  const filteredLib = filterCategory === "All"
    ? vulnLibrary
    : vulnLibrary.filter((v) => v.category === filterCategory);

  const stats = {
    total: findings.length,
    critical: findings.filter((f) => f.riskLevel === "Critical").length,
    high: findings.filter((f) => f.riskLevel === "High").length,
    medium: findings.filter((f) => f.riskLevel === "Medium").length,
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Audit" }, { label: "Threats & Vulnerabilities" }]} />

        <div className="p-7 flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">⚠️</div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-white">Threats & Vulnerabilities</h1>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">MODULE 4 · OWASP-based vulnerability identification & risk mapping</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Findings", value: stats.total, color: "text-sky-300", bar: "#0ea5e9" },
              { label: "Critical", value: stats.critical, color: "text-rose-400", bar: "#f43f5e" },
              { label: "High", value: stats.high, color: "text-orange-400", bar: "#fb923c" },
              { label: "Medium", value: stats.medium, color: "text-yellow-400", bar: "#fbbf24" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-500 mb-2">{s.label}</div>
                <div className={`text-[30px] font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="mt-2 h-[3px] bg-[#1e3158] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: stats.total ? `${(s.value / stats.total) * 100}%` : "0%", background: s.bar }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_340px] gap-6">
            {/* LEFT */}
            <div className="space-y-5">
              {/* Step Wizard */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                {/* Step indicator */}
                <div className="px-6 py-4 border-b border-[#1e3158] flex items-center gap-4">
                  {[{ n: 1, label: "Select Asset & Vulnerabilities" }, { n: 2, label: "Set Likelihood" }].map((s) => (
                    <div key={s.n} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all
                        ${step === s.n ? "bg-sky-500 border-sky-500 text-white" : step > s.n ? "bg-teal-500/20 border-teal-500/40 text-teal-400" : "bg-[#111d35] border-[#1e3158] text-slate-500"}`}>
                        {step > s.n ? "✓" : s.n}
                      </div>
                      <span className={`text-[12px] font-medium ${step === s.n ? "text-slate-200" : "text-slate-500"}`}>{s.label}</span>
                      {s.n < 2 && <span className="text-slate-600 mx-1">→</span>}
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <div className="p-6">
                    {/* Asset Select */}
                    <div className="mb-5">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-2">Select Asset to Audit</label>
                      <div className="grid grid-cols-3 gap-2">
                        {assets.map((a) => (
                          <button key={a.id} onClick={() => setSelectedAsset(a.id)}
                            className={`p-3 rounded-xl border text-left transition-all text-[12px] font-medium
                              ${selectedAsset === a.id ? "bg-sky-500/10 border-sky-500/35 text-sky-300" : "bg-[#111d35] border-[#1e3158] text-slate-400 hover:text-slate-200 hover:border-[#243d6b]"}`}>
                            <div className="font-mono text-[10px] text-slate-600 mb-0.5">{a.id}</div>
                            {a.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category filter */}
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {["All", ...categories].map((cat) => (
                        <button key={cat} onClick={() => setFilterCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all
                            ${filterCategory === cat ? "bg-sky-500/10 border-sky-500/30 text-sky-300" : "bg-[#111d35] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Vuln checklist */}
                    <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                      {filteredLib.map((v) => {
                        const checked = selectedVulns.includes(v.id);
                        return (
                          <label key={v.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                              ${checked ? "bg-sky-500/8 border-sky-500/25" : "bg-[#111d35] border-[#1e3158] hover:border-[#243d6b]"}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleVuln(v.id)}
                              className="mt-0.5 accent-sky-500 w-3.5 h-3.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-medium text-slate-200">{v.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${riskConfig[getRiskLevel(3 * impactScore[v.impact])].color} ${riskConfig[getRiskLevel(3 * impactScore[v.impact])].bg} ${riskConfig[getRiskLevel(3 * impactScore[v.impact])].border}`}>
                                  {v.impact}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{v.category} · {v.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1e3158]">
                      <span className="text-[12px] text-slate-500">{selectedVulns.length} vulnerabilities selected</span>
                      <button
                        onClick={() => selectedVulns.length > 0 && setStep(2)}
                        disabled={selectedVulns.length === 0}
                        className="px-5 py-2 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-sky-500/25 transition-all">
                        Next: Set Likelihood →
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="p-6">
                    <p className="text-[12px] text-slate-400 mb-4">Set likelihood for each selected vulnerability. Risk = Likelihood × Impact.</p>
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                      {selectedVulns.map((vid) => {
                        const vuln = vulnLibrary.find((v) => v.id === vid)!;
                        const lh = likelihoodMap[vid] || "Possible";
                        const score = likelihoodScore[lh] * impactScore[vuln.impact];
                        const level = getRiskLevel(score);
                        const cfg = riskConfig[level];
                        return (
                          <div key={vid} className="bg-[#111d35] border border-[#1e3158] rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[12px] font-semibold text-slate-200">{vuln.name}</span>
                              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                                <span className={`font-mono text-[13px] font-bold ${cfg.color}`}>{score}</span>
                                <span className={`text-[10px] font-semibold ${cfg.color}`}>{level}</span>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              {likelihoods.map((lv) => (
                                <button key={lv} onClick={() => setLikelihoodMap((m) => ({ ...m, [vid]: lv }))}
                                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-semibold border transition-all
                                    ${lh === lv ? "bg-sky-500/15 border-sky-500/35 text-sky-300" : "bg-[#0f1a2e] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                                  {lv}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#1e3158]">
                      <button onClick={() => setStep(1)}
                        className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-400 border border-[#1e3158] hover:text-slate-200 transition-colors">
                        ← Back
                      </button>
                      <button onClick={handleAnalyze}
                        className="flex-1 py-2 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                        ⚡ Run Risk Analysis
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Findings Table */}
              {findings.length > 0 && (
                <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#1e3158]">
                    <div className="text-[13px] font-semibold text-slate-200">🔍 Risk Analysis Results ({findings.length})</div>
                  </div>
                  <div className="divide-y divide-[#1e3158]/50">
                    {findings.map((f) => {
                      const cfg = riskConfig[f.riskLevel];
                      const expanded = expandedId === f.id;
                      return (
                        <div key={f.id}>
                          <div className="px-6 py-3.5 flex items-center gap-3 hover:bg-[#0d1526]/50 cursor-pointer transition-colors"
                            onClick={() => setExpandedId(expanded ? null : f.id)}>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                              {f.riskLevel}
                            </span>
                            <div className="flex-1">
                              <div className="text-[12px] font-semibold text-slate-200">{f.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{f.assetName} · {f.category}</div>
                            </div>
                            <div className={`font-mono text-[14px] font-bold ${cfg.color}`}>{f.riskScore}</div>
                            <span className="text-slate-500 text-sm">{expanded ? "▲" : "▼"}</span>
                          </div>
                          {expanded && (
                            <div className="px-6 pb-4 bg-[#0d1526]/30">
                              <div className="grid grid-cols-3 gap-3 mb-3">
                                <div className="bg-[#111d35] border border-[#1e3158] rounded-lg p-3">
                                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Likelihood</div>
                                  <div className="text-[12px] font-semibold text-slate-200">{f.likelihood}</div>
                                </div>
                                <div className="bg-[#111d35] border border-[#1e3158] rounded-lg p-3">
                                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Impact</div>
                                  <div className="text-[12px] font-semibold text-slate-200">{f.impact}</div>
                                </div>
                                <div className="bg-[#111d35] border border-[#1e3158] rounded-lg p-3">
                                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Risk Score</div>
                                  <div className={`text-[16px] font-bold font-mono ${cfg.color}`}>{f.riskScore}/25</div>
                                </div>
                              </div>
                              <div className="bg-sky-500/5 border border-sky-500/15 rounded-lg p-3">
                                <div className="text-[9px] text-sky-400 uppercase tracking-widest font-semibold mb-1">📋 Audit Checklist Item Generated</div>
                                <div className="text-[11px] text-slate-300 leading-relaxed">{f.auditItem}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Risk Matrix */}
            <div className="space-y-4">
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-5 py-4 border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">🎯 Risk Matrix (5×5)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Risk = Likelihood × Impact</div>
                </div>
                <div className="p-5">
                  <div className="flex gap-2 items-start">
                    <div className="text-[9px] text-slate-600 self-center mr-1"
                      style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
                      LIKELIHOOD ↑
                    </div>
                    <div className="flex-1">
                      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                        {[5,4,3,2,1].map((l) =>
                          [1,2,3,4,5].map((i) => {
                            const score = l * i;
                            return (
                              <div key={`${l}-${i}`}
                                className={`aspect-square rounded-md border flex items-center justify-center text-[11px] font-bold font-mono cursor-default transition-all ${matrixColor(score)}`}>
                                {score}
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div className="flex justify-between mt-1.5 text-[9px] text-slate-600">
                        <span>1</span><span>IMPACT →</span><span>5</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {(["Critical","High","Medium","Low"] as RiskLevel[]).map((lvl) => (
                      <div key={lvl} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${riskConfig[lvl].bg} ${riskConfig[lvl].border}`}>
                        <span className={`text-[10px] font-semibold ${riskConfig[lvl].color}`}>{lvl}</span>
                        <span className="text-[9px] text-slate-500 font-mono ml-auto">
                          {lvl === "Critical" ? "≥16" : lvl === "High" ? "9–15" : lvl === "Medium" ? "4–8" : "1–3"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formula */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5">
                <div className="text-[12px] font-semibold text-slate-200 mb-3">🧮 Risk Formula</div>
                <div className="bg-[#111d35] border border-[#1e3158] rounded-xl p-4 text-center">
                  <div className="text-[18px] font-bold font-mono text-sky-300">Risk = L × I</div>
                  <div className="text-[10px] text-slate-500 mt-1">Likelihood × Impact (max 25)</div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {likelihoods.map((l, i) => (
                    <div key={l} className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{l}</span>
                      <span className="font-mono text-slate-400">= {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* OWASP note */}
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-[14px] p-4">
                <div className="text-[11px] font-semibold text-orange-300 mb-1">📚 OWASP Top 10 Based</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Vulnerability library pre-populated with 19 vulnerabilities across 8 OWASP categories. Each finding auto-generates an audit checklist item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
