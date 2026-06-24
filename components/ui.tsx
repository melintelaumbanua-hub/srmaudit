import { ReactNode } from "react";

// ── CARD ──────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  className?: string;
  accent?: "blue" | "teal" | "red" | "orange" | "green";
}

export function Card({ children, className = "", accent }: CardProps) {
  return (
    <div
      className={`relative bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] overflow-hidden transition-all hover:border-[#243d6b] ${className}`}
    >
      {accent && (
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-[14px]`}
          style={{
            background: `linear-gradient(90deg, ${
              accent === "blue" ? "#0ea5e9" :
              accent === "teal" ? "#14b8a6" :
              accent === "red" ? "#f43f5e" :
              accent === "orange" ? "#fb923c" :
              "#22c55e"
            }, transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between px-[22px] py-[18px] border-b border-[#1e3158] ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-200">
      {icon && <span className="text-[14px]">{icon}</span>}
      {children}
    </div>
  );
}

export function CardAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] text-sky-400 font-semibold hover:text-sky-300 transition-colors"
    >
      {children}
    </button>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-[22px] py-[18px] ${className}`}>{children}</div>;
}

// ── KPI CARD ──────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  progress?: number;
  color: "blue" | "teal" | "red" | "orange" | "green";
  delay?: number;
}

const colorMap = {
  blue:   { value: "text-sky-300",  bar: "#0ea5e9", accent: "#0ea5e9" },
  teal:   { value: "text-teal-400", bar: "#14b8a6", accent: "#14b8a6" },
  red:    { value: "text-rose-400", bar: "#f43f5e", accent: "#f43f5e" },
  orange: { value: "text-orange-400", bar: "#fb923c", accent: "#fb923c" },
  green:  { value: "text-green-400", bar: "#22c55e", accent: "#22c55e" },
};

export function KpiCard({ label, value, sub, icon, progress, color, delay = 0 }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div
      className="relative bg-[#0f1a2e] border border-[#1e3158] rounded-[14px] p-5 overflow-hidden transition-all hover:border-[#243d6b] hover:-translate-y-0.5 animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[14px]"
        style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }}
      />
      {icon && <div className="absolute right-4 top-4 text-xl opacity-10">{icon}</div>}
      <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-slate-500 mb-2">{label}</div>
      <div className={`text-[32px] font-bold font-mono-code leading-none mb-1.5 ${c.value}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
      {progress !== undefined && (
        <div className="mt-3 h-[3px] bg-[#1e3158] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: c.bar }}
          />
        </div>
      )}
    </div>
  );
}

// ── SEVERITY BADGE ────────────────────────────────────
type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    CRITICAL: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    HIGH:     "bg-orange-500/15 text-orange-400 border-orange-500/30",
    MEDIUM:   "bg-yellow-500/12 text-yellow-400 border-yellow-500/25",
    LOW:      "bg-green-500/12 text-green-400 border-green-500/25",
    INFO:     "bg-sky-500/12 text-sky-400 border-sky-500/25",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono-code ${map[severity]}`}>
      {severity}
    </span>
  );
}

// ── STATUS CHIP ───────────────────────────────────────
type ControlStatus = "Compliant" | "Partial" | "Non-Compliant" | "N/A";

export function StatusChip({ status }: { status: ControlStatus }) {
  const map: Record<ControlStatus, { cls: string; dot: string }> = {
    "Compliant":     { cls: "bg-green-500/12 text-green-400",   dot: "bg-green-400" },
    "Partial":       { cls: "bg-yellow-500/12 text-yellow-400", dot: "bg-yellow-400" },
    "Non-Compliant": { cls: "bg-rose-500/12 text-rose-400",     dot: "bg-rose-400" },
    "N/A":           { cls: "bg-slate-500/15 text-slate-500",   dot: "bg-slate-500" },
  };
  const { cls, dot } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

// ── BUTTON ────────────────────────────────────────────
interface BtnProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  icon?: string;
}

export function Btn({ children, variant = "outline", onClick, className = "", type = "button", icon }: BtnProps) {
  const base = "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer border-none font-[Sora]";
  const variants = {
    primary: "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5",
    outline: "bg-[#111d35] border border-[#243d6b] text-slate-300 hover:text-white hover:border-sky-500",
    ghost:   "text-slate-400 hover:text-slate-200 hover:bg-[#111d35]",
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

// ── PAGE HEADER ───────────────────────────────────────
interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  actions?: ReactNode;
}

export function PageHeader({ icon, title, subtitle, tabs, activeTab, onTabChange, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">
            {icon}
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-white">{title}</h1>
            {subtitle && (
              <div className="text-[11px] font-mono-code text-slate-500 mt-0.5">{subtitle}</div>
            )}
          </div>
        </div>
        {tabs && (
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all border
                  ${activeTab === tab
                    ? "text-sky-300 bg-sky-500/10 border-sky-500/25"
                    : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-[#111d35]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────
export function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-20">{icon}</div>
      <div className="text-[15px] font-semibold text-slate-400 mb-1">{title}</div>
      <div className="text-[12px] text-slate-600 max-w-xs">{desc}</div>
    </div>
  );
}

// ── PROGRESS BAR ─────────────────────────────────────
export function ProgressBar({ label, value, color = "#0ea5e9" }: { label: string; value: number; color?: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[12px] text-slate-300 font-medium">{label}</span>
        <span className="text-[12px] font-mono-code font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#1e3158] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
