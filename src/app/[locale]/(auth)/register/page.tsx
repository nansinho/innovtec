'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'));
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError(t('emailAlreadyUsed'));
      } else {
        setError(authError.message);
      }
      setIsLoading(false);
      return;
    }

    setSuccess(t('registrationSuccess'));
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
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
          <h2 className="text-2xl font-bold text-text-primary">{t('registerTitle')}</h2>
          <p className="text-sm text-text-secondary mt-2">{t('registerSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-semibold text-text-primary mb-1.5">
                  {t('firstName')}
                </label>
                <input
                  id="first_name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-semibold text-text-primary mb-1.5">
                  {t('lastName')}
                </label>
                <input
                  id="last_name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="input"
                  required
                />
              </div>
            </div>

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
              />
            </div>

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
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">{t('passwordHint')}</p>
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('confirmPassword')}
              </label>
              <input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t('registering')}
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  {t('registerButton')}
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              {t('backToLogin')}
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            {t('hasAccount')}{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
              {t('loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
