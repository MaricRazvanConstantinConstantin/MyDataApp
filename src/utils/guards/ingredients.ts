import type {Ingredient} from '../types/ingredient';

export function isIngredient(obj: unknown): obj is Ingredient {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.name !== 'string') return false;
  if (
    o.quantity !== undefined &&
    o.quantity !== null &&
    typeof o.quantity !== 'string'
  )
    return false;
  if (o.notes !== undefined && o.notes !== null && typeof o.notes !== 'string')
    return false;
  return true;
}

export function isIngredients(arr: unknown): arr is Ingredient[] {
  return Array.isArray(arr) && arr.every((i) => isIngredient(i));
}
