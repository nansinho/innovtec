'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn, getInitials, getAvatarGradient, getRoleLabel } from '@/lib/utils';
import { useCurrentUser } from '@/lib/hooks/use-supabase-query';
import {
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ClipboardList,
  Lightbulb,
  BarChart3,
  Users,
  Calendar,
  GraduationCap,
  Building2,
  PenTool,
  FolderOpen,
  Image,
  ChevronDown,
  Zap,
  LogOut,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

export function Sidebar() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [expandedSections, setExpandedSections] = useState<string[]>(['qse']);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isAdmin = user?.role === 'admin';

  const navItems: NavItem[] = [
    {
      label: t('dashboard'),
      href: '/',
      icon: <LayoutDashboard size={19} strokeWidth={1.8} />,
    },
    {
      label: t('news'),
      href: '/actualites',
      icon: <Newspaper size={19} strokeWidth={1.8} />,
    },
    {
      label: t('qse'),
      href: '/qse',
      icon: <ShieldCheck size={19} strokeWidth={1.8} />,
      children: [
        { label: t('qsePolicy'), href: '/qse/politique', icon: <FileText size={17} strokeWidth={1.8} /> },
        { label: t('bestPractices'), href: '/qse/bonnes-pratiques', icon: <Lightbulb size={17} strokeWidth={1.8} /> },
        { label: t('dangerousSituations'), href: '/qse/situations-dangereuses', icon: <AlertTriangle size={17} strokeWidth={1.8} /> },
        { label: t('actionPlans'), href: '/qse/plans-actions', icon: <ClipboardList size={17} strokeWidth={1.8} /> },
        { label: t('rex'), href: '/qse/rex', icon: <Lightbulb size={17} strokeWidth={1.8} /> },
        { label: t('sseTable'), href: '/qse/tableau-sse', icon: <BarChart3 size={17} strokeWidth={1.8} /> },
      ],
    },
    {
      label: t('team'),
      href: '/trombinoscope',
      icon: <Users size={19} strokeWidth={1.8} />,
    },
    {
      label: t('planning'),
      href: '/planning',
      icon: <Calendar size={19} strokeWidth={1.8} />,
    },
    {
      label: t('formations'),
      href: '/formations',
      icon: <GraduationCap size={19} strokeWidth={1.8} />,
    },
    {
      label: t('hr'),
      href: '/rh',
      icon: <Building2 size={19} strokeWidth={1.8} />,
    },
    {
      label: t('signatures'),
      href: '/signatures',
      icon: <PenTool size={19} strokeWidth={1.8} />,
    },
    {
      label: t('documents'),
      href: '/documents',
      icon: <FolderOpen size={19} strokeWidth={1.8} />,
    },
    {
      label: t('gallery'),
      href: '/galerie',
      icon: <Image size={19} strokeWidth={1.8} />,
    },
    {
      label: 'Administration',
      href: '/admin',
      icon: <Shield size={19} strokeWidth={1.8} />,
      adminOnly: true,
    },
  ];

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/(fr|pt)/, '') || '/';
    if (href === '/') return cleanPath === '/';
    return cleanPath.startsWith(href);
  };

  const displayName = user
    ? `${user.first_name} ${user.last_name}`
    : 'Utilisateur';
  const roleLabel = getRoleLabel(user?.role);
  const initials = user
    ? getInitials(user.first_name, user.last_name)
    : 'IN';

  return (
    <aside className="hidden w-[260px] flex-shrink-0 lg:flex lg:flex-col bg-gradient-to-b from-[#070E1A] via-sidebar to-sidebar-light shadow-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/[0.06]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dark shadow-md">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">INNOVTEC</h1>
          <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">R&eacute;seaux</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
        <ul className="space-y-0.5">
          {visibleNavItems.map((item) => (
            <li key={item.href}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.href)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive(item.href)
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronDown
                      size={15}
                      className={cn(
                        'transition-transform duration-200',
                        expandedSections.includes(item.href) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedSections.includes(item.href) && (
                    <ul className="mt-1 ml-4 space-y-0.5 border-l border-white/[0.06] pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
                              isActive(child.href)
                                ? 'bg-primary/20 text-primary-light'
                                : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                            )}
                          >
                            {child.icon}
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-white/[0.08] text-white shadow-sm'
                      : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80',
                    item.adminOnly && 'border-t border-white/[0.06] mt-3 pt-3'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <Link href="/profil" className="flex-1 flex items-center gap-3 min-w-0 rounded-xl p-1.5 -ml-1.5 hover:bg-white/[0.04] transition-colors">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
              />
            ) : (
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white flex-shrink-0 ring-2 ring-white/10',
                user ? getAvatarGradient(displayName) : 'from-primary to-primary-light'
              )}>
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5',
                user?.role === 'admin' && 'bg-red-500/15 text-red-300',
                user?.role === 'directeur' && 'bg-blue-500/15 text-blue-300',
                user?.role === 'manager' && 'bg-amber-500/15 text-amber-300',
                (!user?.role || user?.role === 'collaborateur') && 'bg-emerald-500/15 text-emerald-300'
              )}>
                {roleLabel}
              </span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
            title={tCommon('logout')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
