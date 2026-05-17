"use client";
import type { EnvConfig, DifficultyTier } from "@/types/rl";

interface Props { config: EnvConfig; onChange: (cfg: EnvConfig) => void; disabled: boolean; }

export default function ConfigPanel({ config, onChange, disabled }: Props) {
  const set = <K extends keyof EnvConfig>(key: K, val: EnvConfig[K]) => onChange({ ...config, [key]: val });
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <label className="flex flex-col gap-1">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Grid Size</span>
        <select disabled={disabled} className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200 disabled:opacity-50"
          value={`${config.gridWidth}x${config.gridHeight}`}
          onChange={e => { const [w,h]=e.target.value.split("x").map(Number); onChange({...config,gridWidth:w,gridHeight:h}); }}>
          <option value="5x5">5 × 5</option>
          <option value="7x7">7 × 7</option>
          <option value="9x9">9 × 9</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Difficulty</span>
        <select disabled={disabled} className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200 disabled:opacity-50"
          value={config.difficulty} onChange={e => set("difficulty", e.target.value as DifficultyTier)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Max Steps</span>
        <input disabled={disabled} type="number" min={10} max={200}
          className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200 disabled:opacity-50"
          value={config.maxSteps} onChange={e => set("maxSteps", Number(e.target.value))} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Speed (ms)</span>
        <input type="number" min={50} max={2000} step={50}
          className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-slate-200"
          value={config.speedMs} onChange={e => set("speedMs", Number(e.target.value))} />
      </label>
      <div className="col-span-2 flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700">
        <div>
          <p className="text-slate-200 text-sm font-medium">Overseer Agent</p>
          <p className="text-slate-500 text-xs">Approves / blocks / escalates actions</p>
        </div>
        <button onClick={() => set("overseerEnabled", !config.overseerEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${config.overseerEnabled ? "bg-blue-600" : "bg-slate-600"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.overseerEnabled ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>
    </div>
  );
}
