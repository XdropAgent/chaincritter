'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════════
   CHAINCRITTER — Cyberpunk Virtual Pet
   Single-file React component. All styles inline. No Tailwind. No external CSS.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─── Constants ───────────────────────────────────────────────────────────────

const API_ENDPOINT = 'https://token-plan-sgp.xiaomimimo.com/v1/chat/completions';
const API_KEY = 'sk-10999b3e1c4246aba07b6da2971ab064';
const API_MODEL = 'mimo-v2.5-pro';

const COLORS = {
  bg: '#0a0a0f',
  bgCard: '#111118',
  bgCardHover: '#16162a',
  border: '#1e1e2e',
  borderHover: '#2e2e4e',
  green: '#39ff14',
  cyan: '#00ffd5',
  magenta: '#ff00ff',
  violet: '#a855f7',
  pink: '#ff2d95',
  yellow: '#ffd700',
  blue: '#00f0ff',
  dim: '#5a5a6e',
  dimmer: '#3a3a4e',
  text: '#c8c8d8',
  textBright: '#e8e8f0',
};

const EVOLUTION_STAGES = [
  { name: 'Glitch',   icon: '⬜', level: [1, 5],   ascii: [
    '  ░░  ',
    ' ░██░ ',
    ' ░░░░ ',
    '  ░░  ',
  ]},
  { name: 'Sprite',   icon: '👾', level: [6, 15],  ascii: [
    ' ◢██◣ ',
    ' ██░░ ',
    '██████',
    ' ██ ██',
  ]},
  { name: 'Phantom',  icon: '👻', level: [16, 30], ascii: [
    ' ▟████▙ ',
    '██░░░░██',
    '██ ██ ██',
    '▜█████▛ ',
    ' ▚▞ ▚▞  ',
  ]},
  { name: 'Nexus',    icon: '🤖', level: [31, 50], ascii: [
    '╔══════╗',
    '║ ◉  ◉ ║',
    '║  ▓▓  ║',
    '║ ╚══╝ ║',
    '╚══════╝',
  ]},
  { name: 'Omega',    icon: '🌌', level: [51, 999],ascii: [
    '  ✦ ★ ✦  ',
    ' ★ ◈◉◈ ★ ',
    '✦◉═════◉✦',
    ' ★ ◈◉◈ ★ ',
    '  ✦ ★ ✦  ',
  ]},
];

const MOODS = ['idle', 'charging', 'boosted', 'syncing'] as const;
type Mood = typeof MOODS[number];

const ACHIEVEMENTS = [
  { id: 'first_block',      label: 'First Block',      desc: 'Complete 1st quest',        icon: '🧱' },
  { id: 'gas_spender',      label: 'Gas Spender',      desc: 'Reach level 10',            icon: '⛽' },
  { id: 'diamond_hands',    label: 'Diamond Hands',     desc: '7-day streak',              icon: '💎' },
  { id: 'evolution',        label: 'Evolution',         desc: 'First evolution',           icon: '🧬' },
  { id: 'block_confirm',    label: 'Block Confirm',     desc: '10 blocks mined',           icon: '✅' },
  { id: 'streak_master',    label: 'Streak Master',     desc: '30-day streak',             icon: '🔥' },
  { id: 'chain_runner',     label: 'Chain Runner',      desc: '25 quests complete',        icon: '🏃' },
  { id: 'half_century',     label: 'Half Century',      desc: 'Reach level 50',            icon: '5️⃣' },
  { id: 'nexus_achieved',   label: 'Nexus Achieved',    desc: 'Reach Nexus stage',         icon: '🤖' },
  { id: 'omega',            label: 'Omega',             desc: 'Reach Omega stage',         icon: '🌌' },
  { id: 'full_charge',      label: 'Full Charge',       desc: 'Energy above 90%',          icon: '⚡' },
  { id: 'stable_node',      label: 'Stable Node',       desc: 'Stability above 85%',       icon: '📊' },
  { id: 'quest_hunter',     label: 'Quest Hunter',      desc: '50 quests complete',        icon: '🎯' },
  { id: 'legendary',        label: 'Legendary',         desc: 'Reach level 100',           icon: '👑' },
];

