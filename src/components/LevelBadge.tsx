"use client";
import type { Stage } from "@/lib/critter";

interface Props {
  level: number;
  xp: number;
  xpToNext: number;
  stage: Stage;
}

const STAGE_COLORS: Record<Stage, string> = {
  glitch: "#5a5a6e", sprite: "#39ff14", phantom: "#b94fff", nexus: "#00f0ff", omega: "#ffd700",
};

export default function LevelBadge({ level, xp, xpToNext, stage }: Props) {
  const pct = Math.floor((xp / xpToNext) * 100);
  const color = STAGE_COLORS[stage];
  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold" style={{ color }}>LV.{level}</span>
        <span className="text-xs" style={{ color: "#5a5a6e" }}>
          {xp}/{xpToNext} XP
        </span>
      </div>
      <div className="h-3 rounded-full bg-[#0a0a0f] border border-[#1e1e2e] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)`, boxShadow: `0 0 10px ${color}66` }}
        />
      </div>
      <div className="text-[10px] text-right" style={{ color: "#3a3a4e" }}>
        {pct}% to next level
      </div>
    </div>
  );
}
