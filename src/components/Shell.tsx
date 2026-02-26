import React from 'react';
import Header from './Header';
import Container from './ui/Container';
import ToastProvider from '../context/ToastContext';
import {useAppSelector} from '../store/hooks';
import {useToast} from '../context/hooks';
import TimersWatcher from './timer/TimersWatcher';

function ReduxErrorWatcher() {
  const {showToast} = useToast();
  const authError = useAppSelector((s) => s.auth.error);
  const recipesError = useAppSelector((s) => s.recipes.error);

  React.useEffect(() => {
    if (authError) showToast(authError, 'error');
  }, [authError, showToast]);

  React.useEffect(() => {
    if (recipesError) showToast(recipesError, 'error');
  }, [recipesError, showToast]);

  return null;
}

export default function Shell({children}: {children: React.ReactNode}) {
  return (
    <ToastProvider>
      <div className='h-screen flex flex-col'>
        <TimersWatcher />
        <Header />
        <main className='flex-1 overflow-auto'>
          <Container>
            <ReduxErrorWatcher />
            {children}
          </Container>
        </main>
      </div>
    </ToastProvider>
  );
}
