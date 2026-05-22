# 🌐 ChainCritter

<h3 align="center">A cyberpunk virtual pet that evolves with your on-chain journey</h3>

<p align="center">
  A gamified digital companion powered by Xiaomi MiMo V2.5 Pro<br/>
  that grows through daily interactions, AI-generated blockchain quests, and real-time streaming chat.
</p>

<p align="center">
  <a href="https://chaincritter.vercel.app">🔗 Live Demo</a> ·
  <a href="https://github.com/XdropAgent/chaincritter">📦 GitHub</a> ·
  <a href="#getting-started">🚀 Getting Started</a>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/NEXT.JS-16-black?style=flat-square&logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/REACT-19-61DAFB?style=flat-square&logo=react" alt="React 19"/>
  <img src="https://img.shields.io/badge/TYPESCRIPT-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5"/>
  <img src="https://img.shields.io/badge/TAILWIND-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind 4"/>
  <img src="https://img.shields.io/badge/AI_ENGINE-MiMo_V2.5_Pro-FF6900?style=flat-square&logo=xiaomi" alt="MiMo V2.5 Pro"/>
  <img src="https://img.shields.io/badge/STREAMING-SSE-00FFD5?style=flat-square" alt="SSE Streaming"/>
  <img src="https://img.shields.io/badge/LICENSE-MIT-green?style=flat-square" alt="MIT"/>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [5-Stage Evolution System](#-5-stage-evolution-system)
  - [AI Quest System](#-ai-quest-system-mimo-v25-pro)
  - [Critter Chat](#-critter-chat-mimo-conversational-ai)
  - [Achievement System](#-achievement-system)
  - [Evolution Timeline](#-evolution-timeline)
  - [Wallet Integration](#-wallet-integration)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**ChainCritter** transforms your on-chain activity into a virtual pet evolution game. Connect a wallet address to give your critter an identity. Complete AI-powered blockchain quests to earn XP. Watch it evolve through **5 stages** — from a flickering Glitch to a transcendent Omega entity with a cosmic aura.

Every AI feature is powered exclusively by **Xiaomi MiMo V2.5 Pro** through the Pina API, generating contextual blockchain quests and maintaining personality-driven conversations.

**The Problem:** Web3 users interact with dozens of protocols but get no recognition for their on-chain journey. ChainCritter bridges this gap with gamification — turning every interaction into XP, every quest into growth, and every level-up into visual evolution.

---

## Features

### ⬜ 5-Stage Evolution System

Your critter evolves based on level, with unique ASCII-art designs and neon glow effects at each stage. Each stage features mood-reactive expressions (charging, boosted, syncing, idle).

| Stage | Level | Appearance |
|-------|-------|------------|
| ⬜ **Glitch** | 1–5 | Flickering pixel with random color shifts, unstable signal |
| 👾 **Sprite** | 6–15 | Small neon creature with pulsing eyes, bouncing animation |
| 👻 **Phantom** | 16–30 | Glowing translucent entity with floating particles |
| 🤖 **Nexus** | 31–50 | Cybernetic being with circuit patterns, data streams |
| 🌌 **Omega** | 51+ | Transcendent AI entity with cosmic aura, star field particles |

### 🧠 AI Quest System (MiMo V2.5 Pro)

Blockchain-themed quests generated in real-time by Xiaomi MiMo V2.5 Pro. Each quest is unique — no templates, pure AI generation with **blockchain-native themes** (mining, staking, bridging, governance, airdrops, and more).

**4 Quest Types:**
- **⛏ Mining** — Computational puzzles and hash-based challenges
- **🥩 Staking** — DeFi strategy and yield optimization tasks
- **🌉 Bridge** — Cross-chain asset transfer scenarios
- **🏛 Governance** — DAO voting and proposal analysis

**Adaptive Difficulty** — Quest complexity scales with critter level:
- Level 1–10: Easy
- Level 11–25: Medium
- Level 26+: Hard

Quests are generated with no repeats. A "New Quests" button regenerates fresh content instantly.

### 💬 Critter Chat (MiMo Conversational AI)

Talk to your critter through a real-time chat interface powered by MiMo V2.5 Pro streaming. The critter responds in a cyberpunk persona based on:
- Evolution stage and level
- Current mood (charging/boosted/syncing/idle)
- Wallet address and stats
- Stability and energy percentages

Messages stream token-by-token via SSE with animated typing indicators.

### 🏆 Achievement System

14 unlockable achievements tracking long-term progress:

| Achievement | Icon | Condition | Color |
|------------|------|-----------|-------|
| First Block | ⬡ | Complete 1st quest | Cyan |
| Gas Spender | ⛽ | Reach level 10 | Orange |
| Diamond Hands | 💎 | 7-day streak | Cyan |
| Evolution! | 🦋 | Witness first evolution | Violet |
| Block Confirm | ⬡ | Confirm 10 blocks | Cyan |
| Streak Master | 🔥 | 30-day streak | Orange |
| Chain Runner | ⛓ | Complete 25 quests | Cyan |
| Half Century | 💯 | Reach level 50 | Gold |
| Nexus Achieved | 🤖 | Reach Nexus stage | Violet |
| Omega! | 🌌 | Reach Omega stage | Gold |
| Full Charge | ⚡ | Keep energy >90% | Orange |
| Stable Node | ◈ | Keep stability >85% | Violet |
| Quest Hunter | 🎯 | Complete 50 quests | Cyan |
| Legendary | 👑 | Reach level 100 | Gold |

Unlocked achievements display full-color cards with shimmer effects. Locked ones show grayscale with progress indicators.

### 📈 Evolution Timeline

Horizontal 5-stage progression visualization. Each stage shown as a connected circle:
- **Current stage**: Large, glowing border, labeled
- **Completed stages**: Colored, lit up
- **Future stages**: Gray, dimmed

### 🔗 Wallet Integration

Connect an EVM wallet address to give your critter an identity:
- **10 XP** per interaction
- **5 XP** daily login bonus
- On-chain stats displayed (nonce, balance, first TX)
- Critter stability/energy decays over time (incentivizing daily visits)

### ⚡ Charge & ◈ Boost Actions

- **Charge** — Restores energy +30%, stability +10%. Shows floating "+30 ⚡" animation.
- **Boost** — Grants +15 XP instantly. Shows floating "+15 XP" animation.
- Both buttons feature press-scale feedback and cooldown timers.

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Wallet Addr  │────▶│ Activity Analysis │────▶│   XP + Evolution     │
│  (EVM/Solana) │     │ nonce, balance    │     │  Level Up + Achieve  │
└──────────────┘     └──────────────────┘     └──────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐     ┌──────────────────────┐
                    │  MiMo V2.5 Pro   │────▶│  Streaming SSE        │
                    │  Pina API        │     │  Token-by-token       │
                    └──────────────────┘     └──────────────────────┘
```

### Why MiMo V2.5 Pro?

- **Extended reasoning chains** — Generates coherent, multi-step blockchain scenarios that adapt to the critter's evolution stage
- **Streaming quality** — Token-by-token SSE provides instant feedback as quests materialize in real-time
- **Creative generation** — Unique blockchain-themed quests with no repetition
- **Conversational ability** — Critter chat requires personality, context awareness, and cyberpunk tone that MiMo handles naturally

### Token Consumption

| Metric | Value |
|--------|-------|
| Per quest generation | 5K–20K tokens |
| Per chat message | 1K–5K tokens |
| API endpoint | `api.pina.my.id` |
| Auth method | `api-key` header |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Custom CSS Animations |
| AI Engine | Xiaomi MiMo V2.5 Pro (Pina API) |
| Data | Wallet address (client-side identity) |
| Storage | localStorage (client-side critter state) |
| Deployment | Vercel (Edge + Serverless) |
| Font | JetBrains Mono |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/XdropAgent/chaincritter.git
cd chaincritter

# Install dependencies
npm install

# Set up environment variables
echo "MIMO_API_KEY=your-api-key" > .env.local
echo "MIMO_ENDPOINT=https://api.pina.my.id/v1" >> .env.local
echo "MIMO_MODEL=mimo-v2.5-pro" >> .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

**Build for Production:**

```bash
npm run build
npm run start
```

---

## Project Structure

```
chaincritter/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page (animated critter, features, CTA)
│   │   ├── layout.tsx                  # Root layout (fonts, metadata, global CSS)
│   │   ├── globals.css                 # Cyberpunk theme, animations (pulse, glow, float)
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Main dashboard (Stats, Quests, Chat, Achievements)
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts            # MiMo API proxy (streaming SSE, api-key auth)
│   │       └── quests/
│   │           └── route.ts            # MiMo quest generation proxy
│   │
│   ├── components/
│   │   ├── PixelCritter.tsx            # 5 evolution stages with ASCII art + neon glow
│   │   ├── StatBar.tsx                 # Animated stat progress bar
│   │   ├── ChatBox.tsx                 # Conversational critter chat (MiMo streaming)
│   │   ├── QuestPanel.tsx              # AI quest generator (MiMo streaming, blockchain themes)
│   │   ├── AchievementGrid.tsx         # 14 unlockable achievements with progress
│   │   ├── EvolutionTimeline.tsx       # Horizontal 5-stage progress visualization
│   │   ├── LevelBadge.tsx              # Level + stage display with glow effects
│   │   └── ActivityLog.tsx             # Activity feed with timestamps + XP earned
│   │
│   └── lib/
│       └── critter.ts                  # Critter state management (localStorage, XP, evolution, mood)
│
└── .env.local                          # Environment variables (not committed)
```

---

## API Reference

### `POST /api/chat`

Proxies all AI requests (quest generation + critter chat) to MiMo V2.5 Pro.

| Property | Value |
|----------|-------|
| Endpoint | `https://api.pina.my.id/v1/chat/completions` |
| Auth | `api-key` header |
| Model | `mimo-v2.5-pro` |
| Streaming | SSE (Server-Sent Events) |

**Request body:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a cyberpunk digital creature..." },
    { "role": "user", "content": "Generate a Medium Mining quest for a level 15 critter." }
  ],
  "temperature": 0.8,
  "maxTokens": 512
}
```

### `POST /api/quests`

Generates blockchain-themed quests via MiMo V2.5 Pro.

| Property | Value |
|----------|-------|
| Returns | 3 unique quests with title, description, type, XP reward, difficulty |

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# MiMo AI Engine (required)
MIMO_API_KEY=sk-your-api-key

# MiMo API endpoint (required for Pina)
MIMO_ENDPOINT=https://api.pina.my.id/v1

# Model name (optional — defaults to mimo-v2.5-pro)
MIMO_MODEL=mimo-v2.5-pro
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MIMO_API_KEY` | Yes | MiMo API key (`sk-...`) |
| `MIMO_ENDPOINT` | Yes | MiMo API endpoint (Pina: `https://api.pina.my.id/v1`) |
| `MIMO_MODEL` | No | Model name (default: `mimo-v2.5-pro`) |

---

## License

MIT

---

<p align="center">
  Built with Next.js 16 + TypeScript + Tailwind CSS v4<br/>
  AI powered by <a href="https://xiaomimimo.com">Xiaomi MiMo V2.5 Pro</a>
</p>
