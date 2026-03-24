<div align="center">

# HumanClaw

**Carbon-Based Node Orchestration Framework — Humans as Distributed Worker Nodes**

[![npm](https://img.shields.io/npm/v/@humanclaw/humanclaw)](https://www.npmjs.com/package/@humanclaw/humanclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**中文** | [English](./README_EN.md)

[Documentation Site](https://humanclaw.github.io/humanclaw/)

</div>

---

## Overview

HumanClaw is a carbon-based node orchestration framework. The system abstracts real humans as Agents (carbon-based nodes), models task dispatch and result collection as process **Suspend** and **Resume**.

Core flow: natural language input → select people → AI auto-plans (breaks down tasks + generates briefings + sets deadlines) → confirm dispatch → collect deliverables → AI aggregated review.

## Core Architecture

```
┌─────────────┐     Dispatch      ┌──────────────┐
│             │ ──────────────►   │              │
│   Master    │     trace_id      │  HumanAgent  │
│  (Boss/PM)  │ ◄──────────────   │  (Carbon CPU)│
│             │   Resume + Result │              │
└─────┬───────┘                   └──────────────┘
      │
      │  AI Review
      ▼
┌─────────────┐
│  LLM Review │
│ (Claude/GPT)│
└─────────────┘
```

- **Master Node**: Input requirements, AI auto-breaks them into independent sub-tasks, dispatches to carbon-based nodes
- **Worker Node (HumanAgent)**: Receives independent tasks with a `trace_id`, executes asynchronously in the carbon-based world
- **AI Review**: After all tasks complete, LLM reviews deliverable quality and generates a report

## Quick Start

### Install

```bash
npm install -g @humanclaw/humanclaw
```

### Start Server

```bash
humanclaw serve
# Server runs at http://localhost:2026
# Dashboard: http://localhost:2026
```

### Register a Carbon-Based Node

```bash
humanclaw agent add
# Interactive prompts for: node name, capability tags
```

### AI Task Planning

```bash
humanclaw plan "Rebuild the homepage with responsive navbar and footer"
# AI auto-breaks tasks, matches nodes, generates briefings and deadlines
```

### View Compute Pool

```bash
humanclaw agent list
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/nodes/status` | Carbon compute pool status |
| `POST` | `/api/v1/nodes` | Register carbon-based node |
| `PATCH` | `/api/v1/nodes/:id/status` | Update node status |
| `POST` | `/api/v1/jobs/plan` | AI task planning (does not dispatch) |
| `POST` | `/api/v1/jobs/create` | Create and dispatch job |
| `GET` | `/api/v1/jobs/active` | Get kanban data |
| `POST` | `/api/v1/tasks/resume` | Submit deliverable, trigger resume |
| `POST` | `/api/v1/tasks/reject` | Reject and retry |
| `POST` | `/api/v1/tasks/simulate` | AI simulate delivery (role-play) |
| `POST` | `/api/v1/jobs/:id/review` | AI aggregated review of deliverables |
| `GET` | `/api/v1/config` | Get LLM configuration |
| `PUT` | `/api/v1/config` | Update LLM configuration |

### AI Planning Example

```bash
curl -X POST http://localhost:2026/api/v1/jobs/plan \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "Rebuild the homepage" }'
```

### Submit Deliverable

```bash
curl -X POST http://localhost:2026/api/v1/tasks/resume \
  -H "Content-Type: application/json" \
  -d '{
    "trace_id": "TK-9527",
    "result_data": { "text": "https://github.com/org/repo/pull/42" }
  }'
```

## Dashboard

The web dashboard includes three core views:

- **Carbon Compute Pool** — Real-time carbon-based node status (🟢Idle 🟡Busy 🔴Offline 🟣OOM), add/remove nodes
- **Carbon Orchestration Pipeline** — AI planning + Task Kanban + interactive task cards (click to submit/reject) + simulate delivery + AI review
- **I/O Resolution Terminal** — Input trace_id and payload to trigger system resume

### AI Features

- **Smart Planning** — Input requirements, AI auto-breaks tasks, matches nodes, generates briefings, sets adjustable deadlines
- **Simulate Delivery** — Click a button, AI role-plays as the worker node based on their identity, skills, and relationship to generate mock deliverables
- **Aggregated Review** — After all deliveries, AI reviews each deliverable (supports GitHub PR/Commit/Issue URLs), generates quality report
- **Configurable LLM** — Supports Claude / OpenAI, custom Base URL for private deployments (vLLM / Ollama / Azure)

### Demo Scenarios

The dashboard includes three built-in demo scenarios for instant hands-on experience:

- **Three Kingdoms (Shu Han)** 🐉 — You are Liu Bei, commanding Guan Yu, Zhang Fei, Zhao Yun, Zhuge Liang and more
- **Tech Company** 💻 — You are the Tech Director, managing frontend, backend, algorithm, product, design, QA, and ops teams
- **US Government** 🇺🇸 — You are Trump, directing Musk, Rubio, Bessent and the core cabinet

## Core Workflow

1. **Agent Encapsulation** — Register human members, build the carbon compute pool
2. **AI Planning** — Input requirements, AI breaks tasks, matches nodes, generates briefings and deadlines
3. **Confirm Dispatch** — Preview plan, adjust deadlines, one-click dispatch
4. **Async Resume** — Carbon-based nodes submit deliverables (supports GitHub URLs), system wakes up the Job
5. **AI Review** — When all sub-tasks complete, LLM reviews deliverable quality and generates a report

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HUMANCLAW_LLM_PROVIDER` | `claude` | LLM provider: `claude` or `openai` |
| `HUMANCLAW_LLM_API_KEY` | - | LLM API Key (required for AI features) |
| `HUMANCLAW_LLM_MODEL` | per provider | Optional model override |
| `HUMANCLAW_LLM_BASE_URL` | official | Custom API URL (private deployments) |

> Dashboard settings panel can also configure these, with higher priority than env vars.

## Data Models

```typescript
interface HumanAgent {
  agent_id: string;       // emp_xxxxxxxx
  name: string;           // "Frontend Dev Li"
  capabilities: string[]; // ["UI/UX", "Frontend"]
  relationship: string;   // "P7 direct report, 3 years"
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

## Development

```bash
git clone https://github.com/humanclaw/humanclaw.git
cd humanclaw
npm install
npm run dev        # Start dev server
npm test           # Run tests
npm run lint       # Type check
```

## Tech Stack

- **Runtime**: Node.js 22+, TypeScript (ESM, strict)
- **API**: Express v5
- **Storage**: SQLite (better-sqlite3, WAL mode)
- **LLM**: Claude / OpenAI (native fetch, zero dependencies)
- **CLI**: Commander.js + @clack/prompts
- **Dashboard**: Inline HTML (no build step)
- **Testing**: Vitest (40 tests)

## License

[MIT](./LICENSE)
