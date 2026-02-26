export type Timer = {
  id: string;
  recipeId?: string | number | null;
  stepIndex?: number | null;
  label?: string;
  duration: number;
  remaining: number;
  running: boolean;
  createdAt: string;
  endsAt?: string | null;
};
