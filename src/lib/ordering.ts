/**
 * Fractional-indexing helpers so drag-and-drop reorder only ever rewrites the
 * moved row, never its siblings.
 */

const GAP = 1024

export function firstOrder(): number {
  return GAP
}

export function orderAfterAll(existing: { sortOrder: number }[]): number {
  if (existing.length === 0) return GAP
  return Math.max(...existing.map((e) => e.sortOrder)) + GAP
}

/** Order value to place an item between `before` and `after` (either may be undefined for list ends). */
export function orderBetween(before: number | undefined, after: number | undefined): number {
  if (before === undefined && after === undefined) return GAP
  if (before === undefined) return after! / 2
  if (after === undefined) return before + GAP
  return before + (after - before) / 2
}

/** True once the gap between two neighbors has collapsed and a rebalance is needed. */
export function needsRebalance(before: number | undefined, after: number | undefined): boolean {
  if (before === undefined || after === undefined) return false
  return after - before < 0.001
}

export function rebalance<T>(items: T[]): (T & { sortOrder: number })[] {
  return items.map((item, i) => ({ ...item, sortOrder: (i + 1) * GAP }))
}
