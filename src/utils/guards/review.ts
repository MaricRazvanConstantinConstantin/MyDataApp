export function isReview(obj: unknown): obj is import('../types/review').Review {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.id !== 'string') return false;
  if (typeof o.recipe_id !== 'string') return false;
  if (
    o.author !== undefined &&
    o.author !== null &&
    typeof o.author !== 'string'
  )
    return false;
  if (typeof o.rating !== 'number') return false;
  if (
    o.content !== undefined &&
    o.content !== null &&
    typeof o.content !== 'string'
  )
    return false;
  if (typeof o.created_at !== 'string') return false;
  return true;
}
