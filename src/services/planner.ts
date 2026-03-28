import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import { listAgentsWithMetrics, getAgent } from '../models/agent.js';
import { getTeamWithMembers } from '../models/team.js';
import { createLlmProvider } from '../llm/index.js';
import { getConfig } from '../models/config.js';
import type { PlanRequest, PlanResponse, PlannedTask, AgentWithMetrics } from '../models/types.js';
import type { LlmProvider } from '../llm/types.js';

export type RespectLevel = 'high' | 'medium' | 'low';

const BRIEFING_STYLE: Record<RespectLevel, string> = {
  high: '语气像一个靠谱的项目经理在给组员分配任务：尊重对方、说明背景和意义、表达信任与期待，同时清晰传达交付物要求。',
  medium: '语气直接、简洁、务实，说清楚做什么和交付什么，省略客套话，但保持基本礼貌。',
  low: '纯指令口吻，冷冰冰，没有任何铺垫或缓冲。直接告诉对方做什么、交什么、什么时候交。不需要解释原因，不需要鼓励，不需要任何礼貌用语。',
};

function buildSystemPrompt(respectLevel: RespectLevel): string {
  const briefingStyle = BRIEFING_STYLE[respectLevel];
  return `你是 HumanClaw 任务编排规划器。你的工作是将用户的需求拆解为可以分发给碳基节点（真实人类）执行的独立子任务。

规则：
1. 将需求拆解为扁平的、无依赖的子任务列表（每个任务可以独立执行）
2. 根据每个 Agent 的技能（capabilities）和当前负载来匹配分配
3. 为每个任务生成一段「话术」—— 这是直接发给该人类执行者的任务说明，包含具体的交付物要求。话术风格要求：${briefingStyle}
4. 根据任务复杂度设置合理的截止时间（相对于当前时间）
5. 任务分配应以最佳匹配为原则，同一个 Agent 可以承担多个任务

你必须严格输出以下 JSON 格式（不要输出任何其他内容）：

\`\`\`json
[
  {
    "assignee_id": "agent的ID",
    "assignee_name": "agent的名字",
    "todo_description": "简短的任务标题/描述",
    "briefing": "话术：详细的任务说明，包括目标、交付物要求、注意事项。语气像一个靠谱的项目经理在给组员分配任务。",
    "deadline": "ISO 8601 时间"
  }
]
\`\`\``;
}

function buildUserPrompt(
  prompt: string,
  agents: AgentWithMetrics[],
  teamContext?: { name: string; description: string; relationships: Map<string, string> }
): string {
  const now = new Date();
  const agentList = agents.map(a => {
    const load = a.active_task_count > 0
      ? `当前有 ${a.active_task_count} 个进行中的任务`
      : '当前空闲';
    const speed = a.avg_delivery_hours !== null
      ? `平均交付时间 ${a.avg_delivery_hours}h`
      : '暂无历史数据';
    // Use team-contextual relationship if available, fallback to general
    const relText = teamContext?.relationships.get(a.agent_id) || a.relationship;
    const rel = relText ? `  关系: ${relText}` : '';
    return `- ${a.name} (ID: ${a.agent_id})  技能: [${a.capabilities.join(', ')}]${rel}  ${load}  ${speed}`;
  }).join('\n');

  let teamInfo = '';
  if (teamContext) {
    teamInfo = `\n团队: ${teamContext.name}${teamContext.description ? ` — ${teamContext.description}` : ''}\n`;
  }

  return `当前时间: ${now.toISOString()}
${teamInfo}
可用的碳基节点：
${agentList}

需求：
${prompt}

请根据以上信息拆解任务并分配。输出 JSON 数组。`;
}

function extractJson(raw: string): string {
  // Try to extract JSON from markdown code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  // Try to find a JSON array directly
  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }
  return raw.trim();
}

