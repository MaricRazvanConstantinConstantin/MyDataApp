import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import supabase from '../lib/supabase';
import type {Review} from '../utils/types/review';

export interface ReviewsState {
  byRecipe: Record<string, Review[]>;
  loading: boolean;
  error?: string | null;
}

const initialState: ReviewsState = {
  byRecipe: {},
  loading: false,
  error: null,
};

export const fetchReviews = createAsyncThunk<
  Review[],
  string,
  {rejectValue: string}
>('reviews/fetch', async (recipeId, {rejectWithValue}) => {
  const {data, error} = await supabase
    .from('reviews')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', {ascending: false});
  if (error) return rejectWithValue(error.message ?? 'Failed to fetch reviews');
  return (data ?? []) as Review[];
});

export const addReview = createAsyncThunk<
  Review,
  {recipeId: string; author?: string; rating: number; content?: string},
  {rejectValue: string}
>('reviews/add', async (payload, {rejectWithValue}) => {
  const row = {
    recipe_id: payload.recipeId,
    author: payload.author ?? null,
    rating: payload.rating,
    content: payload.content ?? null,
  };
  const {data, error} = await supabase
    .from('reviews')
    .insert([row])
    .select()
    .single();
  if (error) return rejectWithValue(error.message ?? 'Failed to add review');
  return data as Review;
});

const slice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        const recipeId = action.meta.arg;
        state.byRecipe[recipeId] = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to fetch reviews';
      })

      .addCase(addReview.fulfilled, (state, action: PayloadAction<Review>) => {
        const r = action.payload;
        state.byRecipe[r.recipe_id] = state.byRecipe[r.recipe_id] || [];
        state.byRecipe[r.recipe_id].unshift(r);
      })
      .addCase(addReview.rejected, (state, action) => {
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to add review';
      });
  },
});

export default slice.reducer;
