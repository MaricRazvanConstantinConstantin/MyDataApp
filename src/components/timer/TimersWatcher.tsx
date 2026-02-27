import {useEffect, useRef, useState, useCallback} from 'react';
import {createPortal} from 'react-dom';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  tick,
  setRemaining,
  startTimer,
  removeTimer,
} from '../../store/timersSlice';
import {getJson, setJson} from '../../utils/storage';
import type {Timer} from '../../utils/types/timer';

export default function TimersWatcher() {
  const dispatch = useAppDispatch();
  const timers = useAppSelector((s) => s.timers.items as Timer[]);
  const alertedRef = useRef<Record<string, boolean>>({});
  const timersRef = useRef<Timer[]>([]);
  const scheduledRef = useRef<Record<string, number>>({});
  const [modalTimer, setModalTimer] = useState<Timer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    try {
      const a = new Audio('/sounds/timer.mp3');
      a.preload = 'auto';
      a.load();
      audioRef.current = a;
    } catch (err) {
      audioRef.current = null;
      console.warn('Failed to load timer sound', err);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      dispatch(tick({now: new Date().toISOString()}));
    }, 1000);
    return () => window.clearInterval(id);
  }, [dispatch]);

  const startAlertPlayback = useCallback(() => {
    if (playingRef.current) return;
    const a = audioRef.current;
    if (!a) {
      console.warn('No audio file loaded to play for timer');
      return;
    }
    try {
      a.loop = true;
      a.currentTime = 0;
      void a
        .play()
        .then(() => {
          playingRef.current = true;
        })
        .catch((err) => {
          console.warn('Audio play failed', err);
        });
    } catch (err) {
      console.warn('Audio play failed', err);
    }
  }, []);

  const stopAlertPlayback = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
        a.loop = false;
        a.currentTime = 0;
      } catch (err) {
        console.warn('Stopping audio failed', err);
      }
    }
    playingRef.current = false;
  }, []);

  useEffect(() => {
    timersRef.current = timers;

    for (const t of timers) {
      if (t.remaining <= 0 && !alertedRef.current[t.id]) {
        alertedRef.current[t.id] = true;

        const tid = window.setTimeout(() => {
          const latest = timersRef.current.find((x) => x.id === t.id);
          if (!latest || latest.remaining > 0) {
            delete scheduledRef.current[t.id];
            alertedRef.current[t.id] = false;
            return;
          }
          setModalTimer(latest);
          startAlertPlayback();
          delete scheduledRef.current[t.id];
        }, 1000);
        scheduledRef.current[t.id] = tid as unknown as number;
        break;
      }
    }
  }, [timers, startAlertPlayback]);

  useEffect(() => {
    const scheduled = {...scheduledRef.current};
    return () => {
      try {
        for (const v of Object.values(scheduled)) {
          if (typeof v === 'number') window.clearTimeout(v);
        }
      } catch (err) {
        console.warn('Failed to clear scheduled timer alerts on unmount', err);
      }
    };
  }, []);

  const markStepChecked = useCallback((t: Timer | null) => {
    if (!t) return;
    if (t.recipeId == null) return;
    const idx = typeof t.stepIndex === 'number' ? t.stepIndex : -1;
    if (idx < 0) return;
    try {
      const rid = String(t.recipeId);
      const key = `recipe-checks-${rid}`;
      const existing = getJson<{ingredients: boolean[]; steps: boolean[]}>(
        key,
        {ingredients: [], steps: []},
      );
      const steps = Array.isArray(existing.steps) ? [...existing.steps] : [];
      while (steps.length <= idx) steps.push(false);
      steps[idx] = true;
      setJson(key, {...existing, steps});
      try {
        window.dispatchEvent(
          new CustomEvent('recipe-checks-updated', {detail: {recipeId: rid}}),
        );
      } catch (err) {
        console.warn('Failed to dispatch recipe-checks-updated event', err);
      }
    } catch (err) {
      console.warn('Failed to mark step checked for finished timer', err);
    }
  }, []);

  if (!modalTimer) return null;

  const modal = (
    <div className='timer-modal-backdrop' role='dialog' aria-modal='true'>
      <div
        className='timer-modal'
        role='document'
        aria-labelledby={`timer-modal-title-${modalTimer.id}`}
      >
        <button
          className='timer-modal-close'
          aria-label='Dismiss'
          onClick={() => {
            try {
              markStepChecked(modalTimer);
            } catch (err) {
              console.warn('markStepChecked failed', err);
            }
            dispatch(removeTimer({id: modalTimer.id}));
            try {
              stopAlertPlayback();
            } catch (err) {
              console.warn('Failed to stop playback on dismiss', err);
            }
            setModalTimer(null);
          }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            width='18'
            height='18'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden
          >
            <path d='M18 6L6 18M6 6l12 12' />
          </svg>
        </button>

        <div className='timer-modal-header'>
          <div className='timer-modal-icon' aria-hidden>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-8 h-8'
            >
              <circle cx='12' cy='12' r='8' />
              <path d='M12 8v5' />
              <path d='M12 12l3 2' />
            </svg>
          </div>
          <div>
            <h2 id={`timer-modal-title-${modalTimer.id}`}>Timer finished</h2>
            <p className='timer-modal-label'>
              {modalTimer.label ?? 'Timer finished'}
            </p>
          </div>
        </div>

        <div className='timer-modal-actions'>
          <button
            onClick={() => {
              dispatch(
                setRemaining({
                  id: modalTimer.id,
                  remaining: modalTimer.remaining + 60,
                }),
              );
              dispatch(startTimer({id: modalTimer.id}));

              alertedRef.current[modalTimer.id] = false;
              try {
                stopAlertPlayback();
              } catch (err) {
                console.warn('Failed to stop playback on snooze', err);
              }
              setModalTimer(null);
            }}
            className='btn-primary'
          >
            Snooze 1m
          </button>

          <button
            onClick={() => {
              try {
                markStepChecked(modalTimer);
              } catch (err) {
                console.warn('markStepChecked failed', err);
              }
              dispatch(removeTimer({id: modalTimer.id}));
              try {
                stopAlertPlayback();
              } catch (err) {
                console.warn('Failed to stop playback on dismiss', err);
              }
              setModalTimer(null);
            }}
            className='pager-btn'
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
