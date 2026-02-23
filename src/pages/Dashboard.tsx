import {useNavigate} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {signOut} from '../store/authSlice';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {user, isAdmin} = useAppSelector((s) => s.auth);

  async function handleLogout() {
    await dispatch(signOut());
    navigate('/');
  }

  return (
    <div className='min-h-screen p-6'>
      <header className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold'>Dashboard</h2>
        <div className='flex items-center space-x-3'>
          {user ? (
            <>
              <span className='text-sm text-gray-700'>{user.email}</span>
              {isAdmin && (
                <span className='text-xs bg-yellow-200 px-2 py-1 rounded'>
                  Admin
                </span>
              )}
              <button
                onClick={handleLogout}
                className='ml-2 px-3 py-1 border rounded'
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className='px-3 py-1 border rounded'
            >
              Admin Login
            </button>
          )}
        </div>
      </header>

      <main>
        <p className='mb-4'>
          Welcome to the Recipe Manager dashboard. As a visitor you can browse
          recipes. Admins can add or remove recipes.
        </p>
        <div className='p-4 border rounded'>
          No recipes yet — build the app to manage recipes.
        </div>
      </main>
    </div>
  );
}
