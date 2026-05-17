"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { EnvConfig, EnvState, Episode } from "@/types/rl";
import { buildGrid, stepEnvironment } from "@/lib/rlEngine";
import GridVisualizer from "@/components/GridVisualizer";
import RewardChart from "@/components/RewardChart";
import ActionLog from "@/components/ActionLog";
import ConfigPanel from "@/components/ConfigPanel";
import StatsBar from "@/components/StatsBar";

const DEFAULT_CONFIG: EnvConfig = {
  gridWidth: 7, gridHeight: 7, maxSteps: 60, difficulty: "medium",
  rewardGoal: 10, rewardStep: -0.1, rewardObstacle: -1,
  speedMs: 300, overseerEnabled: true, blockThreshold: 0.4,
};

function makeInitialState(config: EnvConfig): EnvState {
  return {
    config, status: "idle", grid: buildGrid(config),
    currentEpisode: 1, currentStep: 0, cumulativeReward: 0,
    actionLog: [], episodeHistory: [], currentEpisodeSteps: [],
  };
}

export default function Home() {
  const [config, setConfig] = useState<EnvConfig>(DEFAULT_CONFIG);
  const [envState, setEnvState] = useState<EnvState>(() => makeInitialState(DEFAULT_CONFIG));
  const [activeTab, setActiveTab] = useState<"log"|"config">("log");
  const actionCounter = useRef({ current: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const reset = useCallback((cfg: EnvConfig = config) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    actionCounter.current = { current: 0 };
    setEnvState(makeInitialState(cfg));
  }, [config]);

  const tick = useCallback(() => {
    setEnvState(prev => {
      if (prev.status !== "running") return prev;
      const { newGrid, action, step, done } = stepEnvironment(prev.grid, prev.config, prev.currentStep + 1, actionCounter.current);
      const newCumulative = prev.cumulativeReward + action.reward;
      step.cumulativeReward = newCumulative;
      const newSteps = [...prev.currentEpisodeSteps, step];
      const newLog = [...prev.actionLog, action];
      const maxReached = prev.currentStep + 1 >= prev.config.maxSteps;
      if (done || maxReached) {
        const episode: Episode = {
          id: prev.currentEpisode, steps: newSteps, totalReward: newCumulative,
          success: newGrid.agentPos.x === prev.grid.goalPos.x && newGrid.agentPos.y === prev.grid.goalPos.y,
          stepCount: prev.currentStep + 1,
        };
        return { ...prev, grid: buildGrid(prev.config), currentEpisode: prev.currentEpisode + 1,
          currentStep: 0, cumulativeReward: 0, actionLog: newLog,
          episodeHistory: [...prev.episodeHistory, episode], currentEpisodeSteps: [] };
      }
      return { ...prev, grid: newGrid, currentStep: prev.currentStep + 1,
        cumulativeReward: newCumulative, actionLog: newLog, currentEpisodeSteps: newSteps };
    });
  }, []);

  useEffect(() => {
    if (envState.status === "running") {
      intervalRef.current = setInterval(tick, envState.config.speedMs);
    } else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [envState.status, envState.config.speedMs, tick]);

  useEffect(() => {
    setEnvState(prev => ({ ...prev, config: { ...prev.config, speedMs: config.speedMs } }));
  }, [config.speedMs]);

  const epHistory = envState.episodeHistory.map(e => ({ id: e.id, totalReward: e.totalReward, success: e.success }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <div className="max-w-6xl mx-auto mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              <span className="text-blue-400">RL</span> Environment Visualizer
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Interactive Reinforcement Learning environment with Overseer agent · Next.js + TypeScript
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
              envState.status==="running" ? "bg-emerald-900/50 text-emerald-400 border-emerald-700 animate-pulse"
              : envState.status==="paused" ? "bg-yellow-900/50 text-yellow-400 border-yellow-700"
              : "bg-slate-800 text-slate-400 border-slate-700"}`}>
              {envState.status.toUpperCase()}
            </span>
            <a href="https://github.com/MrEinsteinE/rl-env-visualizer" target="_blank" rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 px-2 py-1 rounded transition-colors">
              GitHub ↗
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-4"><StatsBar state={envState} /></div>

      <div className="max-w-6xl mx-auto mb-5 flex gap-2 justify-center flex-wrap">
        {[
          { label:"▶ Play", onClick:()=>setEnvState(p=>({...p,status:"running"})), disabled:envState.status==="running", cls:"bg-blue-600 hover:bg-blue-500" },
          { label:"⏸ Pause", onClick:()=>setEnvState(p=>({...p,status:"paused"})), disabled:envState.status!=="running", cls:"bg-yellow-600 hover:bg-yellow-500" },
          { label:"⏭ Step", onClick:()=>{ setEnvState(p=>({...p,status:"paused"})); tick(); }, disabled:false, cls:"bg-slate-700 hover:bg-slate-600" },
          { label:"↺ Reset", onClick:()=>reset(config), disabled:false, cls:"bg-slate-700 hover:bg-slate-600" },
        ].map(btn => (
          <button key={btn.label} onClick={btn.onClick} disabled={btn.disabled}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:bg-slate-700 disabled:text-slate-500 ${btn.cls}`}>
            {btn.label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Environment Grid</h2>
            <GridVisualizer grid={envState.grid} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              {label:"Difficulty", value:envState.config.difficulty, cls:"capitalize text-white"},
              {label:"Overseer", value:envState.config.overseerEnabled?"Active":"Off", cls:envState.config.overseerEnabled?"text-emerald-400":"text-slate-500"},
              {label:"Grid", value:`${envState.config.gridWidth}×${envState.config.gridHeight}`, cls:"text-white"},
              {label:"Speed", value:`${envState.config.speedMs}ms`, cls:"text-white"},
            ].map(({label,value,cls})=>(
              <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <p className="text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <p className={`font-bold ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Reward Signal</h2>
            <RewardChart steps={envState.currentEpisodeSteps} episodeHistory={epHistory} />
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
            <div className="flex gap-1 mb-3 bg-slate-800/50 rounded-lg p-1 w-fit">
              {(["log","config"] as const).map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab===tab?"bg-slate-700 text-white":"text-slate-500 hover:text-slate-300"}`}>
                  {tab==="log"?"Action Log":"Config"}
                </button>
              ))}
            </div>
            {activeTab==="log"
              ? <ActionLog actions={envState.actionLog} />
              : <ConfigPanel config={config} onChange={(cfg)=>{ setConfig(cfg); if(envState.status==="idle") reset(cfg); }} disabled={envState.status==="running"} />
            }
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 text-center text-slate-600 text-xs">
        Built by Einstein Ellandala · Next.js 14 · TypeScript · Tailwind CSS · Recharts ·{" "}
        <a href="https://github.com/MrEinsteinE" className="hover:text-slate-400 transition-colors">github.com/MrEinsteinE</a>
      </div>
    </main>
  );
}
