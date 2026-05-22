import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainCritter — Your On-Chain Companion",
  description: "A digital creature that evolves with your blockchain journey",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}