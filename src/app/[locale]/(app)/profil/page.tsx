'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import {
  User, Lock, Save, Check, Briefcase, GraduationCap, BookOpen,
  Plus, Pencil, Trash2, Calendar, MapPin, Phone, Shield, Clock,
  Building2, X, Camera,
} from 'lucide-react';
import { useCurrentUser, useSupabaseQuery } from '@/lib/hooks/use-supabase-query';
import { createClient } from '@/lib/supabase/client';
import { cn, getInitials, getAvatarGradient, getRoleLabel, getRoleBadgeClass, calculateSeniority, formatDateShort } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { POSITIONS, CONTRACT_TYPES, EMERGENCY_RELATIONSHIPS } from '@/lib/constants';
import type { Diploma, Experience, FormationEnrollment } from '@/lib/types';

type ProfileTab = 'info' | 'career' | 'diplomas' | 'experiences' | 'formations' | 'security';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user, loading, refetch } = useCurrentUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');

  // ─── Personal Info form ───
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [nationality, setNationality] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  // ─── Career form ───
  const [position, setPosition] = useState('');
  const [contractType, setContractType] = useState('');
  const [employmentStartDate, setEmploymentStartDate] = useState('');
  const [bio, setBio] = useState('');
  const [savingCareer, setSavingCareer] = useState(false);

  // ─── Diplomas ───
  const [editingDiploma, setEditingDiploma] = useState<string | null>(null);
  const [diplomaForm, setDiplomaForm] = useState({ title: '', institution: '', year: '', field_of_study: '' });
  const [savingDiploma, setSavingDiploma] = useState(false);

  // ─── Experiences ───
  const [editingExperience, setEditingExperience] = useState<string | null>(null);
  const [experienceForm, setExperienceForm] = useState({ company: '', position: '', start_date: '', end_date: '', description: '', is_current: false });
  const [savingExperience, setSavingExperience] = useState(false);

  // ─── Avatar upload ───
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ─── Security ───
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // ─── Data queries ───
  const { data: diplomas, refetch: refetchDiplomas } = useSupabaseQuery<Diploma[]>(
    async (supabase) => await supabase.from('diplomas').select('*').eq('profile_id', user?.id ?? '').order('year', { ascending: false }),
    [user?.id],
    { enabled: !!user?.id }
  );

  const { data: experiences, refetch: refetchExperiences } = useSupabaseQuery<Experience[]>(
    async (supabase) => await supabase.from('experiences').select('*').eq('profile_id', user?.id ?? '').order('start_date', { ascending: false }),
    [user?.id],
    { enabled: !!user?.id }
  );

  const { data: enrollments } = useSupabaseQuery<FormationEnrollment[]>(
    async (supabase) => await supabase
      .from('formation_enrollments')
      .select('*, formation:formations(*)')
      .eq('user_id', user?.id ?? '')
      .order('enrolled_at', { ascending: false }),
    [user?.id],
    { enabled: !!user?.id }
  );

  // Populate forms from user data
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.date_of_birth || '');
      setBirthPlace(user.birth_place || '');
      setNationality(user.nationality || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setPostalCode(user.postal_code || '');
      setEmergencyName(user.emergency_contact_name || '');
      setEmergencyPhone(user.emergency_contact_phone || '');
      setEmergencyRelationship(user.emergency_contact_relationship || '');
      setPosition(user.position || '');
      setContractType(user.contract_type || '');
      setEmploymentStartDate(user.employment_start_date || '');
      setBio(user.bio || '');
    }
  }, [user]);

  // ─── Handlers ───

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast('Veuillez s\u00e9lectionner une image', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('L\'image ne doit pas d\u00e9passer 5 Mo', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refetch();
      toast('Photo de profil mise \u00e0 jour', 'success');
    } catch {
      toast('Erreur lors du t\u00e9l\u00e9chargement de la photo', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdatePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingInfo(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        birth_place: birthPlace || null,
        nationality: nationality || null,
        address: address || null,
        city: city || null,
        postal_code: postalCode || null,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
        emergency_contact_relationship: emergencyRelationship || null,
      })
      .eq('id', user.id);

    if (error) {
      toast(error.message, 'error');
    } else {
      await refetch();
      toast(t('profileUpdated'), 'success');
    }
    setSavingInfo(false);
  };

  const handleUpdateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingCareer(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        position: position || null,
        contract_type: contractType || null,
        employment_start_date: employmentStartDate || null,
        bio: bio || null,
      })
      .eq('id', user.id);

    if (error) {
      toast(error.message, 'error');
    } else {
      await refetch();
      toast(t('profileUpdated'), 'success');
    }
    setSavingCareer(false);
  };

  const handleSaveDiploma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingDiploma(true);
    const supabase = createClient();
    const payload = {
      title: diplomaForm.title,
      institution: diplomaForm.institution || null,
      year: diplomaForm.year ? parseInt(diplomaForm.year) : null,
      field_of_study: diplomaForm.field_of_study || null,
    };

    if (editingDiploma === 'new') {
      const { error } = await supabase.from('diplomas').insert({ ...payload, profile_id: user.id });
      if (error) { toast(error.message, 'error'); }
      else { toast(t('saveSuccess'), 'success'); }
    } else {
      const { error } = await supabase.from('diplomas').update(payload).eq('id', editingDiploma!);
      if (error) { toast(error.message, 'error'); }
      else { toast(t('saveSuccess'), 'success'); }
    }

    setEditingDiploma(null);
    setDiplomaForm({ title: '', institution: '', year: '', field_of_study: '' });
    await refetchDiplomas();
    setSavingDiploma(false);
  };

  const handleDeleteDiploma = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    const supabase = createClient();
    const { error } = await supabase.from('diplomas').delete().eq('id', id);
    if (error) { toast(error.message, 'error'); }
    else { toast(t('deleteSuccess'), 'success'); await refetchDiplomas(); }
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingExperience(true);
    const supabase = createClient();
    const payload = {
      company: experienceForm.company,
      position: experienceForm.position || null,
      start_date: experienceForm.start_date || null,
      end_date: experienceForm.is_current ? null : (experienceForm.end_date || null),
      description: experienceForm.description || null,
    };

    if (editingExperience === 'new') {
      const { error } = await supabase.from('experiences').insert({ ...payload, profile_id: user.id });
      if (error) { toast(error.message, 'error'); }
      else { toast(t('saveSuccess'), 'success'); }
    } else {
      const { error } = await supabase.from('experiences').update(payload).eq('id', editingExperience!);
      if (error) { toast(error.message, 'error'); }
      else { toast(t('saveSuccess'), 'success'); }
    }

    setEditingExperience(null);
    setExperienceForm({ company: '', position: '', start_date: '', end_date: '', description: '', is_current: false });
    await refetchExperiences();
    setSavingExperience(false);
  };

  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    const supabase = createClient();
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) { toast(error.message, 'error'); }
    else { toast(t('deleteSuccess'), 'success'); await refetchExperiences(); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast(t('passwordMismatch'), 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast(t('passwordMinLength'), 'error');
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

  const startEditDiploma = (d: Diploma) => {
    setEditingDiploma(d.id);
    setDiplomaForm({
      title: d.title,
      institution: d.institution || '',
      year: d.year ? String(d.year) : '',
      field_of_study: d.field_of_study || '',
    });
  };

  const startEditExperience = (exp: Experience) => {
    setEditingExperience(exp.id);
    setExperienceForm({
      company: exp.company,
      position: exp.position || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      description: exp.description || '',
      is_current: !exp.end_date,
    });
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : '';
  const initials = user ? getInitials(user.first_name, user.last_name) : '';
  const seniority = calculateSeniority(user?.employment_start_date ?? null);

  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { key: 'info', icon: <User size={16} />, label: t('personalInfo') },
    { key: 'career', icon: <Briefcase size={16} />, label: t('career') },
    { key: 'diplomas', icon: <GraduationCap size={16} />, label: t('diplomas') },
    { key: 'experiences', icon: <Building2 size={16} />, label: t('experiences') },
    { key: 'formations', icon: <BookOpen size={16} />, label: t('trainings') },
    { key: 'security', icon: <Lock size={16} />, label: t('security') },
  ];

  const enrollmentStatusConfig: Record<string, { label: string; color: string }> = {
    inscrit: { label: 'Inscrit', color: 'bg-amber-50 text-amber-700' },
    en_cours: { label: 'En cours', color: 'bg-blue-50 text-blue-700' },
    termine: { label: 'Terminée', color: 'bg-emerald-50 text-emerald-700' },
    abandonne: { label: 'Abandonné', color: 'bg-gray-100 text-gray-500' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
      </div>

      <div className="card p-6">
        {/* ═══ Profile Header ═══ */}
        <div className="flex items-start gap-5 mb-6">
          <div className="relative flex-shrink-0 group">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white shadow-md"
              />
            ) : (
              <div className={cn(
                'flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white',
                user ? getAvatarGradient(displayName) : 'from-primary to-primary-light'
              )}>
                {initials}
              </div>
            )}
            <label className={cn(
              'absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
              uploadingAvatar && 'opacity-100'
            )}>
              {uploadingAvatar ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-primary">{displayName}</h2>
            <p className="text-sm text-text-secondary">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={cn('badge', getRoleBadgeClass(user?.role))}>
                {getRoleLabel(user?.role)}
              </span>
              {user?.position && (
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Briefcase size={12} /> {user.position}
                </span>
              )}
              {seniority && (
                <span className="badge bg-primary/10 text-primary">
                  <Clock size={12} className="mr-1" />
                  {t('seniorityValue', { years: seniority.years, months: seniority.months })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Tab Bar ═══ */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Tab: Personal Info ═══ */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdatePersonalInfo} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('firstName')}</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('lastName')}</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('dateOfBirth')}</label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('birthPlace')}</label>
                <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="input" placeholder="Bordeaux" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('nationality')}</label>
              <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} className="input" placeholder="Française" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('address')}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('city')}</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('postalCode')}</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="input" placeholder="33000" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('phone')}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+33 6 12 34 56 78" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('email')}</label>
              <input type="email" value={user?.email || ''} className="input bg-gray-50 cursor-not-allowed" disabled />
            </div>

            {/* Emergency Contact */}
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                <Shield size={18} className="text-danger" />
                {t('emergencyContact')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('emergencyContactName')}</label>
                  <input type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('emergencyContactPhone')}</label>
                  <input type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('emergencyContactRelationship')}</label>
                  <select value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} className="input">
                    <option value="">{t('selectRelationship')}</option>
                    {EMERGENCY_RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={savingInfo} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
              {savingInfo ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {t('saving')}</>
              ) : (
                <><Save size={16} /> {t('updateProfile')}</>
              )}
            </button>
          </form>
        )}

        {/* ═══ Tab: Career ═══ */}
        {activeTab === 'career' && (
          <form onSubmit={handleUpdateCareer} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('role')}</label>
              <div className="flex items-center gap-3 rounded-button border border-border bg-gray-50 px-4 py-2.5">
                <span className={cn('badge', getRoleBadgeClass(user?.role))}>
                  {getRoleLabel(user?.role)}
                </span>
                <span className="text-xs text-text-muted">{t('roleDefinedByAdmin')}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('position')}</label>
              <select value={position} onChange={(e) => setPosition(e.target.value)} className="input">
                <option value="">{t('selectPosition')}</option>
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('contractType')}</label>
              <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="input">
                <option value="">{t('selectContractType')}</option>
                {CONTRACT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('employmentStartDate')}</label>
              <input type="date" value={employmentStartDate} onChange={(e) => setEmploymentStartDate(e.target.value)} className="input" />
            </div>

            {seniority && (
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('seniority')}</label>
                <div className="flex items-center gap-3 rounded-button border border-border bg-gray-50 px-4 py-2.5">
                  <Clock size={16} className="text-primary" />
                  <span className="text-sm font-medium text-text-primary">
                    {t('seniorityValue', { years: seniority.years, months: seniority.months })}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('bio')}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input min-h-[120px] resize-y"
                placeholder={t('bioPlaceholder')}
              />
            </div>

            <button type="submit" disabled={savingCareer} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
              {savingCareer ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {t('saving')}</>
              ) : (
                <><Save size={16} /> {t('updateProfile')}</>
              )}
            </button>
          </form>
        )}

        {/* ═══ Tab: Diplomas ═══ */}
        {activeTab === 'diplomas' && (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">{t('diplomas')}</h3>
              {!editingDiploma && (
                <button
                  onClick={() => { setEditingDiploma('new'); setDiplomaForm({ title: '', institution: '', year: '', field_of_study: '' }); }}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> {t('addDiploma')}
                </button>
              )}
            </div>

            {/* Diploma form */}
            {editingDiploma && (
              <form onSubmit={handleSaveDiploma} className="card p-4 space-y-4 border-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('diplomaTitle')}</label>
                    <input type="text" value={diplomaForm.title} onChange={(e) => setDiplomaForm({ ...diplomaForm, title: e.target.value })} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('diplomaInstitution')}</label>
                    <input type="text" value={diplomaForm.institution} onChange={(e) => setDiplomaForm({ ...diplomaForm, institution: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('diplomaYear')}</label>
                    <input type="number" min="1950" max={new Date().getFullYear()} value={diplomaForm.year} onChange={(e) => setDiplomaForm({ ...diplomaForm, year: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('diplomaField')}</label>
                    <input type="text" value={diplomaForm.field_of_study} onChange={(e) => setDiplomaForm({ ...diplomaForm, field_of_study: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" disabled={savingDiploma} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-60">
                    {savingDiploma ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={14} />}
                    {t('updateProfile')}
                  </button>
                  <button type="button" onClick={() => setEditingDiploma(null)} className="btn-secondary inline-flex items-center gap-2 text-sm">
                    <X size={14} /> Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Diploma list */}
            {(!diplomas || diplomas.length === 0) && !editingDiploma && (
              <div className="py-12 text-center">
                <GraduationCap size={40} className="mx-auto text-text-muted/40 mb-3" />
                <p className="text-sm text-text-muted">{t('noDiplomas')}</p>
              </div>
            )}

            {diplomas && diplomas.map((d) => (
              <div key={d.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary">{d.title}</p>
                  <p className="text-sm text-text-secondary">
                    {[d.institution, d.year].filter(Boolean).join(' · ')}
                  </p>
                  {d.field_of_study && <p className="text-xs text-text-muted">{d.field_of_study}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEditDiploma(d)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteDiploma(d.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 text-text-muted hover:text-danger transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ Tab: Experiences ═══ */}
        {activeTab === 'experiences' && (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">{t('experiences')}</h3>
              {!editingExperience && (
                <button
                  onClick={() => { setEditingExperience('new'); setExperienceForm({ company: '', position: '', start_date: '', end_date: '', description: '', is_current: false }); }}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> {t('addExperience')}
                </button>
              )}
            </div>

            {/* Experience form */}
            {editingExperience && (
              <form onSubmit={handleSaveExperience} className="card p-4 space-y-4 border-primary/20">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('experienceCompany')}</label>
                  <input type="text" value={experienceForm.company} onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })} className="input" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('experiencePosition')}</label>
                    <input type="text" value={experienceForm.position} onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })} className="input" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                      <input
                        type="checkbox"
                        checked={experienceForm.is_current}
                        onChange={(e) => setExperienceForm({ ...experienceForm, is_current: e.target.checked, end_date: '' })}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-text-primary">{t('experienceCurrent')}</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('experienceStartDate')}</label>
                    <input type="date" value={experienceForm.start_date} onChange={(e) => setExperienceForm({ ...experienceForm, start_date: e.target.value })} className="input" />
                  </div>
                  {!experienceForm.is_current && (
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('experienceEndDate')}</label>
                      <input type="date" value={experienceForm.end_date} onChange={(e) => setExperienceForm({ ...experienceForm, end_date: e.target.value })} className="input" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('experienceDescription')}</label>
                  <textarea value={experienceForm.description} onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })} className="input min-h-[80px] resize-y" />
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" disabled={savingExperience} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-60">
                    {savingExperience ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={14} />}
                    {t('updateProfile')}
                  </button>
                  <button type="button" onClick={() => setEditingExperience(null)} className="btn-secondary inline-flex items-center gap-2 text-sm">
                    <X size={14} /> Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Experience list (timeline) */}
            {(!experiences || experiences.length === 0) && !editingExperience && (
              <div className="py-12 text-center">
                <Building2 size={40} className="mx-auto text-text-muted/40 mb-3" />
                <p className="text-sm text-text-muted">{t('noExperiences')}</p>
              </div>
            )}

            {experiences && experiences.map((exp, idx) => (
              <div key={exp.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-primary mt-1.5" />
                  {idx < experiences.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                </div>
                {/* Content */}
                <div className="flex-1 pb-6 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary">{exp.company}</p>
                      {exp.position && <p className="text-sm text-text-secondary">{exp.position}</p>}
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        {exp.start_date ? formatDateShort(exp.start_date) : '?'}
                        {' — '}
                        {exp.end_date ? formatDateShort(exp.end_date) : t('experienceCurrent')}
                      </p>
                      {exp.description && <p className="text-sm text-text-secondary mt-1 line-clamp-2">{exp.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => startEditExperience(exp)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteExperience(exp.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 text-text-muted hover:text-danger transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ Tab: Formations ═══ */}
        {activeTab === 'formations' && (
          <div className="max-w-2xl space-y-4">
            <h3 className="text-base font-semibold text-text-primary">{t('trainings')}</h3>

            {(!enrollments || enrollments.length === 0) && (
              <div className="py-12 text-center">
                <BookOpen size={40} className="mx-auto text-text-muted/40 mb-3" />
                <p className="text-sm text-text-muted">{t('noFormations')}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments && enrollments.map((enrollment) => {
                const formation = enrollment.formation;
                const statusConf = enrollmentStatusConfig[enrollment.status] || { label: enrollment.status, color: 'bg-gray-100 text-gray-500' };
                return (
                  <div key={enrollment.id} className="rounded-xl border border-border p-4 hover:border-primary/20 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-text-primary text-sm">{formation?.title || '—'}</p>
                      <span className={cn('badge text-[10px]', statusConf.color)}>{statusConf.label}</span>
                    </div>
                    {formation?.instructor && (
                      <p className="text-xs text-text-muted mb-2">{formation.instructor}</p>
                    )}
                    {formation?.duration_hours && (
                      <p className="text-xs text-text-muted mb-2">{formation.duration_hours}h</p>
                    )}
                    {enrollment.status === 'en_cours' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                          <span>{t('formationProgress')}</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {enrollment.certificate_url && enrollment.completed_at && (
                      <a
                        href={enrollment.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:underline"
                      >
                        <GraduationCap size={12} /> {t('formationCertificate')}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Tab: Security ═══ */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('newPassword')}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="input" required minLength={8} />
              <p className="mt-1 text-xs text-text-muted">{t('passwordMinLength')}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">{t('confirmNewPassword')}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="input" required minLength={8} />
            </div>
            <button type="submit" disabled={changingPassword} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
              {changingPassword ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {t('saving')}</>
              ) : (
                <><Check size={16} /> {t('updatePassword')}</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
