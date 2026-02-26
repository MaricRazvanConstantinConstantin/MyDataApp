import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ToastContext} from './hooks';

type Toast = {
  id: string;
  message: string;
  variant?: 'error' | 'info' | 'success';
};

export type ToastContextValue = {
  showToast: (message: string, variant?: Toast['variant']) => void;
};

export default function ToastProvider({children}: {children: React.ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, variant: Toast['variant'] = 'info') => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
      setToasts((t) => [...t, {id, message, variant}]);
    },
    [],
  );

  useEffect(() => {
    function onUnhandledRejection(e: PromiseRejectionEvent) {
      const msg =
        (e.reason && e.reason.message) ||
        String(e.reason || 'Unhandled rejection');
      showToast(msg, 'error');
    }

    function onError(ev: ErrorEvent) {
      showToast(ev.message || 'An error occurred', 'error');
    }

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onError as EventListener);
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onError as EventListener);
    };
  }, [showToast]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((t) => t.slice(1));
    }, 4500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const value = useMemo(() => ({showToast}), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live='polite'
        className='fixed bottom-4 right-4 z-50 flex flex-col space-y-2'
      >
        {toasts.map((to) => (
          <div
            key={to.id}
            className={`min-w-55 max-w-sm p-3 rounded shadow-lg text-sm text-white ${
              to.variant === 'error'
                ? 'bg-red-600'
                : to.variant === 'success'
                  ? 'bg-green-600'
                  : 'bg-gray-800'
            }`}
          >
            {to.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
