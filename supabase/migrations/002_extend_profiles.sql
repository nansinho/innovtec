-- ============================================
-- Migration: 002_extend_profiles
-- Extend profiles for complete employee file
-- Add diplomas and experiences tables
-- ============================================

-- Add new columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_place TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_start_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contract_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- ============================================
-- DIPLOMAS
-- ============================================
CREATE TABLE IF NOT EXISTS diplomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  institution TEXT,
  year INTEGER,
  field_of_study TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diplomas_profile ON diplomas(profile_id);

-- ============================================
-- EXPERIENCES
-- ============================================
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  position TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_profile ON experiences(profile_id);

-- ============================================
-- RLS for diplomas
-- ============================================
ALTER TABLE diplomas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diplomas_select_own" ON diplomas
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "diplomas_insert_own" ON diplomas
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "diplomas_update_own" ON diplomas
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "diplomas_delete_own" ON diplomas
  FOR DELETE USING (profile_id = auth.uid());

CREATE POLICY "diplomas_admin" ON diplomas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RLS for experiences
-- ============================================
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiences_select_own" ON experiences
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "experiences_insert_own" ON experiences
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "experiences_update_own" ON experiences
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "experiences_delete_own" ON experiences
  FOR DELETE USING (profile_id = auth.uid());

CREATE POLICY "experiences_admin" ON experiences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
