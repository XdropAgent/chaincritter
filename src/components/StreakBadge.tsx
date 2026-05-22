"use client";

interface Props {
  streak: number;
}

export default function StreakBadge({ streak }: Props) {
  const color = streak >= 30 ? "#ffd700" : streak >= 7 ? "#ff2d95" : streak >= 3 ? "#b94fff" : "#5a5a6e";
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border"
      style={{ borderColor: color + "44", background: "#0a0a0f" }}
    >
      <span className="text-lg">{streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "📡"}</span>
      <div>
        <div className="text-xs font-bold" style={{ color }}>
          {streak} DAY STREAK
        </div>
        <div className="text-[10px]" style={{ color: "#3a3a4e" }}>
          {streak >= 30 ? "LEGENDARY" : streak >= 7 ? "ON FIRE" : streak >= 3 ? "BUILDING" : "STARTING"}
        </div>
      </div>
    </div>
  );
}