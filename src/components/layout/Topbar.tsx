'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Bell, Search, Settings, Menu, Globe } from 'lucide-react';
import { useState } from 'react';

export function Topbar() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const switchLocale = () => {
    const newLocale = locale === 'fr' ? 'pt' : 'fr';
    router.replace(pathname, { locale: newLocale });
  };

  const openSearch = () => {
    // Dispatch custom event to open search modal
    window.dispatchEvent(new CustomEvent('open-search'));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 backdrop-blur-md px-4 md:px-6 shadow-topbar">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} className="text-text-secondary" />
      </button>

      {/* Search bar */}
      <button
        onClick={openSearch}
        className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-muted hover:border-primary/30 hover:bg-white transition-all duration-200 w-full max-w-md mx-4"
      >
        <Search size={16} />
        <span className="flex-1 text-left">{t('searchPlaceholder')}</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border bg-white px-1.5 py-0.5 text-[11px] font-medium text-text-muted">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Language toggle */}
        <button
          onClick={switchLocale}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 transition-colors"
          title={locale === 'fr' ? 'Mudar para Português' : 'Passer en Français'}
        >
          <Globe size={16} />
          <span className="hidden sm:inline uppercase">{locale}</span>
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-text-secondary" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* Settings */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Settings size={18} className="text-text-secondary" />
        </button>
      </div>
    </header>
  );
}
