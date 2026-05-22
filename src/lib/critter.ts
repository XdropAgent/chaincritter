export type Stage = "glitch" | "sprite" | "phantom" | "nexus" | "omega";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export interface Quest {
  id: string;
  title: string;
  desc: string;
  xp: number;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
}

export interface CritterState {
  name: string;
  stage: Stage;
  level: number;
  xp: number;
  xpToNext: number;
  stability: number;      // 0-100 (like health)
  energy: number;          // 0-100
  streak: number;
  lastActive: number;
  totalInteractions: number;
  achievements: Achievement[];
  quests: Quest[];
  mood: string;
  wallet: string | null;
}

const STAGES: { name: Stage; minLevel: number; label: string }[] = [
  { name: "glitch", minLevel: 1, label: "Glitch" },
  { name: "sprite", minLevel: 6, label: "Sprite" },
  { name: "phantom", minLevel: 16, label: "Phantom" },
  { name: "nexus", minLevel: 31, label: "Nexus" },
  { name: "omega", minLevel: 51, label: "Omega" },
];

const LEVEL_XP = [0, 50, 120, 200, 300, 500, 700, 950, 1200, 1500,
  1850, 2250, 2700, 3200, 3800, 4500, 5200, 6000, 6900, 7900,
  9000, 10200, 11500, 12900, 14400, 16000, 17800, 19800, 22000, 24500,
  27500, 30500, 34000, 38000, 42000, 46500, 51500, 57000, 63000, 70000,
  77000, 85000, 93000, 102000, 112000, 123000, 135000, 148000, 162000, 178000,
  195000];

const MOODS = ["syncing", "idle", "frenzy", "calm", "curious", "flickering", "stabilized", "overclocked"];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first_connect", name: "First Link", desc: "Connect your wallet", icon: "🔗", unlocked: false },
  { id: "streak_3", name: "3-Day Uptime", desc: "Maintain a 3-day streak", icon: "⚡", unlocked: false },
  { id: "streak_7", name: "Week Online", desc: "Maintain a 7-day streak", icon: "🔥", unlocked: false },
  { id: "streak_30", name: "Perma-Link", desc: "Maintain a 30-day streak", icon: "💎", unlocked: false },
  { id: "level_10", name: "Double Digits", desc: "Reach level 10", icon: "🎯", unlocked: false },
  { id: "level_25", name: "Quarter Century", desc: "Reach level 25", icon: "🏅", unlocked: false },
  { id: "level_50", name: "Half Century", desc: "Reach level 50", icon: "👑", unlocked: false },
  { id: "quest_10", name: "Quest Runner", desc: "Complete 10 quests", icon: "📜", unlocked: false },
  { id: "chat_20", name: "Conversationalist", desc: "Chat 20 times", icon: "💬", unlocked: false },
  { id: "evolve_sprite", name: "Phase Shift", desc: "Evolve to Sprite stage", icon: "✨", unlocked: false },
  { id: "evolve_phantom", name: "Ghost Protocol", desc: "Evolve to Phantom stage", icon: "👻", unlocked: false },
  { id: "evolve_nexus", name: "Network Merge", desc: "Evolve to Nexus stage", icon: "🌐", unlocked: false },
  { id: "evolve_omega", name: "Transcendence", desc: "Evolve to Omega stage", icon: "🌌", unlocked: false },
  { id: "max_stability", name: "Fully Synced", desc: "Reach 100% stability", icon: "💚", unlocked: false },
];

function getStage(level: number): Stage {
  let current = STAGES[0].name;
  for (const s of STAGES) {
    if (level >= s.minLevel) current = s.name;
  }
  return current;
}

function getXpToNext(level: number): number {
  if (level < LEVEL_XP.length) return LEVEL_XP[level];
  return LEVEL_XP[LEVEL_XP.length - 1] + (level - LEVEL_XP.length + 1) * 20000;
}

