import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import supabase from '../lib/supabase';
import type {User} from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  status: 'idle' | 'loading' | 'error';
  error?: string | null;
}

const initialState: AuthState = {
  user: null,
  isAdmin: false,
  status: 'idle',
  error: null,
};

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    {email, password}: {email: string; password: string},
    {rejectWithValue},
  ) => {
    const res = await supabase.auth.signInWithPassword({email, password});
    if (res.error) return rejectWithValue(res.error.message);

    const {data: userData} = await supabase.auth.getUser();
    const user = userData?.user ?? null;
    if (!user) return rejectWithValue('No user returned from Supabase');

    const {data: profile, error: profileErr} = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr) {
      return {user, isAdmin: false};
    }

    return {user, isAdmin: profile?.role === 'admin'};
  },
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await supabase.auth.signOut();
});

export const restoreSession = createAsyncThunk('auth/restore', async () => {
  const {data} = await supabase.auth.getSession();
  const session = data?.session ?? null;
  if (!session) return {user: null as User | null, isAdmin: false};
  const user = session.user as User;
  const {data: profile, error: profileErr} = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileErr) return {user, isAdmin: false};
  return {user, isAdmin: profile?.role === 'admin'};
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(
      state,
      action: PayloadAction<{user: User | null; isAdmin: boolean}>,
    ) {
      state.user = action.payload.user;
      state.isAdmin = action.payload.isAdmin;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user;
        state.isAdmin = action.payload.isAdmin;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'error';
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Sign in failed';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isAdmin = false;
        state.status = 'idle';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAdmin = action.payload.isAdmin;
      });
  },
});

export const {clearError, setUser} = slice.actions;

export default slice.reducer;
