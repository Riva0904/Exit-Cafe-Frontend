import { useEffect } from 'react';
import { useAppDispatch } from './hooks';
import { logout } from '@/features/auth/authSlice';

export function AuthEventListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleLogout = () => dispatch(logout());
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [dispatch]);

  return null;
}
