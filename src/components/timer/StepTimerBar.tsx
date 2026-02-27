import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  startTimer,
  pauseTimer,
  resetTimer,
  removeTimer,
} from '../../store/timersSlice';
import type {Timer} from '../../utils/types/timer';
import AddTimerButton from './AddTimerButton';

function fmt(s: number) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.max(0, s % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function StepTimerBar({
  recipeId,
  stepIndex,
  label,
}: {
  recipeId?: string | number | null;
  stepIndex?: number | null;
  label?: string;
}) {
  const dispatch = useAppDispatch();
  const timers = useAppSelector((s) => s.timers.items as Timer[]);

  const match = timers.find((t) => {
    if (t.recipeId == null && recipeId == null)
      return t.stepIndex === stepIndex;
    return String(t.recipeId) === String(recipeId) && t.stepIndex === stepIndex;
  });

  if (!match) {
    return (
      <AddTimerButton recipeId={recipeId} stepIndex={stepIndex} label={label} />
    );
  }

  const pct =
    match.duration > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((match.duration - match.remaining) / match.duration) * 100,
            ),
          ),
        )
      : 0;

  return (
    <div className='step-timer-bar'>
      <div className='step-timer-info'>
        <span className='sr-only'>{label ?? match.label}</span>
        <div
          className='step-timer-progress'
          aria-hidden
          aria-label={`Progress ${pct}%`}
        >
          <div className='step-timer-fill' style={{width: `${pct}%`}} />
        </div>
      </div>

      <div className='step-timer-time'>{fmt(match.remaining)}</div>

      <div className='step-timer-controls'>
        {!match.running ? (
          <button
            onClick={() => dispatch(startTimer({id: match.id}))}
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
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden
            >
              <polygon points='5 3 19 12 5 21 5 3'></polygon>
            </svg>
          </button>
        ) : (
          <button
            onClick={() => dispatch(pauseTimer({id: match.id}))}
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
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden
            >
              <rect x='6' y='4' width='4' height='16'></rect>
              <rect x='14' y='4' width='4' height='16'></rect>
            </svg>
          </button>
        )}
        <button
          onClick={() => dispatch(resetTimer({id: match.id}))}
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
          onClick={() => dispatch(removeTimer({id: match.id}))}
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
  );
}
