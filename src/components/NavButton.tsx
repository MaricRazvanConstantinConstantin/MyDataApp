import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {useAppSelector} from '../store/hooks';
import ContactModal from './ContactModal';
import TimersPanel from './timer/TimersPanel';
import ThemeToggle from './ThemeToggle';

export default function NavButton({className = ''}: {className?: string}) {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [timersOpen, setTimersOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const isAdmin = useAppSelector((s) => s.auth.isAdmin);
  const timersCount = useAppSelector((s) => s.timers?.items?.length ?? 0);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!asideRef.current) return;
    try {
      asideRef.current.inert = !open;
    } catch (err) {
      console.warn('inert not supported', err);
    }
  }, [open]);

  const closeMenu = () => {
    try {
      if (
        asideRef.current &&
        asideRef.current.contains(document.activeElement)
      ) {
        menuButtonRef.current?.focus();
      }
    } catch (err) {
      console.warn('NavButton focus check failed', err);
    }
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={['nav-button', className].filter(Boolean).join(' ')}
    >
      <button
        ref={menuButtonRef}
        aria-expanded={open}
        aria-haspopup='menu'
        onClick={() => (open ? closeMenu() : setOpen(true))}
        className='pager-btn nav-toggle'
        type='button'
        aria-label='Open menu'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='w-5 h-5'
          aria-hidden='true'
        >
          <path d='M3 12h18'></path>
          <path d='M3 6h18'></path>
          <path d='M3 18h18'></path>
        </svg>
      </button>

      <div
        className={`nav-backdrop fixed inset-0 z-40 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}
        onClick={closeMenu}
        aria-hidden={!open}
      />

      <aside
        ref={asideRef}
        className={`nav-sidebar fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role='menu'
      >
        <div className='p-6 flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <div className='text-lg font-semibold'>Menu</div>
            <button
              onClick={closeMenu}
              className='pager-btn p-2'
              aria-label='Close menu'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-5 h-5'
                aria-hidden='true'
              >
                <path d='M18 6L6 18'></path>
                <path d='M6 6l12 12'></path>
              </svg>
            </button>
          </div>

          <nav className='flex flex-col mt-2 space-y-1'>
            <Link
              role='menuitem'
              to='/'
              className='nav-link'
              onClick={closeMenu}
            >
              <span className='nav-icon' aria-hidden>
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
                  <path d='M3 11.5L12 4l9 7.5' />
                  <path d='M5 21h14a1 1 0 0 0 1-1V11' />
                </svg>
              </span>
              <span>Home</span>
            </Link>

            <Link
              role='menuitem'
              to='/recipes'
              className='nav-link'
              onClick={closeMenu}
            >
              <span className='nav-icon' aria-hidden>
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
                  <path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20' />
                  <path d='M4 4.5A2.5 2.5 0 0 1 6.5 7H20v12' />
                </svg>
              </span>
              <span>Recipes</span>
            </Link>

            <button
              role='menuitem'
              className='nav-link'
              onClick={() => {
                setContactOpen(true);
                closeMenu();
              }}
            >
              <span className='nav-icon' aria-hidden>
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
                  <path d='M22 6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6' />
                  <path d='M22 6l-10 7L2 6' />
                </svg>
              </span>
              <span>Contact</span>
            </button>

            <button
              role='menuitem'
              className={`nav-link ${timersCount === 0 ? 'opacity-60' : ''}`}
              onClick={() => {
                if (timersCount === 0) {
                  closeMenu();
                  return;
                }
                setTimersOpen(true);
                closeMenu();
              }}
            >
              <span className='nav-icon' aria-hidden>
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
                  <path d='M21 10v2a9 9 0 1 1-2-5.8' />
                  <path d='M12 6V2' />
                </svg>
              </span>
              <span>Timers{timersCount > 0 ? ` (${timersCount})` : ''}</span>
            </button>

            {isAdmin && (
              <Link
                role='menuitem'
                to='/messages'
                className='nav-link'
                onClick={closeMenu}
              >
                <span className='nav-icon' aria-hidden>
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
                    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                  </svg>
                </span>
                <span>Messages</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                role='menuitem'
                to='/recipes/new'
                className='nav-link'
                onClick={closeMenu}
              >
                <span className='nav-icon' aria-hidden>
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
                    <path d='M12 5v14' />
                    <path d='M5 12h14' />
                  </svg>
                </span>
                <span>Add Recipe</span>
              </Link>
            )}
          </nav>

          <div className='mt-auto pt-4 border-t border-transparent'>
            <div className='flex items-center justify-between'>
              <small className='text-sm text-muted'>Theme</small>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <TimersPanel open={timersOpen} onClose={() => setTimersOpen(false)} />
    </div>
  );
}
