import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { FiBell, FiCheck } from 'react-icons/fi';
import { notificationsApi } from '@/api/notifications';

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 15_000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.getAll({ pageNumber: 1, pageSize: 10 }),
    enabled: open,
    refetchInterval: open ? 15_000 : false,
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-cream-200/70 transition-colors hover:bg-white/5 hover:text-gold-400"
      >
        <FiBell size={18} />
        {Boolean(unreadCount) && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-ink-950">
            {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
          </span>
        )}
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
              className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-white/10 bg-ink-900 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="text-sm font-semibold text-cream-100">Notifications</span>
                {Boolean(unreadCount) && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="flex items-center gap-1 text-xs text-gold-400 hover:underline"
                  >
                    <FiCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {!notifications || notifications.items.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-cream-200/40">No notifications yet.</p>
                ) : (
                  notifications.items.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) markOneRead.mutate(n.id);
                        if (n.type === 'NewOrder') navigate('/admin/orders');
                        setOpen(false);
                      }}
                      className={`block w-full border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                        n.isRead ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-cream-100">{n.title}</span>
                        {!n.isRead && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />}
                      </div>
                      <p className="mt-1 text-xs text-cream-200/60">{n.message}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-cream-200/30">
                        {timeAgo(n.createdAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
