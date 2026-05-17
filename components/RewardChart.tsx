"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { EpisodeStep } from "@/types/rl";

interface Props {
  steps: EpisodeStep[];
  episodeHistory: { id: number; totalReward: number; success: boolean }[];
}

export default function RewardChart({ steps, episodeHistory }: Props) {
  const stepData = steps.map(s => ({
    step: s.step,
    reward: parseFloat(s.reward.toFixed(2)),
    cumulative: parseFloat(s.cumulativeReward.toFixed(2)),
  }));
  const epData = episodeHistory.map(e => ({
    episode: e.id,
    totalReward: parseFloat(e.totalReward.toFixed(2)),
  }));
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Current Episode — Step Rewards</p>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={stepData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="step" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} />
            <ReferenceLine y={0} stroke="#334155" />
            <Line type="monotone" dataKey="reward" stroke="#38bdf8" strokeWidth={2} dot={false} name="Step Reward" />
            <Line type="monotone" dataKey="cumulative" stroke="#a78bfa" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Cumulative" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {epData.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Episode History — Total Reward</p>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={epData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="episode" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} />
              <Line type="monotone" dataKey="totalReward" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399", r: 3 }} name="Total Reward" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
