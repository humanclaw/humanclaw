import { Router } from 'express';
import { reviewJob } from '../services/reviewer.js';

const router = Router();

// POST /api/v1/jobs/:job_id/review - AI review of all deliverables
router.post('/:job_id/review', async (req, res) => {
  const { job_id } = req.params;
  const { rating_system, task_weights } = req.body as {
    rating_system?: string;
    task_weights?: Record<string, number>;
  };

  const validSystems = ['ali', 'letter', 'em'];
  const ratingSystem = rating_system && validSystems.includes(rating_system)
    ? (rating_system as 'ali' | 'letter' | 'em')
    : undefined;

  try {
    const result = await reviewJob(job_id, undefined, undefined, ratingSystem, task_weights);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('API Key') || message.includes('API key') ? 503 : 400;
    res.status(status).json({ error: message });
  }
});

export default router;
