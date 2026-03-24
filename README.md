<div align="center">

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

核心流程：输入自然语言需求 → 选人 → AI 自动规划（拆任务 + 生成话术 + 设 DDL）→ 确认分发 → 收交付物 → AI 聚合审查。

## 核心架构

```
┌─────────────┐     Dispatch      ┌──────────────┐
│             │ ──────────────►   │              │
│   Master    │     trace_id      │  HumanAgent  │
│  (老板/PM)  │ ◄──────────────   │  (碳基算力)   │
│             │   Resume + Result │              │
└─────┬───────┘                   └──────────────┘
      │
      │  AI Review
      ▼
┌─────────────┐
│  LLM 审查   │
│ (Claude/GPT)│
└─────────────┘
```

- **Master 节点**：输入需求，AI 自动拆解为独立子任务，分发给碳基节点
- **Worker 节点 (HumanAgent)**：接收带 `trace_id` 的独立任务，在碳基世界异步执行
- **AI 审查**：所有任务完成后，LLM 自动审查交付质量并生成报告

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

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/nodes/status` | 碳基算力池状态 |
| `POST` | `/api/v1/nodes` | 注册碳基节点 |
| `PATCH` | `/api/v1/nodes/:id/status` | 更新节点状态 |
| `POST` | `/api/v1/jobs/plan` | AI 智能规划（不分发） |
| `POST` | `/api/v1/jobs/create` | 创建并分发任务 |
| `GET` | `/api/v1/jobs/active` | 获取看板数据 |
| `POST` | `/api/v1/tasks/resume` | 提交交付物，触发恢复 |
| `POST` | `/api/v1/tasks/reject` | 打回重做 |
| `POST` | `/api/v1/jobs/:id/review` | AI 聚合审查交付质量 |
| `GET` | `/api/v1/config` | 获取 LLM 配置 |
| `PUT` | `/api/v1/config` | 更新 LLM 配置 |

### AI 规划示例

```bash
curl -X POST http://localhost:2026/api/v1/jobs/plan \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "完成首页重构" }'
```

### 提交交付物

```bash
curl -X POST http://localhost:2026/api/v1/tasks/resume \
  -H "Content-Type: application/json" \
  -d '{
    "trace_id": "TK-9527",
    "result_data": { "text": "https://github.com/org/repo/pull/42" }
  }'
```

## Dashboard 看板

Web 看板包含三个核心视图：

- **碳基算力池** — 实时查看碳基节点状态（🟢空闲 🟡忙碌 🔴离线 🟣崩溃），一键添加/删除节点
- **碳基编排大盘** — AI 智能规划 + 任务 Kanban + 可交互任务卡片（点击直接提交交付/打回）+ AI 聚合审查
- **I/O 交付终端** — 输入 trace_id 和交付载荷，触发系统恢复

### AI 功能

- **智能规划** — 输入需求，AI 自动拆任务、匹配碳基节点、生成布置话术、设 DDL（可调）
- **聚合审查** — 全部交付后，AI 审查每个交付物质量（支持 GitHub PR/Commit/Issue URL），生成评分报告
- **可配置 LLM** — 支持 Claude / OpenAI，可自定义 Base URL 接入私有模型服务（vLLM / Ollama / Azure）

## 核心工作流

1. **镜像封装** — 录入碳基成员信息，构建碳基算力池
2. **AI 规划** — 输入需求，AI 拆解任务、匹配节点、生成话术和 DDL
3. **确认分发** — 预览规划结果，调整 DDL，确认后一键分发
4. **异步恢复** — 碳基节点提交交付物（支持 GitHub URL），系统唤醒 Job
5. **AI 审查** — 所有子任务完成后，LLM 审查交付质量并生成报告

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `HUMANCLAW_LLM_PROVIDER` | `claude` | LLM 提供商：`claude` 或 `openai` |
| `HUMANCLAW_LLM_API_KEY` | - | LLM API Key（使用 AI 功能时必填） |
| `HUMANCLAW_LLM_MODEL` | 按 provider | 可选覆盖模型名 |
| `HUMANCLAW_LLM_BASE_URL` | 官方地址 | 自定义 API 地址（私有部署） |

> Dashboard 设置面板也可以配置以上参数，优先级高于环境变量。

## 数据模型

```typescript
interface HumanAgent {
  agent_id: string;       // emp_xxxxxxxx
  name: string;           // "前端老李"
  capabilities: string[]; // ["UI/UX", "前端开发"]
  status: AgentStatus;    // IDLE | BUSY | OFFLINE | OOM
}

interface HumanTask {
  trace_id: string;       // TK-9527
  job_id: string;
  assignee_id: string;
  todo_description: string;
  deadline: string;
  status: TaskStatus;     // PENDING | DISPATCHED | RESOLVED | OVERDUE
  result_data: unknown;
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
- **LLM**: Claude / OpenAI（原生 fetch，零依赖）
- **CLI**: Commander.js + @clack/prompts
- **Dashboard**: 内联 HTML（无需构建）
- **Testing**: Vitest (40 tests)

## License

[MIT](./LICENSE)
