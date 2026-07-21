import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiClock, FiLogOut, FiMenu, FiMoon, FiShoppingBag, FiSun, FiUser, FiX } from 'react-icons/fi';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleTheme } from '@/app/uiSlice';
import { logout } from '@/features/auth/authSlice';
import { CustomerNotificationBell } from './CustomerNotificationBell';

function AccountMenu({ firstName }: { firstName?: string }) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full p-2 text-sm text-cream-200/80 transition-colors hover:bg-white/5 hover:text-gold-400"
      >
        <FiUser size={16} /> {firstName}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-xl"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/orders');
                }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-cream-200/80 transition-colors hover:bg-white/5 hover:text-gold-400"
              >
                <FiClock size={15} /> Order History
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  dispatch(logout());
                }}
                className="flex w-full items-center gap-2.5 border-t border-white/5 px-4 py-3 text-left text-sm text-cream-200/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <FiLogOut size={15} /> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  return (
    <header className="sticky top-0 z-50 glass-panel">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-wide text-gradient-gold">Exit Caff</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'text-sm font-medium tracking-wide transition-colors hover:text-gold-400',
                  isActive ? 'text-gold-400' : 'text-cream-200/80',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
            className="rounded-full p-2 text-cream-200/80 transition-colors hover:bg-white/5 hover:text-gold-400"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2 text-cream-200/80 transition-colors hover:bg-white/5 hover:text-gold-400"
          >
            <FiShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-ink-950">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <CustomerNotificationBell />
              <AccountMenu firstName={user?.firstName} />
            </>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-1.5 rounded-full p-2 text-sm text-cream-200/80 transition-colors hover:bg-white/5 hover:text-gold-400 sm:flex"
            >
              <FiUser size={16} /> Sign in
            </Link>
          )}

          <button
            className="rounded-full p-2 text-cream-200/80 hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-4 lg:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-cream-200/80 hover:bg-white/5 hover:text-gold-400"
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-cream-200/80 hover:bg-white/5 hover:text-gold-400"
              >
                Order History
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  dispatch(logout());
                }}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-cream-200/80 hover:bg-white/5 hover:text-red-400"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-cream-200/80 hover:bg-white/5 hover:text-gold-400"
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
