import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

let db: Database.Database | null = null;

const DEFAULT_DB_PATH = path.join(
  process.env.HUMANCLAW_DATA_DIR ?? process.cwd(),
  'humanclaw.db'
);

export function getDb(dbPath?: string): Database.Database {
  if (db) return db;

  const resolvedPath = dbPath ?? DEFAULT_DB_PATH;
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

export function createInMemoryDb(): Database.Database {
  const memDb = new Database(':memory:');
  memDb.pragma('foreign_keys = ON');
  return memDb;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function setDb(newDb: Database.Database): void {
  db = newDb;
}
