import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
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

      <div className='timers-panel bg-white p-4 rounded shadow max-w-lg w-full z-10'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-3'>
            <div className='timers-panel-badge' aria-hidden>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-5 h-5'
              >
                <circle cx='12' cy='12' r='8' />
                <path d='M12 8v5' />
                <path d='M12 12l3 2' />
              </svg>
            </div>
            <h3 className='text-lg font-semibold'>Timers</h3>
            <div className='text-sm text-muted'>({timers.length})</div>
          </div>
          <button
            onClick={onClose}
            className='pager-btn'
            aria-label='Close timers'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              width='16'
              height='16'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        {timers.length === 0 ? (
          <div className='text-sm text-muted'>No timers set.</div>
        ) : (
          <ul className='space-y-3'>
            {timers.map((t) => {
              const pct =
                t.duration > 0
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(
                          ((t.duration - t.remaining) / t.duration) * 100,
                        ),
                      ),
                    )
                  : 0;
              return (
                <li key={t.id} className='timers-item p-3 rounded'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between gap-3'>
                        <div>
                          <div className='font-medium'>
                            {t.recipeId ? (
                              <Link
                                to={`/recipes/${t.recipeId}`}
                                onClick={onClose}
                              >
                                {t.label ?? 'Timer'}
                              </Link>
                            ) : (
                              (t.label ?? 'Timer')
                            )}
                          </div>
                          {/* intentionally left blank (no recipe id/title shown) */}
                        </div>
                        <div className='font-mono text-sm'>
                          {fmt(t.remaining)}
                        </div>
                      </div>

                      <div className='timers-item-progress mt-2' aria-hidden>
                        <div
                          className='timers-item-fill'
                          style={{width: `${pct}%`}}
                        />
                      </div>
                    </div>

                    <div className='flex flex-col items-end gap-2'>
                      {!t.running ? (
                        <button
                          onClick={() => dispatch(startTimer({id: t.id}))}
                          className='btn-primary btn-sm'
                          aria-label='Start timer'
                          title='Start'
                        >
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            aria-hidden
                          >
                            <polygon points='5 3 19 12 5 21 5 3'></polygon>
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => dispatch(pauseTimer({id: t.id}))}
                          className='pager-btn btn-sm'
                          aria-label='Pause timer'
                          title='Pause'
                        >
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            aria-hidden
                          >
                            <rect x='6' y='4' width='4' height='16'></rect>
                            <rect x='14' y='4' width='4' height='16'></rect>
                          </svg>
                        </button>
                      )}

                      <div className='flex gap-2'>
                        <button
                          onClick={() => dispatch(resetTimer({id: t.id}))}
                          className='pager-btn btn-sm'
                          aria-label='Reset timer'
                          title='Reset'
                        >
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            aria-hidden
                          >
                            <path d='M21 12a9 9 0 1 1-3.2-6.6'></path>
                            <polyline points='21 6 21 12 15 12'></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={() => dispatch(removeTimer({id: t.id}))}
                          className='pager-btn btn-sm'
                          aria-label='Remove timer'
                          title='Remove'
                        >
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            aria-hidden
                          >
                            <polyline points='3 6 5 6 21 6'></polyline>
                            <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'></path>
                            <path d='M10 11v6'></path>
                            <path d='M14 11v6'></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
