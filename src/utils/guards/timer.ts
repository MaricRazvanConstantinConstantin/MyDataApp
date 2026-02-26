export function isTimer(obj: unknown): obj is import('../types/timer').Timer {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.id !== 'string') return false;
  const dur = o.duration;
  const rem = o.remaining;
  if (
    !(
      typeof dur === 'number' ||
      (typeof dur === 'string' && !Number.isNaN(Number(dur)))
    )
  )
    return false;
  if (
    !(
      typeof rem === 'number' ||
      (typeof rem === 'string' && !Number.isNaN(Number(rem)))
    )
  )
    return false;
  if (typeof o.createdAt !== 'string') return false;
  if (o.running !== undefined && typeof o.running !== 'boolean') return false;
  return true;
}
