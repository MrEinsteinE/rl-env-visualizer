export type ActionVerdict = "approve" | "block" | "escalate";
export type DifficultyTier = "easy" | "medium" | "hard";
export type AgentStatus = "idle" | "running" | "paused" | "done";

export interface Position { x: number; y: number; }

export interface CellType {
  type: "empty" | "agent" | "goal" | "obstacle" | "trap" | "checkpoint";
  reward?: number;
}

export interface GridState {
  width: number; height: number;
  cells: CellType[][];
  agentPos: Position; goalPos: Position;
}

export interface AgentAction {
  id: number; step: number; timestamp: string;
  action: "move_up" | "move_down" | "move_left" | "move_right" | "wait";
  verdict: ActionVerdict; reward: number; reasoning: string;
  fromPos: Position; toPos: Position;
}

export interface EpisodeStep {
  step: number; reward: number; cumulativeReward: number;
  action: AgentAction["action"]; verdict: ActionVerdict;
}

export interface Episode {
  id: number; steps: EpisodeStep[]; totalReward: number;
  success: boolean; stepCount: number;
}

export interface EnvConfig {
  gridWidth: number; gridHeight: number; maxSteps: number;
  difficulty: DifficultyTier; rewardGoal: number; rewardStep: number;
  rewardObstacle: number; speedMs: number; overseerEnabled: boolean;
  blockThreshold: number;
}

export interface EnvState {
  config: EnvConfig; status: AgentStatus; grid: GridState;
  currentEpisode: number; currentStep: number; cumulativeReward: number;
  actionLog: AgentAction[]; episodeHistory: Episode[]; currentEpisodeSteps: EpisodeStep[];
}
