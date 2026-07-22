import type { Store } from '@reduxjs/toolkit';
import type { QueryClient } from '@tanstack/react-query';
import type { RootState } from './store';

/**
 * Query keys like ['orders', 'my'] or ['my-notifications', ...] aren't scoped by user id, so
 * switching accounts (login as someone else, logout, a forced re-login) can serve the previous
 * user's cached "my X" data for up to `staleTime` before a background refetch replaces it —
 * looks like "showing the wrong person's order history." Clearing the whole cache on every
 * identity change removes the need to individually scope every "my"-style query key.
 */
export function subscribeQueryCacheToAuth(store: Store<RootState>, queryClient: QueryClient) {
  let lastUserId = store.getState().auth.user?.userId;

  store.subscribe(() => {
    const currentUserId = store.getState().auth.user?.userId;
    if (currentUserId !== lastUserId) {
      lastUserId = currentUserId;
      queryClient.clear();
    }
  });
}
