import {useEffect, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  startTimer,
  pauseTimer,
  resetTimer,
  removeTimer,
  tick,
} from '../../store/timersSlice';
import type {Timer} from '../../utils/types/timer';

function fmt(s: number) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.max(0, s % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function TimersPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const timers = useAppSelector((s) => s.timers.items as Timer[]);
  const prevRef = useRef<Record<string, number>>({});
  const [alerts, setAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      dispatch(tick({now: new Date().toISOString()}));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, dispatch]);

  useEffect(() => {
    timers.forEach((t) => {
      const prev = prevRef.current[t.id] ?? t.remaining;
      if (prev > 0 && t.remaining === 0 && !alerts[t.id]) {
        setAlerts((a) => ({...a, [t.id]: true}));
        try {
          if (
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            new Notification('Timer finished', {body: t.label ?? 'Timer'});
          }
        } catch (err) {
          console.warn('Notifications not available', err);
        }
      }
      prevRef.current[t.id] = t.remaining;
    });
  }, [timers, alerts]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/40'
        onClick={onClose}
        aria-hidden
      />

      <div className='bg-white p-4 rounded shadow max-w-lg w-full z-10'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-lg font-semibold'>Timers</h3>
          <button
            onClick={onClose}
            className='pager-btn'
            aria-label='Close timers'
          >
            Close
          </button>
        </div>

        {timers.length === 0 ? (
          <div className='text-sm text-muted'>No timers set.</div>
        ) : (
          <ul className='space-y-2'>
            {timers.map((t) => (
              <li key={t.id} className='border p-2 rounded flex items-center'>
                <div className='flex-1'>
                  <div className='font-medium'>{t.label ?? `Timer`}</div>
                  <div className='text-sm text-muted'>
                    {t.recipeId
                      ? `Recipe ${t.recipeId}${t.stepIndex != null ? ` • Step ${t.stepIndex + 1}` : ''}`
                      : ''}
                  </div>
                </div>

                <div className='mx-3 font-mono'>{fmt(t.remaining)}</div>

                <div className='flex items-center gap-2'>
                  {!t.running ? (
                    <button
                      onClick={() => dispatch(startTimer({id: t.id}))}
                      className='btn-primary'
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={() => dispatch(pauseTimer({id: t.id}))}
                      className='pager-btn'
                    >
                      Pause
                    </button>
                  )}
                  <button
                    onClick={() => dispatch(resetTimer({id: t.id}))}
                    className='pager-btn'
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => dispatch(removeTimer({id: t.id}))}
                    className='pager-btn'
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
