import express from 'express';
import cors from 'cors';
import { getDb } from './db/connection.js';
import { initSchema } from './db/schema.js';
import nodesRouter from './routes/nodes.js';
import jobsRouter from './routes/jobs.js';
import tasksRouter from './routes/tasks.js';
import syncRouter from './routes/sync.js';
import configRouter from './routes/config.js';
import { getDashboardHtml } from './dashboard.js';

export function createServer(port = 2026) {
  // Initialize database
  const db = getDb();
  initSchema(db);

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.use('/api/v1/nodes', nodesRouter);
  app.use('/api/v1/jobs', jobsRouter);
  app.use('/api/v1/tasks', tasksRouter);
  app.use('/api/v1/jobs', syncRouter);
  app.use('/api/v1/config', configRouter);

  // Serve dashboard as inline HTML (no build step needed)
  const dashboardHtml = getDashboardHtml();
  app.get('/', (_req, res) => {
    res.type('html').send(dashboardHtml);
  });

  // Error handler
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error('Server error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  );

  return { app, port };
}

export function startServer(port = 2026) {
  const { app } = createServer(port);

  app.listen(port, () => {
    console.log(`\n  HumanClaw server running at http://localhost:${port}`);
    console.log(`  Dashboard:  http://localhost:${port}`);
    console.log(`  API base:   http://localhost:${port}/api/v1\n`);
  });
}
