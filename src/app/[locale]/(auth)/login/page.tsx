'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Supabase auth
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark">
          <Zap size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-wide">INNOVTEC</h1>
          <p className="text-[10px] text-text-muted font-medium tracking-[0.3em] uppercase">Réseaux</p>
        </div>
      </div>

      <div className="card p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary">{t('loginTitle')}</h2>
          <p className="text-sm text-text-secondary mt-2">{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@innovtec.fr"
              className="input"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-secondary">{t('rememberMe')}</span>
            </label>
            <button type="button" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              {t('forgotPassword')}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {t('loggingIn')}
              </>
            ) : (
              <>
                <LogIn size={16} />
                {t('loginButton')}
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-text-muted mt-6">
        INNOVTEC Réseaux &copy; {new Date().getFullYear()} — Intranet de direction
      </p>
    </div>
  );
}