interface Quest {
  id: string;
  title: string;
  desc: string;
  xp: number;
  completed: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface CritterState {
  name: string;
  xp: number;
  level: number;
  energy: number;
  stability: number;
  mood: Mood;
  streak: number;
  lastLogin: string;
  lastDecay: number;
  questsCompleted: number;
  blocksMined: number;
  unlockedAchievements: string[];
  activityLog: string[];
  quests: Quest[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStage(level: number) {
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (level >= EVOLUTION_STAGES[i].level[0]) return { ...EVOLUTION_STAGES[i], index: i };
  }
  return { ...EVOLUTION_STAGES[0], index: 0 };
}

function xpForLevel(level: number) { return level * 100; }
function totalXpForLevel(level: number) { let t = 0; for (let i = 1; i < level; i++) t += xpForLevel(i); return t; }

function computeLevel(xp: number) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) { remaining -= xpForLevel(level); level++; }
  return { level, currentXp: remaining, neededXp: xpForLevel(level) };
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

function generateId() { return Math.random().toString(36).slice(2, 8); }

const DEFAULT_STATE: CritterState = {
  name: '',
  xp: 0,
  level: 1,
  energy: 80,
  stability: 75,
  mood: 'idle',
  streak: 0,
  lastLogin: '',
  lastDecay: Date.now(),
  questsCompleted: 0,
  blocksMined: 0,
  unlockedAchievements: [],
  activityLog: [],
  quests: [],
};

function loadState(): CritterState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem('chaincritter_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

function saveState(state: CritterState) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('chaincritter_state', JSON.stringify(state)); } catch {}
}

// ─── Reusable Style Builders ─────────────────────────────────────────────────

const glassStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: 'rgba(17, 17, 24, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
  ...extra,
});

const neonBorderStyle = (color: string): React.CSSProperties => ({
  border: `1px solid ${color}`,
  boxShadow: `0 0 12px ${color}33, inset 0 0 12px ${color}11`,
});

const btnStyle = (color: string, bg?: string): React.CSSProperties => ({
  background: bg || `${color}18`,
  border: `1px solid ${color}`,
  borderRadius: 10,
  color: color,
  padding: '10px 20px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
});

// ─── Animated Grid Background ────────────────────────────────────────────────

function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 60;
      offset = (offset + 0.15) % gridSize;

      ctx.strokeStyle = 'rgba(57, 255, 20, 0.04)';
      ctx.lineWidth = 0.5;

      for (let x = -gridSize + offset; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = -gridSize + offset; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Random "data flow" lines
      ctx.strokeStyle = 'rgba(0, 255, 213, 0.06)';
      ctx.lineWidth = 1;
      const t = Date.now() * 0.001;
      for (let i = 0; i < 5; i++) {
        const x = ((t * 40 + i * 200) % (canvas.width + 200)) - 100;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + Math.sin(t + i) * 30, canvas.height);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

// ─── Scanline Overlay ────────────────────────────────────────────────────────

function Scanlines() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      pointerEvents: 'none',
      borderRadius: 'inherit',
      zIndex: 1,
    }} />
  );
}

// ─── Gradient Text ───────────────────────────────────────────────────────────

