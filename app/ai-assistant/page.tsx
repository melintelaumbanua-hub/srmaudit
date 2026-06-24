"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type Mode = "advisor" | "explainer" | "recommendation" | "report";
type Role = "user" | "ai";

interface Message {
  role: Role;
  text: string;
  mode?: Mode;
  timestamp: string;
}

const modeConfig: Record<Mode, { label: string; icon: string; color: string; bg: string; border: string; desc: string }> = {
  advisor:        { label: "Audit Advisor",       icon: "🧠", color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/25",    desc: "Ask anything about audit controls & risks" },
  explainer:      { label: "Vuln Explainer",      icon: "🔍", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25", desc: "Explain vulnerabilities in plain language" },
  recommendation: { label: "Control Recommender", icon: "✅", color: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/25",   desc: "Get mitigation & control recommendations" },
  report:         { label: "Report Writer",        icon: "📄", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/25", desc: "Auto-generate executive summaries & reports" },
};

const prompts: Record<Mode, string[]> = {
  advisor: ["Is not having backup dangerous?", "What is the risk of no MFA?", "How critical is patch management?", "What does NIST CSF cover?"],
  explainer: ["Explain SQL Injection to management", "What is XSS in simple terms?", "Explain CSRF risk", "What is privilege escalation?"],
  recommendation: ["How to fix weak password policy?", "Recommend controls for data encryption", "How to implement MFA quickly?", "Steps to enable audit logging"],
  report: ["Generate executive summary", "Write audit conclusion", "Summarize key findings", "Generate final audit opinion"],
};

const knowledge: Record<string, string> = {
  // Advisor
  "backup": `**Risk: No Backup Policy**\n\nWithout backups, a ransomware attack or hardware failure means **permanent data loss**. For a university, this includes student records, grades, and financial data.\n\n**Business Impact:**\n• Loss of academic records — legal liability\n• Operational downtime — classes suspended\n• Regulatory fines under data protection laws\n\n**Recommendation:**\nImplement the 3-2-1 backup rule: 3 copies, 2 different media, 1 offsite. Encrypt all backups with AES-256. Test restoration monthly.`,

  "mfa": `**Risk: No Multi-Factor Authentication**\n\nPasswords alone are no longer sufficient. **85% of breaches** involve stolen or weak credentials.\n\n**Business Impact:**\n• Admin account takeover → full system compromise\n• Data exfiltration of student/staff records\n• Ransomware deployment via compromised admin\n\n**Recommendation:**\nEnable TOTP-based MFA (Google Authenticator / Microsoft Authenticator) for all privileged accounts within **14 days**. Consider hardware keys for system administrators.`,

  "patch": `**Risk: Poor Patch Management**\n\nUnpatched software is the #1 vector for ransomware and exploits. Attackers actively scan for known vulnerabilities (CVEs).\n\n**Business Impact:**\n• Known exploits can be weaponized within 24–48 hours of CVE disclosure\n• Compliance failure under ISO 27001 / NIST\n\n**Recommendation:**\nEstablish a patch window: Critical patches within **7 days**, High within **30 days**. Use automated patch management tools (WSUS, Ansible).`,

  "nist": `**NIST Cybersecurity Framework (CSF)**\n\nNIST CSF organizes cybersecurity into **5 core functions**:\n\n🔵 **Identify** — Know your assets, risks, and governance\n🟢 **Protect** — Implement safeguards (access control, encryption, training)\n🟡 **Detect** — Monitor for anomalies and security events\n🟠 **Respond** — Execute incident response plans\n🔴 **Recover** — Restore operations and improve\n\nEach function contains categories and subcategories mapped to specific controls. Your current audit score is **72%** — targeting **85%** for compliance.`,

  // Explainer
  "sql": `**SQL Injection — Plain Language Explanation**\n\n*What it is:*\nImagine your employee search box as a door. SQL Injection is when an attacker types a secret code into that door that tricks it into opening the entire building — not just the room you intended.\n\n*What attackers can do:*\n• Steal your entire database (student names, salaries, passwords)\n• Delete all records permanently\n• Bypass login pages entirely\n\n*Real example:*\nAttacker types: \`' OR '1'='1\` into a search field → database returns all records\n\n*How to fix:*\nUse **parameterized queries** — this separates the "command" from the "data" so the trick doesn't work.`,

  "xss": `**Cross-Site Scripting (XSS) — Plain Language**\n\n*What it is:*\nXSS is like a graffiti artist sneaking malicious messages onto your website. When other users visit, their browsers "read" the graffiti and execute it as commands.\n\n*What attackers can do:*\n• Steal session cookies → hijack logged-in accounts\n• Redirect users to phishing sites\n• Deface your web portal\n\n*Business Impact:*\nIf your LMS is vulnerable, attackers can hijack lecturer accounts and modify student grades.\n\n*How to fix:*\nImplement **Content Security Policy (CSP)** headers and encode all user-generated output before displaying it.`,

  "csrf": `**CSRF (Cross-Site Request Forgery) — Plain Language**\n\n*What it is:*\nCSRF tricks a logged-in user into unknowingly sending a request to your system. Like someone forging your signature while you're asleep.\n\n*Example:*\nA student receives an email with a link. Clicking it silently sends a request to the grading system that changes their grades — while they're already logged in.\n\n*How to fix:*\nAdd **CSRF tokens** to every form — a secret one-time code that verifies the request actually came from your website.`,

  "privilege": `**Privilege Escalation — Plain Language**\n\n*What it is:*\nA regular user finds a weakness that lets them grant themselves administrator powers — like a student who finds a way to give themselves a master key to all offices.\n\n*Business Impact:*\n• Student gains access to all academic records\n• Staff member accesses payroll data\n• Complete system compromise\n\n*How to fix:*\nEnforce **Role-Based Access Control (RBAC)** server-side. Never trust client-side permission checks. Regular access reviews quarterly.`,

  // Recommendations
  "password": `**Fixing Weak Password Policy — Step by Step**\n\n✅ **Immediate Actions (Day 1–3):**\n1. Set minimum password length to **12 characters**\n2. Require complexity: uppercase, lowercase, numbers, symbols\n3. Enable **account lockout** after 5 failed attempts (15-min lockout)\n\n✅ **Short-term (Week 1–2):**\n4. Force password reset for all accounts\n5. Block common passwords (top 10,000 list)\n6. Enable password history (prevent reuse of last 10 passwords)\n\n✅ **Long-term:**\n7. Implement MFA as the primary authentication layer\n8. Consider passwordless authentication (FIDO2)\n\n*Control Reference: PR.AC-1, NIST SP 800-63B*`,

  "encryption": `**Data Encryption Controls — Recommendations**\n\n🔐 **Data at Rest (PR.DS-1):**\n• Enable AES-256 encryption on all databases\n• Encrypt backup files before storage\n• Use encrypted volumes for sensitive file storage (BitLocker / LUKS)\n\n🔐 **Data in Transit (PR.DS-2):**\n• Enforce TLS 1.3 on all endpoints\n• Disable TLS 1.0 and 1.1 immediately\n• Implement HSTS headers (HTTP Strict Transport Security)\n• Use certificate pinning for mobile apps\n\n🔐 **Key Management:**\n• Store encryption keys separately from encrypted data\n• Rotate keys annually\n• Use a Hardware Security Module (HSM) for critical systems`,

  "logging": `**Enabling Audit Logging — Implementation Guide**\n\n📋 **What to Log (DE.CM-3):**\n• Authentication events (login, logout, failed attempts)\n• Privilege escalation and role changes\n• Data access and export events\n• Admin configuration changes\n• System errors and exceptions\n\n📋 **Implementation Steps:**\n1. Enable application-level logging in your LMS/HR system\n2. Configure OS-level audit logging (Windows Event Log / auditd)\n3. Forward logs to a **centralized SIEM** (Elastic, Splunk, or Wazuh)\n4. Set retention policy: minimum **90 days** online, 1 year archive\n5. Configure alerts for suspicious patterns\n\n📋 **Review Process:**\nAssign a dedicated analyst to review critical alerts daily.`,

  // Report
  "executive": `**Executive Summary — SRM Audit 2026**\n\n---\n\n**Audit Scope:** Human Resources Information Systems, Learning Management Platform, Cloud Infrastructure\n\n**Framework:** NIST Cybersecurity Framework (CSF)\n\n**Overall Compliance Score: 72% — Needs Improvement**\n\n**Key Findings:**\n🔴 **Critical (1):** Administrative portal lacks Multi-Factor Authentication, exposing the organization to account takeover risks.\n\n🟠 **High (2):** SQL Injection vulnerability in employee search module; database backup files stored without encryption.\n\n🟡 **Medium (1):** Incomplete audit logging on the Learning Management System.\n\n**Recommendation:**\nImmediate remediation of Critical and High findings is required within 30 days. The organization should target 85% compliance by Q2 2026 to meet acceptable risk thresholds.\n\n*Prepared by: SRMAudit Platform · February 2026*`,

  "conclusion": `**Audit Conclusion**\n\n---\n\nBased on the assessment conducted against the NIST Cybersecurity Framework, the organization demonstrates **partial compliance** with a score of **72%**.\n\n**Strengths:**\n• Asset inventory and governance policies are well-established (Identify: 90%)\n• Incident response plan is documented and tested (Respond: 80%)\n• Data-in-transit protection (TLS) is implemented\n\n**Weaknesses:**\n• Authentication controls require immediate strengthening (MFA gap)\n• Data-at-rest encryption is not consistently applied\n• Recovery capabilities are underdeveloped (Recover: 40%)\n\n**Final Opinion: Acceptable Risk with Conditions**\nThe organization may continue operations but must remediate Critical and High findings within 30 days and submit a remediation plan within 7 days.\n\n*Audit period: January–February 2026*`,

  "opinion": `**Final Audit Opinion**\n\n---\n\n⚠️ **VERDICT: ACCEPTABLE RISK — IMMEDIATE ACTION REQUIRED**\n\nThe organization scored **72% compliance** against NIST CSF controls. While foundational governance and asset management practices are in place, critical gaps in authentication, encryption, and monitoring present unacceptable risk exposure.\n\n**Conditions for Acceptable Risk Classification:**\n\n1. ✅ MFA must be enabled on all admin accounts within **14 days**\n2. ✅ Database backup encryption must be implemented within **7 days**\n3. ✅ SQL Injection vulnerability must be patched within **21 days**\n4. ✅ Formal remediation plan must be submitted within **7 days**\n\n**If conditions are not met within 30 days, classification will be elevated to: NEEDS IMMEDIATE ACTION**\n\n*Chief Auditor Sign-off required · SRMAudit Platform 2026*`,
};

function getResponse(input: string, mode: Mode): string {
  const lower = input.toLowerCase();
  if (mode === "advisor") {
    if (lower.includes("backup")) return knowledge["backup"];
    if (lower.includes("mfa") || lower.includes("multi-factor") || lower.includes("authentication")) return knowledge["mfa"];
    if (lower.includes("patch")) return knowledge["patch"];
    if (lower.includes("nist") || lower.includes("csf") || lower.includes("framework")) return knowledge["nist"];
  }
  if (mode === "explainer") {
    if (lower.includes("sql")) return knowledge["sql"];
    if (lower.includes("xss") || lower.includes("cross-site scripting")) return knowledge["xss"];
    if (lower.includes("csrf") || lower.includes("forgery")) return knowledge["csrf"];
    if (lower.includes("privilege") || lower.includes("escalation")) return knowledge["privilege"];
  }
  if (mode === "recommendation") {
    if (lower.includes("password")) return knowledge["password"];
    if (lower.includes("encrypt")) return knowledge["encryption"];
    if (lower.includes("log")) return knowledge["logging"];
    if (lower.includes("mfa") || lower.includes("authentication")) return knowledge["mfa"];
  }
  if (mode === "report") {
    if (lower.includes("executive") || lower.includes("summary")) return knowledge["executive"];
    if (lower.includes("conclusion")) return knowledge["conclusion"];
    if (lower.includes("opinion") || lower.includes("final")) return knowledge["opinion"];
    if (lower.includes("finding") || lower.includes("summarize")) return knowledge["executive"];
  }
  return `I understand you're asking about **"${input}"**.\n\nIn **${modeConfig[mode].label}** mode, I can help you with:\n${prompts[mode].map((p) => `• ${p}`).join("\n")}\n\nTry one of the suggested prompts above, or ask a more specific question about your audit.`;
}

function renderText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-200 font-semibold">$1</strong>')
    .replace(/\n/g, "<br/>")
    .replace(/^---$/gm, '<hr class="border-[#1e3158] my-2"/>');
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AIAssistantPage() {
  const [mode, setMode] = useState<Mode>("advisor");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: `👋 Hello! I'm your **AI Audit Assistant**.\n\nI'm currently in **${modeConfig["advisor"].label}** mode. Select a mode below or ask me anything about your audit.\n\n*Tip: Try the suggested prompts to get started quickly.*`, mode: "advisor", timestamp: now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleMode(m: Mode) {
    setMode(m);
    const cfg = modeConfig[m];
    setMessages((prev) => [...prev, {
      role: "ai",
      text: `Switched to **${cfg.label}** mode ${cfg.icon}\n\n${cfg.desc}.\n\nTry asking:\n${prompts[m].map((p) => `• ${p}`).join("\n")}`,
      mode: m,
      timestamp: now(),
    }]);
  }

  function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg, timestamp: now() }]);
    setLoading(true);
    setTimeout(() => {
      const response = getResponse(msg, mode);
      setMessages((prev) => [...prev, { role: "ai", text: response, mode, timestamp: now() }]);
      setLoading(false);
    }, 800);
  }

  const cfg = modeConfig[mode];

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Tools" }, { label: "AI Assistant" }]} />
        <div className="p-7 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">🤖</div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-white">AI Audit Assistant</h1>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">MODULE 10 · AI-powered audit advisor, explainer & report writer</div>
            </div>
            <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border}`}>
              <span className="text-base">{cfg.icon}</span>
              <span className={`text-[11px] font-semibold ${cfg.color}`}>{cfg.label}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            </div>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {(Object.entries(modeConfig) as [Mode, typeof modeConfig[Mode]][]).map(([key, val]) => (
              <button key={key} onClick={() => handleMode(key)}
                className={`p-4 rounded-[14px] border text-left transition-all hover:-translate-y-0.5
                  ${mode === key ? `${val.bg} ${val.border}` : "bg-[#0f1a2e] border-[#1e3158] hover:border-[#243d6b]"}`}>
                <div className="text-2xl mb-2">{val.icon}</div>
                <div className={`text-[12px] font-bold mb-0.5 ${mode === key ? val.color : "text-slate-300"}`}>{val.label}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{val.desc}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_240px] gap-5 flex-1 min-h-0">
            {/* Chat */}
            <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: "thin", maxHeight: "480px" }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "ai" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">🤖</div>
                    )}
                    <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-4 py-3 rounded-2xl text-[12px] leading-relaxed
                        ${msg.role === "user"
                          ? "bg-sky-500/15 border border-sky-500/25 text-slate-200 rounded-tr-sm"
                          : "bg-[#111d35] border border-[#1e3158] text-slate-300 rounded-tl-sm"}`}
                        dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
                      />
                      <span className="text-[9px] font-mono text-slate-600 px-1">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#111d35] border border-[#1e3158] flex items-center gap-1.5">
                      {[0,1,2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggested prompts */}
              <div className="px-4 py-2.5 border-t border-[#1e3158] flex gap-1.5 flex-wrap">
                {prompts[mode].map((p) => (
                  <button key={p} onClick={() => send(p)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${cfg.bg} ${cfg.border} ${cfg.color} hover:opacity-80`}>
                    {p}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#1e3158] flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Ask ${cfg.label}...`}
                  className="flex-1 bg-[#111d35] border border-[#1e3158] rounded-xl px-4 py-2.5 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
                <button onClick={() => send()}
                  disabled={loading || !input.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all ${loading || !input.trim() ? "bg-[#1e3158] text-slate-600" : "bg-gradient-to-br from-sky-500 to-violet-600 hover:shadow-lg hover:shadow-sky-500/25 hover:scale-105"}`}>
                  ➤
                </button>
              </div>
            </div>

            {/* Right — capabilities */}
            <div className="space-y-3">
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-4">
                <div className="text-[12px] font-semibold text-slate-200 mb-3">🎯 Current Mode</div>
                <div className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border} mb-3`}>
                  <div className="text-xl mb-1">{cfg.icon}</div>
                  <div className={`text-[12px] font-bold ${cfg.color}`}>{cfg.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{cfg.desc}</div>
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Try asking:</div>
                <div className="space-y-1.5">
                  {prompts[mode].map((p) => (
                    <button key={p} onClick={() => send(p)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-[#111d35] border border-[#1e3158] text-[11px] text-slate-400 hover:text-slate-200 hover:border-sky-500/25 transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-4">
                <div className="text-[11px] font-semibold text-slate-200 mb-2">📊 Coverage</div>
                {(Object.entries(modeConfig) as [Mode, typeof modeConfig[Mode]][]).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 py-1.5">
                    <span className="text-sm">{val.icon}</span>
                    <span className={`text-[10px] font-medium ${mode === key ? val.color : "text-slate-500"}`}>{val.label}</span>
                    {mode === key && <span className="ml-auto text-[9px] text-teal-400 font-semibold">ACTIVE</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
