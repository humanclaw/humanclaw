import { Router } from 'express';
import { reviewJob } from '../services/reviewer.js';

const router = Router();

// POST /api/v1/jobs/:job_id/review - AI review of all deliverables
router.post('/:job_id/review', async (req, res) => {
  const { job_id } = req.params;

  try {
    const result = await reviewJob(job_id);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('API Key') || message.includes('API key') ? 503 : 400;
    res.status(status).json({ error: message });
  }
});

export default router;
