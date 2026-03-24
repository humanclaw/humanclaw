import { nanoid } from 'nanoid';

export function generateTraceId(): string {
  const num = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `TK-${num}`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${nanoid(8)}`;
}
