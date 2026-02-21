'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { User, Lock, Save, Check } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/use-supabase-query';
import { createClient } from '@/lib/supabase/client';
import { cn, getInitials, getAvatarGradient, getRoleLabel, getRoleBadgeClass } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { POSITIONS } from '@/lib/constants';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user, loading } = useCurrentUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [saving, setSaving] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setPosition(user.position || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        position: position || null,
      })
      .eq('id', user.id);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast(t('profileUpdated'), 'success');
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }

    setChangingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast(error.message, 'error');
    } else {
      toast(t('passwordUpdated'), 'success');
      setNewPassword('');
      setConfirmPassword('');
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : '';
  const initials = user ? getInitials(user.first_name, user.last_name) : '';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white',
            user ? getAvatarGradient(displayName) : 'from-primary to-primary-light'
          )}>
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{displayName}</h2>
            <p className="text-sm text-text-secondary">{user?.email}</p>
            <span className={cn('badge mt-1', getRoleBadgeClass(user?.role))}>
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'info'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            )}
          >
            <User size={16} />
            {t('personalInfo')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            )}
          >
            <Lock size={16} />
            {t('security')}
          </button>
        </div>

        {/* Personal info tab */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  {t('personalInfo')} - Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('phone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('position')}
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="input"
              >
                <option value="">{t('selectPosition')}</option>
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('role')}
              </label>
              <div className="flex items-center gap-3 rounded-button border border-border bg-gray-50 px-4 py-2.5">
                <span className={cn('badge', getRoleBadgeClass(user?.role))}>
                  {getRoleLabel(user?.role)}
                </span>
                <span className="text-xs text-text-muted">
                  {t('roleDefinedByAdmin')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {t('updateProfile')}
                </>
              )}
            </button>
          </form>
        )}

        {/* Security tab */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-text-muted">Minimum 8 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('confirmNewPassword')}
              </label>
              <input
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
              disabled={changingPassword}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {changingPassword ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Check size={16} />
                  {t('updatePassword')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
