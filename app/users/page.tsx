"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type Role = "Admin" | "Auditor" | "Auditee";
type UserStatus = "Active" | "Inactive";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department: string;
  lastLogin: string;
  audits: number;
}

const initialUsers: User[] = [
  { id: "U-001", name: "Ahmad Fauzi", email: "ahmad@university.edu", role: "Admin", status: "Active", department: "IT Security", lastLogin: "2026-08-07", audits: 12 },
  { id: "U-002", name: "Siti Rahayu", email: "siti@university.edu", role: "Auditor", status: "Active", department: "Internal Audit", lastLogin: "2026-08-07", audits: 8 },
  { id: "U-003", name: "Rizky Pratama", email: "rizky@university.edu", role: "Auditor", status: "Active", department: "IT Security", lastLogin: "2026-08-06", audits: 5 },
  { id: "U-004", name: "Dewi Anggraini", email: "dewi@university.edu", role: "Auditee", status: "Active", department: "Human Resources", lastLogin: "2026-08-05", audits: 0 },
  { id: "U-005", name: "Budi Santoso", email: "budi@university.edu", role: "Auditee", status: "Active", department: "Finance", lastLogin: "2026-08-04", audits: 0 },
  { id: "U-006", name: "Maya Sari", email: "maya@university.edu", role: "Auditor", status: "Inactive", department: "Compliance", lastLogin: "2026-07-20", audits: 3 },
  { id: "U-007", name: "Doni Kusuma", email: "doni@university.edu", role: "Auditee", status: "Active", department: "IT Department", lastLogin: "2026-08-03", audits: 0 },
  { id: "U-008", name: "Rina Wulandari", email: "rina@university.edu", role: "Auditee", status: "Inactive", department: "Academic", lastLogin: "2026-07-15", audits: 0 },
];

const roleColors: Record<Role, string> = {
  Admin:   "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Auditor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Auditee: "bg-teal-500/15 text-teal-400 border-teal-500/30",
};

