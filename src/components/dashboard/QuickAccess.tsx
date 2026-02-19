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
  { key: 'qsePolicy', href: '/qse/politique', icon: ShieldCheck, color: 'from-blue-500 to-blue-600' },
  { key: 'teamDirectory', href: '/trombinoscope', icon: Users, color: 'from-emerald-500 to-emerald-600' },
  { key: 'trainings', href: '/formations', icon: GraduationCap, color: 'from-purple-500 to-purple-600' },
  { key: 'signDocument', href: '/signatures', icon: PenTool, color: 'from-orange-500 to-orange-600' },
  { key: 'declareRex', href: '/qse/rex', icon: Lightbulb, color: 'from-pink-500 to-pink-600' },
  { key: 'viewPlanning', href: '/planning', icon: Calendar, color: 'from-cyan-500 to-cyan-600' },
];

export function QuickAccess() {
  const t = useTranslations('dashboard');

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
      <h2 className="text-lg font-bold text-text-primary mb-4">{t('quickAccess')}</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {quickLinks.map(({ key, href, icon: Icon, color }) => (
          <Link
            key={key}
            href={href}
            className="card group flex flex-col items-center gap-2.5 p-4 text-center hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
              <Icon size={22} />
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
