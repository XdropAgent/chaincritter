"use client";
import type { Stage } from "@/lib/critter";

interface Props {
  currentStage: Stage;
  level: number;
}

const STAGES = [
  { name: "glitch", label: "Glitch", min: 1, icon: "⬜" },
  { name: "sprite", label: "Sprite", min: 6, icon: "🟩" },
  { name: "phantom", label: "Phantom", min: 16, icon: "🟪" },
  { name: "nexus", label: "Nexus", min: 31, icon: "🟦" },
  { name: "omega", label: "Omega", min: 51, icon: "🟨" },
];

export default function EvolutionTimeline({ currentStage, level }: Props) {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <span className="text-xs" style={{ color: "#ffd700" }}>◈ EVOLUTION</span>
      <div className="flex items-center justify-between">
        {STAGES.map((s, i) => {
          const active = s.name === currentStage;
          const reached = STAGES.findIndex(st => st.name === currentStage) >= i;
          return (
            <div key={s.name} className="flex flex-col items-center gap-1">
              <div
                className={`text-lg ${active ? "animate-pulse-glow" : ""}`}
                style={{ opacity: reached ? 1 : 0.3 }}
              >
                {s.icon}
              </div>
              <div
                className="text-[10px]"
                style={{ color: active ? "#ffd700" : reached ? "#5a5a6e" : "#2a2a3e" }}
              >
                {s.label}
              </div>
              <div className="text-[9px]" style={{ color: "#3a3a4e" }}>
                Lv.{s.min}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
