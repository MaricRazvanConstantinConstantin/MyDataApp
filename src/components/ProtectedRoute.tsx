import {type ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {useAppSelector} from '../store/hooks';

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}) {
  const {user, isAdmin, initialized} = useAppSelector((s) => s.auth);

  if (!initialized) return <div />;
  if (requireAdmin && !isAdmin) return <Navigate to='/' replace />;
  if (requireAuth && !user) return <Navigate to='/' replace />;
  return <>{children}</>;
}
