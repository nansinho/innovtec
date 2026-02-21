'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

interface PageBannerProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  overlapping?: boolean;
}

export function PageBanner({ icon: Icon, title, subtitle, children, overlapping = false }: PageBannerProps) {
  if (overlapping) {
    return (
      <div className="relative overflow-hidden -mx-6 md:-mx-8 -mt-6 sm:-mt-[3.75rem] z-10 bg-gradient-to-br from-[#060E1F] via-[#0B1A3E] to-[#0F2A5E] pb-32 pt-5 sm:pt-4 px-6 md:px-10 text-white">
        {/* Grid pattern overlay */}
        <div className="banner-grid absolute inset-0" />

        {/* Gradient orbs */}
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(76,154,255,0.4) 0%, transparent 70%)' }} />
        <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(0,82,204,0.5) 0%, transparent 70%)' }} />
        <div className="absolute right-1/3 top-0 h-[300px] w-[300px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(76,154,255,0.3) 0%, transparent 70%)' }} />

        {/* Dot patterns */}
        <div className="absolute right-8 md:right-16 top-6 grid grid-cols-6 gap-3 opacity-30">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
          ))}
        </div>
        <div className="absolute left-8 bottom-20 grid grid-cols-4 gap-2.5 opacity-15">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-white" />
          ))}
        </div>

        {/* Breadcrumb - inside the banner on desktop */}
        <div className="hidden sm:block relative z-10 max-w-content mx-auto mb-5">
          <Breadcrumb variant="dark" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-content mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
      </div>
    );
  }

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
