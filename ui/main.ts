// ─── i18n ────────────────────────────────────────────────────

type Lang = 'zh' | 'en';

const i18n: Record<Lang, Record<string, string>> = {
  zh: {
    // nav
    navArch: '架构',
    navFeat: '特性',
    navWorkflow: '工作流',
    navDemo: '场景',
    navStart: '快速上手',
    // hero
    heroSubtitle: '碳基节点编排框架 — 将人类抽象为分布式 Worker 节点',
    heroSlogan: '在 AI 时代，最需要被编排的不是容器，不是微服务，而是人。',
    copy: '复制',
    copied: '已复制!',
    // architecture
    archTitle: '核心架构',
    archDesc: '将人类抽象为碳基 Worker 节点，任务派发为进程挂起，交付结果为进程恢复。',
    archMaster: 'Master 节点',
    archMasterHint: '老板 / PM',
    archPlanning: 'AI 规划',
    archPlanningHint: '拆任务 + 话术 + DDL',
    archDispatch: '分发 Dispatch',
    archWorker: 'HumanAgent',
    archWorkerHint: '碳基算力',
    archReturn: '← Resume + Result → AI 审查 + 绩效评价',
    conceptSuspend: '挂起 & 恢复',
    conceptSuspendDesc: '任务分发后进程挂起，碳基节点异步执行，提交交付物后自动恢复。',
    conceptTeam: '团队上下文',
    conceptTeamDesc: '碳基节点按团队组织，每个成员有独立的团队关系描述，注入 AI 规划。',
    conceptEval: '审查 & 绩效',
    conceptEvalDesc: 'LLM 审查交付质量，支持三种评分体系（Ali 3.75 / SABCD / EM+MM-）。',
    // features
    featTitle: '功能特性',
    feat1Title: 'AI 智能规划',
    feat1Desc: '自然语言输入需求，AI 自动拆解任务、匹配碳基节点、生成布置话术。',
    feat2Title: '碳基算力池',
    feat2Desc: '将人类注册为带技能标签、关系描述的 Worker 节点，实时追踪状态。',
    feat3Title: '团队管理',
    feat3Desc: '创建团队、管理成员，每人有独立团队关系，按团队维度规划任务。',
    feat4Title: '绩效评价',
    feat4Desc: '三种评分体系（Ali 3.75 / SABCD / EM+MM-），AI 生成按人按任务的绩效。',
    feat5Title: '模拟交付',
    feat5Desc: 'AI 角色扮演碳基节点，基于身份、技能和关系生成模拟交付物。',
    feat6Title: 'AI 聚合审查',
    feat6Desc: '全部交付后，LLM 审查每个交付物质量（支持 GitHub URL），生成报告。',
    feat7Title: '3 种 LLM 格式',
    feat7Desc: 'Anthropic Messages / OpenAI Chat / OpenAI Responses，自定义 Base URL。',
    feat8Title: '可伸缩编辑器',
    feat8Desc: '所有文本区域支持拖拽调整大小和全屏展开，舒适编辑长文本。',
    feat9Title: '开箱即用 Demo',
    feat9Desc: '内置三国蜀汉、互联网大厂、美国政府三大场景，一键体验。',
    // workflow
    wfTitle: '核心工作流',
    wf1Title: '镜像封装',
    wf1Desc: '录入碳基成员，建立团队，构建算力池',
    wf2Title: 'AI 规划',
    wf2Desc: '输入需求，AI 拆解任务、匹配节点、生成话术',
    wf3Title: '确认分发',
    wf3Desc: '预览规划结果，调整 DDL，一键分发',
    wf4Title: '异步恢复',
    wf4Desc: '碳基节点提交交付物，系统唤醒 Job',
    wf5Title: 'AI 审查',
    wf5Desc: 'LLM 审查交付质量，生成评分报告',
    wf6Title: '绩效评价',
    wf6Desc: '选择评分体系，AI 生成绩效评分',
    // demo
    demoTitle: '内置场景',
    demoDesc: '三个开箱即用的 Demo 场景，一键加载碳基节点和团队：',
    demo1Title: '三国蜀汉',
    demo1Role: '你是刘备',
    demo1Desc: '全体文臣武将：关羽、张飞、赵云、诸葛亮、庞统、黄忠、马超',
    demo2Title: '互联网大厂',
    demo2Role: '你是技术总监',
    demo2Desc: '前端、后端、算法、产品、设计、测试、运维七员大将',
    demo3Title: '美国政府',
    demo3Role: '你是特朗普',
    demo3Desc: 'Musk、Rubio、Hegseth、Bessent 等核心内阁',
    // quickstart
    qsTitle: '快速上手',
    qs1Label: '安装',
    qs2Label: '启动服务',
    qs3Label: '注册碳基节点',
    qs3Comment: '# 交互式录入：节点名称、技能标签',
    qs4Label: 'AI 规划任务',
    qs4Cmd: '完成首页重构',
    qs4Comment: '# AI 自动拆解任务、匹配节点、生成话术',
    // footer
    footerDocs: '文档',
  },
  en: {
    navArch: 'Architecture',
    navFeat: 'Features',
    navWorkflow: 'Workflow',
    navDemo: 'Demos',
    navStart: 'Quick Start',
    heroSubtitle: 'Carbon-Based Node Orchestration — Humans as Distributed Worker Nodes',
    heroSlogan: 'In the age of AI, the thing that most needs orchestrating isn\'t containers or microservices — it\'s people.',
    copy: 'Copy',
    copied: 'Copied!',
    archTitle: 'Architecture',
    archDesc: 'Abstracts humans as carbon-based worker nodes. Task dispatch = process suspend. Delivery = process resume.',
    archMaster: 'Master Node',
    archMasterHint: 'Boss / PM',
    archPlanning: 'AI Planning',
    archPlanningHint: 'Task breakdown + Briefings + DDL',
    archDispatch: 'Dispatch',
    archWorker: 'HumanAgent',
    archWorkerHint: 'Carbon CPU',
    archReturn: '← Resume + Result → AI Review + Perf Evaluation',
    conceptSuspend: 'Suspend & Resume',
    conceptSuspendDesc: 'After dispatch, the process suspends. Carbon nodes execute async. Deliverables trigger resume.',
    conceptTeam: 'Team Context',
    conceptTeamDesc: 'Nodes organized into teams. Each member has team-specific relationships injected into AI planning.',
    conceptEval: 'Review & Evaluation',
    conceptEvalDesc: 'LLM reviews deliverable quality. Three rating systems (Ali 3.75 / SABCD / EM+MM-).',
    featTitle: 'Features',
    feat1Title: 'AI Smart Planning',
    feat1Desc: 'Natural language input, AI auto-breaks tasks, matches nodes, generates briefings.',
    feat2Title: 'Carbon Compute Pool',
    feat2Desc: 'Register humans as worker nodes with skill tags and relationships, real-time status tracking.',
    feat3Title: 'Team Management',
    feat3Desc: 'Create teams, manage members with team-specific relationships, plan tasks by team.',
    feat4Title: 'Performance Evaluation',
    feat4Desc: 'Three rating systems (Ali 3.75 / SABCD / EM+MM-), AI generates per-person performance scores.',
    feat5Title: 'Simulate Delivery',
    feat5Desc: 'AI role-plays as a worker node based on identity, skills and relationships.',
    feat6Title: 'AI Aggregated Review',
    feat6Desc: 'After all deliveries, LLM reviews quality (supports GitHub URLs), generates report.',
    feat7Title: '3 LLM Formats',
    feat7Desc: 'Anthropic Messages / OpenAI Chat / OpenAI Responses, custom Base URL support.',
    feat8Title: 'Resizable Editors',
    feat8Desc: 'All text areas support drag-to-resize and fullscreen expansion.',
    feat9Title: 'Built-in Demos',
    feat9Desc: 'Three Kingdoms, Tech Company, US Government — one-click to experience.',
    wfTitle: 'Core Workflow',
    wf1Title: 'Encapsulate',
    wf1Desc: 'Register members, build teams, construct compute pool',
    wf2Title: 'AI Planning',
    wf2Desc: 'Input requirements, AI breaks tasks, matches nodes, generates briefings',
    wf3Title: 'Dispatch',
    wf3Desc: 'Preview plan, adjust deadlines, one-click dispatch',
    wf4Title: 'Async Resume',
    wf4Desc: 'Carbon nodes submit deliverables, system wakes up Job',
    wf5Title: 'AI Review',
    wf5Desc: 'LLM reviews deliverable quality, generates scoring report',
    wf6Title: 'Evaluation',
    wf6Desc: 'Select rating system, AI generates performance scores',
    demoTitle: 'Built-in Scenarios',
    demoDesc: 'Three ready-to-use demo scenarios, one-click to load nodes and teams:',
    demo1Title: 'Three Kingdoms',
    demo1Role: 'You are Liu Bei',
    demo1Desc: 'All generals: Guan Yu, Zhang Fei, Zhao Yun, Zhuge Liang, Pang Tong, Huang Zhong, Ma Chao',
    demo2Title: 'Tech Company',
    demo2Role: 'You are Tech Director',
    demo2Desc: 'Frontend, backend, algorithm, product, design, QA, and DevOps — seven key players',
    demo3Title: 'US Government',
    demo3Role: 'You are Trump',
    demo3Desc: 'Musk, Rubio, Hegseth, Bessent and the core cabinet',
    qsTitle: 'Quick Start',
    qs1Label: 'Install',
    qs2Label: 'Start Server',
    qs3Label: 'Register Carbon Node',
    qs3Comment: '# Interactive: node name, skill tags',
    qs4Label: 'AI Task Planning',
    qs4Cmd: 'Rebuild the homepage',
    qs4Comment: '# AI auto-breaks tasks, matches nodes, generates briefings',
    footerDocs: 'Docs',
  },
};

