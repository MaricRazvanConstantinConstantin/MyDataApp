import {useState} from 'react';
import {createPortal} from 'react-dom';
import {useAppDispatch} from '../../store/hooks';
import {addTimer, startTimer} from '../../store/timersSlice';
import {useToast} from '../../context/hooks';

export default function AddTimerButton({
  recipeId,
  stepIndex,
  label: labelProp,
}: {
  recipeId?: string | number | null;
  stepIndex?: number | null;
  label?: string;
}) {
  const dispatch = useAppDispatch();
  const {showToast} = useToast();
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [autoStart, setAutoStart] = useState<boolean>(true);

  function handleAdd() {
    const total = Math.max(0, Math.floor(minutes) * 60 + Math.floor(seconds));
    if (total <= 0) {
      showToast('Please set a duration', 'error');
      return;
    }
    const label =
      labelProp ?? (stepIndex != null ? `Step ${stepIndex + 1}` : 'Timer');
    const action = addTimer({duration: total, recipeId, stepIndex, label});
    dispatch(action);
    if (autoStart && action.payload && action.payload.id) {
      dispatch(startTimer({id: action.payload.id}));
    }
    showToast('Timer added', 'success');
    setOpen(false);
    setMinutes(0);
    setSeconds(0);
  }

  return (
    <div className='inline-block ml-3'>
      <button
        type='button'
        className='add-timer-btn'
        aria-label='Add timer for step'
        onClick={() => setOpen((o) => !o)}
      >
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
      </button>

      {open &&
        createPortal(
          <div
            className='timer-modal-backdrop'
            role='dialog'
            aria-modal='true'
            onClick={() => setOpen(false)}
          >
            <div
              className='timer-modal'
              onClick={(e) => e.stopPropagation()}
              aria-label='Add timer dialog'
            >
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  min={0}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value) || 0)}
                  className='input w-16'
                />
                <span className='text-sm'>min</span>
                <input
                  type='number'
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) =>
                    setSeconds(
                      Math.max(0, Math.min(59, Number(e.target.value) || 0)),
                    )
                  }
                  className='input w-16'
                />
                <span className='text-sm'>sec</span>
              </div>
              <div className='flex items-center gap-2 mt-2'>
                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={autoStart}
                    onChange={(e) => setAutoStart(e.target.checked)}
                  />
                  <span>Start on add</span>
                </label>
              </div>
              <div className='mt-2 flex gap-2'>
                <button onClick={handleAdd} className='btn-primary'>
                  Add
                </button>
                <button onClick={() => setOpen(false)} className='pager-btn'>
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
