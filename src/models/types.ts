// ─── Status Enums ────────────────────────────────────────────────────────────

export type AgentStatus = 'IDLE' | 'BUSY' | 'OFFLINE' | 'OOM';

export type TaskStatus = 'PENDING' | 'DISPATCHED' | 'RESOLVED' | 'OVERDUE';

// ─── Core Data Models ────────────────────────────────────────────────────────

export interface HumanAgent {
  agent_id: string;
  name: string;
  capabilities: string[];
  relationship: string;
  status: AgentStatus;
  created_at: string;
}

export interface HumanTask {
  trace_id: string;
  job_id: string;
  assignee_id: string;
  todo_description: string;
  deadline: string;
  payload: Record<string, unknown>;
  status: TaskStatus;
  result_data: unknown;
  created_at: string;
  updated_at: string;
}

export interface OrchestrationJob {
  job_id: string;
  original_prompt: string;
  created_at: string;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface CreateJobRequest {
  original_prompt: string;
  tasks: Array<{
    assignee_id: string;
    todo_description: string;
    deadline: string;
    payload?: Record<string, unknown>;
  }>;
}

export interface ResumeTaskRequest {
  trace_id: string;
  result_data: unknown;
}

export interface RejectTaskRequest {
  trace_id: string;
  new_deadline?: string;
}

export interface JobWithTasks extends OrchestrationJob {
  tasks: HumanTask[];
}

export interface AgentWithMetrics extends HumanAgent {
  active_task_count: number;
  avg_delivery_hours: number | null;
}

// ─── Team Types ──────────────────────────────────────────────────────────────

export interface Team {
  team_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface TeamMember {
  team_id: string;
  agent_id: string;
  relationship: string;
}

export interface TeamWithMembers extends Team {
  members: (TeamMember & { agent_name: string; agent_status: AgentStatus })[];
}

export interface TeamRow {
  team_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface TeamMemberRow {
  team_id: string;
  agent_id: string;
  relationship: string;
}

// ─── Evaluation Types ────────────────────────────────────────────────────────

export type RatingSystem = 'ali' | 'letter' | 'em';

export interface Evaluation {
  eval_id: string;
  job_id: string;
  agent_id: string;
  trace_id: string;
  rating_system: RatingSystem;
  rating: string;
  weight: number;
  comment: string;
  created_at: string;
}

export interface EvaluationRow {
  eval_id: string;
  job_id: string;
  agent_id: string;
  trace_id: string;
  rating_system: string;
  rating: string;
  weight: number;
  comment: string;
  created_at: string;
}

export interface EvaluationRequest {
  job_id: string;
  rating_system: RatingSystem;
  task_weights?: Record<string, number>;
}

export interface EvaluationResult {
  job_id: string;
  evaluations: Evaluation[];
  generated_at: string;
}

// ─── AI Planning Types ──────────────────────────────────────────────────────

export interface PlanRequest {
  prompt: string;
  agent_ids?: string[];
  team_id?: string;
}

export interface PlannedTask {
  assignee_id: string;
  assignee_name: string;
  todo_description: string;
  briefing: string;
  deadline: string;
}

export interface PlanResponse {
  original_prompt: string;
  planned_tasks: PlannedTask[];
}

// ─── Database Row Types (flat representations) ──────────────────────────────

export interface AgentRow {
  agent_id: string;
  name: string;
  capabilities: string; // JSON-serialized string[]
  relationship: string;
  status: AgentStatus;
  created_at: string;
}

export interface TaskRow {
  trace_id: string;
  job_id: string;
  assignee_id: string;
  todo_description: string;
  deadline: string;
  payload: string; // JSON-serialized
  status: TaskStatus;
  result_data: string | null; // JSON-serialized
  created_at: string;
  updated_at: string;
}

export interface JobRow {
  job_id: string;
  original_prompt: string;
  created_at: string;
}