let currentLang: Lang = 'zh';

function t(key: string): string {
  return i18n[currentLang][key] ?? key;
}

// ─── Apply Language ───────────────────────────────────────────

function applyLang(): void {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = currentLang === 'zh' ? 'HumanClaw - 碳基节点编排框架' : 'HumanClaw - Carbon Node Orchestration';

  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.textContent = currentLang === 'zh' ? 'EN' : '中文';

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n!;
    const val = t(key);
    if (val !== key) el.textContent = val;
  });
}

// ─── Language Toggle ──────────────────────────────────────────

document.getElementById('lang-toggle')?.addEventListener('click', () => {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  applyLang();
});

// ─── Smooth Scroll ────────────────────────────────────────────

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href')!);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ─── Copy npm command ─────────────────────────────────────────

document.getElementById('btn-copy')?.addEventListener('click', async () => {
  const cmd = 'npm install -g @humanclaw/humanclaw';
  try {
    await navigator.clipboard.writeText(cmd);
    const icon = document.querySelector('.copy-icon');
    if (icon) {
      icon.textContent = t('copied');
      setTimeout(() => { icon.textContent = t('copy'); }, 2000);
    }
  } catch {
    // fallback: select text
  }
});

// ─── Scroll Animations (Intersection Observer) ───────────────

const observer = new IntersectionObserver(
  entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    }
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.anim').forEach(el => observer.observe(el));

// ─── Nav Scroll Shadow ───────────────────────────────────────

const nav = document.getElementById('top-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    } else {
      nav.style.boxShadow = 'none';
    }
  }, { passive: true });
}

// ─── Init ─────────────────────────────────────────────────────

applyLang();