function GradientText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{
      background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.cyan}, ${COLORS.violet}, ${COLORS.magenta})`,
      backgroundSize: '300% 300%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'gradientShift 4s ease infinite',
      ...style,
    }}>
      {children}
    </span>
  );
}

// ─── Scroll Reveal Wrapper ───────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Stat Bar ────────────────────────────────────────────────────────────────

function StatBar({ label, value, max, color, icon }: {
  label: string; value: number; max: number; color: string; icon: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: COLORS.dim, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: 13, color, fontWeight: 600 }}>{Math.round(value)} / {max}</span>
      </div>
      <div style={{
        height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden',
        border: `1px solid ${color}22`,
      }}>
        <div style={{
          height: '100%', borderRadius: 4,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          width: `${pct}%`,
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}

// ─── XP Bar ──────────────────────────────────────────────────────────────────

function XpBar({ current, needed, level }: { current: number; needed: number; level: number }) {
  const pct = Math.min(100, (current / needed) * 100);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: COLORS.yellow, fontWeight: 700 }}>
          LVL {level}
        </span>
        <span style={{ fontSize: 11, color: COLORS.dim }}>
          {current} / {needed} XP
        </span>
      </div>
      <div style={{
        height: 14, borderRadius: 7, background: 'rgba(255,215,0,0.06)', overflow: 'hidden',
        border: `1px solid ${COLORS.yellow}33`,
        position: 'relative',
      }}>
        <div style={{
          height: '100%', borderRadius: 7,
          background: `linear-gradient(90deg, ${COLORS.yellow}aa, ${COLORS.yellow}, ${COLORS.green})`,
          width: `${pct}%`,
          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: `0 0 12px ${COLORS.yellow}55`,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 9, fontWeight: 700, color: pct > 50 ? '#000' : COLORS.yellow,
          textShadow: pct > 50 ? 'none' : `0 0 4px ${COLORS.yellow}88`,
          zIndex: 2,
        }}>
          {Math.round(pct)}%
        </div>
      </div>
    </div>
  );
}

// ─── ASCII Critter Display ───────────────────────────────────────────────────

function AsciiCritter({ stage, mood }: { stage: ReturnType<typeof getStage>; mood: Mood }) {
  const [glitchFrame, setGlitchFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setGlitchFrame(f => f + 1), 150 + Math.random() * 200);
    return () => clearInterval(id);
  }, []);

  const moodColors: Record<Mood, string> = {
    idle: COLORS.green,
    charging: COLORS.cyan,
    boosted: COLORS.yellow,
    syncing: COLORS.violet,
  };

  const color = moodColors[mood];
  const asciiLines = stage.ascii;
  const glitched = stage.index === 0 && glitchFrame % 7 === 0;

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 16,
      lineHeight: 1.4,
      textAlign: 'center',
      color,
      textShadow: `0 0 12px ${color}66, 0 0 24px ${color}33`,
      filter: glitched ? `hue-rotate(${Math.random() * 60}deg)` : 'none',
      animation: mood === 'charging' ? 'pulse 1.5s ease infinite' : mood === 'boosted' ? 'pulse 0.5s ease infinite' : undefined,
      whiteSpace: 'pre',
    }}>
      {asciiLines.join('\n')}
    </div>
  );
}

// ─── Evolution Timeline ──────────────────────────────────────────────────────

function EvolutionTimeline({ level }: { level: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
      {EVOLUTION_STAGES.map((s, i) => {
        const active = level >= s.level[0];
        const current = level >= s.level[0] && level <= s.level[1];
        return (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 12px',
              borderRadius: 10,
              background: current ? `${COLORS.green}15` : active ? `${COLORS.cyan}08` : 'transparent',
              border: current ? `1px solid ${COLORS.green}55` : `1px solid ${active ? COLORS.border : 'transparent'}`,
              opacity: active ? 1 : 0.3,
              transition: 'all 0.3s',
            }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontSize: 9, color: current ? COLORS.green : COLORS.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {s.name}
              </span>
              <span style={{ fontSize: 8, color: COLORS.dimmer }}>Lv{s.level[0]}+</span>
            </div>
            {i < EVOLUTION_STAGES.length - 1 && (
              <div style={{
                width: 20, height: 2,
                background: level >= EVOLUTION_STAGES[i + 1].level[0] ? COLORS.green : COLORS.border,
                borderRadius: 1,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Achievement Grid ────────────────────────────────────────────────────────

function AchievementGrid({ unlocked }: { unlocked: string[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 10,
    }}>
      {ACHIEVEMENTS.map(a => {
        const has = unlocked.includes(a.id);
        return (
          <div key={a.id} style={{
            ...glassStyle({
              padding: '12px 10px',
              textAlign: 'center',
              opacity: has ? 1 : 0.35,
              border: has ? `1px solid ${COLORS.green}44` : `1px solid ${COLORS.border}`,
              transition: 'all 0.3s',
            }),
          }}>
            <div style={{ fontSize: 24, marginBottom: 4, filter: has ? 'none' : 'grayscale(1)' }}>
              {a.icon}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: has ? COLORS.textBright : COLORS.dimmer, marginBottom: 2 }}>
              {a.label}
            </div>
            <div style={{ fontSize: 8, color: COLORS.dim }}>{a.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Quest Panel ─────────────────────────────────────────────────────────────

function QuestPanel({ quests, onComplete, onRefresh, loading }: {
  quests: Quest[]; onComplete: (id: string) => void; onRefresh: () => void; loading: boolean;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: COLORS.cyan, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          ⚡ Active Quests
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{ ...btnStyle(COLORS.cyan), padding: '6px 14px', fontSize: 10 }}
        >
          {loading ? '...' : '↻ Refresh'}
        </button>
      </div>
      {quests.length === 0 && (
        <div style={{ color: COLORS.dim, fontSize: 12, textAlign: 'center', padding: 20 }}>
          No active quests. Hit refresh to get AI-generated quests!
        </div>
      )}
      {quests.map(q => (
        <div key={q.id} style={{
          ...glassStyle({
            padding: '12px 16px',
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: q.completed ? 0.5 : 1,
          }),
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: q.completed ? COLORS.dim : COLORS.textBright, textDecoration: q.completed ? 'line-through' : 'none' }}>
              {q.title}
            </div>
            <div style={{ fontSize: 10, color: COLORS.dim, marginTop: 2 }}>{q.desc}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: COLORS.yellow, fontWeight: 700 }}>+{q.xp} XP</span>
            {!q.completed && (
              <button
                onClick={() => onComplete(q.id)}
                style={{ ...btnStyle(COLORS.green), padding: '5px 12px', fontSize: 10 }}
              >
                Complete
              </button>
            )}
            {q.completed && <span style={{ fontSize: 16 }}>✅</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Chat Box (SSE Streaming) ────────────────────────────────────────────────

function ChatBox({ critterName, stageName }: { critterName: string; stageName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    setStreaming(true);
    const assistantMsg: ChatMessage = { role: 'assistant', content: '', timestamp: Date.now() };
    setMessages([...newMessages, assistantMsg]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: API_MODEL,
          stream: true,
          messages: [
            { role: 'system', content: `You are ${critterName}, a ${stageName}-stage cyberpunk digital pet. Respond in character — playful, glitchy, blockchain-themed. Keep responses under 80 words. Use emojis occasionally.` },
            ...newMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: '[connection error]' };
          return updated;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, content: last.content + delta };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (!last.content) updated[updated.length - 1] = { ...last, content: '[error communicating with critter]' };
        return updated;
      });
    }
    setStreaming(false);
  }, [input, streaming, messages, critterName, stageName]);

  return (
    <div>
      <div style={{ fontSize: 11, color: COLORS.magenta, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
        💬 Chat with {critterName}
      </div>
      <div
        ref={scrollRef}
        style={{
          height: 240, overflowY: 'auto', padding: 12,
          ...glassStyle({ borderRadius: 12, marginBottom: 8 }),
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: COLORS.dimmer, fontSize: 11, textAlign: 'center', paddingTop: 40 }}>
            Say something to your critter...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: 8,
            textAlign: m.role === 'user' ? 'right' : 'left',
          }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
              background: m.role === 'user' ? `${COLORS.green}18` : `${COLORS.violet}18`,
              border: `1px solid ${m.role === 'user' ? COLORS.green : COLORS.violet}33`,
              color: m.role === 'user' ? COLORS.green : COLORS.textBright,
              fontSize: 12,
              maxWidth: '80%',
              textAlign: 'left',
            }}>
              {m.content || (streaming && i === messages.length - 1 ? '...' : '')}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            color: COLORS.textBright,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          style={{ ...btnStyle(COLORS.magenta), padding: '10px 18px', fontSize: 12, opacity: streaming ? 0.5 : 1 }}
        >
          {streaming ? '...' : '▶'}
        </button>
      </div>
    </div>
  );
}

// ─── Activity Log ────────────────────────────────────────────────────────────

function ActivityLog({ logs }: { logs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [logs.length]);

  return (
    <div style={{ fontSize: 11, color: COLORS.dim }}>
      <div style={{ fontSize: 11, color: COLORS.blue, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
        📋 Activity Log
      </div>
      <div ref={ref} style={{ maxHeight: 180, overflowY: 'auto' }}>
        {logs.length === 0 && <div style={{ color: COLORS.dimmer }}>No activity yet. Start interacting!</div>}
        {logs.slice().reverse().map((log, i) => (
          <div key={i} style={{
            padding: '4px 0',
            borderBottom: `1px solid ${COLORS.border}33`,
            color: i === 0 ? COLORS.text : COLORS.dim,
          }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 700, color,
      textTransform: 'uppercase', letterSpacing: 2,
      marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span>{icon}</span>
      <span>{title}</span>
      <div style={{ flex: 1, height: 1, background: `${color}22` }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN APP COMPONENT ────────────────────────────────���─────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [critter, setCritter] = useState<CritterState>({ ...DEFAULT_STATE });
  const [inputName, setInputName] = useState('');
  const [questLoading, setQuestLoading] = useState(false);
  const [chargeAnim, setChargeAnim] = useState(false);
  const [boostAnim, setBoostAnim] = useState(false);

  // Mount + load state
  useEffect(() => {
    setMounted(true);
    const s = loadState();
    if (s.name) {
      // Daily login check
      const today = todayKey();
      if (s.lastLogin !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (s.lastLogin === yesterday) {
          s.streak += 1;
        } else if (s.lastLogin !== today) {
          s.streak = 1;
        }
        s.lastLogin = today;
        s.xp += 5;
        s.activityLog.push(`📅 Daily login bonus: +5 XP (Day ${s.streak} streak)`);
      }
      // Time-based decay
      const hoursSince = (Date.now() - s.lastDecay) / 3600000;
      if (hoursSince > 0.1) {
        s.energy = Math.max(0, s.energy - hoursSince * 1);
        s.stability = Math.max(0, s.stability - hoursSince * 0.5);
        s.lastDecay = Date.now();
      }
      // Compute level from XP
      const { level } = computeLevel(s.xp);
      s.level = level;
      setCritter(s);
      saveState(s);
      setView('dashboard');
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (mounted && critter.name) saveState(critter);
  }, [critter, mounted]);

  const stage = useMemo(() => getStage(critter.level), [critter.level]);
  const levelInfo = useMemo(() => computeLevel(critter.xp), [critter.xp]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCritter(prev => {
      const updated = { ...prev, activityLog: [...prev.activityLog, `[${ts}] ${msg}`].slice(-50) };
      return updated;
    });
  }, []);

  const checkAchievements = useCallback((state: CritterState): string[] => {
    const newUnlocks: string[] = [];
    const u = (id: string) => { if (!state.unlockedAchievements.includes(id)) newUnlocks.push(id); };
    const stageNow = getStage(state.level);

    if (state.questsCompleted >= 1) u('first_block');
    if (state.level >= 10) u('gas_spender');
    if (state.streak >= 7) u('diamond_hands');
    if (stageNow.index >= 1) u('evolution');
    if (state.blocksMined >= 10) u('block_confirm');
    if (state.streak >= 30) u('streak_master');
    if (state.questsCompleted >= 25) u('chain_runner');
    if (state.level >= 50) u('half_century');
    if (stageNow.index >= 3) u('nexus_achieved');
    if (stageNow.index >= 4) u('omega');
    if (state.energy > 90) u('full_charge');
    if (state.stability > 85) u('stable_node');
    if (state.questsCompleted >= 50) u('quest_hunter');
    if (state.level >= 100) u('legendary');

    return newUnlocks;
  }, []);

  const applyXp = useCallback((amount: number, reason: string) => {
    setCritter(prev => {
      const newXp = prev.xp + amount;
      const { level } = computeLevel(newXp);
      const evolved = level > prev.level;
      const updated = { ...prev, xp: newXp, level };
      const newAch = checkAchievements(updated);
      updated.unlockedAchievements = [...updated.unlockedAchievements, ...newAch];

      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const logs = [...prev.activityLog];
      logs.push(`[${ts}] ${reason}: +${amount} XP`);
      if (evolved) logs.push(`[${ts}] 🎉 LEVEL UP! Now level ${level}`);
      newAch.forEach(a => {
        const ach = ACHIEVEMENTS.find(x => x.id === a);
        if (ach) logs.push(`[${ts}] 🏆 Achievement unlocked: ${ach.label}`);
      });
      updated.activityLog = logs.slice(-50);

      return updated;
    });
  }, [checkAchievements]);

  const handleCharge = useCallback(() => {
    setChargeAnim(true);
    setCritter(prev => {
      const updated = { ...prev, energy: Math.min(100, prev.energy + 30), stability: Math.min(100, prev.stability + 10), mood: 'charging' as Mood };
      const newAch = checkAchievements(updated);
      updated.unlockedAchievements = [...updated.unlockedAchievements, ...newAch];
      return updated;
    });
    addLog('⚡ Charged: +30 energy, +10 stability');
    applyXp(10, 'Charge');
    setTimeout(() => {
      setChargeAnim(false);
      setCritter(prev => ({ ...prev, mood: 'idle' }));
    }, 2000);
  }, [addLog, applyXp, checkAchievements]);

  const handleBoost = useCallback(() => {
    setBoostAnim(true);
    setCritter(prev => ({ ...prev, mood: 'boosted' as Mood }));
    addLog('🚀 Boost activated: +15 XP');
    applyXp(15, 'Boost');
    setTimeout(() => {
      setBoostAnim(false);
      setCritter(prev => ({ ...prev, mood: 'idle' }));
    }, 2000);
  }, [addLog, applyXp]);

  const handleQuestComplete = useCallback((id: string) => {
    setCritter(prev => {
      const quest = prev.quests.find(q => q.id === id);
      if (!quest || quest.completed) return prev;
      const updated = {
        ...prev,
        quests: prev.quests.map(q => q.id === id ? { ...q, completed: true } : q),
        questsCompleted: prev.questsCompleted + 1,
        blocksMined: prev.blocksMined + 1,
      };
      const newAch = checkAchievements(updated);
      updated.unlockedAchievements = [...updated.unlockedAchievements, ...newAch];

      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updated.activityLog = [...prev.activityLog, `[${ts}] ✅ Quest complete: ${quest.title} (+${quest.xp} XP)`].slice(-50);
      return updated;
    });
    const quest = critter.quests.find(q => q.id === id);
    if (quest) applyXp(quest.xp, `Quest: ${quest.title}`);
  }, [critter.quests, applyXp, checkAchievements]);

  const fetchQuests = useCallback(async () => {
    setQuestLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: API_MODEL,
          stream: false,
          messages: [
            { role: 'system', content: 'Generate exactly 3 short cyberpunk/blockchain-themed quest tasks for a virtual pet game. Return ONLY valid JSON array with objects: {"title": string, "desc": string, "xp": number}. XP should be 10-50. Keep titles under 40 chars, desc under 60 chars. No markdown, no code fences, just raw JSON array.' },
            { role: 'user', content: `Generate 3 quests for a level ${critter.level} ${stage.name}-stage critter named ${critter.name}` },
          ],
        }),
      });
      const data = await res.json();
      let content = data.choices?.[0]?.message?.content || '[]';
      // Strip code fences if present
      content = content.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const quests: Quest[] = parsed.slice(0, 3).map((q: { title?: string; desc?: string; xp?: number }) => ({
            id: generateId(),
            title: q.title || 'Unknown Quest',
            desc: q.desc || 'Complete this task',
            xp: typeof q.xp === 'number' ? q.xp : 20,
            completed: false,
          }));
          setCritter(prev => ({ ...prev, quests }));
          addLog('🎯 New quests loaded from AI');
        }
      } catch {}
    } catch {}
    setQuestLoading(false);
  }, [critter.level, critter.name, stage.name, addLog]);

  const handleStart = useCallback(() => {
    const name = inputName.trim();
    if (!name) return;
    const today = todayKey();
    const state: CritterState = {
      ...DEFAULT_STATE,
      name,
      lastLogin: today,
      lastDecay: Date.now(),
      streak: 1,
      xp: 5,
      activityLog: [`[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ���� ${name} initialized! Welcome, operator.`],
    };
    setCritter(state);
    saveState(state);
    setView('dashboard');
  }, [inputName]);

  // ─── Poll decay every 30s ────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'dashboard') return;
    const id = setInterval(() => {
      setCritter(prev => {
        const updated = { ...prev };
        updated.energy = Math.max(0, updated.energy - 30 / 3600);
        updated.stability = Math.max(0, updated.stability - 15 / 3600);
        return updated;
      });
    }, 30000);
    return () => clearInterval(id);
  }, [view]);

  // ─── Mood cycle ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'dashboard') return;
    const id = setInterval(() => {
      setCritter(prev => {
        if (prev.mood !== 'idle') return prev;
        const moods: Mood[] = ['idle', 'syncing'];
        return { ...prev, mood: moods[Math.floor(Math.random() * moods.length)] };
      });
    }, 8000);
    return () => clearInterval(id);
  }, [view]);

  if (!mounted) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── LANDING PAGE ────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  if (view === 'landing') {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Inject keyframes */}
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.02); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes glitchText {
            0%, 100% { clip-path: inset(0 0 0 0); }
            10% { clip-path: inset(20% 0 60% 0); transform: translate(-2px); }
            20% { clip-path: inset(60% 0 10% 0); transform: translate(2px); }
            30% { clip-path: inset(0 0 0 0); transform: translate(0); }
          }
          @keyframes borderGlow {
            0%, 100% { box-shadow: 0 0 15px ${COLORS.green}33, 0 0 30px ${COLORS.green}11; }
            50% { box-shadow: 0 0 25px ${COLORS.green}55, 0 0 50px ${COLORS.green}22; }
          }
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
          @keyframes typewriter {
            from { width: 0; }
            to { width: 100%; }
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
          ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: ${COLORS.green}44; }
        `}</style>

        <AnimatedGrid />

        {/* Scanline effect */}
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '4px',
          background: `linear-gradient(transparent, ${COLORS.green}08, transparent)`,
          animation: 'scanline 4s linear infinite',
          zIndex: 1, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

          {/* Hero Section */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
          }}>
            <Reveal>
              {/* ASCII Logo */}
              <pre style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                lineHeight: 1.3,
                color: COLORS.green,
                opacity: 0.6,
                marginBottom: 24,
                textShadow: `0 0 10px ${COLORS.green}44`,
              }}>
{`  ██████╗██╗  ██╗ █████╗ ██╗███╗   ██╗
 ██╔════╝██║  ██║██╔══██╗██║████╗  ██║
 ██║     ███████║███████║██║██╔██╗ ██║
 ██║     ██╔══██║██╔══██║██║██║╚██╗██║
 ╚██████╗██║  ██║██║  ██║██║██║ ╚████║
  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝`}
              </pre>
            </Reveal>

            <Reveal delay={200}>
              <h1 style={{
                fontSize: 'clamp(36px, 6vw, 64px)',
                fontWeight: 800,
                margin: '0 0 8px 0',
                letterSpacing: -1,
              }}>
                <GradientText>ChainCritter</GradientText>
              </h1>
            </Reveal>

            <Reveal delay={400}>
              <p style={{
                fontSize: 16,
                color: COLORS.dim,
                maxWidth: 500,
                lineHeight: 1.7,
                margin: '0 0 40px 0',
              }}>
                A digital creature that evolves with your on-chain journey.
                <br />
                <span style={{ color: COLORS.cyan }}>Charge it</span> · <span style={{ color: COLORS.magenta }}>Quest with it</span> · <span style={{ color: COLORS.violet }}>Watch it grow</span>
              </p>
            </Reveal>

            <Reveal delay={600}>
              {/* Animated critter preview */}
              <div style={{
                ...glassStyle({
                  padding: '30px 50px',
                  marginBottom: 40,
                  animation: 'borderGlow 3s ease infinite',
                  position: 'relative',
                  overflow: 'hidden',
                }),
              }}>
                <Scanlines />
                <div style={{ position: 'relative', zIndex: 2, animation: 'float 3s ease-in-out infinite' }}>
                  <pre style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 18,
                    lineHeight: 1.4,
                    color: COLORS.green,
                    textShadow: `0 0 15px ${COLORS.green}66, 0 0 30px ${COLORS.green}33`,
                    margin: 0,
                    whiteSpace: 'pre',
                  }}>
                    {EVOLUTION_STAGES[0].ascii.join('\n')}
                  </pre>
                  <div style={{ fontSize: 12, color: COLORS.dim, marginTop: 8 }}>
                    Stage 1: <span style={{ color: COLORS.green }}>Glitch</span> — Lv 1
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={800}>
              {/* Name input */}
              <div style={{ width: '100%', maxWidth: 400 }}>
                <input
                  placeholder="Name your critter..."
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  maxLength={20}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 12,
                    color: COLORS.textBright,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    marginBottom: 12,
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = COLORS.green)}
                  onBlur={e => (e.target.style.borderColor = COLORS.border)}
                />
                <button
                  onClick={handleStart}
                  disabled={!inputName.trim()}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: inputName.trim() ? COLORS.green : `${COLORS.green}33`,
                    border: 'none',
                    borderRadius: 12,
                    color: '#000',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: inputName.trim() ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    letterSpacing: 3,
                    transition: 'all 0.3s',
                    boxShadow: inputName.trim() ? `0 0 20px ${COLORS.green}44` : 'none',
                  }}
                >
                  ▶ Initialize
                </button>
              </div>
            </Reveal>

            <Reveal delay={1000}>
              <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { icon: '⛏️', label: 'Quests' },
                  { icon: '🧬', label: 'Evolution' },
                  { icon: '🔥', label: 'Streaks' },
                  { icon: '🤖', label: 'AI Chat' },
                ].map(f => (
                  <div key={f.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{f.icon}</div>
                    <div style={{ fontSize: 10, color: COLORS.dim, textTransform: 'uppercase', letterSpacing: 1 }}>{f.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '20px', fontSize: 10, color: COLORS.dimmer }}>
            ChainCritter v1.0 — Powered by blockchain dreams & neon code
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── DASHBOARD ──────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Inject keyframes */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.01); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 15px ${COLORS.green}33, 0 0 30px ${COLORS.green}11; }
          50% { box-shadow: 0 0 25px ${COLORS.green}55, 0 0 50px ${COLORS.green}22; }
        }
        @keyframes chargePulse {
          0% { box-shadow: 0 0 0 0 ${COLORS.cyan}66; }
          70% { box-shadow: 0 0 0 20px ${COLORS.cyan}00; }
          100% { box-shadow: 0 0 0 0 ${COLORS.cyan}00; }
        }
        @keyframes boostPulse {
          0% { box-shadow: 0 0 0 0 ${COLORS.yellow}66; }
          70% { box-shadow: 0 0 0 20px ${COLORS.yellow}00; }
          100% { box-shadow: 0 0 0 0 ${COLORS.yellow}00; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.green}44; }
      `}</style>

      <AnimatedGrid />

      {/* Scanline sweep */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '3px',
        background: `linear-gradient(transparent, ${COLORS.green}06, transparent)`,
        animation: 'scanline 5s linear infinite',
        zIndex: 1, pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* Top Bar */}
        <Reveal>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⬡</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                <GradientText>ChainCritter</GradientText>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, color: COLORS.dim }}>
                🔥 <span style={{ color: COLORS.yellow }}>{critter.streak}</span> day streak
              </span>
              <span style={{ fontSize: 11, color: COLORS.dim }}>
                {stage.icon} <span style={{ color: COLORS.green }}>{stage.name}</span>
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('chaincritter_state');
                  setCritter({ ...DEFAULT_STATE });
                  setView('landing');
                }}
                style={{ ...btnStyle(COLORS.dimmer), padding: '5px 12px', fontSize: 9 }}
              >
                Reset
              </button>
            </div>
          </div>
        </Reveal>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}>

          {/* ── Left Column: Pet Card ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Pet Card */}
            <Reveal>
              <div style={{
                ...glassStyle({
                  padding: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  animation: 'borderGlow 4s ease infinite',
                }),
              }}>
                <Scanlines />
                <div style={{ position: 'relative', zIndex: 2, padding: '28px 24px' }}>
                  {/* Critter Display */}
                  <div style={{ textAlign: 'center', marginBottom: 16, animation: 'float 4s ease-in-out infinite' }}>
                    <AsciiCritter stage={stage} mood={critter.mood} />
                  </div>

                  {/* Name + Stage */}
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.textBright, marginBottom: 4 }}>
                      {critter.name}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.green, textTransform: 'uppercase', letterSpacing: 2 }}>
                      {stage.icon} {stage.name} Stage
                    </div>
                    <div style={{
                      display: 'inline-block', marginTop: 6,
                      padding: '3px 10px', borderRadius: 20,
                      background: `${COLORS.violet}18`, border: `1px solid ${COLORS.violet}33`,
                      fontSize: 10, color: COLORS.violet, textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                      {critter.mood}
                    </div>
                  </div>

                  {/* XP Bar */}
                  <XpBar current={levelInfo.currentXp} needed={levelInfo.neededXp} level={critter.level} />

                  {/* Stats */}
                  <StatBar label="Energy" value={critter.energy} max={100} color={COLORS.cyan} icon="⚡" />
                  <StatBar label="Stability" value={critter.stability} max={100} color={COLORS.violet} icon="📊" />

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button
                      onClick={handleCharge}
                      style={{
                        ...btnStyle(COLORS.cyan, `${COLORS.cyan}15`),
                        flex: 1,
                        animation: chargeAnim ? 'chargePulse 0.6s ease 3' : 'none',
                      }}
                    >
                      ⚡ Charge
                    </button>
                    <button
                      onClick={handleBoost}
                      style={{
                        ...btnStyle(COLORS.yellow, `${COLORS.yellow}15`),
                        flex: 1,
                        animation: boostAnim ? 'boostPulse 0.6s ease 3' : 'none',
                      }}
                    >
                      🚀 Boost
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Evolution Timeline */}
            <Reveal delay={100}>
              <div style={glassStyle({ padding: '20px 16px' })}>
                <SectionHeader icon="🧬" title="Evolution" color={COLORS.green} />
                <EvolutionTimeline level={critter.level} />
              </div>
            </Reveal>

            {/* Stats Summary */}
            <Reveal delay={200}>
              <div style={glassStyle({ padding: '20px' })}>
                <SectionHeader icon="📈" title="Stats" color={COLORS.cyan} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Level', value: critter.level.toString(), color: COLORS.yellow },
                    { label: 'Total XP', value: critter.xp.toLocaleString(), color: COLORS.green },
                    { label: 'Quests', value: critter.questsCompleted.toString(), color: COLORS.cyan },
                    { label: 'Blocks', value: critter.blocksMined.toString(), color: COLORS.magenta },
                    { label: 'Streak', value: `${critter.streak}d`, color: COLORS.yellow },
                    { label: 'Achievements', value: `${critter.unlockedAchievements.length}/${ACHIEVEMENTS.length}`, color: COLORS.violet },
                  ].map(s => (
                    <div key={s.label} style={{
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 10,
                      border: `1px solid ${COLORS.border}`,
                    }}>
                      <div style={{ fontSize: 9, color: COLORS.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Activity Log */}
            <Reveal delay={300}>
              <div style={glassStyle({ padding: '20px' })}>
                <ActivityLog logs={critter.activityLog} />
              </div>
            </Reveal>
          </div>

          {/* ─��� Right Column: Quests + Chat + Achievements ───────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Quest Panel */}
            <Reveal delay={100}>
              <div style={glassStyle({ padding: '20px' })}>
                <QuestPanel
                  quests={critter.quests}
                  onComplete={handleQuestComplete}
                  onRefresh={fetchQuests}
                  loading={questLoading}
                />
              </div>
            </Reveal>

            {/* Chat Box */}
            <Reveal delay={200}>
              <div style={glassStyle({ padding: '20px' })}>
                <ChatBox critterName={critter.name} stageName={stage.name} />
              </div>
            </Reveal>

            {/* Achievements */}
            <Reveal delay={300}>
              <div style={glassStyle({ padding: '20px' })}>
                <SectionHeader icon="🏆" title="Achievements" color={COLORS.yellow} />
                <div style={{ fontSize: 11, color: COLORS.dim, marginBottom: 14 }}>
                  {critter.unlockedAchievements.length} / {ACHIEVEMENTS.length} unlocked
                </div>
                <AchievementGrid unlocked={critter.unlockedAchievements} />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
