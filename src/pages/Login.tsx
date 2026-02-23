import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {signIn} from '../store/authSlice';
import {useAppDispatch, useAppSelector} from '../store/hooks';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(signIn({email, password}));
    if (signIn.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-md bg-white p-6 rounded shadow'
      >
        <h1 className='text-2xl font-semibold mb-4'>Admin Sign in</h1>
        {auth.error && <div className='text-red-600 mb-2'>{auth.error}</div>}
        <label className='block mb-2 text-sm'>Email</label>
        <input
          className='w-full mb-3 p-2 border rounded'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='admin@example.com'
        />
        <label className='block mb-2 text-sm'>Password</label>
        <input
          type='password'
          className='w-full mb-4 p-2 border rounded'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='••••••••'
        />
        <div className='flex items-center justify-between'>
          <button
            type='submit'
            className='bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60'
            disabled={auth.status === 'loading'}
          >
            {auth.status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
          <a className='text-sm text-gray-600' href='/dashboard'>
            Continue as visitor
          </a>
        </div>
      </form>
    </div>
  );
}
