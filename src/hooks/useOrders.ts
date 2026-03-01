import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import type { CartItem } from '@/data/mockData';

export interface DbOrder {
  id: string;
  order_number: string;
  table_id: number | null;
  status: string;
  total: number;
  type: string;
  customer_name: string | null;
  created_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
  modifiers: unknown;
  special_instructions: string | null;
}

export const ORDER_STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  sent: { label: 'Sent', color: 'text-info', bg: 'bg-info/10' },
  preparing: { label: 'Preparing', color: 'text-warning', bg: 'bg-warning/10' },
  ready: { label: 'Ready', color: 'text-success', bg: 'bg-success/10' },
  served: { label: 'Served', color: 'text-primary', bg: 'bg-primary/10' },
  billing: { label: 'Billing', color: 'text-warning', bg: 'bg-warning/10' },
  paid: { label: 'Paid', color: 'text-success', bg: 'bg-success/10' },
  cancelled: { label: 'Cancelled', color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function useOrders() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DbOrder[];
    },
  });
}

export function useOrderItems(orderId?: string) {
  return useQuery({
    queryKey: ['orders', 'items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (error) throw error;
      return data as DbOrderItem[];
    },
    enabled: !!orderId,
  });
}

export function useOrdersWithItems() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('orders-with-items-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['orders', 'with-items', 'live'],
    queryFn: async () => {
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['sent', 'preparing', 'ready', 'served'])
        .order('created_at', { ascending: true });
      if (ordersErr) throw ordersErr;

      const orderIds = (orders || []).map(o => o.id);
      if (orderIds.length === 0) return [];

      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      if (itemsErr) throw itemsErr;

      return (orders as DbOrder[]).map(order => ({
        ...order,
        items: (items as DbOrderItem[]).filter(i => i.order_id === order.id),
      }));
    },
  });
}

export function useTableOrdersWithItems(tableNumber?: number, orderIds: string[] = []) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Basic table-level real-time
    const tableId = tableNumber || 0;
    const channel = supabase
      .channel(`table-${tableId}-session-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders', 'table', tableId] });
        queryClient.invalidateQueries({ queryKey: ['orders', 'session', orderIds] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, tableNumber, orderIds]);

  return useQuery({
    queryKey: ['orders', 'table', tableNumber || 0, orderIds],
    queryFn: async () => {
      let query = supabase.from('orders').select('*');
      
      if (tableNumber && tableNumber > 0 && orderIds.length > 0) {
        // Fetch both table's active orders AND specific session orders
        query = query.or(`table_id.eq.${tableNumber},id.in.(${orderIds.map(id => `"${id}"`).join(',')})`);
      } else if (tableNumber && tableNumber > 0) {
        query = query.eq('table_id', tableNumber);
      } else if (orderIds.length > 0) {
        query = query.in('id', orderIds);
      } else {
        return [];
      }

      const { data: orders, error: ordersErr } = await query
        .in('status', ['sent', 'preparing', 'ready', 'served', 'billing', 'paid'])
        .order('created_at', { ascending: false });
      
      if (ordersErr) throw ordersErr;
      if (!orders || orders.length === 0) return [];

      const foundOrderIds = orders.map(o => o.id);
      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', foundOrderIds);
      
      if (itemsErr) throw itemsErr;

      return (orders as DbOrder[]).map(order => ({
        ...order,
        items: (items as DbOrderItem[]).filter(i => i.order_id === order.id),
      }));
    },
    enabled: (tableNumber !== undefined && tableNumber > 0) || orderIds.length > 0,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId, items, total }: { tableId: number; items: CartItem[]; total: number }) => {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          table_id: tableId > 0 ? tableId : null,
          total,
          type: 'dine-in',
          status: 'sent',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        name: item.menuItem.name,
        price: Number(item.menuItem.price),
        quantity: item.quantity,
        modifiers: item.modifiers,
        special_instructions: item.specialInstructions || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      // Hierarchical invalidation
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: (data, variables) => {
      // Hierarchical invalidation for all orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateTableOrdersStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId, status }: { tableId: number; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('table_id', tableId)
        .in('status', ['sent', 'preparing', 'ready', 'served']); // Only update active ones
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
