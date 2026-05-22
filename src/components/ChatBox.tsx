"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  critterContext: string;
}

export default function ChatBox({ critterContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user" as const, content: input.trim() };
    setInput("");
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-10),
          critterContext,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const { content } = JSON.parse(line.slice(6));
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const next = [...prev];
                  next[next.length - 1] = { role: "assistant", content: assistantContent };
                  return next;
                });
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "[SIGNAL_LOST] Connection error." }]);
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-xl p-4 flex flex-col h-80">
      <div className="text-xs mb-2" style={{ color: "#00f0ff" }}>◈ CRITTER LINK</div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 text-sm mb-3">
        {messages.length === 0 && (
          <div className="text-xs" style={{ color: "#3a3a4e" }}>
            Send a signal to your critter...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className="inline-block px-3 py-1 rounded-lg max-w-[80%]"
              style={{
                background: m.role === "user" ? "#1a1a2e" : "#0f1a0f",
                color: m.role === "user" ? "#00f0ff" : "#39ff14",
                border: `1px solid ${m.role === "user" ? "#00f0ff22" : "#39ff1422"}`,
              }}
            >
              {m.content || (loading && i === messages.length - 1 ? "..." : "")}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type signal..."
          className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white outline-none focus:border-[#00f0ff] transition"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg font-bold text-black text-sm transition disabled:opacity-30"
          style={{ background: "#00f0ff" }}
        >
          TX
        </button>
      </div>
    </div>
  );
}
