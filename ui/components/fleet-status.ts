const API = '/api/v1';

interface AgentWithMetrics {
  agent_id: string;
  name: string;
  capabilities: string[];
  status: 'IDLE' | 'BUSY' | 'OFFLINE' | 'OOM';
  active_task_count: number;
  avg_delivery_hours: number | null;
}

interface FleetResponse {
  total: number;
  idle: number;
  busy: number;
  offline: number;
  oom: number;
  agents: AgentWithMetrics[];
}

export async function fetchFleet(): Promise<FleetResponse> {
  const res = await fetch(`${API}/nodes/status`);
  return res.json();
}

export function renderFleet(container: HTMLElement, data: FleetResponse): void {
  const summaryHtml = `
    <div class="fleet-summary">
      <div class="summary-item">
        <div class="summary-value">${data.total}</div>
        <div class="summary-label">Total</div>
      </div>
      <div class="summary-item">
        <div class="summary-value" style="color:var(--green)">${data.idle}</div>
        <div class="summary-label">Idle</div>
      </div>
      <div class="summary-item">
        <div class="summary-value" style="color:var(--yellow)">${data.busy}</div>
        <div class="summary-label">Busy</div>
      </div>
      <div class="summary-item">
        <div class="summary-value" style="color:var(--red)">${data.offline}</div>
        <div class="summary-label">Offline</div>
      </div>
      <div class="summary-item">
        <div class="summary-value" style="color:var(--purple)">${data.oom}</div>
        <div class="summary-label">OOM</div>
      </div>
    </div>
  `;

  if (data.agents.length === 0) {
    container.innerHTML = summaryHtml + '<div class="empty">No carbon-based nodes registered. Use CLI: humanclaw agent add</div>';
    return;
  }

  const cardsHtml = data.agents
    .map(
      agent => `
    <div class="agent-card">
      <div class="agent-header">
        <span class="status-dot ${agent.status}"></span>
        <span class="agent-name">${escapeHtml(agent.name)}</span>
      </div>
      <div class="agent-id">${agent.agent_id}</div>
      <div class="agent-caps">
        ${agent.capabilities.map(c => `<span class="cap-tag">${escapeHtml(c)}</span>`).join('')}
      </div>
      <div class="agent-metrics">
        Active tasks: ${agent.active_task_count}
        ${agent.avg_delivery_hours !== null ? ` | Avg delivery: ${agent.avg_delivery_hours}h` : ''}
      </div>
    </div>
  `
    )
    .join('');

  container.innerHTML = summaryHtml + `<div class="fleet-grid">${cardsHtml}</div>`;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
