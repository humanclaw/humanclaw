import { fetchFleet, renderFleet } from './components/fleet-status';
import { fetchActiveJobs, renderPipeline } from './components/task-pipeline';
import { renderTerminal } from './components/io-terminal';

// ─── i18n ────────────────────────────────────────────────────

type Lang = 'zh' | 'en';

const i18n: Record<Lang, Record<string, string>> = {
  zh: {
    title: 'HumanClaw',
    subtitle: '碳基节点编排框架 — 将人类抽象为分布式 Worker 节点',
    pageTitle: 'HumanClaw - 碳基节点编排框架',
    tabFleet: '碳基算力池',
    tabPipeline: '任务编排',
    tabTerminal: 'I/O 终端',
    langToggle: 'EN',
    landingDesc: '碳基节点编排框架 — 将人类抽象为分布式 Worker 节点。这是 Dashboard 预览页面。要使用完整的实时看板，请在本地启动 HumanClaw 服务：',
    archTitle: '核心架构',
    archMaster: '主节点 (老板/PM)',
    archPlanning: 'AI 规划 --> 任务拆解 + 话术生成 + DDL',
    archDispatch: '分发 (trace_id) --> 碳基节点 (碳基算力)',
    archResume: '<-- 恢复 + 交付结果',
    archReview: 'LLM 审查 (Claude / GPT)',
    featTitle: '核心功能',
    feat1: '碳基算力池 — 将人类注册为带技能标签和关系描述的 Worker 节点',
    feat2: 'AI 智能规划 — 自然语言输入需求，自动拆解任务、匹配节点、生成布置话术',
    feat3: '扁平编排 — 无嵌套依赖，避免碳基死锁',
    feat4: '挂起与恢复 — 碳基节点异步执行期间持久化上下文',
    feat5: '模拟交付 — AI 角色扮演碳基节点，生成模拟交付物',
    feat6: 'AI 聚合审查 — LLM 审查交付质量，生成评分报告',
    feat7: 'Demo 场景 — 内置三国蜀汉、互联网大厂、美国政府三大场景',
    feat8: '看板面板 — 实时跟踪 DISPATCHED / OVERDUE / RESOLVED',
    demoTitle: 'Demo 场景',
    demoDesc: 'Dashboard 内置三个开箱即用的场景，一键加载即可体验：',
    demo1: '三国蜀汉 — 你是刘备，底下有关羽、张飞、赵云、诸葛亮等七员大将',
    demo2: '互联网大厂 — 你是技术总监，管理前端、后端、算法、产品、设计、测试、运维团队',
    demo3: '美国政府 — 你是特朗普，指挥 Musk、Rubio、Bessent 等核心内阁',
  },
  en: {
    title: 'HumanClaw',
    subtitle: 'Carbon-Based Node Orchestration Framework — Humans as Distributed Worker Nodes',
    pageTitle: 'HumanClaw - Carbon-Based Node Orchestration',
    tabFleet: 'Carbon Compute Pool',
    tabPipeline: 'Task Pipeline',
    tabTerminal: 'I/O Terminal',
    langToggle: '中文',
    landingDesc: 'Carbon-Based Node Orchestration Framework — treating humans as distributed worker nodes. This is the dashboard preview. To use the live dashboard, start the HumanClaw server locally:',
    archTitle: 'Architecture',
    archMaster: 'Master (Boss/PM)',
    archPlanning: 'AI Planning --> Task Breakdown + Briefings + DDL',
    archDispatch: 'Dispatch (trace_id) --> HumanAgent (Carbon CPU)',
    archResume: '<-- Resume + Result',
    archReview: 'LLM Review (Claude / GPT)',
    featTitle: 'Features',
    feat1: 'Carbon Compute Pool — Register humans as worker nodes with skill tags and relationships',
    feat2: 'AI Task Planning — Natural language input, auto task breakdown, briefing generation',
    feat3: 'Flat-layer Orchestration — No nested dependencies, avoid physical deadlock',
    feat4: 'Suspend & Resume — Persist context during long async human execution',
    feat5: 'Simulate Delivery — AI role-plays as worker to generate mock deliverables',
    feat6: 'AI Aggregated Review — LLM reviews deliverable quality with scoring report',
    feat7: 'Demo Scenarios — Built-in Three Kingdoms, Tech Company, US Government',
    feat8: 'Kanban Dashboard — Track DISPATCHED / OVERDUE / RESOLVED per job',
    demoTitle: 'Demo Scenarios',
    demoDesc: 'The dashboard includes three built-in scenarios for instant hands-on experience:',
    demo1: 'Three Kingdoms (Shu Han) — You are Liu Bei, commanding Guan Yu, Zhang Fei, Zhao Yun, Zhuge Liang and more',
    demo2: 'Tech Company — You are the Tech Director, managing frontend, backend, algorithm, product, design, QA, and ops teams',
    demo3: 'US Government — You are Trump, directing Musk, Rubio, Bessent and the core cabinet',
  },
};

