import { isAxiosError } from 'axios';

export function getErrorMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return fallback;

  if (err.response?.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  if (err.response?.status === 403) {
    return "You don't have permission to do that. If you're signed in as a different account in another tab, sign in again here.";
  }

  return err.response?.data?.message ?? fallback;
}
