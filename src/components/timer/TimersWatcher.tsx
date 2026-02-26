import {useEffect, useRef, useState, useCallback} from 'react';
import {createPortal} from 'react-dom';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  tick,
  setRemaining,
  startTimer,
  removeTimer,
} from '../../store/timersSlice';
import type {Timer} from '../../utils/types/timer';

export default function TimersWatcher() {
  const dispatch = useAppDispatch();
  const timers = useAppSelector((s) => s.timers.items as Timer[]);
  const alertedRef = useRef<Record<string, boolean>>({});
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
    for (const t of timers) {
      if (t.remaining <= 0 && !alertedRef.current[t.id]) {
        alertedRef.current[t.id] = true;

        setTimeout(() => {
          setModalTimer(t);
          startAlertPlayback();
        }, 0);
        break;
      }
    }
  }, [timers, startAlertPlayback]);

  if (!modalTimer) return null;

  const modal = (
    <div className='timer-modal-backdrop' role='dialog' aria-modal='true'>
      <div className='timer-modal'>
        <h2>Timer finished</h2>
        <p>{modalTimer.label ?? 'Timer finished'}</p>
        <div className='timer-modal-actions'>
          <button
            onClick={() => {
              dispatch(setRemaining({id: modalTimer.id, remaining: 60}));
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
