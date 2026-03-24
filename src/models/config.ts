import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';

export function getConfig(key: string, db?: Database.Database): string | undefined {
  const conn = db ?? getDb();
  const row = conn.prepare('SELECT value FROM config WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value;
}

export function setConfig(key: string, value: string, db?: Database.Database): void {
  const conn = db ?? getDb();
  conn.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value);
}

export function deleteConfig(key: string, db?: Database.Database): void {
  const conn = db ?? getDb();
  conn.prepare('DELETE FROM config WHERE key = ?').run(key);
}

export function getAllConfig(db?: Database.Database): Record<string, string> {
  const conn = db ?? getDb();
  const rows = conn.prepare('SELECT key, value FROM config').all() as Array<{ key: string; value: string }>;
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}
