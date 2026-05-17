"use client";
import type { GridState } from "@/types/rl";

const CELL_COLORS: Record<string, string> = {
  empty: "bg-slate-800 border-slate-700",
  agent: "bg-blue-500 border-blue-400",
  goal: "bg-emerald-500 border-emerald-400",
  obstacle: "bg-red-900 border-red-800",
  trap: "bg-orange-600 border-orange-500",
  checkpoint: "bg-yellow-600 border-yellow-500",
};
const CELL_ICONS: Record<string, string> = {
  agent:"🤖", goal:"🎯", obstacle:"🧱", trap:"⚠️", checkpoint:"⭐", empty:""
};

export default function GridVisualizer({ grid }: { grid: GridState }) {
  const sz = Math.min(56, Math.floor(380 / Math.max(grid.width, grid.height)));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid gap-1 p-3 bg-slate-900 rounded-xl border border-slate-700"
        style={{ gridTemplateColumns: `repeat(${grid.width}, ${sz}px)` }}>
        {grid.cells.map((row, y) => row.map((cell, x) => (
          <div key={`${x}-${y}`}
            className={`flex items-center justify-center rounded border transition-all duration-200 ${CELL_COLORS[cell.type]}`}
            style={{ width: sz, height: sz }}
            title={`(${x},${y}) ${cell.type}`}>
            <span style={{ fontSize: sz * 0.45 }}>{CELL_ICONS[cell.type]}</span>
          </div>
        )))}
      </div>
      <div className="flex gap-3 text-xs text-slate-400 flex-wrap justify-center">
        {Object.entries(CELL_ICONS).filter(([,v])=>v).map(([k,v])=>(
          <span key={k} className="flex items-center gap-1"><span>{v}</span><span className="capitalize">{k}</span></span>
        ))}
      </div>
    </div>
  );
}