const roleIcons: Record<Role, string> = {
  Admin:   "👑",
  Auditor: "🔍",
  Auditee: "🏢",
};

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${roleColors[role]}`}>
      <span>{roleIcons[role]}</span>
      {role}
    </span>
  );
}

function StatusDot({ status }: { status: UserStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold
      ${status === "Active" ? "text-green-400" : "text-slate-500"}`}>
      <span className={`w-2 h-2 rounded-full ${status === "Active" ? "bg-green-400" : "bg-slate-600"}`} />
      {status}
    </span>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filterRole, setFilterRole] = useState<"All" | Role>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | UserStatus>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Auditor" as Role, department: "" });

  const filtered = users.filter((u) => {
    if (filterRole !== "All" && u.role !== filterRole) return false;
    if (filterStatus !== "All" && u.status !== filterStatus) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedUser = users.find((u) => u.id === selected);

  function addUser() {
    if (!newUser.name || !newUser.email) return;
    const id = `U-00${users.length + 1}`;
    setUsers((prev) => [...prev, {
      ...newUser, id, status: "Active",
      lastLogin: "Never", audits: 0,
    }]);
    setNewUser({ name: "", email: "", role: "Auditor", department: "" });
    setShowAddModal(false);
  }

  function toggleStatus(id: string) {
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
    ));
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col">
        <Topbar breadcrumbs={[{ label: "Tools" }, { label: "User Management" }]} />

        <div className="p-7 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/20">
                👥
              </div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-white">User Management</h1>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {users.length} users · {users.filter(u => u.status === "Active").length} active
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all">
              ➕ Add User
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Users", value: users.length, icon: "👥", color: "text-slate-300", top: "#6366f1" },
              { label: "Admins", value: users.filter(u => u.role === "Admin").length, icon: "👑", color: "text-violet-400", top: "#8b5cf6" },
              { label: "Auditors", value: users.filter(u => u.role === "Auditor").length, icon: "🔍", color: "text-sky-400", top: "#0ea5e9" },
              { label: "Auditees", value: users.filter(u => u.role === "Auditee").length, icon: "🏢", color: "text-teal-400", top: "#14b8a6" },
            ].map(({ label, value, icon, color, top }) => (
              <div key={label} className="relative bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5 hover:border-[#243d6b] transition-all overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[14px]"
                  style={{ background: `linear-gradient(90deg, ${top}, transparent)` }} />
                <div className="absolute right-4 top-4 text-2xl opacity-10">{icon}</div>
                <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-slate-500 mb-2">{label}</div>
                <div className={`text-[32px] font-bold font-mono leading-none ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className={`grid gap-5 ${selectedUser ? "grid-cols-[1fr_360px]" : "grid-cols-1"}`}>
            {/* Table */}
            <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden">
              {/* Filters */}
              <div className="flex items-center gap-3 px-[22px] py-[14px] border-b border-[#1e3158] flex-wrap">
                <div className="text-[13px] font-semibold text-slate-200">👥 All Users</div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-1.5 w-[200px] ml-2">
                  <span className="text-slate-500 text-sm">🔍</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className="bg-transparent text-[12px] text-slate-200 outline-none flex-1 placeholder:text-slate-600"
                  />
                </div>

                <div className="ml-auto flex gap-1.5">
                  {(["All", "Admin", "Auditor", "Auditee"] as ("All" | Role)[]).map((r) => (
                    <button key={r} onClick={() => setFilterRole(r)}
                      className={`text-[11px] px-3 py-1 rounded-lg font-medium transition-all border
                        ${filterRole === r ? "bg-sky-500/12 text-sky-300 border-sky-500/25" : "text-slate-500 border-transparent hover:text-slate-300"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div className="px-[22px] py-2 border-b border-[#1e3158] flex gap-1.5 items-center">
                <span className="text-[10px] text-slate-600 mr-1">Status:</span>
                {(["All", "Active", "Inactive"] as ("All" | UserStatus)[]).map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all border
                      ${filterStatus === s ? "bg-sky-500/12 text-sky-300 border-sky-500/25" : "text-slate-600 border-transparent hover:text-slate-400"}`}>
                    {s}
                  </button>
                ))}
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e3158]">
                    {["ID", "Name", "Email", "Role", "Department", "Status", "Last Login", "Audits", "Action"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-slate-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}
                      onClick={() => setSelected(selected === u.id ? null : u.id)}
                      className={`border-b border-[#1e3158]/50 last:border-0 cursor-pointer transition-colors
                        ${selected === u.id ? "bg-violet-500/5" : "hover:bg-[#0d1526]/50"}`}>
                      <td className="px-4 py-3 font-mono text-[11px] text-violet-400">{u.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/40 to-purple-600/40 border border-violet-500/20 flex items-center justify-center text-[11px] font-bold text-violet-300">
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-[12px] font-semibold text-slate-200">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{u.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">{u.department}</td>
                      <td className="px-4 py-3"><StatusDot status={u.status} /></td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{u.lastLogin}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{u.audits}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStatus(u.id); }}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all
                            ${u.status === "Active"
                              ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                              : "border-green-500/30 text-green-400 hover:bg-green-500/10"}`}>
                          {u.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-600 text-[13px]">No users found.</div>
              )}
            </div>

            {/* Detail panel */}
            {selectedUser && (
              <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden self-start">
                <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#1e3158]">
                  <div className="text-[13px] font-semibold text-slate-200">👤 User Detail</div>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
                </div>
                <div className="px-[22px] py-[18px]">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-5 pb-5 border-b border-[#1e3158]">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg shadow-violet-500/20">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div className="text-[16px] font-bold text-white mb-1">{selectedUser.name}</div>
                    <div className="text-[12px] text-slate-500 mb-3">{selectedUser.email}</div>
                    <RoleBadge role={selectedUser.role} />
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-5">
                    {[
                      { label: "User ID",     value: selectedUser.id },
                      { label: "Department",  value: selectedUser.department },
                      { label: "Status",      value: selectedUser.status },
                      { label: "Last Login",  value: selectedUser.lastLogin },
                      { label: "Audits Done", value: String(selectedUser.audits) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-[12px] border-b border-[#1e3158]/50 pb-2 last:border-0">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-200 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Permissions */}
                  <div className="bg-[#111d35] border border-[#1e3158] rounded-lg p-3 mb-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">Permissions</div>
                    <div className="space-y-1.5">
                      {selectedUser.role === "Admin" && (
                        <>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> Full system access</div>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> Manage users</div>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> View all audits</div>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> Generate reports</div>
                        </>
                      )}
                      {selectedUser.role === "Auditor" && (
                        <>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> Create & edit audits</div>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> Upload evidence</div>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> Generate findings</div>
                          <div className="text-[11px] text-rose-500 flex items-center gap-2"><span>❌</span> Manage users</div>
                        </>
                      )}
                      {selectedUser.role === "Auditee" && (
                        <>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> View assigned audits</div>
                          <div className="text-[11px] text-green-400 flex items-center gap-2"><span>✅</span> Upload evidence</div>
                          <div className="text-[11px] text-rose-500 flex items-center gap-2"><span>❌</span> Create audits</div>
                          <div className="text-[11px] text-rose-500 flex items-center gap-2"><span>❌</span> Manage users</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[12px] font-semibold hover:-translate-y-0.5 transition-all">
                      ✏️ Edit User
                    </button>
                    <button
                      onClick={() => toggleStatus(selectedUser.id)}
                      className={`flex-1 py-2 rounded-lg text-[12px] font-semibold border transition-all
                        ${selectedUser.status === "Active"
                          ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                          : "border-green-500/30 text-green-400 hover:bg-green-500/10"}`}>
                      {selectedUser.status === "Active" ? "🚫 Deactivate" : "✅ Activate"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1a2e] border border-[#243d6b] rounded-[20px] w-full max-w-[440px] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e3158]">
              <div className="text-[15px] font-bold text-white">➕ Add New User</div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-300 text-xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: "Full Name", key: "name", placeholder: "e.g. Ahmad Fauzi", type: "text" },
                { label: "Email", key: "email", placeholder: "e.g. ahmad@university.edu", type: "email" },
                { label: "Department", key: "department", placeholder: "e.g. IT Security", type: "text" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={newUser[key as keyof typeof newUser]}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Admin", "Auditor", "Auditee"] as Role[]).map((r) => (
                    <button key={r} onClick={() => setNewUser((prev) => ({ ...prev, role: r }))}
                      className={`py-2 rounded-lg text-[12px] font-semibold border transition-all
                        ${newUser.role === r ? roleColors[r] : "border-[#1e3158] text-slate-500 hover:border-[#243d6b]"}`}>
                      {roleIcons[r]} {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#243d6b] text-slate-400 text-[13px] font-semibold hover:text-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={addUser}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[13px] font-semibold hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5 transition-all">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}