function validatePlannedTasks(
  parsed: unknown,
  validAgentIds: Set<string>,
  agents: AgentWithMetrics[]
): PlannedTask[] {
  if (!Array.isArray(parsed)) {
    throw new Error('LLM 返回的不是有效的任务数组');
  }

  if (parsed.length === 0) {
    throw new Error('LLM 未生成任何任务');
  }

  return parsed.map((item: Record<string, unknown>, i: number) => {
    if (!item.todo_description || typeof item.todo_description !== 'string') {
      throw new Error(`任务 ${i + 1} 缺少 todo_description`);
    }
    if (!item.briefing || typeof item.briefing !== 'string') {
      throw new Error(`任务 ${i + 1} 缺少 briefing (话术)`);
    }

    // Validate or fallback assignee_id
    let assigneeId = String(item.assignee_id || '');
    let assigneeName = String(item.assignee_name || '');

    if (!validAgentIds.has(assigneeId)) {
      // Fallback to first available agent
      const fallback = agents[0];
      if (fallback) {
        assigneeId = fallback.agent_id;
        assigneeName = fallback.name;
      }
    }

    // Validate deadline or generate a default
    let deadline = String(item.deadline || '');
    if (!deadline || isNaN(Date.parse(deadline))) {
      // Default: 24 hours from now
      deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    return {
      assignee_id: assigneeId,
      assignee_name: assigneeName,
      todo_description: String(item.todo_description),
      briefing: String(item.briefing),
      deadline,
    };
  });
}

export async function planJob(
  request: PlanRequest,
  provider?: LlmProvider,
  db?: Database.Database
): Promise<PlanResponse> {
  const conn = db ?? getDb();

  // Get available agents
  const allAgents = listAgentsWithMetrics(conn);
  let agents: AgentWithMetrics[];
  let teamContext: { name: string; description: string; relationships: Map<string, string> } | undefined;

  // If team_id specified, use team members as agent pool
  if (request.team_id) {
    const team = getTeamWithMembers(request.team_id, conn);
    if (!team) {
      throw new Error(`团队不存在: ${request.team_id}`);
    }
    if (team.members.length === 0) {
      throw new Error(`团队 "${team.name}" 中没有成员`);
    }
    const memberIds = new Set(team.members.map(m => m.agent_id));
    agents = allAgents.filter(a => memberIds.has(a.agent_id));

    // Build team relationship map
    const relationships = new Map<string, string>();
    for (const m of team.members) {
      if (m.relationship) {
        relationships.set(m.agent_id, m.relationship);
      }
    }
    teamContext = { name: team.name, description: team.description, relationships };
  } else if (request.agent_ids && request.agent_ids.length > 0) {
    agents = allAgents.filter(a => request.agent_ids!.includes(a.agent_id));
    if (agents.length === 0) {
      throw new Error('指定的 Agent 均不存在');
    }
  } else {
    // Default: only IDLE agents
    agents = allAgents.filter(a => a.status === 'IDLE');
    if (agents.length === 0) {
      // Fallback: include BUSY agents too (but not OFFLINE/OOM)
      agents = allAgents.filter(a => a.status !== 'OFFLINE' && a.status !== 'OOM');
    }
    if (agents.length === 0) {
      throw new Error('没有可用的碳基节点。请先在碳基算力池中添加节点。');
    }
  }

  // Get LLM provider
  const llm = provider ?? createLlmProvider();

  const rawLevel = getConfig('respect_level', conn) ?? 'high';
  const respectLevel: RespectLevel = (['high', 'medium', 'low'] as const).includes(rawLevel as RespectLevel)
    ? (rawLevel as RespectLevel)
    : 'high';
  const systemPrompt = buildSystemPrompt(respectLevel);
  const userPrompt = buildUserPrompt(request.prompt, agents, teamContext);

  const response = await llm.complete({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  // Parse LLM response
  const jsonStr = extractJson(response.content);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('AI 返回的内容无法解析为 JSON，请重试');
  }

  const validIds = new Set(agents.map(a => a.agent_id));
  const plannedTasks = validatePlannedTasks(parsed, validIds, agents);

  return {
    original_prompt: request.prompt,
    planned_tasks: plannedTasks,
  };
}
