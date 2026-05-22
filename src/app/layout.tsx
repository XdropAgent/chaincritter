import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChainCritter — Your On-Chain Companion",
  description: "A digital creature that evolves with your blockchain journey. Charge it, quest with it, watch it grow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0a0a0f',
        color: '#c8c8d8',
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        minHeight: '100vh',
        overflowX: 'hidden',
      }}>{children}</body>
    </html>
  );
}
