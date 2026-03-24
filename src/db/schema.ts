import type Database from 'better-sqlite3';

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id     TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      capabilities TEXT NOT NULL DEFAULT '[]',
      relationship TEXT NOT NULL DEFAULT '',
      status       TEXT NOT NULL DEFAULT 'IDLE'
                   CHECK (status IN ('IDLE', 'BUSY', 'OFFLINE', 'OOM')),
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      job_id           TEXT PRIMARY KEY,
      original_prompt  TEXT NOT NULL,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      trace_id         TEXT PRIMARY KEY,
      job_id           TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
      assignee_id      TEXT NOT NULL REFERENCES agents(agent_id),
      todo_description TEXT NOT NULL,
      deadline         TEXT NOT NULL,
      payload          TEXT NOT NULL DEFAULT '{}',
      status           TEXT NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING', 'DISPATCHED', 'RESOLVED', 'OVERDUE')),
      result_data      TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON tasks(job_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Migration: add relationship column to existing agents table
  const cols = db.prepare("PRAGMA table_info(agents)").all() as Array<{ name: string }>;
  if (!cols.some(c => c.name === 'relationship')) {
    db.exec(`ALTER TABLE agents ADD COLUMN relationship TEXT NOT NULL DEFAULT ''`);
  }
}
