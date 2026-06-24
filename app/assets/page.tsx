"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type CIALevel = "High" | "Medium" | "Low";
type AssetType = "Application" | "Server" | "Data" | "Network" | "Endpoint" | "Cloud";

interface Asset {
  id: string;
  name: string;
  owner: string;
  location: string;
  type: AssetType;
  confidentiality: CIALevel;
  integrity: CIALevel;
  availability: CIALevel;
  criticality: number;
  criticalityLevel: "Critical" | "High" | "Medium" | "Low";
}

const ciaScore: Record<CIALevel, number> = { High: 3, Medium: 2, Low: 1 };

function calcCriticality(c: CIALevel, i: CIALevel, a: CIALevel): { score: number; level: Asset["criticalityLevel"] } {
  const score = ciaScore[c] + ciaScore[i] + ciaScore[a];
  if (score >= 8) return { score, level: "Critical" };
  if (score >= 6) return { score, level: "High" };
  if (score >= 4) return { score, level: "Medium" };
  return { score, level: "Low" };
}

const assetTypes: AssetType[] = ["Application", "Server", "Data", "Network", "Endpoint", "Cloud"];
const ciaLevels: CIALevel[] = ["High", "Medium", "Low"];

const typeIcon: Record<AssetType, string> = {
  Application: "🌐", Server: "🖥️", Data: "🗄️",
  Network: "🔗", Endpoint: "💻", Cloud: "☁️",
};

