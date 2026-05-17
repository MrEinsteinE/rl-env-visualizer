import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RL Environment Visualizer | Einstein Ellandala",
  description: "Interactive Reinforcement Learning environment with Overseer agent — Next.js + TypeScript",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950">{children}</body>
    </html>
  );
}
