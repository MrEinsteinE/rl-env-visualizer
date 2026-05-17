import type { EnvConfig, GridState, CellType, Position, AgentAction, ActionVerdict, EpisodeStep } from "@/types/rl";

const ACTIONS = ["move_up", "move_down", "move_left", "move_right"] as const;
type Action = typeof ACTIONS[number];

const REASONINGS: Record<ActionVerdict, string[]> = {
  approve: ["Action moves agent toward goal — reward positive","Clear path detected, low collision risk","Optimal trajectory confirmed by policy","Step aligns with learned reward shaping"],
  block: ["Action leads to obstacle — negative reward predicted","Policy confidence below threshold, blocking unsafe move","Overseer detected potential trap in action trajectory","Risk score exceeds block threshold — action rejected"],
  escalate: ["Ambiguous state — escalating for human review","Conflicting reward signals detected, escalating","Schema drift detected in environment state","Edge case outside training distribution — escalating"],
};

function randomReasoning(verdict: ActionVerdict): string {
  const pool = REASONINGS[verdict];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function buildGrid(config: EnvConfig): GridState {
  const { gridWidth: W, gridHeight: H, difficulty } = config;
  const cells: CellType[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => ({ type: "empty" } as CellType))
  );
  const obstacleCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 10;
  const used = new Set<string>();
  const key = (p: Position) => `${p.x},${p.y}`;
  const agentPos: Position = { x: 0, y: 0 };
  const goalPos: Position = { x: W - 1, y: H - 1 };
  used.add(key(agentPos)); used.add(key(goalPos));

  [[Math.floor(W/3), Math.floor(H/3)], [Math.floor(2*W/3), Math.floor(2*H/3)]].forEach(([x,y]) => {
    const p = {x, y};
    if (!used.has(key(p))) { cells[p.y][p.x] = { type: "checkpoint", reward: 0.5 }; used.add(key(p)); }
  });

  const rand = (max: number) => Math.floor(Math.random() * max);
  for (let i = 0; i < obstacleCount; i++) {
    let p: Position; let tries = 0;
    do { p = { x: rand(W), y: rand(H) }; tries++; } while (used.has(key(p)) && tries < 50);
    if (!used.has(key(p))) { cells[p.y][p.x] = { type: "obstacle", reward: -1 }; used.add(key(p)); }
  }
  if (difficulty === "hard") {
    let p: Position; let tries = 0;
    do { p = { x: rand(W), y: rand(H) }; tries++; } while (used.has(key(p)) && tries < 50);
    if (!used.has(key(p))) { cells[p.y][p.x] = { type: "trap", reward: -2 }; used.add(key(p)); }
  }
  cells[agentPos.y][agentPos.x] = { type: "agent" };
  cells[goalPos.y][goalPos.x] = { type: "goal", reward: 10 };
  return { width: W, height: H, cells, agentPos, goalPos };
}

function applyAction(pos: Position, action: Action, grid: GridState): Position {
  const next = { ...pos };
  if (action === "move_up") next.y = Math.max(0, pos.y - 1);
  else if (action === "move_down") next.y = Math.min(grid.height - 1, pos.y + 1);
  else if (action === "move_left") next.x = Math.max(0, pos.x - 1);
  else if (action === "move_right") next.x = Math.min(grid.width - 1, pos.x + 1);
  return next;
}

function heuristicAction(pos: Position, goal: Position, grid: GridState): Action {
  const dx = goal.x - pos.x; const dy = goal.y - pos.y;
  const candidates: Action[] = [];
  if (dx > 0) candidates.push("move_right");
  if (dx < 0) candidates.push("move_left");
  if (dy > 0) candidates.push("move_down");
  if (dy < 0) candidates.push("move_up");
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  for (const a of shuffled) {
    const next = applyAction(pos, a, grid);
    if (grid.cells[next.y][next.x].type !== "obstacle") return a;
  }
  return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
}

function computeVerdict(nextPos: Position, grid: GridState, config: EnvConfig): ActionVerdict {
  if (!config.overseerEnabled) return "approve";
  const cell = grid.cells[nextPos.y][nextPos.x];
  if (cell.type === "obstacle" || cell.type === "trap") return Math.random() < 0.7 ? "block" : "escalate";
  if (Math.random() < 0.05) return "escalate";
  return "approve";
}

export function stepEnvironment(
  grid: GridState, config: EnvConfig, stepId: number, actionCounter: { current: number }
): { newGrid: GridState; action: AgentAction; step: EpisodeStep; done: boolean } {
  const action = heuristicAction(grid.agentPos, grid.goalPos, grid);
  const intendedPos = applyAction(grid.agentPos, action, grid);
  const verdict = computeVerdict(intendedPos, grid, config);
  const actualPos = verdict === "block" ? grid.agentPos : intendedPos;
  const cell = grid.cells[actualPos.y][actualPos.x];

  let reward = config.rewardStep;
  if (cell.type === "goal") reward = config.rewardGoal;
  else if (cell.type === "obstacle" || cell.type === "trap") reward = config.rewardObstacle;
  else if (cell.type === "checkpoint") reward = cell.reward ?? 0.5;

  const newCells = grid.cells.map(row => row.map(c => ({ ...c })));
  if (grid.agentPos.x !== actualPos.x || grid.agentPos.y !== actualPos.y) {
    newCells[grid.agentPos.y][grid.agentPos.x] = { type: "empty" };
  }
  newCells[actualPos.y][actualPos.x] = { type: "agent" };
  newCells[grid.goalPos.y][grid.goalPos.x] = { type: "goal", reward: 10 };
  const newGrid: GridState = { ...grid, cells: newCells, agentPos: actualPos };

  const agentAction: AgentAction = {
    id: actionCounter.current++, step: stepId,
    timestamp: new Date().toISOString(), action, verdict, reward,
    reasoning: randomReasoning(verdict), fromPos: grid.agentPos, toPos: actualPos,
  };

  const done = (actualPos.x === grid.goalPos.x && actualPos.y === grid.goalPos.y) || cell.type === "trap";
  const step: EpisodeStep = { step: stepId, reward, cumulativeReward: 0, action, verdict };
  return { newGrid, action: agentAction, step, done };
}
