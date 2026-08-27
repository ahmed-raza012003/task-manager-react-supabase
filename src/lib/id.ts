import { nanoid } from 'nanoid'

export function createId(): string {
  return nanoid(12)
}

export function nowIso(): string {
  return new Date().toISOString()
}
