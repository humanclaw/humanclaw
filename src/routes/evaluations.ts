import { Router } from 'express';
import { generateEvaluations, getPerformanceDashboard } from '../services/evaluator.js';
import { listEvaluationsByJob, listEvaluationsByAgent } from '../models/evaluation.js';
import type { RatingSystem } from '../models/types.js';

const router = Router();

// POST /api/v1/evaluations/generate - Generate performance evaluations for a job
router.post('/generate', async (req, res) => {
  const { job_id, rating_system, task_weights } = req.body as {
    job_id?: string;
    rating_system?: string;
    task_weights?: Record<string, number>;
  };

  if (!job_id || typeof job_id !== 'string') {
    res.status(400).json({ error: 'job_id is required' });
    return;
  }

  const validSystems: RatingSystem[] = ['ali', 'letter', 'em'];
  if (!rating_system || !validSystems.includes(rating_system as RatingSystem)) {
    res.status(400).json({
      error: `rating_system is required. Must be one of: ${validSystems.join(', ')}`,
    });
    return;
  }

  try {
    const result = await generateEvaluations({
      job_id,
      rating_system: rating_system as RatingSystem,
      task_weights,
    });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('API Key') || message.includes('API key') ? 503 : 400;
    res.status(status).json({ error: message });
  }
});

// GET /api/v1/evaluations/job/:job_id - Get evaluations for a job
router.get('/job/:job_id', (req, res) => {
  const evaluations = listEvaluationsByJob(req.params.job_id);
  res.json({ evaluations });
});

// GET /api/v1/evaluations/agent/:agent_id - Get evaluation history for an agent
router.get('/agent/:agent_id', (req, res) => {
  const evaluations = listEvaluationsByAgent(req.params.agent_id);
  res.json({ evaluations });
});

// GET /api/v1/evaluations/dashboard - Performance dashboard
router.get('/dashboard', (req, res) => {
  const agentId = req.query.agent_id as string | undefined;
  const dashboard = getPerformanceDashboard(agentId);
  res.json(dashboard);
});

export default router;