const critConfig = {
  Critical: { color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/30" },
  High:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  Medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  Low:      { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/25" },
};

const ciaColor: Record<CIALevel, string> = {
  High: "text-rose-400 bg-rose-500/10 border-rose-500/25",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  Low: "text-green-400 bg-green-500/10 border-green-500/25",
};

const defaultAssets: Asset[] = [
  { id: "A-001", name: "Student Information System", owner: "IT Department", location: "Cloud Server", type: "Application", confidentiality: "High", integrity: "High", availability: "High", criticality: 9, criticalityLevel: "Critical" },
  { id: "A-002", name: "HR Database", owner: "HR Department", location: "On-Premise", type: "Data", confidentiality: "High", integrity: "High", availability: "Medium", criticality: 8, criticalityLevel: "Critical" },
  { id: "A-003", name: "LMS Website", owner: "Academic Division", location: "Cloud Server", type: "Application", confidentiality: "Medium", integrity: "High", availability: "High", criticality: 7, criticalityLevel: "High" },
  { id: "A-004", name: "Internal Network Switch", owner: "IT Department", location: "Server Room", type: "Network", confidentiality: "Medium", integrity: "Medium", availability: "High", criticality: 6, criticalityLevel: "High" },
];

const emptyForm = {
  name: "", owner: "", location: "",
  type: "Application" as AssetType,
  confidentiality: "Medium" as CIALevel,
  integrity: "Medium" as CIALevel,
  availability: "Medium" as CIALevel,
};

export default function AssetInventoryPage() {
  const [assets, setAssets] = useState<Asset[]>(defaultAssets);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<AssetType | "All">("All");
  const [editId, setEditId] = useState<string | null>(null);

  const preview = calcCriticality(form.confidentiality, form.integrity, form.availability);

  function handleSubmit() {
    if (!form.name || !form.owner || !form.location) return;
    const { score, level } = calcCriticality(form.confidentiality, form.integrity, form.availability);
    if (editId) {
      setAssets((prev) => prev.map((a) => a.id === editId
        ? { ...a, ...form, criticality: score, criticalityLevel: level }
        : a));
      setEditId(null);
    } else {
      const newAsset: Asset = {
        id: `A-${String(assets.length + 1).padStart(3, "0")}`,
        ...form, criticality: score, criticalityLevel: level,
      };
      setAssets((prev) => [...prev, newAsset]);
    }
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleEdit(asset: Asset) {
    setForm({ name: asset.name, owner: asset.owner, location: asset.location, type: asset.type, confidentiality: asset.confidentiality, integrity: asset.integrity, availability: asset.availability });
    setEditId(asset.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  const filtered = assets.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.owner.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || a.type === filterType;
    return matchSearch && matchType;
  });

  const stats = {
    total: assets.length,
    critical: assets.filter((a) => a.criticalityLevel === "Critical").length,
    high: assets.filter((a) => a.criticalityLevel === "High").length,
    avgScore: assets.length ? (assets.reduce((s, a) => s + a.criticality, 0) / assets.length).toFixed(1) : "0",
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Audit" }, { label: "Asset Inventory" }]} />

        <div className="p-7 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-violet-500 to-sky-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/20">🗄️</div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-white">Asset Inventory</h1>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">MODULE 3 · Register & score assets by CIA value</div>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all"
            >
              ➕ Add Asset
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Assets", value: stats.total, icon: "📦", color: "text-sky-300", bar: "#0ea5e9", pct: 100 },
              { label: "Critical Assets", value: stats.critical, icon: "🚨", color: "text-rose-400", bar: "#f43f5e", pct: stats.total ? (stats.critical / stats.total) * 100 : 0 },
              { label: "High Risk", value: stats.high, icon: "⚠️", color: "text-orange-400", bar: "#fb923c", pct: stats.total ? (stats.high / stats.total) * 100 : 0 },
              { label: "Avg CIA Score", value: stats.avgScore, icon: "📊", color: "text-teal-400", bar: "#14b8a6", pct: (Number(stats.avgScore) / 9) * 100 },
            ].map((s) => (
              <div key={s.label} className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-500">{s.label}</div>
                  <span className="text-base opacity-20">{s.icon}</span>
                </div>
                <div className={`text-[30px] font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="mt-2 h-[3px] bg-[#1e3158] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.bar }} />
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-5">
            <div className="flex items-center gap-2 bg-[#0f1a2e] border border-[#1e3158] rounded-lg px-3 py-2 flex-1 max-w-[280px]">
              <span className="text-slate-500 text-sm">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="bg-transparent outline-none text-[12px] text-slate-200 placeholder:text-slate-600 flex-1"
              />
            </div>
            <div className="flex gap-1.5">
              {(["All", ...assetTypes] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t as AssetType | "All")}
                  className={`px-3 py-2 rounded-lg text-[11px] font-medium transition-all border
                    ${filterType === t
                      ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                      : "bg-[#0f1a2e] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}
                >
                  {t === "All" ? "All Types" : `${typeIcon[t as AssetType]} ${t}`}
                </button>
              ))}
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-[#0f1a2e] border border-sky-500/30 rounded-[14px] mb-5 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1e3158] bg-sky-500/5 flex items-center justify-between">
                <div className="text-[13px] font-semibold text-sky-300">{editId ? "✏️ Edit Asset" : "➕ Register New Asset"}</div>
                <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Asset Name *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Student Database"
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Owner *</label>
                    <input value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                      placeholder="e.g. IT Department"
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Location *</label>
                    <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. Cloud Server"
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-5">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Asset Type</label>
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AssetType }))}
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-sky-500/50 transition-colors">
                      {assetTypes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {(["confidentiality", "integrity", "availability"] as const).map((cia) => (
                    <div key={cia}>
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">{cia[0].toUpperCase() + cia.slice(1)}</label>
                      <div className="flex gap-1">
                        {ciaLevels.map((lvl) => (
                          <button key={lvl} onClick={() => setForm((f) => ({ ...f, [cia]: lvl }))}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all
                              ${form[cia] === lvl
                                ? lvl === "High" ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                                  : lvl === "Medium" ? "bg-yellow-500/15 border-yellow-500/35 text-yellow-400"
                                  : "bg-green-500/15 border-green-500/30 text-green-400"
                                : "bg-[#111d35] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                            {lvl[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${critConfig[preview.level].bg} ${critConfig[preview.level].border}`}>
                    <span className="text-[11px] text-slate-400">CIA Score:</span>
                    <span className={`text-[16px] font-bold font-mono ${critConfig[preview.level].color}`}>{preview.score}/9</span>
                    <span className={`text-[11px] font-semibold ${critConfig[preview.level].color}`}>→ {preview.level}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowForm(false); setEditId(null); }}
                      className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-400 border border-[#1e3158] hover:text-slate-200 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSubmit}
                      className="px-5 py-2 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all">
                      {editId ? "Update Asset" : "Register Asset"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Asset Table */}
          <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e3158] flex items-center justify-between">
              <div className="text-[13px] font-semibold text-slate-200">📦 Registered Assets ({filtered.length})</div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e3158]">
                  {["Asset ID", "Name", "Owner", "Location", "Type", "C", "I", "A", "Score", "Criticality", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold tracking-[1.2px] uppercase text-slate-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => {
                  const cfg = critConfig[asset.criticalityLevel];
                  return (
                    <tr key={asset.id} className="border-b border-[#1e3158]/50 last:border-0 hover:bg-[#0d1526]/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-sky-300">{asset.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{typeIcon[asset.type]}</span>
                          <span className="text-[12px] font-medium text-slate-200">{asset.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-400">{asset.owner}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-400">{asset.location}</td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{asset.type}</td>
                      {(["confidentiality", "integrity", "availability"] as const).map((cia) => (
                        <td key={cia} className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ciaColor[asset[cia]]}`}>
                            {asset[cia][0]}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <span className={`font-mono text-[13px] font-bold ${cfg.color}`}>{asset.criticality}</span>
                        <span className="text-[9px] text-slate-600">/9</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          {asset.criticalityLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleEdit(asset)}
                            className="text-[10px] px-2 py-1 rounded bg-[#111d35] border border-[#1e3158] text-slate-400 hover:text-sky-300 hover:border-sky-500/30 transition-colors">
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(asset.id)}
                            className="text-[10px] px-2 py-1 rounded bg-[#111d35] border border-[#1e3158] text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-[12px] text-slate-600">
                      No assets found. Click "Add Asset" to register one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
