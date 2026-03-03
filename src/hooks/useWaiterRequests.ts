import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface WaiterRequest {
  id: string;
  table_id: number;
  request_type: string;
  note: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

/** Labels for each request type (used in admin UI) */
export const REQUEST_TYPE_LABELS: Record<string, string> = {
  water: 'Refill Water',
  bill: 'Bring Bill',
  silverware: 'Silverware',
  help: 'Need Help',
};

// ── Customer side ──────────────────────────────────────────────

export function useCreateWaiterRequest() {
  return useMutation({
    mutationFn: async ({
      tableId,
      requestType,
      note,
    }: {
      tableId: number;
      requestType: string | null;
      note: string;
    }) => {
      const { data, error } = await supabase
        .from('waiter_requests')
        .insert({
          table_id: tableId,
          request_type: requestType || 'help',
          note: note.trim() || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as WaiterRequest;
    },
  });
}

// ── Admin side ─────────────────────────────────────────────────

/**
 * Fetches all pending/acknowledged waiter requests with Supabase
 * Realtime subscription so the list updates instantly.
 */
export function useWaiterRequests() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('waiter-requests-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waiter_requests' },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['waiter-requests'],
            exact: false,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['waiter-requests', 'active'],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waiter_requests')
        .select('*')
        .in('status', ['pending', 'acknowledged'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WaiterRequest[];
    },
  });
}

/**
 * Mutation to acknowledge or resolve a waiter request.
 */
export function useUpdateWaiterRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'acknowledged' | 'resolved';
    }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('waiter_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['waiter-requests'],
        exact: false,
      });
    },
  });
}
