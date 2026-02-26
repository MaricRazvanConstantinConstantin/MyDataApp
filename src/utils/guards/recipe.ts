import type {Recipe} from '../types/recipe';
import {isIngredients} from './ingredients';
import {isSteps} from './steps';
import {isStringArray} from './stringArray';

export function isRecipe(obj: unknown): obj is Recipe {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.id !== 'string') return false;
  if (typeof o.title !== 'string') return false;
  if (
    o.description !== undefined &&
    o.description !== null &&
    typeof o.description !== 'string'
  )
    return false;
  if (!isIngredients(o.ingredients)) return false;
  if (!isSteps(o.steps)) return false;
  if (
    o.category !== undefined &&
    o.category !== null &&
    typeof o.category !== 'string'
  )
    return false;
  if (
    o.prep_time !== undefined &&
    o.prep_time !== null &&
    typeof o.prep_time !== 'number'
  )
    return false;
  if (
    o.cook_time !== undefined &&
    o.cook_time !== null &&
    typeof o.cook_time !== 'number'
  )
    return false;
  if (
    o.servings !== undefined &&
    o.servings !== null &&
    typeof o.servings !== 'number'
  )
    return false;
  if (!isStringArray(o.tags)) return false;
  if (
    o.image_url !== undefined &&
    o.image_url !== null &&
    typeof o.image_url !== 'string'
  )
    return false;
  if (typeof o.created_at !== 'string') return false;
  if (typeof o.updated_at !== 'string') return false;
  return true;
}
