"use client";
import type { Achievement } from "@/lib/critter";

interface Props {
  achievements: Achievement[];
}

export default function AchievementGrid({ achievements }: Props) {
  const unlocked = achievements.filter(a => a.unlocked);
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <span className="text-xs" style={{ color: "#39ff14" }}>
        ◈ BLOCKS CONFIRMED ({unlocked.length}/{achievements.length})
      </span>
      <div className="grid grid-cols-4 gap-2">
        {achievements.map(a => (
          <div
            key={a.id}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition ${
              a.unlocked ? "bg-[#0f1a0f] border border-[#39ff1433]" : "bg-[#0a0a0f] border border-[#1e1e2e] opacity-30"
            }`}
            title={a.desc}
          >
            <span className="text-lg">{a.icon}</span>
            <span className="text-[9px] leading-tight" style={{ color: a.unlocked ? "#c8c8d8" : "#3a3a4e" }}>
              {a.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
