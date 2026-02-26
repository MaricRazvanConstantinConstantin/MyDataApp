import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import supabase from '../lib/supabase';
import type {RootState} from './index';

export type Message = {
  id: string;
  title: string;
  email: string;
  message: string;
  is_read?: boolean;
  created_at: string;
};

interface MessagesState {
  list: Message[];
  loading: boolean;
  error?: string | null;
}

const initialState: MessagesState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchMessages = createAsyncThunk<
  Message[],
  void,
  {rejectValue: string}
>('messages/fetch', async (_, {rejectWithValue}) => {
  const res = await supabase
    .from('messages')
    .select('*')
    .order('created_at', {ascending: false});
  if (res.error)
    return rejectWithValue(res.error.message ?? 'Failed to fetch messages');
  return (res.data ?? []) as Message[];
});

export const addMessage = createAsyncThunk<
  Message,
  {title: string; email: string; message: string},
  {rejectValue: string}
>('messages/add', async (payload, {rejectWithValue}) => {
  const {data, error} = await supabase
    .from('messages')
    .insert([payload])
    .select()
    .single();
  if (error) return rejectWithValue(error.message ?? 'Failed to add message');
  return data as Message;
});

export const deleteMessage = createAsyncThunk<
  string,
  string,
  {rejectValue: string}
>('messages/delete', async (id, {rejectWithValue}) => {
  const {error} = await supabase.from('messages').delete().eq('id', id);
  if (error)
    return rejectWithValue(error.message ?? 'Failed to delete message');
  return id;
});

const slice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMessages.fulfilled,
        (state, action: PayloadAction<Message[]>) => {
          state.loading = false;
          state.list = action.payload;
        },
      )
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Failed to load messages';
      })

      .addCase(
        addMessage.fulfilled,
        (state, action: PayloadAction<Message>) => {
          state.list.unshift(action.payload);
        },
      )
      .addCase(addMessage.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Add failed';
      })

      .addCase(
        deleteMessage.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.list = state.list.filter((m) => m.id !== action.payload);
        },
      )
      .addCase(deleteMessage.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Delete failed';
      });
  },
});

export const selectMessages = (s: RootState) => s.messages;

export default slice.reducer;
