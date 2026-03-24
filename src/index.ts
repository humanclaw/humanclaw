import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { startServer } from './server.js';
import { getDb } from './db/connection.js';
import { initSchema } from './db/schema.js';
import { createAgent, listAgents } from './models/agent.js';
import { listActiveJobs } from './models/job.js';
import { markOverdueTasks } from './models/task.js';
import { dispatchJob } from './services/dispatch.js';
import { planJob } from './services/planner.js';
import { generateId } from './utils/trace-id.js';
import type { AgentStatus } from './models/types.js';

const program = new Command();

program
  .name('humanclaw')
  .description(
    'Carbon-based node orchestration framework - treating humans as distributed worker nodes'
  )
  .version('1.0.0');

// ─── serve ───────────────────────────────────────────────────────────────────

program
  .command('serve')
  .description('Start the HumanClaw server')
  .option('-p, --port <port>', 'Server port', '2026')
  .action(opts => {
    const port = parseInt(opts.port, 10);
    startServer(port);
  });

// ─── agent ───────────────────────────────────────────────────────────────────

const agentCmd = program
  .command('agent')
  .description('Manage carbon-based nodes (HumanAgent)');

agentCmd
  .command('add')
  .description('Register a new carbon-based node')
  .action(async () => {
    const db = getDb();
    initSchema(db);

    p.intro(chalk.bgCyan(' Register New Carbon-Based Node '));

    const name = await p.text({
      message: 'Node alias (name):',
      placeholder: 'e.g. Frontend Lao Li',
      validate: v => (!v ? 'Name is required' : undefined),
    });

    if (p.isCancel(name)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    const capInput = await p.text({
      message: 'Capabilities (comma-separated):',
      placeholder: 'e.g. UI/UX, Frontend Dev, Stress Resistant',
      validate: v => (!v ? 'At least one capability required' : undefined),
    });

    if (p.isCancel(capInput)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    const capabilities = (capInput as string)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const relInput = await p.text({
      message: 'Relationship with you (optional):',
      placeholder: 'e.g. direct report / intern / contractor',
      defaultValue: '',
    });

    if (p.isCancel(relInput)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    const agent = createAgent({
      agent_id: generateId('emp'),
      name: name as string,
      capabilities,
      relationship: (relInput as string) || '',
      status: 'IDLE',
    });

    p.outro(
      `${chalk.green('Node registered!')} ID: ${chalk.bold(agent.agent_id)}`
    );
  });

agentCmd
  .command('list')
  .description('Show fleet status')
  .action(() => {
    const db = getDb();
    initSchema(db);

    const agents = listAgents();
    if (agents.length === 0) {
      console.log(chalk.dim('  No carbon-based nodes registered.'));
      return;
    }

    const statusIcon: Record<AgentStatus, string> = {
      IDLE: '🟢',
      BUSY: '🟡',
      OFFLINE: '🔴',
      OOM: '🟣',
    };

    console.log(chalk.bold('\n  Carbon Compute Pool\n'));

    for (const agent of agents) {
      const icon = statusIcon[agent.status];
      const caps = agent.capabilities.join(', ');
      console.log(
        `  ${icon} ${chalk.bold(agent.name)} (${chalk.dim(agent.agent_id)})`
      );
      console.log(`     Capabilities: ${chalk.cyan(caps)}`);
      console.log(`     Status: ${agent.status}\n`);
    }
  });

// ─── status ──────────────────────────────────────────────────────────────────

program
  .command('status')
  .description('Show active jobs overview')
  .action(() => {
    const db = getDb();
    initSchema(db);

    markOverdueTasks();
    const jobs = listActiveJobs();

    if (jobs.length === 0) {
      console.log(chalk.dim('\n  No active jobs.\n'));
      return;
    }

    console.log(chalk.bold('\n  Async Orchestration Dashboard\n'));

    for (const job of jobs) {
      const resolved = job.tasks.filter(t => t.status === 'RESOLVED').length;
      const total = job.tasks.length;
      const pct = Math.round((resolved / total) * 100);
      const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));

      console.log(`  ${chalk.bold(job.job_id)} - ${job.original_prompt}`);
      console.log(`  Progress: [${bar}] ${resolved}/${total} (${pct}%)`);

      for (const task of job.tasks) {
        const statusColor =
          task.status === 'RESOLVED'
            ? chalk.green
            : task.status === 'OVERDUE'
              ? chalk.red
              : chalk.yellow;
        console.log(
          `    ${statusColor(task.status.padEnd(10))} ${task.trace_id} -> ${chalk.dim(task.assignee_id)}`
        );
        console.log(`                    ${task.todo_description}`);
      }
      console.log();
    }
  });

// ─── plan ───────────────────────────────────────────────────────────────────

program
  .command('plan')
  .description('AI-powered task planning from natural language')
  .argument('[prompt]', 'What you want to get done')
  .option('--agents <ids>', 'Comma-separated agent IDs (default: all IDLE)')
  .option('--dispatch', 'Automatically dispatch after planning')
  .action(async (promptArg?: string, opts?: { agents?: string; dispatch?: boolean }) => {
    const db = getDb();
    initSchema(db);

    p.intro(chalk.bgCyan(' AI 智能规划 '));

    let prompt = promptArg;
    if (!prompt) {
      const input = await p.text({
        message: '输入你的需求:',
        placeholder: '例: 完成首页重构，包括导航栏和内容区的响应式改版',
        validate: v => (!v ? '需求描述不能为空' : undefined),
      });
      if (p.isCancel(input)) {
        p.cancel('已取消');
        process.exit(0);
      }
      prompt = input as string;
    }

    const agentIds = opts?.agents?.split(',').map(s => s.trim()).filter(Boolean);

    const spin = p.spinner();
    spin.start('AI 正在分析需求、匹配节点、生成话术...');

    try {
      const plan = await planJob({ prompt, agent_ids: agentIds }, undefined, db);
      spin.stop('规划完成！');

      console.log(chalk.bold(`\n  需求: ${chalk.white(plan.original_prompt)}\n`));

      for (const task of plan.planned_tasks) {
        console.log(chalk.cyan(`  ┌─ ${chalk.bold(task.assignee_name)} (${chalk.dim(task.assignee_id)})`));
        console.log(chalk.cyan('  │') + `  任务: ${task.todo_description}`);
        console.log(chalk.cyan('  │') + `  话术: ${chalk.italic(task.briefing)}`);
        console.log(chalk.cyan('  │') + `  截止: ${new Date(task.deadline).toLocaleString()}`);
        console.log(chalk.cyan('  └─'));
        console.log();
      }

      if (opts?.dispatch) {
        const tasks = plan.planned_tasks.map(t => ({
          assignee_id: t.assignee_id,
          todo_description: t.todo_description,
          deadline: t.deadline,
        }));
        const job = dispatchJob({
          original_prompt: plan.original_prompt,
          tasks,
        }, db);
        p.outro(`${chalk.green('已分发！')} Job: ${chalk.bold(job.job_id)}`);
      } else {
        const confirm = await p.confirm({
          message: '确认分发这些任务？',
        });
        if (p.isCancel(confirm) || !confirm) {
          p.outro(chalk.dim('已取消分发'));
          process.exit(0);
        }
        const tasks = plan.planned_tasks.map(t => ({
          assignee_id: t.assignee_id,
          todo_description: t.todo_description,
          deadline: t.deadline,
        }));
        const job = dispatchJob({
          original_prompt: plan.original_prompt,
          tasks,
        }, db);
        p.outro(`${chalk.green('已分发！')} Job: ${chalk.bold(job.job_id)}`);
      }
    } catch (error) {
      spin.stop('规划失败');
      const message = error instanceof Error ? error.message : 'Unknown error';
      p.outro(chalk.red(message));
      process.exit(1);
    }
  });

program.parse();
