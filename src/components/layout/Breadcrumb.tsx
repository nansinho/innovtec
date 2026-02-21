'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  actualites: 'news',
  qse: 'qse',
  politique: 'qsePolicy',
  'bonnes-pratiques': 'bestPractices',
  'situations-dangereuses': 'dangerousSituations',
  'plans-actions': 'actionPlans',
  rex: 'rex',
  'tableau-sse': 'sseTable',
  trombinoscope: 'team',
  planning: 'planning',
  formations: 'formations',
  rh: 'hr',
  signatures: 'signatures',
  documents: 'documents',
  galerie: 'gallery',
  profil: 'profile',
  admin: 'admin',
  'tableau-de-bord-2': 'dashboardV2',
};

function isUuidOrId(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
    || /^\d+$/.test(segment);
}

interface BreadcrumbProps {
  variant?: 'light' | 'dark';
}

export function Breadcrumb({ variant = 'light' }: BreadcrumbProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  // Strip locale prefix
  const cleanPath = pathname.replace(/^\/(fr|pt)/, '') || '/';

  // Don't show breadcrumb on dashboard
  if (cleanPath === '/') return null;

  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs: { label: string; href: string }[] = [];

  let cumulativePath = '';
  for (const segment of segments) {
    cumulativePath += `/${segment}`;

    if (isUuidOrId(segment)) {
      crumbs.push({ label: 'Détail', href: cumulativePath });
    } else {
      const translationKey = ROUTE_LABELS[segment];
      const label = translationKey ? t(translationKey) : segment;
      crumbs.push({ label, href: cumulativePath });
    }
  }

  const isDark = variant === 'dark';

  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Fil d'Ariane">
      <Link
        href="/"
        className={cn(
          'flex items-center gap-1 transition-colors',
          isDark ? 'text-white/40 hover:text-white/70' : 'text-text-muted hover:text-primary'
        )}
      >
        <Home size={14} />
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <div key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight size={12} className={isDark ? 'text-white/25' : 'text-text-muted/50'} />
            {isLast ? (
              <span className={cn('font-medium', isDark ? 'text-white/70' : 'text-text-primary')}>{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className={cn(
                  'transition-colors',
                  isDark ? 'text-white/40 hover:text-white/70' : 'text-text-muted hover:text-primary'
                )}
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
