import { useState } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import {
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useSessionIdentityGuard(user?.userId);

  if (!isAuthenticated || !user || !staffRoles.has(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  const sidebarContent = (
    <>
      <span className="font-display px-2 text-xl font-bold text-gradient-gold">Exit Caff Admin</span>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-ink-950 text-cream-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink-900/60 px-4 py-6 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex w-64 flex-col border-r border-white/10 bg-ink-900 px-4 py-6">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-cream-200/80 hover:bg-white/5"
              aria-label="Open admin menu"
            >
              <FiMenu size={20} />
            </button>
            <span className="font-display text-sm font-bold text-gradient-gold">Exit Caff Admin</span>
          </div>
          <NotificationBell className="ml-auto" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
