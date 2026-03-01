import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DbCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  total_visits: number;
  total_spent: number;
  last_visit: string | null;
  points: number;
  tier: string;
  favorite_item: string | null;
  created_at: string;
}

export interface DbCoupon {
  id: string;
  code: string;
  discount: string;
  usage_count: number;
  status: string;
  created_at: string;
}

export function useCustomers() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('customers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('customers').select('*').order('total_spent', { ascending: false });
      if (error) throw error;
      return (data || []) as DbCustomer[];
    },
  });
}

export function useCoupons() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('coupons-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => {
        queryClient.invalidateQueries({ queryKey: ['coupons'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DbCoupon[];
    },
  });
}

export function useAddCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: { code: string; discount: string }) => {
      const { error } = await (supabase as any).from('coupons').insert(coupon);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
}
