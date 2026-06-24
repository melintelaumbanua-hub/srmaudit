"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type ExposureLevel = "Low" | "Medium" | "High" | "Critical";

const sectorOptions = [
  "Education", "Healthcare", "Finance & Banking", "Government",
  "Retail & E-Commerce", "Manufacturing", "Technology", "Telecommunications",
];

const systemTypes = [
  { id: "web", icon: "🌐", label: "Web Application" },
  { id: "mobile", icon: "📱", label: "Mobile App" },
  { id: "network", icon: "🔗", label: "Internal Network" },
  { id: "cloud", icon: "☁️", label: "Cloud Infrastructure" },
  { id: "erp", icon: "🏭", label: "ERP System" },
  { id: "iot", icon: "📡", label: "IoT / Embedded" },
];

function calcExposure(employees: number, systems: string[], sector: string): ExposureLevel {
  let score = 0;
  if (employees > 1000) score += 3;
  else if (employees > 100) score += 2;
  else score += 1;
  score += systems.length;
  if (["Finance & Banking", "Healthcare", "Government"].includes(sector)) score += 2;
  if (score >= 8) return "Critical";
  if (score >= 6) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

const exposureConfig: Record<ExposureLevel, { color: string; bg: string; border: string; bar: string; desc: string }> = {
  Low:      { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30",  bar: "bg-green-500",  desc: "Organization has minimal attack surface. Standard controls sufficient." },
  Medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", bar: "bg-yellow-500", desc: "Moderate exposure. Additional controls and monitoring recommended." },
  High:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", bar: "bg-orange-500", desc: "High attack surface. Enhanced security posture required." },
  Critical: { color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/30",   bar: "bg-rose-500",   desc: "Critical exposure level. Immediate comprehensive audit required." },
};

const exposureScore: Record<ExposureLevel, number> = { Low: 25, Medium: 55, High: 75, Critical: 95 };

export default function OrganizationPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    orgName: "",
    sector: "",
    employees: "",
    address: "",
    contactName: "",
    contactEmail: "",
    systems: [] as string[],
    notes: "",
  });

  const exposure = form.sector && form.employees && form.systems.length > 0
    ? calcExposure(Number(form.employees), form.systems, form.sector)
    : null;

  function toggleSystem(id: string) {
    setForm((f) => ({
      ...f,
      systems: f.systems.includes(id) ? f.systems.filter((s) => s !== id) : [...f.systems, id],
    }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const cfg = exposure ? exposureConfig[exposure] : null;

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Audit" }, { label: "Organization Profile" }]} />

        <div className="p-7 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-teal-500 to-sky-600 flex items-center justify-center text-xl shadow-lg shadow-teal-500/20">
                  🏢
                </div>
                <div>
                  <h1 className="text-[22px] font-bold tracking-tight text-white">Organization Profile</h1>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">MODULE 2 · Define audit scope & exposure level</div>
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all
                ${saved
                  ? "bg-green-500/20 border border-green-500/40 text-green-400"
                  : "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5"
                }`}
            >
              {saved ? "✅ Saved!" : "💾 Save Profile"}
            </button>
          </div>

          <div className="grid grid-cols-[1fr_320px] gap-6">
            {/* LEFT — Form */}
            <div className="space-y-5">
              {/* Basic Info */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-6 py-4 border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">📋 Basic Information</div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Organization Name *</label>
                    <input
                      value={form.orgName}
                      onChange={(e) => { setForm((f) => ({ ...f, orgName: e.target.value })); setSaved(false); }}
                      placeholder="e.g. Universitas SRM Indonesia"
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Business Sector *</label>
                    <select
                      value={form.sector}
                      onChange={(e) => { setForm((f) => ({ ...f, sector: e.target.value })); setSaved(false); }}
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 outline-none focus:border-sky-500/50 transition-colors appearance-none"
                    >
                      <option value="">Select sector...</option>
                      {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Number of Employees *</label>
                    <input
                      type="number"
                      value={form.employees}
                      onChange={(e) => { setForm((f) => ({ ...f, employees: e.target.value })); setSaved(false); }}
                      placeholder="e.g. 500"
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Contact Person</label>
                    <input
                      value={form.contactName}
                      onChange={(e) => { setForm((f) => ({ ...f, contactName: e.target.value })); setSaved(false); }}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Contact Email</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => { setForm((f) => ({ ...f, contactEmail: e.target.value })); setSaved(false); }}
                      placeholder="e.g. it@university.edu"
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Address / Location</label>
                    <input
                      value={form.address}
                      onChange={(e) => { setForm((f) => ({ ...f, address: e.target.value })); setSaved(false); }}
                      placeholder="e.g. Jakarta, Indonesia"
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* System Types */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-6 py-4 border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">🖥️ System Types in Scope *</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Select all systems that will be audited</div>
                </div>
                <div className="p-6 grid grid-cols-3 gap-3">
                  {systemTypes.map((sys) => {
                    const active = form.systems.includes(sys.id);
                    return (
                      <button
                        key={sys.id}
                        onClick={() => toggleSystem(sys.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all
                          ${active
                            ? "bg-sky-500/10 border-sky-500/40 text-sky-300"
                            : "bg-[#111d35] border-[#1e3158] text-slate-500 hover:text-slate-300 hover:border-[#243d6b]"
                          }`}
                      >
                        <span className="text-xl">{sys.icon}</span>
                        <span className="text-[12px] font-medium leading-tight">{sys.label}</span>
                        {active && <span className="ml-auto text-sky-400 text-sm">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-6 py-4 border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">📝 Additional Notes</div>
                </div>
                <div className="p-6">
                  <textarea
                    value={form.notes}
                    onChange={(e) => { setForm((f) => ({ ...f, notes: e.target.value })); setSaved(false); }}
                    placeholder="Any additional context about the organization, known risks, previous audit history..."
                    rows={4}
                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-3 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — Exposure Panel */}
            <div className="space-y-4">
              {/* Exposure Result */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-5 py-4 border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">⚡ Exposure Level</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Auto-calculated from your inputs</div>
                </div>
                <div className="p-5">
                  {exposure && cfg ? (
                    <div>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${cfg.bg} ${cfg.border} mb-4`}>
                        <span className={`text-[18px] font-bold font-mono ${cfg.color}`}>{exposure}</span>
                        <span className="text-[11px] text-slate-400">Exposure</span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                          <span>Score</span>
                          <span className={cfg.color}>{exposureScore[exposure]}%</span>
                        </div>
                        <div className="h-2 bg-[#1e3158] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                            style={{ width: `${exposureScore[exposure]}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{cfg.desc}</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-3 opacity-30">📊</div>
                      <div className="text-[12px] text-slate-600">Fill in sector, employees, and system types to calculate exposure</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exposure Formula */}
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                <div className="px-5 py-4 border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">🧮 Calculation Logic</div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { factor: "Org Size", rule: ">1000 staff = +3, >100 = +2, else +1", icon: "👥" },
                    { factor: "System Count", rule: "+1 per system type selected", icon: "🖥️" },
                    { factor: "Sector Risk", rule: "Finance/Health/Gov = +2", icon: "🏛️" },
                  ].map((item) => (
                    <div key={item.factor} className="flex gap-3 items-start">
                      <span className="text-base mt-0.5">{item.icon}</span>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-300">{item.factor}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.rule}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-[#1e3158]">
                    <div className="text-[10px] font-mono text-slate-600">
                      Score ≥8 → Critical · ≥6 → High<br/>
                      ≥4 → Medium · &lt;4 → Low
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {form.orgName && (
                <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px]">
                  <div className="px-5 py-4 border-b border-[#1e3158]">
                    <div className="text-[13px] font-semibold text-slate-200">📌 Profile Summary</div>
                  </div>
                  <div className="p-5 space-y-2.5">
                    {[
                      { label: "Organization", value: form.orgName || "—" },
                      { label: "Sector", value: form.sector || "—" },
                      { label: "Employees", value: form.employees ? `${Number(form.employees).toLocaleString()} staff` : "—" },
                      { label: "Systems", value: form.systems.length > 0 ? `${form.systems.length} type(s)` : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-500">{label}</span>
                        <span className="text-[11px] font-medium text-slate-300 text-right max-w-[160px] truncate">{value}</span>
                      </div>
                    ))}
                    {exposure && cfg && (
                      <div className="flex justify-between items-center pt-2 border-t border-[#1e3158]">
                        <span className="text-[11px] text-slate-500">Exposure</span>
                        <span className={`text-[11px] font-bold ${cfg.color}`}>{exposure}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Next Step */}
              <div className="bg-sky-500/5 border border-sky-500/20 rounded-[14px] p-5">
                <div className="text-[12px] font-semibold text-sky-300 mb-2">➡️ Next Step</div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  After saving the organization profile, proceed to register assets in the Asset Inventory module.
                </p>
                <button className="w-full py-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-[12px] font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors">
                  Go to Asset Inventory →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
