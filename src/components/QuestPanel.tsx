"use client";
import type { Quest } from "@/lib/critter";

interface Props {
  quests: Quest[];
  onGenerate: () => void;
  onComplete: (id: string) => void;
  loading: boolean;
}

const DIFF_COLORS = { easy: "#39ff14", medium: "#ffd700", hard: "#ff2d95" };

export default function QuestPanel({ quests, onGenerate, onComplete, loading }: Props) {
  const active = quests.filter(q => !q.completed);
  const done = quests.filter(q => q.completed);

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "#b94fff" }}>◈ MISSIONS</span>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="text-xs px-3 py-1 rounded border transition hover:opacity-80 disabled:opacity-30"
          style={{ borderColor: "#b94fff", color: "#b94fff" }}
        >
          {loading ? "GEN..." : "NEW QUESTS"}
        </button>
      </div>
      {active.length === 0 && done.length === 0 && (
        <div className="text-xs text-center py-4" style={{ color: "#3a3a4e" }}>
          No missions loaded. Generate some.
        </div>
      )}
      {active.map(q => (
        <div key={q.id} className="flex items-center justify-between p-2 rounded bg-[#0a0a0f] border border-[#1e1e2e]">
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate" style={{ color: DIFF_COLORS[q.difficulty] }}>
              {q.title}
            </div>
            <div className="text-xs truncate" style={{ color: "#5a5a6e" }}>{q.desc}</div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs" style={{ color: "#ffd700" }}>+{q.xp}xp</span>
            <button
              onClick={() => onComplete(q.id)}
              className="text-xs px-2 py-1 rounded transition hover:opacity-80"
              style={{ background: "#39ff14", color: "#000" }}
            >
              ✓
            </button>
          </div>
        </div>
      ))}
      {done.length > 0 && (
        <div className="text-xs" style={{ color: "#3a3a4e" }}>
          {done.length} completed
        </div>
      )}
    </div>
  );
}