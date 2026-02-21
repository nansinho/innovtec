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
  { key: 'qsePolicy', href: '/qse/politique', icon: ShieldCheck, gradient: 'from-blue-500/15 to-blue-600/15', iconColor: 'text-blue-600', hoverBorder: 'hover:border-blue-200' },
  { key: 'teamDirectory', href: '/trombinoscope', icon: Users, gradient: 'from-emerald-500/15 to-emerald-600/15', iconColor: 'text-emerald-600', hoverBorder: 'hover:border-emerald-200' },
  { key: 'trainings', href: '/formations', icon: GraduationCap, gradient: 'from-sky-500/15 to-sky-600/15', iconColor: 'text-sky-600', hoverBorder: 'hover:border-sky-200' },
  { key: 'signDocument', href: '/signatures', icon: PenTool, gradient: 'from-amber-500/15 to-amber-600/15', iconColor: 'text-amber-600', hoverBorder: 'hover:border-amber-200' },
  { key: 'declareRex', href: '/qse/rex', icon: Lightbulb, gradient: 'from-teal-500/15 to-teal-600/15', iconColor: 'text-teal-600', hoverBorder: 'hover:border-teal-200' },
  { key: 'viewPlanning', href: '/planning', icon: Calendar, gradient: 'from-cyan-500/15 to-cyan-600/15', iconColor: 'text-cyan-600', hoverBorder: 'hover:border-cyan-200' },
];

export function QuickAccess() {
  const t = useTranslations('dashboard');

  return (
    <div className="card-elevated p-6 h-full opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <h2 className="text-base font-bold text-text-primary tracking-tight mb-5">{t('quickAccess')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickLinks.map(({ key, href, icon: Icon, gradient, iconColor, hoverBorder }) => (
          <Link
            key={key}
            href={href}
            className={`group flex flex-col items-center gap-3 p-4 rounded-xl border border-border-light/40 bg-background/30 text-center hover:-translate-y-0.5 hover:bg-white hover:shadow-sm transition-all ${hoverBorder}`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} ${iconColor} group-hover:scale-110 transition-all duration-300`}>
              <Icon size={22} strokeWidth={1.7} />
            </div>
            <span className="text-[11px] font-semibold text-text-secondary group-hover:text-text-primary transition-colors leading-tight">
              {t(key)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
