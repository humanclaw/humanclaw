import { nanoid } from 'nanoid';

export function generateTraceId(): string {
  return `TK-${nanoid(8)}`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${nanoid(8)}`;
}
