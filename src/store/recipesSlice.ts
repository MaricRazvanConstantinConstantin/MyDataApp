import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import supabase from '../lib/supabase';
import type {Recipe} from '../utils/types/recipe';
import {isRecipe} from '../utils/guards/recipe';
import {getJson, setJson} from '../utils/storage';

interface RecipesState {
  list: Recipe[];
  loading: boolean;
  error?: string | null;
}

function loadCachedRecipes(): Recipe[] {
  const parsed = getJson<unknown[]>('recipes-cache', []);
  const validated: Recipe[] = [];
  for (const it of parsed) {
    if (isRecipe(it)) validated.push(it);
  }
  return validated;
}

const initialState: RecipesState = {
  list: loadCachedRecipes(),
  loading: false,
  error: null,
};

export const fetchRecipes = createAsyncThunk<
  Recipe[],
  void,
  {rejectValue: string}
>('recipes/fetch', async (_, {rejectWithValue}) => {
  const {data, error} = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', {ascending: false});
  if (error) return rejectWithValue(error.message ?? 'Failed to fetch recipes');
  const items = data ?? [];
  const validated: Recipe[] = [];
  for (const it of items) {
    if (isRecipe(it)) validated.push(it);
    else console.warn('Invalid recipe from backend skipped:', it);
  }
  return validated;
});

export const addRecipe = createAsyncThunk<
  Recipe,
  Partial<Recipe>,
  {rejectValue: string}
>('recipes/add', async (payload, {rejectWithValue}) => {
  const {data, error} = await supabase
    .from('recipes')
    .insert([payload])
    .select()
    .single();
  if (error) return rejectWithValue(error.message ?? 'Failed to add recipe');
  const item = data as unknown;
  if (!isRecipe(item))
    return rejectWithValue('Invalid recipe returned from server');
  return item;
});

export const updateRecipe = createAsyncThunk<
  Recipe,
  {id: string; changes: Partial<Recipe>},
  {rejectValue: string}
>('recipes/update', async ({id, changes}, {rejectWithValue}) => {
  const {data, error} = await supabase
    .from('recipes')
    .update(changes)
    .eq('id', id)
    .select()
    .single();
  if (error) return rejectWithValue(error.message ?? 'Failed to update recipe');
  const item = data as unknown;
  if (!isRecipe(item))
    return rejectWithValue('Invalid recipe returned from server');
  return item;
});

export const deleteRecipe = createAsyncThunk<
  string,
  string,
  {rejectValue: string}
>('recipes/delete', async (id, {rejectWithValue}) => {
  const {error} = await supabase.from('recipes').delete().eq('id', id);
  if (error) return rejectWithValue(error.message ?? 'Failed to delete recipe');
  return id;
});

const slice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRecipes.fulfilled,
        (state, action: PayloadAction<Recipe[]>) => {
          state.loading = false;
          state.list = action.payload;
          setJson('recipes-cache', state.list);
        },
      )
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to load';
      })

      .addCase(addRecipe.fulfilled, (state, action: PayloadAction<Recipe>) => {
        state.list.unshift(action.payload);
        setJson('recipes-cache', state.list);
      })
      .addCase(addRecipe.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Add failed';
      })

      .addCase(
        updateRecipe.fulfilled,
        (state, action: PayloadAction<Recipe>) => {
          const idx = state.list.findIndex((r) => r.id === action.payload.id);
          if (idx >= 0) state.list[idx] = action.payload;
          setJson('recipes-cache', state.list);
        },
      )
      .addCase(updateRecipe.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Update failed';
      })

      .addCase(
        deleteRecipe.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.list = state.list.filter((r) => r.id !== action.payload);
          setJson('recipes-cache', state.list);
        },
      )
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Delete failed';
      });
  },
});

export default slice.reducer;
