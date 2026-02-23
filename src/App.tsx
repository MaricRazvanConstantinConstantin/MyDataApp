import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import Login from './pages/Login';

import './App.css';
import Dashboard from './pages/Dashboard';
import {useEffect} from 'react';
import {useAppDispatch} from './store/hooks';
import {restoreSession} from './store/authSlice';

function Landing() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4'>
      <h1 className='text-3xl font-bold mb-4'>Recipe Manager</h1>
      <p className='mb-6 text-center max-w-xl'>
        Manage recipes — visitors can view, admins can manage.
      </p>
      <div className='space-x-3'>
        <Link to='/login' className='px-4 py-2 bg-blue-600 text-white rounded'>
          Admin Login
        </Link>
        <Link to='/dashboard' className='px-4 py-2 border rounded'>
          Continue as visitor
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
