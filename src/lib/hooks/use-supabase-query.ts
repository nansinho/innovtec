'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseQueryOptions {
  enabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSupabaseQuery<T = any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryFn: (supabase: ReturnType<typeof createClient>) => PromiseLike<{ data: any; error: any }>,
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
      setData(result.data as T);
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
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
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
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