export function createDefaultCritter(): CritterState {
  return {
    name: "unnamed",
    stage: "glitch",
    level: 1,
    xp: 0,
    xpToNext: LEVEL_XP[1],
    stability: 100,
    energy: 100,
    streak: 0,
    lastActive: Date.now(),
    totalInteractions: 0,
    achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a })),
    quests: [],
    mood: "idle",
    wallet: null,
  };
}

export function addXp(state: CritterState, amount: number): CritterState {
  const next = { ...state, xp: state.xp + amount, totalInteractions: state.totalInteractions + 1 };
  while (next.xp >= next.xpToNext && next.level < 100) {
    next.xp -= next.xpToNext;
    next.level += 1;
    next.xpToNext = getXpToNext(next.level);
    next.stability = Math.min(100, next.stability + 5);
    const newStage = getStage(next.level);
    if (newStage !== next.stage) {
      next.stage = newStage;
    }
  }
  return next;
}

export function charge(state: CritterState, amount: number): CritterState {
  const next = { ...state };
  next.energy = Math.min(100, next.energy + amount);
  next.stability = Math.min(100, next.stability + Math.floor(amount / 4));
  next.totalInteractions += 1;
  return next;
}

export function decay(state: CritterState): CritterState {
  const hoursSince = (Date.now() - state.lastActive) / 3600000;
  const stabilityLoss = Math.min(30, Math.floor(hoursSince * 0.5));
  const energyLoss = Math.min(20, Math.floor(hoursSince * 0.3));
  return {
    ...state,
    stability: Math.max(10, state.stability - stabilityLoss),
    energy: Math.max(0, state.energy - energyLoss),
    mood: stabilityLoss > 15 ? "flickering" : stabilityLoss > 5 ? "idle" : "syncing",
  };
}

export function updateStreak(state: CritterState): CritterState {
  const now = Date.now();
  const dayMs = 86400000;
  const daysSince = Math.floor((now - state.lastActive) / dayMs);
  if (daysSince <= 1) {
    return { ...state, streak: state.streak + (daysSince === 1 ? 1 : 0), lastActive: now };
  }
  return { ...state, streak: 1, lastActive: now };
}

export function unlockAchievement(state: CritterState, id: string): CritterState {
  const achievements = state.achievements.map(a =>
    a.id === id ? { ...a, unlocked: true } : a
  );
  const wasUnlocked = state.achievements.find(a => a.id === id)?.unlocked;
  if (wasUnlocked) return state;
  return { ...state, achievements };
}

export function checkAchievements(state: CritterState): CritterState {
  let s = state;
  if (state.wallet) s = unlockAchievement(s, "first_connect");
  if (state.streak >= 3) s = unlockAchievement(s, "streak_3");
  if (state.streak >= 7) s = unlockAchievement(s, "streak_7");
  if (state.streak >= 30) s = unlockAchievement(s, "streak_30");
  if (state.level >= 10) s = unlockAchievement(s, "level_10");
  if (state.level >= 25) s = unlockAchievement(s, "level_25");
  if (state.level >= 50) s = unlockAchievement(s, "level_50");
  if (state.stability >= 100) s = unlockAchievement(s, "max_stability");
  const completedQuests = state.quests.filter(q => q.completed).length;
  if (completedQuests >= 10) s = unlockAchievement(s, "quest_10");
  if (state.stage !== "glitch") {
    const stageAch: Record<string, string> = { sprite: "evolve_sprite", phantom: "evolve_phantom", nexus: "evolve_nexus", omega: "evolve_omega" };
    s = unlockAchievement(s, stageAch[state.stage]);
  }
  return s;
}

export function getMoodEmoji(mood: string): string {
  const map: Record<string, string> = {
    syncing: "🔄", idle: "💤", frenzy: "⚡", calm: "😌",
    curious: "🔍", flickering: "📡", stabilized: "✅", overclocked: "🔥",
  };
  return map[mood] || "❓";
}

export function getStageEmoji(stage: Stage): string {
  const map: Record<Stage, string> = {
    glitch: "⬜", sprite: "🟩", phantom: "🟪", nexus: "🟦", omega: "🟨",
  };
  return map[stage];
}

export { STAGES, MOODS, LEVEL_XP };