"use client";

import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type EvidenceType = "Screenshot" | "Policy Document" | "Config Export" | "Photo" | "Other";

interface EvidenceItem {
  id: string;
  name: string;
  type: EvidenceType;
  controlId: string;
  description: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  status: "Verified" | "Pending Review" | "Rejected";
  tags: string[];
}

const evidenceTypeIcon: Record<EvidenceType, string> = {
  "Screenshot": "🖼️",
  "Policy Document": "📄",
  "Config Export": "⚙️",
  "Photo": "📷",
  "Other": "📎",
};

const statusConfig = {
  "Verified":       { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30" },
  "Pending Review": { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  "Rejected":       { color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/30" },
};

const controls = [
  "PR.AC-1 — Identity & credential management",
  "PR.AC-3 — Remote access management",
  "PR.AC-4 — Access permissions (least privilege)",
  "PR.DS-1 — Data-at-rest protection",
  "PR.DS-2 — Data-in-transit protection",
  "PR.IP-4 — Backup management",
  "PR.MA-1 — Patch management",
  "DE.CM-1 — Network monitoring",
  "DE.CM-3 — Personnel activity monitoring",
  "RS.RP-1 — Incident response plan",
  "ID.AM-1 — Asset inventory",
  "ID.RA-1 — Vulnerability assessment",
];

const defaultEvidence: EvidenceItem[] = [
  { id: "E-001", name: "password_policy_screenshot.png", type: "Screenshot", controlId: "PR.AC-1", description: "Screenshot of Active Directory password policy settings showing complexity requirements.", fileSize: "245 KB", uploadedAt: "2026-01-15 09:23", uploadedBy: "Auditor", status: "Verified", tags: ["password", "AD", "compliant"] },
  { id: "E-002", name: "backup_policy_v2.pdf", type: "Policy Document", controlId: "PR.IP-4", description: "Backup and recovery policy document version 2.1 approved by IT management.", fileSize: "1.2 MB", uploadedAt: "2026-01-15 10:45", uploadedBy: "Auditor", status: "Pending Review", tags: ["backup", "policy"] },
  { id: "E-003", name: "firewall_config_export.txt", type: "Config Export", controlId: "DE.CM-1", description: "Exported firewall ruleset showing blocked ports and monitoring rules.", fileSize: "88 KB", uploadedAt: "2026-01-16 14:12", uploadedBy: "Auditor", status: "Verified", tags: ["firewall", "network"] },
  { id: "E-004", name: "server_room_photo.jpg", type: "Photo", controlId: "ID.AM-1", description: "Physical photo of server room access controls and rack documentation.", fileSize: "3.4 MB", uploadedAt: "2026-01-16 15:30", uploadedBy: "Auditor", status: "Pending Review", tags: ["physical", "server room"] },
];

const emptyForm = { name: "", type: "Screenshot" as EvidenceType, controlId: "", description: "", tags: "" };

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<EvidenceItem[]>(defaultEvidence);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [dragOver, setDragOver] = useState(false);
  const [filterType, setFilterType] = useState<EvidenceType | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUpload() {
    if (!form.name || !form.controlId) return;
    const newItem: EvidenceItem = {
      id: `E-${String(evidence.length + 1).padStart(3, "0")}`,
      name: form.name, type: form.type,
      controlId: form.controlId.split(" — ")[0],
      description: form.description, fileSize: "—",
      uploadedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      uploadedBy: "Auditor", status: "Pending Review",
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    setEvidence((prev) => [...prev, newItem]);
    setForm(emptyForm);
    setShowForm(false);
  }

  function updateStatus(id: string, status: EvidenceItem["status"]) {
    setEvidence((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
  }

  function deleteEvidence(id: string) {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  const filtered = evidence.filter((e) => {
    const matchType = filterType === "All" || e.type === filterType;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.controlId.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const selected = evidence.find((e) => e.id === selectedId);
  const stats = {
    total: evidence.length,
    verified: evidence.filter((e) => e.status === "Verified").length,
    pending: evidence.filter((e) => e.status === "Pending Review").length,
    rejected: evidence.filter((e) => e.status === "Rejected").length,
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Audit" }, { label: "Evidence Collection" }]} />
        <div className="p-7 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">📁</div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-white">Evidence Collection</h1>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">MODULE 7 · Upload & manage audit evidence files</div>
              </div>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
              ⬆️ Upload Evidence
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Files", value: stats.total, color: "text-sky-300", bar: "#0ea5e9", pct: 100 },
              { label: "Verified", value: stats.verified, color: "text-green-400", bar: "#22c55e", pct: stats.total ? (stats.verified/stats.total)*100 : 0 },
              { label: "Pending Review", value: stats.pending, color: "text-yellow-400", bar: "#fbbf24", pct: stats.total ? (stats.pending/stats.total)*100 : 0 },
              { label: "Rejected", value: stats.rejected, color: "text-rose-400", bar: "#f43f5e", pct: stats.total ? (stats.rejected/stats.total)*100 : 0 },
            ].map((s) => (
              <div key={s.label} className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-500 mb-2">{s.label}</div>
                <div className={`text-[30px] font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="mt-2 h-[3px] bg-[#1e3158] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.bar }} />
                </div>
              </div>
            ))}
          </div>

          {/* Upload Form */}
          {showForm && (
            <div className="bg-[#0f1a2e] border border-indigo-500/30 rounded-[14px] mb-5">
              <div className="px-6 py-4 border-b border-[#1e3158] bg-indigo-500/5 flex items-center justify-between">
                <div className="text-[13px] font-semibold text-indigo-300">⬆️ Upload New Evidence</div>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
              </div>
              <div className="p-6">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) setForm((f) => ({ ...f, name: file.name })); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-5 ${dragOver ? "border-indigo-500/60 bg-indigo-500/10" : "border-[#1e3158] hover:border-indigo-500/40 hover:bg-indigo-500/5"}`}>
                  <input ref={fileInputRef} type="file" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setForm((prev) => ({ ...prev, name: f.name })); }} />
                  <div className="text-3xl mb-2">📂</div>
                  <div className="text-[13px] font-semibold text-slate-300">{form.name ? `✅ ${form.name}` : "Drop file here or click to browse"}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Screenshots, PDFs, config exports, photos</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Evidence Type</label>
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EvidenceType }))}
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-indigo-500/50 transition-colors">
                      {(["Screenshot", "Policy Document", "Config Export", "Photo", "Other"] as EvidenceType[]).map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Related Control *</label>
                    <select value={form.controlId} onChange={(e) => setForm((f) => ({ ...f, controlId: e.target.value }))}
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-indigo-500/50 transition-colors">
                      <option value="">Select control...</option>
                      {controls.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What does this evidence demonstrate?" rows={2}
                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-colors resize-none" />
                </div>
                <div className="mb-5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="e.g. password, policy, compliant"
                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-colors" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-400 border border-[#1e3158] hover:text-slate-200 transition-colors">Cancel</button>
                  <button onClick={handleUpload} className="px-5 py-2 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg transition-all">Upload Evidence</button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-[1fr_300px] gap-6">
            {/* LEFT — List */}
            <div>
              <div className="flex gap-3 mb-4 flex-wrap items-center">
                <div className="flex items-center gap-2 bg-[#0f1a2e] border border-[#1e3158] rounded-lg px-3 py-2 flex-1 max-w-[220px]">
                  <span className="text-slate-500 text-sm">🔍</span>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search evidence..."
                    className="bg-transparent outline-none text-[12px] text-slate-200 placeholder:text-slate-600 flex-1" />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(["All", "Screenshot", "Policy Document", "Config Export", "Photo"] as const).map((t) => (
                    <button key={t} onClick={() => setFilterType(t as EvidenceType | "All")}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${filterType === t ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-[#0f1a2e] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                      {t === "All" ? "All Types" : `${evidenceTypeIcon[t as EvidenceType]} ${t}`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#1e3158]">
                  <div className="text-[12px] font-semibold text-slate-200">Evidence Files ({filtered.length})</div>
                </div>
                <div className="divide-y divide-[#1e3158]/50">
                  {filtered.map((item) => {
                    const sCfg = statusConfig[item.status];
                    const isSelected = selectedId === item.id;
                    return (
                      <div key={item.id} onClick={() => setSelectedId(isSelected ? null : item.id)}
                        className={`px-5 py-4 cursor-pointer transition-all ${isSelected ? "bg-indigo-500/8 border-l-2 border-indigo-500" : "hover:bg-[#0d1526]/40 border-l-2 border-transparent"}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#111d35] border border-[#1e3158] flex items-center justify-center text-xl flex-shrink-0">
                            {evidenceTypeIcon[item.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[12px] font-semibold text-slate-200 truncate">{item.name}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0 ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>{item.status}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">{item.controlId} · {item.type} · {item.fileSize}</div>
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {item.tags.map((tag) => <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e3158] text-slate-400">{tag}</span>)}
                            </div>
                          </div>
                          <div className="text-[9px] font-mono text-slate-600 flex-shrink-0">{item.uploadedAt}</div>
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && <div className="px-5 py-10 text-center text-[12px] text-slate-600">No evidence files found.</div>}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {selected ? (
                <div className="bg-[#0f1a2e] border border-indigo-500/25 rounded-[14px]">
                  <div className="px-5 py-4 border-b border-[#1e3158] flex items-center justify-between">
                    <div className="text-[12px] font-semibold text-slate-200">📋 Evidence Detail</div>
                    <button onClick={() => setSelectedId(null)} className="text-slate-500 hover:text-slate-300">×</button>
                  </div>
                  <div className="p-5">
                    <div className="w-full aspect-video bg-[#111d35] border border-[#1e3158] rounded-xl flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{evidenceTypeIcon[selected.type]}</div>
                        <div className="text-[11px] text-slate-500">{selected.name}</div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {[["ID", selected.id], ["Control", selected.controlId], ["Type", selected.type], ["Size", selected.fileSize], ["Uploaded", selected.uploadedAt]].map(([l, v]) => (
                        <div key={l} className="flex justify-between">
                          <span className="text-[10px] text-slate-500">{l}</span>
                          <span className="text-[10px] font-medium text-slate-300">{v}</span>
                        </div>
                      ))}
                    </div>
                    {selected.description && (
                      <div className="bg-[#111d35] border border-[#1e3158] rounded-lg p-3 mb-4">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Description</div>
                        <div className="text-[11px] text-slate-300 leading-relaxed">{selected.description}</div>
                      </div>
                    )}
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Update Status</div>
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {(["Verified", "Pending Review", "Rejected"] as const).map((s) => {
                        const cfg = statusConfig[s];
                        return (
                          <button key={s} onClick={() => updateStatus(selected.id, s)}
                            className={`py-1.5 rounded-lg text-[9px] font-semibold border transition-all ${selected.status === s ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "bg-[#111d35] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => deleteEvidence(selected.id)}
                      className="w-full py-1.5 rounded-lg text-[11px] font-semibold border border-rose-500/25 text-rose-400 bg-rose-500/8 hover:bg-rose-500/15 transition-colors">
                      🗑️ Delete Evidence
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5">
                  <div className="text-[12px] font-semibold text-slate-200 mb-3">📊 Evidence by Type</div>
                  <div className="space-y-3">
                    {(["Screenshot", "Policy Document", "Config Export", "Photo"] as EvidenceType[]).map((type) => {
                      const count = evidence.filter((e) => e.type === type).length;
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className="text-base w-6">{evidenceTypeIcon[type]}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-400">{type}</span>
                              <span className="text-slate-500 font-mono">{count}</span>
                            </div>
                            <div className="h-1.5 bg-[#1e3158] rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-500" style={{ width: evidence.length ? `${(count/evidence.length)*100}%` : "0%" }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-[14px] p-4">
                <div className="text-[11px] font-semibold text-indigo-300 mb-2">💡 Evidence Tips</div>
                <div className="space-y-1.5 text-[10px] text-slate-400 leading-relaxed">
                  <div>• Upload screenshots to prove controls exist</div>
                  <div>• Include policy PDFs for document-based controls</div>
                  <div>• Config exports validate technical controls</div>
                  <div>• Each control needs at least one evidence file</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
