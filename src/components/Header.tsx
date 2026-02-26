import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {signOut} from '../store/authSlice';

import LoginModal from './LoginModal';
import Container from './ui/Container';
import NavButton from './NavButton';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {user, isAdmin} = useAppSelector((s) => s.auth);

  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await dispatch(signOut());
    navigate('/');
  }

  return (
    <header className='site-header w-full relative'>
      <Container className='p-4 flex items-center justify-between'>
        <NavButton />

        <div className='flex items-center space-x-3'>
          {user ? (
            <>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='status-dot' aria-hidden />
                  <span className='role-wrapper'>
                    <span
                      className='text-sm text-muted role'
                      aria-label={`Logged in as ${user.email}`}
                    >
                      {isAdmin ? 'Admin' : 'User'}
                    </span>
                    <span
                      id={`role-tooltip-${user?.id ?? 'anon'}`}
                      className='role-tooltip'
                      aria-hidden
                    >
                      {user.email}
                    </span>
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className='pager-btn'
                  aria-label='Logout'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='w-5 h-5 inline-block mr-2'
                    aria-hidden='true'
                  >
                    <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                    <path d='M16 17l5-5-5-5' />
                    <path d='M21 12H9' />
                  </svg>
                  <span className='responsive-label'>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setOpen(true)}
                className='pager-btn'
                aria-label='Admin login'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='w-5 h-5 inline-block mr-2'
                  aria-hidden='true'
                >
                  <circle cx='12' cy='8' r='4' />
                  <path d='M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2' />
                </svg>
                <span className='responsive-label'>Login</span>
              </button>
              <LoginModal open={open} onClose={() => setOpen(false)} />
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
