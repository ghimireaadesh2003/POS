import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DbReservation {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  party_size: number;
  table_id: number | null;
  reservation_date: string;
  time_slot: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export function useReservations() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('reservations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('reservations')
        .select('*')
        .gte('reservation_date', new Date().toISOString().split('T')[0])
        .order('reservation_date')
        .order('time_slot');
      if (error) throw error;
      return (data || []) as DbReservation[];
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reservation: Omit<DbReservation, 'id' | 'created_at' | 'status'>) => {
      const { error } = await (supabase as any).from('reservations').insert(reservation);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from('reservations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });
}
