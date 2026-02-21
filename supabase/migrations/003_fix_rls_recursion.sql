-- =============================================
-- Migration: 003_fix_rls_recursion
-- Fix: profiles_admin policy causes infinite
-- recursion (self-referencing RLS on profiles)
-- =============================================

-- 1) Create SECURITY DEFINER function to bypass RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2) Fix profiles_admin policy (was self-referencing → infinite recursion)
DROP POLICY IF EXISTS "profiles_admin" ON profiles;
CREATE POLICY "profiles_admin" ON profiles
  FOR ALL USING (public.is_admin());

-- 3) Fix diplomas_admin and experiences_admin to use same function
DROP POLICY IF EXISTS "diplomas_admin" ON diplomas;
CREATE POLICY "diplomas_admin" ON diplomas
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "experiences_admin" ON experiences;
CREATE POLICY "experiences_admin" ON experiences
  FOR ALL USING (public.is_admin());
