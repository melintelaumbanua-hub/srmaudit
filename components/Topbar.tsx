"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Breadcrumb = { label: string; href?: string };
type Theme = "Dark" | "Darker" | "Midnight";

interface Notification {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  { id: "N1", type: "critical", title: "Critical Finding: No MFA",   desc: "F-001 requires immediate attention",       time: "2 mins ago",  read: false },
  { id: "N2", type: "warning",  title: "Evidence Pending Review",    desc: "backup_policy_v2.pdf awaits verification", time: "18 mins ago", read: false },
  { id: "N3", type: "warning",  title: "Compliance Below Target",    desc: "Current score 72% — target is 85%",        time: "1 hr ago",    read: false },
  { id: "N4", type: "info",     title: "AI Report Draft Generated",  desc: "Executive summary ready to review",        time: "3 hrs ago",   read: true  },
  { id: "N5", type: "success",  title: "F-005 Marked Resolved",      desc: "TLS 1.0 finding closed by Network Team",   time: "5 hrs ago",   read: true  },
];

const notifStyle = {
  critical: { dot: "bg-rose-500",   icon: "🚨" },
  warning:  { dot: "bg-yellow-500", icon: "⚠️" },
  info:     { dot: "bg-sky-500",    icon: "ℹ️" },
  success:  { dot: "bg-green-500",  icon: "✅" },
};

const themeStyles: Record<Theme, { bg: string; card: string; border: string }> = {
  Dark:     { bg: "#0a0f1e", card: "#0f1a2e", border: "#1e3158" },
  Darker:   { bg: "#060b14", card: "#0a1220", border: "#162540" },
  Midnight: { bg: "#050810", card: "#080f1c", border: "#101e38" },
};

function useOutsideClick(ref: React.RefObject<HTMLDivElement>, callback: () => void) {
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, callback]);
}

