'use client';

import { type LucideIcon } from 'lucide-react';

interface PageBannerProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // for action buttons on the right
}

export function PageBanner({ icon: Icon, title, subtitle, children }: PageBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-card-lg bg-gradient-to-br from-[#060E1F] via-[#0B1A3E] to-[#0F2A5E] p-6 md:p-8 text-white shadow-banner">
      <div className="banner-grid absolute inset-0" />
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 animate-float" />
      <div className="absolute left-1/4 bottom-0 h-32 w-32 rounded-full bg-white/5 animate-float-slow" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-md border border-white/15"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <Icon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}
