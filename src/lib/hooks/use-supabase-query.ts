'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

/**
 * Subscribe to real-time changes on a Supabase table.
 * Calls `onUpdate` whenever an INSERT, UPDATE, or DELETE occurs.
 */
export function useRealtimeSubscription(
  table: string,
  onUpdate: () => void,
  options: { event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'; filter?: string } = {}
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const supabase = createClient();
    const event = options.event || '*';

    const channelConfig: Record<string, unknown> = {
      event,
      schema: 'public',
      table,
    };
    if (options.filter) {
      channelConfig.filter = options.filter;
    }

    const channel = supabase
      .channel(`realtime-${table}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes' as any,
        channelConfig as any,
        () => {
          onUpdateRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, options.event, options.filter]);
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
        .maybeSingle();

      if (!profile) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.id,
            email: authUser.email || '',
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || '',
          })
          .select('*')
          .single();
        if (newProfile) setUser(newProfile);
      } else {
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

  useRealtimeSubscription('profiles', refetch);

  return { user, loading, refetch };
}