export default function Topbar({ breadcrumbs = [] }: { breadcrumbs?: Breadcrumb[] }) {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<Theme>("Dark");
  const [language, setLanguage] = useState("English");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // Profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileName, setProfileName] = useState("Senior Auditor");
  const [profileEmail, setProfileEmail] = useState("auditor@test.com");
  const [editName, setEditName] = useState(profileName);
  const [editEmail, setEditEmail] = useState(profileEmail);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const notifRef = useRef<HTMLDivElement>(null!);
  const settingsRef = useRef<HTMLDivElement>(null!);

  useOutsideClick(notifRef, () => setShowNotif(false));
  useOutsideClick(settingsRef, () => {
    setShowSettings(false);
    setShowEditProfile(false);
    setShowChangePassword(false);
  });

  // Apply theme to document
  useEffect(() => {
    const t = themeStyles[theme];
    document.documentElement.style.setProperty("--color-bg", t.bg);
    document.documentElement.style.setProperty("--color-card", t.card);
    document.documentElement.style.setProperty("--color-border", t.border);
    // Apply bg color to body
    document.body.style.backgroundColor = t.bg;
  }, [theme]);

  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }
  function deleteNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function handleSignOut() {
    router.push("/login");
  }

  function handleSaveProfile() {
    if (!editName.trim() || !editEmail.trim()) return;
    setProfileName(editName);
    setProfileEmail(editEmail);
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
      setShowEditProfile(false);
    }, 1500);
  }

  function handleChangePassword() {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: "error", text: "All fields are required." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setPasswordMsg({ type: "success", text: "Password changed successfully!" });
    setTimeout(() => {
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setPasswordMsg(null);
      setShowChangePassword(false);
    }, 1500);
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-[#1e3158] px-7 py-3.5 flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px]">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-600">/</span>}
              <span className={i === breadcrumbs.length - 1 ? "text-slate-300 font-medium" : "text-slate-600"}>
                {b.label}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-1.5 text-[11px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Audit In Progress
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-1.5 w-[210px] focus-within:border-sky-500/40 transition-colors cursor-text"
            onClick={() => document.getElementById("topbar-search")?.focus()}
          >
            <span className="text-slate-500 text-sm">🔍</span>
            <input
              id="topbar-search"
              placeholder="Search controls, assets..."
              className="bg-transparent outline-none flex-1 text-slate-300 placeholder:text-slate-600 text-[12px]"
            />
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setShowNotif(!showNotif); setShowSettings(false); }}
              className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all border
                ${showNotif ? "bg-sky-500/15 border-sky-500/30" : "bg-[#111d35] border-[#1e3158] text-slate-400 hover:text-slate-200 hover:border-sky-500/30"}`}
            >
              🔔
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[8px] font-bold text-white flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-10 w-[360px] bg-[#0f1a2e] border border-[#1e3158] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden z-50">
                <div className="px-4 py-3.5 border-b border-[#1e3158] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-200">Notifications</span>
                    {unread > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-400">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <button onClick={markAllRead} className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[340px] overflow-y-auto divide-y divide-[#1e3158]/50" style={{ scrollbarWidth: "thin" }}>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="text-2xl mb-2">🎉</div>
                      <div className="text-[12px] text-slate-600">No notifications</div>
                    </div>
                  ) : notifications.map((n) => {
                    const style = notifStyle[n.type];
                    return (
                      <div key={n.id} onClick={() => markRead(n.id)}
                        className={`px-4 py-3.5 flex gap-3 hover:bg-[#0d1526]/60 transition-colors cursor-pointer group ${!n.read ? "bg-sky-500/[0.03]" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot} ${n.read ? "opacity-30" : ""}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[12px] font-semibold ${n.read ? "text-slate-400" : "text-slate-200"}`}>
                              {style.icon} {n.title}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 text-sm transition-all flex-shrink-0">
                              ×
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{n.desc}</div>
                          <div className="text-[9px] font-mono text-slate-600 mt-1">{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-3 border-t border-[#1e3158] text-center">
                  <button className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => { setShowSettings(!showSettings); setShowNotif(false); setShowEditProfile(false); setShowChangePassword(false); }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border
                ${showSettings ? "bg-violet-500/15 border-violet-500/30" : "bg-[#111d35] border-[#1e3158] text-slate-400 hover:text-slate-200 hover:border-violet-500/30"}`}
            >
              ⚙️
            </button>

            {showSettings && !showEditProfile && !showChangePassword && (
              <div className="absolute right-0 top-10 w-[300px] bg-[#0f1a2e] border border-[#1e3158] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden z-50">
                {/* Profile */}
                <div className="px-5 py-4 border-b border-[#1e3158] bg-gradient-to-r from-violet-500/5 to-sky-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-sm font-bold text-white">
                      {profileName[0]}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-200">{profileName}</div>
                      <div className="text-[10px] text-slate-500">{profileEmail}</div>
                      <div className="text-[9px] font-mono text-teal-400 mt-0.5">Admin · NIST CSF</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Theme */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-2">Theme</label>
                    <div className="flex gap-2">
                      {(["Dark", "Darker", "Midnight"] as Theme[]).map((t) => (
                        <button key={t} onClick={() => setTheme(t)}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all
                            ${theme === t ? "bg-violet-500/15 border-violet-500/30 text-violet-300" : "bg-[#111d35] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                          {theme === t ? "✓ " : ""}{t}
                        </button>
                      ))}
                    </div>
                    <div className="text-[9px] text-slate-600 mt-1.5 text-center">Theme applies to entire app</div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-2">Language</label>
                    <div className="flex gap-2">
                      {["English", "Bahasa"].map((l) => (
                        <button key={l} onClick={() => setLanguage(l)}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all
                            ${language === l ? "bg-sky-500/15 border-sky-500/30 text-sky-300" : "bg-[#111d35] border-[#1e3158] text-slate-500 hover:text-slate-300"}`}>
                          {l === "English" ? "🇬🇧 English" : "🇮🇩 Bahasa"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    {[
                      { label: "Email Alerts", desc: "Receive finding notifications", value: emailAlerts, set: setEmailAlerts },
                      { label: "Auto-save",    desc: "Save changes automatically",   value: autoSave,    set: setAutoSave    },
                    ].map(({ label, desc, value, set }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div>
                          <div className="text-[12px] font-medium text-slate-300">{label}</div>
                          <div className="text-[10px] text-slate-500">{desc}</div>
                        </div>
                        <button onClick={() => set(!value)}
                          className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${value ? "bg-sky-500" : "bg-[#1e3158]"}`}>
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-200 ${value ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Menu */}
                  <div className="border-t border-[#1e3158] pt-3 space-y-1">
                    <button onClick={() => setShowEditProfile(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 hover:bg-[#111d35] transition-colors text-left">
                      👤 Edit Profile
                    </button>
                    <button onClick={() => setShowChangePassword(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 hover:bg-[#111d35] transition-colors text-left">
                      🔑 Change Password
                    </button>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button onClick={handleSignOut}
                    className="w-full py-2 rounded-lg text-[12px] font-semibold border border-rose-500/25 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors">
                    ↩ Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Edit Profile Panel */}
            {showSettings && showEditProfile && (
              <div className="absolute right-0 top-10 w-[300px] bg-[#0f1a2e] border border-[#1e3158] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden z-50">
                <div className="px-5 py-4 border-b border-[#1e3158] flex items-center gap-3">
                  <button onClick={() => setShowEditProfile(false)} className="text-slate-500 hover:text-slate-300 transition-colors text-lg">←</button>
                  <span className="text-[13px] font-semibold text-slate-200">Edit Profile</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-center mb-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-2xl font-bold text-white">
                      {editName[0] || "A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Full Name</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-sky-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Email</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-sky-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Role</label>
                    <input value="Admin · NIST CSF" disabled
                      className="w-full bg-[#0a0f1e] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-500 cursor-not-allowed" />
                  </div>
                  <button onClick={handleSaveProfile}
                    className={`w-full py-2.5 rounded-lg text-[12px] font-semibold transition-all
                      ${profileSaved
                        ? "bg-green-500/20 border border-green-500/30 text-green-400"
                        : "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:shadow-lg hover:shadow-sky-500/25"}`}>
                    {profileSaved ? "✅ Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Change Password Panel */}
            {showSettings && showChangePassword && (
              <div className="absolute right-0 top-10 w-[300px] bg-[#0f1a2e] border border-[#1e3158] rounded-[16px] shadow-2xl shadow-black/50 overflow-hidden z-50">
                <div className="px-5 py-4 border-b border-[#1e3158] flex items-center gap-3">
                  <button onClick={() => { setShowChangePassword(false); setPasswordMsg(null); }} className="text-slate-500 hover:text-slate-300 transition-colors text-lg">←</button>
                  <span className="text-[13px] font-semibold text-slate-200">Change Password</span>
                </div>
                <div className="p-5 space-y-4">
                  {passwordMsg && (
                    <div className={`p-3 rounded-lg text-[11px] font-medium border ${passwordMsg.type === "success" ? "bg-green-500/10 border-green-500/25 text-green-400" : "bg-rose-500/10 border-rose-500/25 text-rose-400"}`}>
                      {passwordMsg.type === "success" ? "✅ " : "❌ "}{passwordMsg.text}
                    </div>
                  )}
                  {[
                    { label: "Current Password", value: currentPassword, set: setCurrentPassword },
                    { label: "New Password",     value: newPassword,     set: setNewPassword     },
                    { label: "Confirm Password", value: confirmPassword, set: setConfirmPassword },
                  ].map(({ label, value, set }) => (
                    <div key={label}>
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">{label}</label>
                      <input type="password" value={value} onChange={(e) => set(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors" />
                    </div>
                  ))}
                  <div className="text-[9px] text-slate-600">Minimum 8 characters required</div>
                  <button onClick={handleChangePassword}
                    className="w-full py-2.5 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all">
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div onClick={() => { setShowSettings(!showSettings); setShowNotif(false); }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-[11px] font-bold text-white cursor-pointer hover:opacity-80 transition-opacity">
            {profileName[0]}
          </div>
        </div>
      </header>
    </>
  );
}
