import { FiAlertTriangle } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';

const staffRoles = new Set(['SuperAdmin', 'Admin', 'Manager', 'Staff']);

/**
 * Staff accounts have no customer profile, so cart/checkout/orders/reviews all fail or look
 * "empty" for them — not broken, just the wrong account. This makes that obvious instead of
 * letting people think order history or checkout is broken.
 */
export function StaffAccountBanner() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated || !user || !staffRoles.has(user.role)) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-300">
      <FiAlertTriangle size={14} className="shrink-0" />
      <span>
        You're browsing as staff ({user.firstName}, {user.role}) — this account can't place orders or leave
        reviews.
      </span>
      <button onClick={() => dispatch(logout())} className="font-medium underline hover:text-amber-200">
        Sign out
      </button>
    </div>
  );
}
