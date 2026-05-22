"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Landing() {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const router = useRouter();

  const handleStart = () => {
    if (!name.trim()) return;
    localStorage.setItem("cc_name", name.trim());
    if (wallet.trim()) localStorage.setItem("cc_wallet", wallet.trim());
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="text-6xl animate-pulse-glow">⬡</div>
        <h1 className="text-3xl font-bold" style={{ color: "#39ff14" }}>ChainCritter</h1>
        <p className="text-sm" style={{ color: "#5a5a6e" }}>
          A digital creature that evolves with your on-chain journey.
          Charge it, quest with it, watch it grow.
        </p>
        <input
          placeholder="Name your critter..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] text-white outline-none focus:border-[#39ff14] transition"
          maxLength={20}
          autoFocus
        />
        <input
          placeholder="Wallet address (optional)"
          value={wallet}
          onChange={e => setWallet(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] text-white outline-none focus:border-[#00f0ff] transition text-xs"
        />
        <button
          onClick={handleStart}
          disabled={!name.trim()}
          className="w-full py-3 rounded-lg font-bold text-black transition hover:opacity-90 disabled:opacity-30"
          style={{ background: "#39ff14" }}
        >
          INITIALIZE
        </button>
        <p className="text-xs" style={{ color: "#3a3a4e" }}>
          Streaks · Quests · Evolution · AI Companion
        </p>
      </div>
    </div>
  );
}