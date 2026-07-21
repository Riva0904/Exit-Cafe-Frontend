import { NavLink, Navigate, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import {
  FiGrid,
  FiLayers,
  FiLogOut,
  FiPackage,
  FiShoppingCart,
  FiUsers,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { useSessionIdentityGuard } from '@/hooks/useSessionIdentityGuard';
import { NotificationBell } from './NotificationBell';

const links = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/categories', label: 'Categories', icon: FiLayers },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers },
];

const staffRoles = new Set(['SuperAdmin', 'Admin', 'Manager', 'Staff']);

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  useSessionIdentityGuard(user?.userId);

  if (!isAuthenticated || !user || !staffRoles.has(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-ink-950 text-cream-100">
      <aside className="flex w-64 flex-col border-r border-white/10 bg-ink-900/60 px-4 py-6">
        <span className="font-display px-2 text-xl font-bold text-gradient-gold">Exit Caff Admin</span>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-gold-500/15 text-gold-400' : 'text-cream-200/70 hover:bg-white/5',
                )
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <p className="px-2 text-xs text-cream-200/50">
            {user.firstName} {user.lastName} · {user.role}
          </p>
          <button
            onClick={() => dispatch(logout())}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-cream-200/70 hover:bg-white/5 hover:text-red-400"
          >
            <FiLogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-end border-b border-white/10 px-6 py-3">
          <NotificationBell />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
