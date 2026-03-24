import { Router } from 'express';
import { resumeTask, rejectTask } from '../services/resume.js';
import { simulateDelivery } from '../services/simulator.js';

const router = Router();

// POST /api/v1/tasks/resume - Submit result for a task
router.post('/resume', (req, res) => {
  const { trace_id, result_data } = req.body;

  if (!trace_id) {
    res.status(400).json({ error: 'trace_id is required' });
    return;
  }

  if (result_data === undefined) {
    res.status(400).json({ error: 'result_data is required' });
    return;
  }

  try {
    const result = resumeTask(trace_id, result_data);
    res.json({
      task: result.task,
      job_complete: result.jobComplete,
      job: result.job ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// POST /api/v1/tasks/reject - Reject and retry a task
router.post('/reject', (req, res) => {
  const { trace_id, new_deadline } = req.body;

  if (!trace_id) {
    res.status(400).json({ error: 'trace_id is required' });
    return;
  }

  try {
    const task = rejectTask(trace_id, new_deadline);
    res.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// POST /api/v1/tasks/simulate - AI simulate delivery from agent's perspective
router.post('/simulate', async (req, res) => {
  const { trace_id } = req.body;

  if (!trace_id) {
    res.status(400).json({ error: 'trace_id is required' });
    return;
  }

  try {
    const result = await simulateDelivery(trace_id);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('API Key') || message.includes('API key') ? 503 : 400;
    res.status(status).json({ error: message });
  }
});

export default router;
