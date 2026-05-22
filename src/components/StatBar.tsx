"use client";

interface Props {
  label: string;
  value: number;
  max: number;
  color: string;
  icon?: string;
}

export default function StatBar({ label, value, max, color, icon }: Props) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: "#5a5a6e" }}>
          {icon} {label}
        </span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#0a0a0f] border border-[#1e1e2e] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </div>
  );
}
