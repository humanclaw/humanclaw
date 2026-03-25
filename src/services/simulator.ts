import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import { getAgent } from '../models/agent.js';
import { getTask } from '../models/task.js';
import { getTeamMemberRelationship } from '../models/team.js';
import { createLlmProvider } from '../llm/index.js';
import type { LlmProvider } from '../llm/types.js';

export interface SimulateResult {
  trace_id: string;
  simulated_delivery: string;
}

function buildSimulatePrompt(
  agentName: string,
  relationship: string,
  capabilities: string[],
  taskDescription: string,
  deadline: string
): string {
  return `你现在扮演一个名叫「${agentName}」的人，你的技能标签是 [${capabilities.join(', ')}]。
${relationship ? `你和布置任务的人的关系是：${relationship}。` : ''}

你收到了一个任务：
${taskDescription}

截止时间：${new Date(deadline).toLocaleString('zh-CN')}

请站在「${agentName}」的视角，用这个人物自然的语气和口吻，写一段任务交付汇报。
要求：
1. 内容要贴合任务描述，体现专业能力
2. 语气符合人物身份${relationship ? '和与上级的关系' : ''}
3. 汇报内容具体、有细节，包含做了什么、遇到了什么问题、最终结果如何
4. 字数 200-400 字
5. 直接输出汇报内容，不要加任何格式前缀或说明`;
}

export async function simulateDelivery(
  traceId: string,
  provider?: LlmProvider,
  db?: Database.Database,
  teamId?: string
): Promise<SimulateResult> {
  const conn = db ?? getDb();

  const task = getTask(traceId, conn);
  if (!task) {
    throw new Error(`Task not found: ${traceId}`);
  }

  const agent = getAgent(task.assignee_id, conn);
  if (!agent) {
    throw new Error(`Agent not found: ${task.assignee_id}`);
  }

  // Use team-contextual relationship if available, fallback to general
  let relationship = agent.relationship;
  if (teamId) {
    const teamRel = getTeamMemberRelationship(teamId, agent.agent_id, conn);
    if (teamRel) relationship = teamRel;
  }

  const llm = provider ?? createLlmProvider();

  const response = await llm.complete({
    messages: [
      {
        role: 'system',
        content: '你是一个角色扮演专家，擅长模拟不同人物的语气和汇报风格。',
      },
      {
        role: 'user',
        content: buildSimulatePrompt(
          agent.name,
          relationship,
          agent.capabilities,
          task.todo_description,
          task.deadline
        ),
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return {
    trace_id: traceId,
    simulated_delivery: response.content,
  };
}
