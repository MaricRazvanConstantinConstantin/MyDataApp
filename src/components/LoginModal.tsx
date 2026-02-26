import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {signIn} from '../store/authSlice';

export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (auth.user && open) {
      onClose();
    }
  }, [auth.user, open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(signIn({email, password}));
    if (signIn.fulfilled.match(result)) {
      onClose();
    }
  }

  const modal = (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
    >
      <div
        className='absolute inset-0 bg-black/40'
        onClick={() => onClose()}
        aria-hidden
      />

      <Card className='z-10 w-full max-w-md'>
        <form onSubmit={handleSubmit} className='p-4'>
          <h2 className='text-xl font-semibold mb-3'>Admin Sign in</h2>
          {auth.error && <div className='text-red-600 mb-2'>{auth.error}</div>}

          <Input
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='admin@example.com'
            className='mb-3 w-full'
          />

          <Input
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
            className='mb-4 w-full'
          />

          <div className='flex items-center justify-between'>
            <Button type='submit' disabled={auth.status === 'loading'}>
              {auth.status === 'loading' ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button variant='ghost' onClick={() => onClose()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  return createPortal(modal, document.body);
}
