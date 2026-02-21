'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Bell,
  BellOff,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser, useRealtimeSubscription } from '@/lib/hooks/use-supabase-query';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/lib/actions';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Info; color: string; border: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-500', border: 'border-l-blue-500', bg: 'bg-blue-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', border: 'border-l-amber-500', bg: 'bg-amber-50' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', border: 'border-l-emerald-500', bg: 'bg-emerald-50' },
  error: { icon: XCircle, color: 'text-red-500', border: 'border-l-red-500', bg: 'bg-red-50' },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || { icon: Bell, color: 'text-primary', border: 'border-l-primary', bg: 'bg-primary-50' };
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: Record<string, Notification[]> = {
    "Aujourd'hui": [],
    'Hier': [],
    'Plus ancien': [],
  };

  for (const n of notifications) {
    const d = new Date(n.created_at);
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dateOnly.getTime() >= today.getTime()) {
      groups["Aujourd'hui"].push(n);
    } else if (dateOnly.getTime() >= yesterday.getTime()) {
      groups['Hier'].push(n);
    } else {
      groups['Plus ancien'].push(n);
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useCurrentUser();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  }, [user]);

  // Listen for toggle event from Topbar
  useEffect(() => {
    const handler = () => setOpen((prev) => !prev);
    window.addEventListener('toggle-notifications', handler);
    return () => window.removeEventListener('toggle-notifications', handler);
  }, []);

  // Fetch on open
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Realtime subscription
  useRealtimeSubscription('notifications', () => {
    if (open) fetchNotifications();
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const grouped = groupByDate(notifications);

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
      } catch { /* ignore */ }
    }
    if (notification.link) {
      setOpen(false);
      router.push(notification.link as any);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { /* ignore */ }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch { /* ignore */ }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light bg-gradient-to-r from-[#060E1F] via-[#0B1A3E] to-[#0F2A5E] text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md border border-white/15" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-white/50">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border-light bg-gray-50/80">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck size={14} />
              Tout marquer lu
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={14} />
              Tout effacer
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50">
                <BellOff size={32} className="text-text-muted" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text-secondary">Aucune notification</p>
                <p className="text-xs text-text-muted mt-1">
                  Vous serez notifié des actions importantes ici
                </p>
              </div>
            </div>
          ) : (
            <div>
              {grouped.map((group) => (
                <div key={group.label}>
                  <div className="sticky top-0 px-5 py-2 bg-gray-50/90 backdrop-blur-sm border-b border-border-light">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      {group.label}
                    </p>
                  </div>
                  {group.items.map((notification) => {
                    const config = getTypeConfig(notification.type);
                    const Icon = config.icon;

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleClick(notification)}
                        className={cn(
                          'group relative flex gap-3 px-5 py-4 border-b border-border-light/50 border-l-3 cursor-pointer transition-all duration-150 hover:bg-gray-50',
                          config.border,
                          !notification.is_read ? 'bg-blue-50/30' : 'bg-white'
                        )}
                      >
                        {/* Icon */}
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl shrink-0', config.bg)}>
                          <Icon size={16} className={config.color} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              'text-sm leading-tight line-clamp-1',
                              !notification.is_read ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'
                            )}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </div>
                          {notification.message && (
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-text-muted">
                              {getRelativeTime(notification.created_at)}
                            </span>
                            {notification.link && (
                              <ExternalLink size={10} className="text-text-muted" />
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
