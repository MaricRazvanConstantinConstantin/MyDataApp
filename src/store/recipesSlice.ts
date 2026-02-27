import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import supabase from '../lib/supabase';
import type {Recipe} from '../utils/types/recipe';
import {isRecipe} from '../utils/guards/recipe';
import {getJson, setJson} from '../utils/storage';

const recipesAdapter = createEntityAdapter<Recipe>();

function loadCachedRecipes(): Recipe[] {
  const parsed = getJson<unknown[]>('recipes-cache', []);
  const validated: Recipe[] = [];
  for (const it of parsed) {
    if (isRecipe(it)) validated.push(it);
  }
  return validated;
}

const initialState = recipesAdapter.getInitialState<{
  loading: boolean;
  error: string | null;
}>({
  loading: false,
  error: null,
});

const cached = loadCachedRecipes();
if (cached.length > 0) {
  recipesAdapter.setAll(initialState, cached);
}

type RecipesState = typeof initialState;

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

export const fetchRecipeById = createAsyncThunk<
  Recipe,
  string,
  {rejectValue: string}
>('recipes/fetchById', async (id, {rejectWithValue}) => {
  const {data, error} = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return rejectWithValue(error.message ?? 'Failed to fetch recipe');
  const item = data;
  if (!isRecipe(item)) return rejectWithValue('Invalid recipe from server');
  return item;
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
  const item = data;
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
  const item = data;
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
          recipesAdapter.setAll(state, action.payload);
          setJson('recipes-cache', action.payload);
        },
      )
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to load';
      })

      .addCase(fetchRecipeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRecipeById.fulfilled,
        (state, action: PayloadAction<Recipe>) => {
          state.loading = false;
          recipesAdapter.upsertOne(state, action.payload);
          // update cache
          const cached = state.ids.reduce<Recipe[]>((acc, id) => {
            const ent = state.entities[id];
            if (ent) acc.push(ent);
            return acc;
          }, []);
          setJson('recipes-cache', cached);
        },
      )
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to fetch recipe';
      })

      .addCase(addRecipe.fulfilled, (state, action: PayloadAction<Recipe>) => {
        recipesAdapter.addOne(state, action.payload);
        state.ids = [
          action.payload.id,
          ...state.ids.filter((i) => i !== action.payload.id),
        ];
        const cached = state.ids.reduce<Recipe[]>((acc, id) => {
          const ent = state.entities[id];
          if (ent) acc.push(ent);
          return acc;
        }, []);
        setJson('recipes-cache', cached);
      })
      .addCase(addRecipe.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Add failed';
      })

      .addCase(
        updateRecipe.fulfilled,
        (state, action: PayloadAction<Recipe>) => {
          recipesAdapter.upsertOne(state, action.payload);
          const cached = state.ids.reduce<Recipe[]>((acc, id) => {
            const ent = state.entities[id];
            if (ent) acc.push(ent);
            return acc;
          }, []);
          setJson('recipes-cache', cached);
        },
      )
      .addCase(updateRecipe.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Update failed';
      })

      .addCase(
        deleteRecipe.fulfilled,
        (state, action: PayloadAction<string>) => {
          recipesAdapter.removeOne(state, action.payload);
          const cached = state.ids.reduce<Recipe[]>((acc, id) => {
            const ent = state.entities[id];
            if (ent) acc.push(ent);
            return acc;
          }, []);
          setJson('recipes-cache', cached);
        },
      )
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Delete failed';
      });
  },
});

const recipesSelectors = recipesAdapter.getSelectors<{
  recipes: RecipesState;
}>((state) => state.recipes);

export const selectAllRecipes = (state: {recipes: RecipesState}) =>
  recipesSelectors.selectAll(state);
export const selectRecipeById = (
  state: {recipes: RecipesState},
  id: string | undefined | null,
) => {
  if (!id) return null as Recipe | null;
  return recipesSelectors.selectById(state, id) ?? null;
};

export default slice.reducer;
