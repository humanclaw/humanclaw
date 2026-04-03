<div align="center">

<img src="assets/logo.jpg" alt="HumanClaw Logo" width="120" />

# HumanClaw

**碳基节点编排框架 —— 将人类抽象为分布式 Worker 节点**

[![npm](https://img.shields.io/npm/v/@humanclaw/humanclaw)](https://www.npmjs.com/package/@humanclaw/humanclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[English](./README_EN.md) | **中文**

[文档站点](https://humanclaw.github.io/humanclaw/)

</div>

---

## 概述

HumanClaw 是一个碳基节点编排框架。系统将真实人类抽象为 Agent（碳基节点），将现实中的任务派发与结果收集抽象为进程的**挂起（Suspend）**与**恢复（Resume）**。

核心流程：输入自然语言需求 → 选人/选团队 → AI 自动规划（拆任务 + 生成话术 + 设 DDL）→ 确认分发 → 收交付物 → AI 聚合审查 → 绩效评价。

## 核心架构

```
┌─────────────┐     Dispatch      ┌──────────────┐
│             │ ──────────────►   │              │
│   Master    │     trace_id      │  HumanAgent  │
│  (老板/PM)  │ ◄──────────────   │  (碳基算力)   │
│             │   Resume + Result │              │
└─────┬───────┘                   └──────┬───────┘
      │                                  │
      │  AI Review + Eval           Team Context
      ▼                                  ▼
┌─────────────┐                   ┌──────────────┐
│  LLM 审查   │                   │   团队管理    │
│ + 绩效评价  │                   │ (关系 & 权重) │
└─────────────┘                   └──────────────┘
```

- **Master 节点**：输入需求，AI 自动拆解为独立子任务，分发给碳基节点
- **Worker 节点 (HumanAgent)**：接收带 `trace_id` 的独立任务，在碳基世界异步执行
- **团队管理**：碳基节点按团队组织，每个团队有独立的关系上下文
- **AI 审查 + 绩效评价**：所有任务完成后，LLM 审查交付质量并生成报告和绩效评分

## 快速开始

### 安装

```bash
npm install -g @humanclaw/humanclaw
```

### 启动服务

```bash
humanclaw serve
# 服务运行在 http://localhost:2026
# Dashboard 看板：http://localhost:2026
```

### 注册碳基节点

```bash
humanclaw agent add
# 交互式录入：节点名称、技能标签
```

### AI 规划任务

```bash
humanclaw plan "完成首页重构，包括导航栏和页脚的响应式改版"
# AI 自动拆解任务、匹配碳基节点、生成话术和 DDL
```

### 查看算力池

```bash
humanclaw agent list
```

## API 接口

### 碳基节点

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/nodes/status` | 碳基算力池状态 |
| `POST` | `/api/v1/nodes` | 注册碳基节点 |
| `GET` | `/api/v1/nodes/:id` | 获取节点详情（含团队） |
| `PATCH` | `/api/v1/nodes/:id/status` | 更新节点状态 |
| `DELETE` | `/api/v1/nodes/:id` | 删除节点 |

### 任务编排

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/v1/jobs/plan` | AI 智能规划（支持 `team_id`） |
| `POST` | `/api/v1/jobs/create` | 创建并分发任务 |
| `GET` | `/api/v1/jobs/active` | 获取看板数据 |
| `POST` | `/api/v1/tasks/resume` | 提交交付物，触发恢复 |
| `POST` | `/api/v1/tasks/reject` | 打回重做 |
| `POST` | `/api/v1/tasks/simulate` | AI 模拟交付（角色扮演） |
| `POST` | `/api/v1/jobs/:id/review` | AI 聚合审查（支持评分体系） |

### 团队管理

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/teams` | 团队列表（含成员） |
| `GET` | `/api/v1/teams/:id` | 团队详情 |
| `POST` | `/api/v1/teams` | 创建团队 |
| `DELETE` | `/api/v1/teams/:id` | 删除团队 |
| `POST` | `/api/v1/teams/:id/members` | 添加成员 |
| `DELETE` | `/api/v1/teams/:id/members/:agent_id` | 移除成员 |
| `PUT` | `/api/v1/teams/:id/members/:agent_id` | 更新成员团队关系 |

### 绩效评价

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/v1/evaluations/generate` | 生成绩效评价 |
| `GET` | `/api/v1/evaluations/job/:job_id` | 按 Job 查询评价 |
| `GET` | `/api/v1/evaluations/agent/:agent_id` | 按 Agent 查询评价历史 |
| `GET` | `/api/v1/evaluations/dashboard` | 绩效看板 |

### LLM 配置

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/config` | 获取 LLM 配置 |
| `PUT` | `/api/v1/config` | 更新 LLM 配置 |

## Dashboard 看板

Web 看板包含三个核心视图：

- **碳基算力池** — 实时查看碳基节点状态（🟢空闲 🟡忙碌 🔴离线 🟣崩溃），团队管理，一键添加/删除节点
- **碳基编排大盘** — AI 智能规划（可按团队）+ 任务看板 + 模拟交付 + AI 聚合审查 + 绩效评价
- **I/O 交付终端** — 输入 trace_id 和交付载荷，触发系统恢复

### AI 功能

- **智能规划** — 输入需求，AI 自动拆任务、匹配碳基节点、生成布置话术、设 DDL（支持按团队规划，注入团队关系上下文）
- **模拟交付** — 点击按钮，AI 以碳基节点视角角色扮演，根据身份、技能、关系生成模拟交付物
- **聚合审查** — 全部交付后，AI 审查每个交付物质量（支持 GitHub PR/Commit/Issue URL），生成评分报告
- **绩效评价** — 支持三种评分体系（阿里 3.75 / SABCD / EM），AI 生成按人按任务的绩效评分和评语
- **可配置 LLM** — 支持 3 种 API 格式（Anthropic Messages / OpenAI Chat Completions / OpenAI Responses），可自定义 Base URL 接入私有模型服务

### 可伸缩编辑器

所有文本编辑区域（任务交付、审查结果、规划话术）均支持拖拽调整大小和全屏展开。

### Demo 场景

Dashboard 内置三个开箱即用的 Demo 场景，一键加载碳基节点和团队：

- **三国蜀汉** 🐉 — 你是刘备，麾下关羽、张飞、赵云、诸葛亮等七员文臣武将
- **互联网大厂** 💻 — 你是技术总监，管理前端、后端、算法、产品、设计、测试、运维
- **美国政府** 🇺🇸 — 你是特朗普，指挥 Musk、Rubio、Bessent 等核心内阁

## 核心工作流

1. **镜像封装** — 录入碳基成员信息，建立团队，构建碳基算力池
2. **AI 规划** — 输入需求，选择团队/节点，AI 拆解任务、生成话术和 DDL
3. **确认分发** — 预览规划结果，调整 DDL，确认后一键分发
4. **异步恢复** — 碳基节点提交交付物（支持 GitHub URL），系统唤醒 Job
5. **AI 审查** — 所有子任务完成后，LLM 审查交付质量并生成报告
6. **绩效评价** — 选择评分体系，AI 生成每个碳基节点的绩效评分

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `HUMANCLAW_LLM_PROVIDER` | `anthropic` | API 格式：`anthropic` / `openai` / `responses` |
| `HUMANCLAW_LLM_API_KEY` | - | LLM API Key（使用 AI 功能时必填） |
| `HUMANCLAW_LLM_MODEL` | 按 provider | 可选覆盖模型名 |
| `HUMANCLAW_LLM_BASE_URL` | 官方地址 | 自定义 API 地址（私有部署） |

> Dashboard 设置面板也可以配置以上参数，优先级高于环境变量。

### 话术风格（respect_level）

通过 Dashboard 设置面板可配置 AI 生成任务话术时的语气风格：

| 值 | 说明 |
|----|------|
| `high`（默认）| 尊重、有温度，像靠谱的项目经理 |
| `medium` | 直接务实，省略客套 |
| `low` | 纯指令，冷冰冰，没有任何缓冲 |

## 数据模型

```typescript
interface HumanAgent {
  agent_id: string;       // emp_xxxxxxxx
  name: string;           // "前端老李"
  capabilities: string[]; // ["UI/UX", "前端开发"]
  relationship: string;   // "P7 直属下属，跟了三年"
  status: AgentStatus;    // IDLE | BUSY | OFFLINE | OOM
}

interface Team {
  team_id: string;        // team_xxxxxxxx
  name: string;           // "前端组"
  description: string;
  members: TeamMember[];  // 含团队关系
}

interface Evaluation {
  eval_id: string;
  agent_id: string;
  trace_id: string;
  rating_system: 'ali' | 'letter' | 'em';
  rating: string;         // "3.75" / "A" / "EM+"
  weight: number;
  comment: string;
}
```

## 开发

```bash
git clone https://github.com/humanclaw/humanclaw.git
cd humanclaw
npm install
npm run dev        # 启动开发服务器
npm test           # 运行测试
npm run lint       # 类型检查
```

## 技术栈

- **Runtime**: Node.js 22+, TypeScript (ESM, strict)
- **API**: Express v5
- **Storage**: SQLite (better-sqlite3, WAL mode)
- **LLM**: 3 种 API 格式（Anthropic / OpenAI / Responses），原生 fetch，零依赖
- **CLI**: Commander.js + @clack/prompts
- **Dashboard**: 内联 HTML（无需构建）
- **Testing**: Vitest (68 tests)

## License

[MIT](./LICENSE)

---

> **Orchestrate Humans, but Humanely.**
