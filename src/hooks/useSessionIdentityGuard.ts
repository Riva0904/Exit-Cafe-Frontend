import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { tokenStorage } from '@/api/client';
import { getTokenUserId } from '@/utils/jwt';

/**
 * Access/refresh tokens live in localStorage under one shared key regardless of which login
 * form was used, so logging into a different account in another tab silently swaps the token
 * this tab sends on every request — while this tab's Redux state (set once at login) keeps
 * showing the old identity in the header. Every request then goes out under the wrong account
 * with no visible error (reads as "empty" or "403", never as "you're logged in as someone
 * else"). Poll for that drift and force a clean re-login the moment it's detected, instead of
 * leaving the UI lying about who's signed in.
 */
export function useSessionIdentityGuard(userId: string | undefined) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function checkIdentity() {
      const token = tokenStorage.getAccessToken();
      if (!token || !userId) return;
      const tokenUserId = getTokenUserId(token);
      if (tokenUserId && tokenUserId !== userId) {
        toast.error('You signed in as a different account in another tab. Please sign in again.');
        dispatch(logout());
      }
    }

    checkIdentity();
    window.addEventListener('focus', checkIdentity);
    const interval = setInterval(checkIdentity, 20_000);
    return () => {
      window.removeEventListener('focus', checkIdentity);
      clearInterval(interval);
    };
  }, [userId, dispatch]);
}