let currentLang: Lang = 'zh';

function t(key: string): string {
  return i18n[currentLang][key] ?? key;
}

function applyLang(): void {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.getElementById('subtitle')!.textContent = t('subtitle');
  document.getElementById('tab-fleet')!.textContent = t('tabFleet');
  document.getElementById('tab-pipeline')!.textContent = t('tabPipeline');
  document.getElementById('tab-terminal')!.textContent = t('tabTerminal');
  document.getElementById('lang-toggle')!.textContent = t('langToggle');

  // Re-render landing if showing
  const activePanel = document.querySelector('.tab.active') as HTMLButtonElement;
  if (activePanel && !apiAvailable) {
    const panelId = activePanel.dataset.panel!;
    renderLanding(document.getElementById(panelId)!);
  }
}

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
      <div style="text-align:center;margin-bottom:24px;">
        <img src="./assets/logo.jpg" alt="HumanClaw Logo" style="width:100px;height:100px;border-radius:16px;" />
      </div>
      <h2 style="color:var(--accent);font-family:var(--font-mono);margin-bottom:16px;text-align:center;">&gt; HumanClaw</h2>
      <p style="color:var(--text);line-height:1.8;margin-bottom:24px;">
        ${t('landingDesc')}
      </p>
      <pre style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px;font-family:var(--font-mono);font-size:14px;color:var(--accent);overflow-x:auto;line-height:1.6;">npm install -g @humanclaw/humanclaw
humanclaw serve
# Dashboard: http://localhost:2026</pre>
      <div style="margin-top:32px;">
        <h3 style="color:var(--text);margin-bottom:12px;">${t('archTitle')}</h3>
        <pre style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px;font-family:var(--font-mono);font-size:13px;color:var(--text-dim);line-height:1.5;">
  ${t('archMaster')}
    |
    |-- ${t('archPlanning')}
    |
    |-- ${t('archDispatch')}
    |                              |
    |${t('archResume')}
    |
    v
  ${t('archReview')}</pre>
      </div>
      <div style="margin-top:32px;">
        <h3 style="color:var(--text);margin-bottom:12px;">${t('featTitle')}</h3>
        <ul style="color:var(--text-dim);line-height:2;padding-left:20px;">
          <li>${t('feat1')}</li>
          <li>${t('feat2')}</li>
          <li>${t('feat3')}</li>
          <li>${t('feat4')}</li>
          <li>${t('feat5')}</li>
          <li>${t('feat6')}</li>
          <li>${t('feat7')}</li>
          <li>${t('feat8')}</li>
        </ul>
      </div>
      <div style="margin-top:32px;">
        <h3 style="color:var(--text);margin-bottom:12px;">${t('demoTitle')}</h3>
        <p style="color:var(--text-dim);margin-bottom:12px;">${t('demoDesc')}</p>
        <ul style="color:var(--text-dim);line-height:2;padding-left:20px;">
          <li>🐉 ${t('demo1')}</li>
          <li>💻 ${t('demo2')}</li>
          <li>🇺🇸 ${t('demo3')}</li>
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

// ─── Language Toggle ─────────────────────────────────────────

document.getElementById('lang-toggle')!.addEventListener('click', () => {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  applyLang();
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
  applyLang();
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
