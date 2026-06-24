"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Replace with your actual Supabase auth call
    await new Promise((r) => setTimeout(r, 800));
    if (email && password) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#1e3158 1px, transparent 1px), linear-gradient(90deg, #1e3158 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-[400px] px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-xl shadow-sky-500/25">
            🛡️
          </div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">SRMAudit</h1>
          <p className="text-[13px] text-slate-500 mt-1">AI-Assisted Security Audit Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#0f1a2e] border border-[#1e3158] rounded-[20px] p-8 shadow-2xl">
          <h2 className="text-[18px] font-bold text-white mb-1.5">Sign in</h2>
          <p className="text-[12px] text-slate-500 mb-6">Access your audit dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-[12px] text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="auditor@university.edu"
                required
                className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#111d35] border border-[#1e3158] rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white text-[13px] font-bold transition-all hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#1e3158]">
            <div className="text-[11px] text-slate-600 text-center mb-3">Test accounts</div>
            <div className="grid grid-cols-3 gap-2">
              {["Admin", "Auditor", "Auditee"].map((role) => (
                <button
                  key={role}
                  onClick={() => { setEmail(`${role.toLowerCase()}@test.com`); setPassword("test123"); }}
                  className="text-[10px] py-1.5 rounded-lg border border-[#243d6b] text-slate-500 hover:text-sky-300 hover:border-sky-500/30 transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          NIST CSF Framework · Mini Project SRM 2026
        </p>
      </div>
    </div>
  );
}