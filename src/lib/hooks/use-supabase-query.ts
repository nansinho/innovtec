'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseQueryOptions {
  enabled?: boolean;
}

export function useSupabaseQuery<T>(
  queryFn: (supabase: ReturnType<typeof createClient>) => Promise<{ data: T | null; error: Error | null }>,
  deps: unknown[] = [],
  options: UseQueryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { enabled = true } = options;

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const result = await queryFn(supabase);
    if (result.error) {
      setError(result.error.message);
    } else {
      setData(result.data);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}

export function useCurrentUser() {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    role: string | null;
    position: string | null;
    phone: string | null;
    team_id: string | null;
    date_of_birth: string | null;
    birth_place: string | null;
    nationality: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    employment_start_date: string | null;
    contract_type: string | null;
    bio: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        refetch();
      }
    });

    return () => subscription.unsubscribe();
  }, [refetch]);

  return { user, loading, refetch };
}
