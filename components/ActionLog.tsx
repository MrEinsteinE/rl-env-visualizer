"use client";
import type { AgentAction, ActionVerdict } from "@/types/rl";

const VERDICT_STYLES: Record<ActionVerdict, string> = {
  approve: "bg-emerald-900/60 text-emerald-400 border border-emerald-800",
  block: "bg-red-900/60 text-red-400 border border-red-800",
  escalate: "bg-yellow-900/60 text-yellow-400 border border-yellow-800",
};
const VERDICT_ICONS: Record<ActionVerdict, string> = { approve:"✓", block:"✗", escalate:"⚡" };
const ACTION_ARROWS: Record<string, string> = { move_up:"↑", move_down:"↓", move_left:"←", move_right:"→", wait:"·" };

export default function ActionLog({ actions }: { actions: AgentAction[] }) {
  const recent = [...actions].reverse().slice(0, 25);
  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-64 pr-1">
      {recent.length === 0 && (
        <p className="text-slate-500 text-xs text-center py-6">No actions yet — press Play to start</p>
      )}
      {recent.map(a => (
        <div key={a.id} className="flex items-start gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs">
          <span className="text-slate-500 font-mono w-6 shrink-0">#{a.step}</span>
          <span className="text-slate-300 font-mono w-4 shrink-0">{ACTION_ARROWS[a.action]}</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-bold shrink-0 ${VERDICT_STYLES[a.verdict]}`}>
            {VERDICT_ICONS[a.verdict]} {a.verdict}
          </span>
          <span className={`font-mono shrink-0 ${a.reward >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {a.reward >= 0 ? "+" : ""}{a.reward.toFixed(1)}
          </span>
          <span className="text-slate-500 truncate">{a.reasoning}</span>
        </div>
      ))}
    </div>
  );
}
