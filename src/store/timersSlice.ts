import {createSlice, nanoid, type PayloadAction} from '@reduxjs/toolkit';
import {getJson, setJson} from '../utils/storage';
import type {Timer} from '../utils/types/timer';
import {isTimer} from '../utils/guards/timer';

type TimersState = {
  items: Timer[];
};

function loadCachedTimers(): Timer[] {
  const parsed = getJson<unknown[]>('timers', []);
  const out: Timer[] = [];
  for (const it of parsed) {
    if (isTimer(it)) {
      const duration = Math.max(0, Math.floor(Number(it.duration)));
      const remaining = Math.max(0, Math.floor(Number(it.remaining)));
      out.push({
        id: it.id,
        recipeId: it.recipeId ?? null,
        stepIndex: it.stepIndex ?? null,
        label: it.label ?? undefined,
        duration,
        remaining,
        running: !!it.running,
        createdAt: it.createdAt,
        endsAt: it.endsAt ?? null,
      });
    }
  }
  return out;
}

const initialState: TimersState = {items: loadCachedTimers()};

const slice = createSlice({
  name: 'timers',
  initialState,
  reducers: {
    addTimer: {
      reducer(state, action: PayloadAction<Timer>) {
        state.items.push(action.payload);
        try {
          setJson('timers', state.items);
        } catch (err) {
          console.warn('Failed to persist timers', err);
        }
      },
      prepare(payload: {
        duration: number;
        recipeId?: string | number | null;
        stepIndex?: number | null;
        label?: string;
      }) {
        const id = nanoid();
        const now = new Date().toISOString();
        const duration = Math.max(0, Math.floor(payload.duration));
        return {
          payload: {
            id,
            recipeId: payload.recipeId ?? null,
            stepIndex: payload.stepIndex ?? null,
            label: payload.label ?? undefined,
            duration,
            remaining: duration,
            running: false,
            createdAt: now,
            endsAt: null,
          } as Timer,
        };
      },
    },
    removeTimer(state, action: PayloadAction<{id: string}>) {
      state.items = state.items.filter((t) => t.id !== action.payload.id);
      try {
        setJson('timers', state.items);
      } catch (err) {
        console.warn('Failed to persist timers', err);
      }
    },
    startTimer(state, action: PayloadAction<{id: string}>) {
      const t = state.items.find((x) => x.id === action.payload.id);
      if (!t) return;
      if (!t.running && t.remaining > 0) {
        t.running = true;
        t.endsAt = new Date(Date.now() + t.remaining * 1000).toISOString();
        try {
          setJson('timers', state.items);
        } catch (err) {
          console.warn('Failed to persist timers', err);
        }
      }
    },
    pauseTimer(state, action: PayloadAction<{id: string}>) {
      const t = state.items.find((x) => x.id === action.payload.id);
      if (!t) return;
      t.running = false;
      t.endsAt = null;
      try {
        setJson('timers', state.items);
      } catch (err) {
        console.warn('Failed to persist timers', err);
      }
    },
    resetTimer(state, action: PayloadAction<{id: string}>) {
      const t = state.items.find((x) => x.id === action.payload.id);
      if (!t) return;
      t.remaining = t.duration;
      t.running = false;
      t.endsAt = null;
      try {
        setJson('timers', state.items);
      } catch (err) {
        console.warn('Failed to persist timers', err);
      }
    },
    tick(state, action: PayloadAction<{now?: string}>) {
      const now = action.payload.now
        ? new Date(action.payload.now).getTime()
        : Date.now();
      state.items.forEach((t) => {
        if (!t.running) return;
        if (t.endsAt) {
          const ends = new Date(t.endsAt).getTime();
          const rem = Math.max(0, Math.ceil((ends - now) / 1000));
          t.remaining = rem;
          if (rem <= 0) {
            t.running = false;
            t.endsAt = null;
            t.remaining = 0;
          }
        } else {
          t.remaining = Math.max(0, t.remaining - 1);
          if (t.remaining <= 0) {
            t.running = false;
          }
        }
      });
      try {
        setJson('timers', state.items);
      } catch (err) {
        console.warn('Failed to persist timers', err);
      }
    },
    setRemaining(
      state,
      action: PayloadAction<{id: string; remaining: number}>,
    ) {
      const t = state.items.find((x) => x.id === action.payload.id);
      if (!t) return;
      t.remaining = Math.max(0, Math.floor(action.payload.remaining));
      if (t.running) {
        t.endsAt = new Date(Date.now() + t.remaining * 1000).toISOString();
      }
      try {
        setJson('timers', state.items);
      } catch (err) {
        console.warn('Failed to persist timers', err);
      }
    },
  },
});

export const {
  addTimer,
  removeTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  tick,
  setRemaining,
} = slice.actions;

export default slice.reducer;
