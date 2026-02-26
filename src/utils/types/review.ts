export type Review = {
  id: string;
  recipe_id: string;
  author?: string | null;
  rating: number;
  content?: string | null;
  created_at: string;
};
