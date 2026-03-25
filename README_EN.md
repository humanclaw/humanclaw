<div align="center">

<img src="assets/logo.jpg" alt="HumanClaw Logo" width="120" />

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

Core flow: natural language input → select people/team → AI auto-plans (breaks down tasks + generates briefings + sets deadlines) → confirm dispatch → collect deliverables → AI aggregated review → performance evaluation.

## Core Architecture

```
┌─────────────┐     Dispatch      ┌──────────────┐
│             │ ──────────────►   │              │
│   Master    │     trace_id      │  HumanAgent  │
│  (Boss/PM)  │ ◄──────────────   │  (Carbon CPU)│
│             │   Resume + Result │              │
└─────┬───────┘                   └──────┬───────┘
      │                                  │
      │  AI Review + Eval           Team Context
      ▼                                  ▼
┌─────────────┐                   ┌──────────────┐
│  LLM Review │                   │     Team     │
│ + Perf Eval │                   │  Management  │
└─────────────┘                   └──────────────┘
```

- **Master Node**: Input requirements, AI auto-breaks them into independent sub-tasks, dispatches to carbon-based nodes
- **Worker Node (HumanAgent)**: Receives independent tasks with a `trace_id`, executes asynchronously in the carbon-based world
- **Team Management**: Carbon-based nodes organized into teams, each team with its own relationship context
- **AI Review + Performance Evaluation**: After all tasks complete, LLM reviews deliverable quality and generates reports with performance ratings

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

### Carbon-Based Nodes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/nodes/status` | Carbon compute pool status |
| `POST` | `/api/v1/nodes` | Register carbon-based node |
| `GET` | `/api/v1/nodes/:id` | Get node details (with teams) |
| `PATCH` | `/api/v1/nodes/:id/status` | Update node status |
| `DELETE` | `/api/v1/nodes/:id` | Delete node |

### Task Orchestration

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/jobs/plan` | AI smart planning (supports `team_id`) |
| `POST` | `/api/v1/jobs/create` | Create and dispatch job |
| `GET` | `/api/v1/jobs/active` | Get dashboard data |
| `POST` | `/api/v1/tasks/resume` | Submit deliverable, trigger resume |
| `POST` | `/api/v1/tasks/reject` | Reject and redo |
| `POST` | `/api/v1/tasks/simulate` | AI simulate delivery (role-play) |
| `POST` | `/api/v1/jobs/:id/review` | AI aggregated review (supports rating system) |

### Team Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/teams` | Team list (with members) |
| `GET` | `/api/v1/teams/:id` | Team details |
| `POST` | `/api/v1/teams` | Create team |
| `DELETE` | `/api/v1/teams/:id` | Delete team |
| `POST` | `/api/v1/teams/:id/members` | Add member |
| `DELETE` | `/api/v1/teams/:id/members/:agent_id` | Remove member |
| `PUT` | `/api/v1/teams/:id/members/:agent_id` | Update member team relationship |

### Performance Evaluation

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/evaluations/generate` | Generate performance evaluations |
| `GET` | `/api/v1/evaluations/job/:job_id` | Query evaluations by Job |
| `GET` | `/api/v1/evaluations/agent/:agent_id` | Query evaluation history by Agent |
| `GET` | `/api/v1/evaluations/dashboard` | Performance dashboard |

### LLM Configuration

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/config` | Get LLM configuration |
| `PUT` | `/api/v1/config` | Update LLM configuration |

## Dashboard

The web dashboard includes three core views:

- **Carbon Compute Pool** — Real-time carbon-based node status (🟢Idle 🟡Busy 🔴Offline 🟣OOM), team management, add/remove nodes
- **Carbon Orchestration Pipeline** — AI smart planning (by team) + task board + simulate delivery + AI aggregated review + performance evaluation
- **I/O Resolution Terminal** — Input trace_id and payload to trigger system resume

### AI Features

- **Smart Planning** — Input requirements, AI auto-breaks tasks, matches nodes, generates briefings, sets deadlines (supports team-based planning with team relationship context injection)
- **Simulate Delivery** — Click a button, AI role-plays as the worker node based on identity, skills, and relationships to generate mock deliverables
- **Aggregated Review** — After all deliveries, AI reviews each deliverable (supports GitHub PR/Commit/Issue URLs), generates quality report
- **Performance Evaluation** — Three rating systems (Ali 3.75 / SABCD / EM+MM-), AI generates per-person per-task performance ratings and comments
- **Configurable LLM** — Supports 3 API formats (Anthropic Messages / OpenAI Chat Completions / OpenAI Responses), custom Base URL for private model services

### Resizable Editors

All text editing areas (task delivery, review results, planning briefings) support drag-to-resize and fullscreen expansion.

### Demo Scenarios

The dashboard includes three built-in demo scenarios, one-click to load carbon-based nodes and teams:

- **Three Kingdoms (Shu Han)** 🐉 — You are Liu Bei, commanding Guan Yu, Zhang Fei, Zhao Yun, Zhuge Liang and more
- **Tech Company** 💻 — You are the Tech Director, managing frontend, backend, algorithm, product, design, QA, and DevOps
- **US Government** 🇺🇸 — You are Trump, directing Musk, Rubio, Bessent and the core cabinet

## Core Workflow

1. **Agent Encapsulation** — Register human members, build teams, construct the carbon compute pool
2. **AI Planning** — Input requirements, select team/nodes, AI breaks tasks, generates briefings and deadlines
3. **Confirm Dispatch** — Preview plan, adjust deadlines, one-click dispatch
4. **Async Resume** — Carbon-based nodes submit deliverables (supports GitHub URLs), system wakes up the Job
5. **AI Review** — When all sub-tasks complete, LLM reviews deliverable quality and generates a report
6. **Performance Evaluation** — Select rating system, AI generates performance ratings for each carbon-based node

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HUMANCLAW_LLM_PROVIDER` | `anthropic` | API format: `anthropic` / `openai` / `responses` |
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

interface Team {
  team_id: string;        // team_xxxxxxxx
  name: string;           // "Frontend Team"
  description: string;
  members: TeamMember[];  // with team relationships
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
- **LLM**: 3 API formats (Anthropic / OpenAI / Responses), native fetch, zero dependencies
- **CLI**: Commander.js + @clack/prompts
- **Dashboard**: Inline HTML (no build step)
- **Testing**: Vitest (68 tests)

## License

[MIT](./LICENSE)
