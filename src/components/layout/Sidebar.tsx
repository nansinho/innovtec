'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['qse']);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const navItems: NavItem[] = [
    {
      label: t('dashboard'),
      href: '/',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: t('news'),
      href: '/actualites',
      icon: <Newspaper size={20} />,
    },
    {
      label: t('qse'),
      href: '/qse',
      icon: <ShieldCheck size={20} />,
      children: [
        { label: t('qsePolicy'), href: '/qse/politique', icon: <FileText size={18} /> },
        { label: t('bestPractices'), href: '/qse/bonnes-pratiques', icon: <Lightbulb size={18} /> },
        { label: t('dangerousSituations'), href: '/qse/situations-dangereuses', icon: <AlertTriangle size={18} /> },
        { label: t('actionPlans'), href: '/qse/plans-actions', icon: <ClipboardList size={18} /> },
        { label: t('rex'), href: '/qse/rex', icon: <Lightbulb size={18} /> },
        { label: t('sseTable'), href: '/qse/tableau-sse', icon: <BarChart3 size={18} /> },
      ],
    },
    {
      label: t('team'),
      href: '/trombinoscope',
      icon: <Users size={20} />,
    },
    {
      label: t('planning'),
      href: '/planning',
      icon: <Calendar size={20} />,
    },
    {
      label: t('formations'),
      href: '/formations',
      icon: <GraduationCap size={20} />,
    },
    {
      label: t('hr'),
      href: '/rh',
      icon: <Building2 size={20} />,
    },
    {
      label: t('signatures'),
      href: '/signatures',
      icon: <PenTool size={20} />,
    },
    {
      label: t('documents'),
      href: '/documents',
      icon: <FolderOpen size={20} />,
    },
    {
      label: t('gallery'),
      href: '/galerie',
      icon: <Image size={20} />,
    },
  ];

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/(fr|pt)/, '') || '/';
    if (href === '/') return cleanPath === '/';
    return cleanPath.startsWith(href);
  };

  return (
    <aside className="hidden w-[260px] flex-shrink-0 lg:flex lg:flex-col bg-gradient-to-b from-sidebar to-sidebar-light shadow-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dark">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">INNOVTEC</h1>
          <p className="text-[10px] text-white/50 font-medium tracking-widest uppercase">Réseaux</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.href)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive(item.href)
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'transition-transform duration-200',
                        expandedSections.includes(item.href) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedSections.includes(item.href) && (
                    <ul className="mt-1 ml-4 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                              isActive(child.href)
                                ? 'bg-primary/20 text-primary-light'
                                : 'text-white/50 hover:bg-white/5 hover:text-white/80'
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
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive(item.href)
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/90'
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
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-xs font-bold text-white">
            IN
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Utilisateur</p>
            <p className="text-xs text-white/50 truncate">Directeur</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
