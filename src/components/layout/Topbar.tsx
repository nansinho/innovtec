'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { Bell, Search, Settings, Menu, Globe, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrentUser, useRealtimeSubscription } from '@/lib/hooks/use-supabase-query';
import { createClient } from '@/lib/supabase/client';
import { cn, getInitials, getAvatarGradient, getRoleLabel, getRoleBadgeClass } from '@/lib/utils';

export function Topbar() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const switchLocale = () => {
    const newLocale = locale === 'fr' ? 'pt' : 'fr';
    router.replace(pathname, { locale: newLocale });
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'));
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Fetch notification count
  const refetchNotifCount = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotificationCount(count || 0);
  }, [user]);

  useEffect(() => {
    refetchNotifCount();
  }, [refetchNotifCount]);

  // Realtime notification count
  useRealtimeSubscription('notifications', refetchNotifCount);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = user ? `${user.first_name} ${user.last_name}` : '';
  const initials = user ? getInitials(user.first_name, user.last_name) : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-light/50 bg-white/70 backdrop-blur-xl px-4 md:px-6 shadow-topbar">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} className="text-text-secondary" />
      </button>

      {/* Search bar */}
      <button
        onClick={openSearch}
        className="flex items-center gap-3 rounded-xl border border-border-light/60 bg-background/60 px-4 py-2 text-sm text-text-muted hover:border-primary/20 hover:bg-white hover:shadow-sm transition-all duration-200 w-full max-w-md mx-4"
      >
        <Search size={16} />
        <span className="flex-1 text-left">{t('searchPlaceholder')}</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border-light bg-white px-1.5 py-0.5 text-[11px] font-medium text-text-muted shadow-sm">
          <span className="text-xs">{'\u2318'}</span>K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Language toggle */}
        <button
          onClick={switchLocale}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100/80 transition-colors"
          title={locale === 'fr' ? 'Mudar para Portugu\u00eas' : 'Passer en Fran\u00e7ais'}
        >
          <Globe size={16} />
          <span className="hidden sm:inline uppercase text-xs font-bold">{locale}</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-notifications'))}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100/80 transition-colors"
        >
          <Bell size={18} className="text-text-secondary" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-gray-100/80 transition-all"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/10 shadow-sm"
              />
            ) : (
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ring-2 ring-primary/10 shadow-sm',
                user ? getAvatarGradient(displayName) : 'from-primary to-primary-light'
              )}>
                {initials || <User size={14} />}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-text-primary leading-tight">{displayName}</p>
              <p className="text-[10px] text-text-muted leading-tight">{getRoleLabel(user?.role)}</p>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border-light/60 bg-white/95 backdrop-blur-xl shadow-lg py-1 animate-fade-in">
              {user && (
                <div className="px-4 py-3 border-b border-border-light/50">
                  <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                  <span className={cn('badge mt-1', getRoleBadgeClass(user.role))}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              )}
              <Link
                href="/profil"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
              >
                <User size={16} />
                {t('profile')}
              </Link>
              <Link
                href="/profil"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
              >
                <Settings size={16} />
                {t('settings')}
              </Link>
              <div className="border-t border-border-light/50 my-1" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
