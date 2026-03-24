import { Router } from 'express';
import { dispatchJob } from '../services/dispatch.js';
import { planJob } from '../services/planner.js';
import { listActiveJobs, getJobWithTasks } from '../models/job.js';
import { markOverdueTasks } from '../models/task.js';
import type { CreateJobRequest, PlanRequest } from '../models/types.js';

const router = Router();

// POST /api/v1/jobs/create - Create and dispatch a new job
router.post('/create', (req, res) => {
  const body = req.body as CreateJobRequest;

  if (!body.original_prompt || !Array.isArray(body.tasks) || body.tasks.length === 0) {
    res.status(400).json({
      error: 'original_prompt and non-empty tasks[] are required',
    });
    return;
  }

  for (const task of body.tasks) {
    if (!task.assignee_id || !task.todo_description || !task.deadline) {
      res.status(400).json({
        error: 'Each task requires assignee_id, todo_description, and deadline',
      });
      return;
    }
  }

  try {
    const job = dispatchJob(body);
    res.status(201).json(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// GET /api/v1/jobs/active - List active jobs for kanban
router.get('/active', (_req, res) => {
  // Mark overdue tasks before returning
  markOverdueTasks();
  const jobs = listActiveJobs();
  res.json({ jobs });
});

// POST /api/v1/jobs/plan - AI-powered task planning (does NOT dispatch)
router.post('/plan', async (req, res) => {
  const body = req.body as PlanRequest;

  if (!body.prompt || typeof body.prompt !== 'string') {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  try {
    const plan = await planJob(body);
    res.json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('API Key') || message.includes('API key') ? 503 : 400;
    res.status(status).json({ error: message });
  }
});

// GET /api/v1/jobs/:job_id - Get a single job with tasks
router.get('/:job_id', (req, res) => {
  const { job_id } = req.params;
  const job = getJobWithTasks(job_id);
  if (!job) {
    res.status(404).json({ error: `Job not found: ${job_id}` });
    return;
  }
  res.json(job);
});

export default router;
