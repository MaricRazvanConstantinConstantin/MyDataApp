import type {Ingredient} from './ingredient';

export interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  ingredients: Ingredient[];
  steps: (string | {step: string; note?: string})[];
  category?: string | null;
  prep_time?: number | null;
  cook_time?: number | null;
  servings?: number | null;
  tags: string[];
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}
