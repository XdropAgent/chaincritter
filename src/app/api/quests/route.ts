import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { level, stage, completedQuests } = await req.json();

  const prompt = `Generate 3 unique crypto/blockchain-themed quests for a level ${level} ChainCritter (stage: ${stage}). 
Previously completed: ${JSON.stringify(completedQuests || [])}.
Return ONLY a JSON array with objects: {id: string, title: string, desc: string, xp: number (50-500), difficulty: "easy"|"medium"|"hard"}.
Make quests creative and blockchain-themed (mining, staking, bridging, exploring, syncing, etc). 
Do NOT repeat completed quest titles.`;

  const response = await fetch(`${process.env.MIMO_ENDPOINT}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": process.env.MIMO_API_KEY! },
    body: JSON.stringify({
      model: process.env.MIMO_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const quests = JSON.parse(jsonMatch?.[0] || "[]");
    return NextResponse.json({ quests });
  } catch {
    return NextResponse.json({ quests: [] });
  }
}
