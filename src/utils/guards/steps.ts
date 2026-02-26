export function isStep(
  s: unknown,
): s is string | {step: string; note?: string} {
  if (typeof s === 'string') return true;
  if (!s || typeof s !== 'object') return false;
  const o = s as Record<string, unknown>;
  if (typeof o.step !== 'string') return false;
  if (o.note !== undefined && o.note !== null && typeof o.note !== 'string')
    return false;
  return true;
}

export function isSteps(
  arr: unknown,
): arr is (string | {step: string; note?: string})[] {
  return Array.isArray(arr) && arr.every((s) => isStep(s));
}
