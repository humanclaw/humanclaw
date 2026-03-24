import { fetchFleet, renderFleet } from './components/fleet-status';
import { fetchActiveJobs, renderPipeline } from './components/task-pipeline';
import { renderTerminal } from './components/io-terminal';

// ─── API Availability Check ─────────────────────────────────

let apiAvailable = true;

async function checkApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/nodes/status');
    return res.ok;
  } catch {
    return false;
  }
}

function renderLanding(container: HTMLElement): void {
  container.innerHTML = `
    <div style="max-width:720px;margin:0 auto;padding:40px 0;">
      <h2 style="color:var(--accent);font-family:var(--font-mono);margin-bottom:16px;">&gt; HumanClaw</h2>
      <p style="color:var(--text);line-height:1.8;margin-bottom:24px;">
        Carbon-Based Node Orchestration Framework &mdash; treating humans as distributed worker nodes.
        This is the dashboard preview. To use the live dashboard, start the HumanClaw server locally:
      </p>
      <pre style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px;font-family:var(--font-mono);font-size:14px;color:var(--accent);overflow-x:auto;line-height:1.6;">npm install -g @humanclaw/humanclaw
humanclaw serve
# Dashboard: http://localhost:2026</pre>
      <div style="margin-top:32px;">
        <h3 style="color:var(--text);margin-bottom:12px;">Architecture</h3>
        <pre style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px;font-family:var(--font-mono);font-size:13px;color:var(--text-dim);line-height:1.5;">
  Master (Boss/PM)
    |
    |-- AI Planning --> Task Breakdown + Briefings + DDL
    |
    |-- Dispatch (trace_id) --> HumanAgent (Carbon CPU)
    |                              |
    |<-- Resume + Result ----------|
    |
    v
  LLM Review (Claude / GPT)</pre>
      </div>
      <div style="margin-top:32px;">
        <h3 style="color:var(--text);margin-bottom:12px;">Features</h3>
        <ul style="color:var(--text-dim);line-height:2;padding-left:20px;">
          <li>Carbon Compute Pool - Register humans as worker nodes with skill tags and relationships</li>
          <li>AI Task Planning - Natural language input, auto task breakdown, briefing generation</li>
          <li>Flat-layer Orchestration - No nested dependencies, avoid physical deadlock</li>
          <li>Suspend & Resume - Persist context during long async human execution</li>
          <li>Simulate Delivery - AI role-plays as worker to generate mock deliverables</li>
          <li>AI Aggregated Review - LLM reviews deliverable quality with scoring report</li>
          <li>Demo Scenarios - Built-in demos (Three Kingdoms, Tech Company, US Government)</li>
          <li>Kanban Dashboard - Track DISPATCHED / OVERDUE / RESOLVED per job</li>
        </ul>
      </div>
      <div style="margin-top:32px;display:flex;gap:12px;">
        <a href="https://github.com/humanclaw/humanclaw" style="padding:10px 24px;background:var(--accent);color:var(--bg);border-radius:6px;text-decoration:none;font-weight:600;">GitHub</a>
        <a href="https://www.npmjs.com/package/@humanclaw/humanclaw" style="padding:10px 24px;background:var(--surface);color:var(--accent);border:1px solid var(--border);border-radius:6px;text-decoration:none;font-weight:600;">npm</a>
      </div>
    </div>
  `;
}

// ─── Tab Navigation ──────────────────────────────────────────

const tabs = document.querySelectorAll<HTMLButtonElement>('.tab');
const panels = document.querySelectorAll<HTMLElement>('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const panelId = tab.dataset.panel!;
    document.getElementById(panelId)!.classList.add('active');

    loadPanel(panelId);
  });
});

// ─── Panel Loading ───────────────────────────────────────────

async function loadPanel(panelId: string): Promise<void> {
  const container = document.getElementById(panelId)!;

  if (!apiAvailable) {
    renderLanding(container);
    return;
  }

  switch (panelId) {
    case 'fleet': {
      container.innerHTML = '<div class="empty">Loading...</div>';
      try {
        const data = await fetchFleet();
        renderFleet(container, data);
      } catch {
        renderLanding(container);
      }
      break;
    }
    case 'pipeline': {
      container.innerHTML = '<div class="empty">Loading...</div>';
      try {
        const data = await fetchActiveJobs();
        renderPipeline(container, data);
      } catch {
        renderLanding(container);
      }
      break;
    }
    case 'terminal': {
      renderTerminal(container);
      break;
    }
  }
}

// ─── Initial Load ────────────────────────────────────────────

(async () => {
  apiAvailable = await checkApi();
  loadPanel('fleet');

  if (apiAvailable) {
    setInterval(() => {
      const activePanel = document.querySelector('.tab.active') as HTMLButtonElement;
      if (activePanel) {
        const panelId = activePanel.dataset.panel!;
        if (panelId !== 'terminal') {
          loadPanel(panelId);
        }
      }
    }, 10000);
  }
})();
