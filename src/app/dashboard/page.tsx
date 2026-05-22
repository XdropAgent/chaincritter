"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createDefaultCritter,
  addXp,
  charge,
  decay,
  updateStreak,
  checkAchievements,
  type CritterState,
} from "@/lib/critter";
import PixelCritter from "@/components/PixelCritter";
import StatBar from "@/components/StatBar";
import ChatBox from "@/components/ChatBox";
import QuestPanel from "@/components/QuestPanel";
import EvolutionTimeline from "@/components/EvolutionTimeline";
import AchievementGrid from "@/components/AchievementGrid";
import ActivityLog from "@/components/ActivityLog";
import StreakBadge from "@/components/StreakBadge";
import LevelBadge from "@/components/LevelBadge";

const STORAGE_KEY = "chaincritter_state";

interface LogEntry {
  time: string;
  action: string;
  detail: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [critter, setCritter] = useState<CritterState | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [questLoading, setQuestLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const addLog = useCallback((action: string, detail: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
    setLogs(prev => [{ time, action, detail }, ...prev].slice(0, 50));
  }, []);

  // Initialize
  useEffect(() => {
    const name = localStorage.getItem("cc_name");
    if (!name) { router.push("/"); return; }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CritterState;
        const decayed = decay(parsed);
        const streaked = updateStreak(decayed);
        setCritter(streaked);
        addLog("SYNC", `Welcome back. ${streaked.streak}-day streak.`);
      } catch {
        const fresh = createDefaultCritter();
        fresh.name = name;
        fresh.wallet = localStorage.getItem("cc_wallet");
        setCritter(checkAchievements(fresh));
        addLog("INIT", `Critter "${name}" created.`);
      }
    } else {
      const fresh = createDefaultCritter();
      fresh.name = name;
      fresh.wallet = localStorage.getItem("cc_wallet");
      setCritter(checkAchievements(fresh));
      addLog("INIT", `Critter "${name}" created.`);
    }
    setInitialized(true);
  }, [router, addLog]);

  // Auto-save
  useEffect(() => {
    if (critter && initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(critter));
    }
  }, [critter, initialized]);

  const handleCharge = () => {
    if (!critter) return;
    const amount = 10 + Math.floor(Math.random() * 15);
    const updated = charge(critter, amount);
    setCritter(checkAchievements(updated));
    addLog("CHARGE", `+${amount} energy`);
  };

  const handleBoost = () => {
    if (!critter) return;
    const xpGain = 20 + Math.floor(Math.random() * 30);
    const updated = addXp(critter, xpGain);
    updated.mood = ["frenzy", "overclocked", "syncing"][Math.floor(Math.random() * 3)];
    setCritter(checkAchievements(updated));
    addLog("BOOST", `+${xpGain} XP`);
  };

  const handleCompleteQuest = (id: string) => {
    if (!critter) return;
    const quest = critter.quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    const updated = {
      ...critter,
      quests: critter.quests.map(q => q.id === id ? { ...q, completed: true } : q),
    };
    const withXp = addXp(updated, quest.xp);
    withXp.mood = "stabilized";
    setCritter(checkAchievements(withXp));
    addLog("QUEST", `Completed "${quest.title}" +${quest.xp} XP`);
  };

  const handleGenerateQuests = async () => {
    if (!critter) return;
    setQuestLoading(true);
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: critter.level,
          stage: critter.stage,
          completedQuests: critter.quests.filter(q => q.completed).map(q => q.title),
        }),
      });
      const data = await res.json();
      if (data.quests?.length) {
        const newQuests = data.quests.map((q: { id?: string; title: string; desc: string; xp: number; difficulty: "easy" | "medium" | "hard" }) => ({
          ...q,
          id: q.id || `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          completed: false,
        }));
        setCritter(prev => prev ? { ...prev, quests: [...prev.quests, ...newQuests] } : prev);
        addLog("QUESTS", `Generated ${newQuests.length} new missions`);
      }
    } catch {
      addLog("ERROR", "Quest generation failed");
    }
    setQuestLoading(false);
  };

  const handleMoodCycle = () => {
    if (!critter) return;
    const moods = ["syncing", "curious", "calm", "frenzy", "stabilized"];
    const next = moods[(moods.indexOf(critter.mood) + 1) % moods.length];
    setCritter({ ...critter, mood: next });
    addLog("MOOD", `Shifted to ${next}`);
  };

  if (!critter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm animate-pulse-glow" style={{ color: "#39ff14" }}>
          SYNCING...
        </div>
      </div>
    );
  }

  const critterContext = `Name: ${critter.name}, Level: ${critter.level}, Stage: ${critter.stage}, Stability: ${critter.stability}%, Energy: ${critter.energy}%, Streak: ${critter.streak} days, Mood: ${critter.mood}`;

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⬡</span>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#39ff14" }}>
              {critter.name}
            </h1>
            <div className="text-xs" style={{ color: "#5a5a6e" }}>
              {critter.wallet ? `${critter.wallet.slice(0, 6)}...${critter.wallet.slice(-4)}` : "no wallet linked"}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCharge}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-black transition hover:opacity-80"
            style={{ background: "#39ff14" }}
          >
            ⚡ CHARGE
          </button>
          <button
            onClick={handleBoost}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-black transition hover:opacity-80"
            style={{ background: "#00f0ff" }}
          >
            ◈ BOOST
          </button>
          <button
            onClick={handleMoodCycle}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-80"
            style={{ background: "#b94fff", color: "#000" }}
          >
            ↻ MOOD
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Critter Display */}
          <div className="glass rounded-xl p-6 flex flex-col items-center">
            <PixelCritter
              stage={critter.stage}
              stability={critter.stability}
              mood={critter.mood}
              energy={critter.energy}
            />
          </div>

          {/* Level */}
          <LevelBadge
            level={critter.level}
            xp={critter.xp}
            xpToNext={critter.xpToNext}
            stage={critter.stage}
          />

          {/* Stats */}
          <div className="glass rounded-xl p-4 space-y-3">
            <span className="text-xs" style={{ color: "#5a5a6e" }}>◈ SYSTEM STATUS</span>
            <StatBar label="Stability" value={critter.stability} max={100} color="#39ff14" icon="🟢" />
            <StatBar label="Energy" value={critter.energy} max={100} color="#00f0ff" icon="⚡" />
            <StatBar label="Interactions" value={critter.totalInteractions} max={500} color="#b94fff" icon="📊" />
          </div>

          {/* Streak */}
          <StreakBadge streak={critter.streak} />

          {/* Evolution */}
          <EvolutionTimeline currentStage={critter.stage} level={critter.level} />
        </div>

        {/* Middle Column */}
        <div className="space-y-4">
          <ChatBox critterContext={critterContext} />
          <QuestPanel
            quests={critter.quests}
            onGenerate={handleGenerateQuests}
            onComplete={handleCompleteQuest}
            loading={questLoading}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <AchievementGrid achievements={critter.achievements} />
          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
