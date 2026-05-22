"use client";

interface LogEntry {
  time: string;
  action: string;
  detail: string;
}

interface Props {
  logs: LogEntry[];
}

export default function ActivityLog({ logs }: Props) {
  return (
    <div className="glass rounded-xl p-4 space-y-2 max-h-48 overflow-y-auto">
      <span className="text-xs" style={{ color: "#00f0ff" }}>◈ TRANSACTION LOG</span>
      {logs.length === 0 && (
        <div className="text-xs text-center py-2" style={{ color: "#3a3a4e" }}>
          No activity yet.
        </div>
      )}
      {logs.map((l, i) => (
        <div key={i} className="flex gap-2 text-xs">
          <span style={{ color: "#3a3a4e" }}>{l.time}</span>
          <span style={{ color: "#00f0ff" }}>{l.action}</span>
          <span style={{ color: "#5a5a6e" }}>{l.detail}</span>
        </div>
      ))}
    </div>
  );
}