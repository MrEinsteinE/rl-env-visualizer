"use client";
import type { EnvState } from "@/types/rl";

function Stat({ label, value, color="text-white" }: { label: string; value: string|number; color?: string }) {
  return (
    <div className="flex flex-col items-center bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700 min-w-[72px]">
      <span className={`text-lg font-bold font-mono ${color}`}>{value}</span>
      <span className="text-slate-500 text-xs uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function StatsBar({ state }: { state: EnvState }) {
  const approvals = state.actionLog.filter(a => a.verdict === "approve").length;
  const blocks = state.actionLog.filter(a => a.verdict === "block").length;
  const escalations = state.actionLog.filter(a => a.verdict === "escalate").length;
  const wins = state.episodeHistory.filter(e => e.success).length;
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Stat label="Episode" value={state.currentEpisode} color="text-blue-400" />
      <Stat label="Step" value={state.currentStep} color="text-slate-200" />
      <Stat label="Reward" value={state.cumulativeReward.toFixed(1)} color={state.cumulativeReward >= 0 ? "text-emerald-400" : "text-red-400"} />
      <Stat label="Approved" value={approvals} color="text-emerald-400" />
      <Stat label="Blocked" value={blocks} color="text-red-400" />
      <Stat label="Escalated" value={escalations} color="text-yellow-400" />
      <Stat label="Wins" value={wins} color="text-purple-400" />
    </div>
  );
}
