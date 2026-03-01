import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DbInventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  min_stock: number;
  max_stock: number;
  cost_per_unit: number;
  last_restocked: string;
  daily_usage: number;
  waste: number;
  created_at: string;
}

export function useInventory() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('inventory-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('inventory_items').select('*').order('name');
      if (error) throw error;
      return (data || []) as DbInventoryItem[];
    },
  });
}

export function useAddInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<DbInventoryItem, 'id' | 'created_at'>) => {
      const { error } = await (supabase as any).from('inventory_items').insert(item);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbInventoryItem> & { id: string }) => {
      const { error } = await (supabase as any).from('inventory_items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('inventory_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
}
