import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
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

const messagesAdapter = createEntityAdapter<Message>();

interface MessagesState extends ReturnType<
  typeof messagesAdapter.getInitialState
> {
  loading: boolean;
  error?: string | null;
}

const initialState: MessagesState = {
  ...messagesAdapter.getInitialState(),
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
          messagesAdapter.setAll(state, action.payload);
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
          messagesAdapter.addOne(state, action.payload);
          // keep newest first ordering
          state.ids = [
            action.payload.id,
            ...state.ids.filter((i) => i !== action.payload.id),
          ];
        },
      )
      .addCase(addMessage.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Add failed';
      })

      .addCase(
        deleteMessage.fulfilled,
        (state, action: PayloadAction<string>) => {
          messagesAdapter.removeOne(state, action.payload);
        },
      )
      .addCase(deleteMessage.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Delete failed';
      });
  },
});

// selectors
const messagesSelectors = messagesAdapter.getSelectors<{
  messages: MessagesState;
}>((state) => state.messages);

export const selectAllMessages = (state: RootState) =>
  messagesSelectors.selectAll(state);
export const selectMessageById = (state: RootState, id?: string | null) => {
  if (!id) return null;
  return messagesSelectors.selectById(state, id) ?? null;
};

export default slice.reducer;
