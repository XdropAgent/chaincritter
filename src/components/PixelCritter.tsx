"use client";
import type { Stage } from "@/lib/critter";

interface Props {
  stage: Stage;
  stability: number;
  mood: string;
  energy: number;
}

const CRITTER_ART: Record<Stage, string[]> = {
  glitch: [
    "  ░░░░  ",
    " ░▒▓█▓▒░",
    " ░█▓▒▓█░",
    " ░▒▓█▓▒░",
    "  ░░░░  ",
  ],
  sprite: [
    "  ┌──┐  ",
    " │◉◉│ ",
    " │ ▽ │ ",
    " └┬──┬┘",
    "  │  │  ",
  ],
  phantom: [
    " ╔════╗ ",
    " ║◈  ◈║ ",
    " ║ ╬╬ ║ ",
    " ╠════╣ ",
    " ╚════╝ ",
  ],
  nexus: [
    " ╔═╦══╦═╗",
    " ║ ◈◈ ║",
    " ║ ╬╬╬╬ ║",
    " ╠══╬╬══╣",
    " ╚══╩╩══╝",
  ],
  omega: [
    " ▓▓▓▓▓▓▓▓",
    " ▓◈◈◈◈◈◈▓",
    " ▓◈╬╬╬╬◈▓",
    " ▓◈◈◈◈◈◈▓",
    " ▓▓▓▓▓▓▓▓",
  ],
};

const STAGE_COLORS: Record<Stage, string> = {
  glitch: "#5a5a6e",
  sprite: "#39ff14",
  phantom: "#b94fff",
  nexus: "#00f0ff",
  omega: "#ffd700",
};

export default function PixelCritter({ stage, stability, mood, energy }: Props) {
  const art = CRITTER_ART[stage];
  const color = STAGE_COLORS[stage];
  const isLow = stability < 30;
  const animClass = isLow ? "animate-glitch" : mood === "frenzy" ? "animate-flicker" : "animate-pulse-glow";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs tracking-wider" style={{ color: "#5a5a6e" }}>
        [{stage.toUpperCase()}]
      </div>
      <pre
        className={`text-sm leading-tight select-none ${animClass}`}
        style={{ color, textShadow: `0 0 10px ${color}` }}
      >
        {art.join("\n")}
      </pre>
      <div className="flex gap-4 text-xs" style={{ color: "#5a5a6e" }}>
        <span>STB:{stability}%</span>
        <span>NRG:{energy}%</span>
        <span>{mood.toUpperCase()}</span>
      </div>
    </div>
  );
}
