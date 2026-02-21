-- =============================================
-- Migration 004: Formations RLS Policies
-- Add write policies for formations management
-- =============================================

-- Helper function: checks if user has admin, directeur, or manager role
-- Uses SECURITY DEFINER to bypass RLS (same pattern as is_admin in migration 003)
CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'directeur', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Formations: INSERT/UPDATE/DELETE for admin/directeur/manager
CREATE POLICY "formations_insert" ON formations
  FOR INSERT WITH CHECK (public.is_manager_or_above());

CREATE POLICY "formations_update" ON formations
  FOR UPDATE USING (public.is_manager_or_above());

CREATE POLICY "formations_delete" ON formations
  FOR DELETE USING (public.is_manager_or_above());

-- Formation enrollments: UPDATE/DELETE for admin/directeur/manager
CREATE POLICY "enrollments_update_admin" ON formation_enrollments
  FOR UPDATE USING (public.is_manager_or_above());

CREATE POLICY "enrollments_delete_admin" ON formation_enrollments
  FOR DELETE USING (public.is_manager_or_above());
