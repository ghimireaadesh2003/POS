import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DbTable {
  id: number;
  seats: number;
  status: string;
  current_order: string | null;
  revenue: number;
  avg_dine_time: number;
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tableId, status }: { tableId: number; status: string }) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status })
        .eq('id', tableId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useUpdateTableRevenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tableId, revenue }: { tableId: number; revenue: number }) => {
      // 1. Get current revenue
      const { data: tableData } = await supabase.from('restaurant_tables').select('revenue').eq('id', tableId).single();
      const newRevenue = (Number(tableData?.revenue || 0)) + revenue;

      // 2. Update table revenue and set to free
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ revenue: newRevenue, status: 'free' })
        .eq('id', tableId);
      if (tableError) throw tableError;

      // 3. Mark all active orders for this table as 'paid'
      const { error: ordersError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('table_id', tableId)
        .in('status', ['sent', 'preparing', 'ready', 'served', 'billing']);
      
      if (ordersError) throw ordersError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useTables() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('tables-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, () => {
        queryClient.invalidateQueries({ queryKey: ['tables'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('id');
      if (error) throw error;
      return data as DbTable[];
    },
  });
}
