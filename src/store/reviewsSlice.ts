import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import supabase from '../lib/supabase';
import type {Review} from '../utils/types/review';

const reviewsAdapter = createEntityAdapter<Review>();

export interface ReviewsState extends ReturnType<
  typeof reviewsAdapter.getInitialState
> {
  byRecipe: Record<string, string[]>;
  loading: boolean;
  error?: string | null;
}

const initialState: ReviewsState = {
  ...reviewsAdapter.getInitialState(),
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
        // upsert fetched reviews into entity map
        reviewsAdapter.upsertMany(state, action.payload);
        // record ordering for this recipe
        state.byRecipe[recipeId] = action.payload.map((r) => r.id);
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
        reviewsAdapter.addOne(state, r);
        state.byRecipe[r.recipe_id] = state.byRecipe[r.recipe_id] || [];
        // ensure newest first
        state.byRecipe[r.recipe_id] = [
          r.id,
          ...state.byRecipe[r.recipe_id].filter((i) => i !== r.id),
        ];
      })
      .addCase(addReview.rejected, (state, action) => {
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to add review';
      });
  },
});

// selectors
const reviewsSelectors = reviewsAdapter.getSelectors<{
  reviews: ReviewsState;
}>((state) => state.reviews);

export const selectAllReviews = (state: {reviews: ReviewsState}) =>
  reviewsSelectors.selectAll(state);
export const selectReviewById = (
  state: {reviews: ReviewsState},
  id?: string | null,
) => {
  if (!id) return null as Review | null;
  return reviewsSelectors.selectById(state, id) ?? null;
};

export const selectReviewsByRecipe = (
  state: {reviews: ReviewsState},
  recipeId?: string | null,
) => {
  if (!recipeId) return [] as Review[];
  const ids = state.reviews.byRecipe[recipeId] ?? [];
  return ids
    .map((id) => reviewsSelectors.selectById(state, id))
    .filter(Boolean) as Review[];
};

export default slice.reducer;
