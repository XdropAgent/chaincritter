import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages, critterContext } = await req.json();

  const systemPrompt = `You are ChainCritter, a digital creature living on the blockchain. You speak in a playful, cyberpunk style with occasional glitch effects. You're aware of your stats: ${critterContext || "no data yet"}. Keep responses under 80 words. Be curious about the user's crypto journey. Occasionally use words like "sync", "block", "hash", "signal" in casual conversation. Never break character.`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const response = await fetch(`${process.env.MIMO_ENDPOINT}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.MIMO_API_KEY!,
    },
    body: JSON.stringify({
      model: process.env.MIMO_MODEL,
      messages: apiMessages,
      stream: true,
      temperature: 0.85,
      max_tokens: 200,
    }),
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) { controller.close(); return; }
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") { controller.close(); return; }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            } catch { /* skip malformed */ }
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
  });
}
