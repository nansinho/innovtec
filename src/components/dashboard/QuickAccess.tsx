'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  PenTool,
  Lightbulb,
  Calendar,
} from 'lucide-react';

const quickLinks = [
  { key: 'qsePolicy', href: '/qse/politique', icon: ShieldCheck, gradient: 'from-blue-500/10 to-blue-600/10', iconColor: 'text-blue-600', hoverBorder: 'hover:border-blue-200' },
  { key: 'teamDirectory', href: '/trombinoscope', icon: Users, gradient: 'from-emerald-500/10 to-emerald-600/10', iconColor: 'text-emerald-600', hoverBorder: 'hover:border-emerald-200' },
  { key: 'trainings', href: '/formations', icon: GraduationCap, gradient: 'from-purple-500/10 to-purple-600/10', iconColor: 'text-purple-600', hoverBorder: 'hover:border-purple-200' },
  { key: 'signDocument', href: '/signatures', icon: PenTool, gradient: 'from-orange-500/10 to-orange-600/10', iconColor: 'text-orange-600', hoverBorder: 'hover:border-orange-200' },
  { key: 'declareRex', href: '/qse/rex', icon: Lightbulb, gradient: 'from-pink-500/10 to-pink-600/10', iconColor: 'text-pink-600', hoverBorder: 'hover:border-pink-200' },
  { key: 'viewPlanning', href: '/planning', icon: Calendar, gradient: 'from-cyan-500/10 to-cyan-600/10', iconColor: 'text-cyan-600', hoverBorder: 'hover:border-cyan-200' },
];

export function QuickAccess() {
  const t = useTranslations('dashboard');

  return (
    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <h2 className="section-title mb-4">{t('quickAccess')}</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {quickLinks.map(({ key, href, icon: Icon, gradient, iconColor, hoverBorder }) => (
          <Link
            key={key}
            href={href}
            className={`card-elevated group flex flex-col items-center gap-3 p-4 text-center hover:-translate-y-1 ${hoverBorder}`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} ${iconColor} backdrop-blur-sm border border-white/60 group-hover:scale-110 transition-all duration-300`}>
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors leading-tight">
              {t(key)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
