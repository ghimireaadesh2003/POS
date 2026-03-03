import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { CartItem } from "@/data/mockData";

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

export const ORDER_STATUS_STYLES: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  sent: { label: "Sent", color: "text-info", bg: "bg-info/10" },
  preparing: { label: "Preparing", color: "text-warning", bg: "bg-warning/10" },
  ready: { label: "Ready", color: "text-success", bg: "bg-success/10" },
  served: { label: "Served", color: "text-primary", bg: "bg-primary/10" },
  billing: { label: "Billing", color: "text-warning", bg: "bg-warning/10" },
  paid: { label: "Paid", color: "text-success", bg: "bg-success/10" },
  cancelled: {
    label: "Cancelled",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

/**
 * Centralized realtime listener for all order-related changes.
 * Updates the React Query cache instantly for simple lists,
 * and invalidates complex queries for consistency.
 */
export function useOrdersRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("orders-global-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Realtime order change received:", payload);
          // 1. Smart Cache Update for ['orders', 'all']
          queryClient.setQueryData(["orders", "all"], (old: DbOrder[] = []) => {
            if (payload.eventType === "INSERT") return [payload.new as DbOrder, ...old];
            if (payload.eventType === "UPDATE") {
              return old.map((o) => (o.id === payload.new.id ? (payload.new as DbOrder) : o));
            }
            if (payload.eventType === "DELETE") return old.filter((o) => o.id !== payload.old.id);
            return old;
          });

          // 2. Partial Invalidation for all other order queries
          queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        (payload) => {
          console.log("Realtime order_item change received:", payload);
          queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime Subscription Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders", "all"],
    staleTime: 30_000,
    gcTime: 1000 * 60 * 5, // 5 mins
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbOrder[];
    },
  });
}

export function useOrderItems(orderId?: string) {
  return useQuery({
    queryKey: ["orders", "items", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      if (error) throw error;
      return data as DbOrderItem[];
    },
    enabled: !!orderId,
  });
}

export function useOrdersWithItems() {
  return useQuery({
    queryKey: ["orders", "with-items", "live"],
    staleTime: 10_000, // Shorter stale time for "live" kitchen view
    queryFn: async () => {
      const { data: orders, error: ordersErr } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["sent", "preparing", "ready", "served"])
        .order("created_at", { ascending: true });
      if (ordersErr) throw ordersErr;

      const orderIds = (orders || []).map((o) => o.id);
      if (orderIds.length === 0) return [];

      const { data: items, error: itemsErr } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      if (itemsErr) throw itemsErr;

      return (orders as DbOrder[]).map((order) => ({
        ...order,
        items: (items as DbOrderItem[]).filter((i) => i.order_id === order.id),
      }));
    },
  });
}

export function useTableOrdersWithItems(
  tableNumber?: number,
  orderIds: string[] = [],
) {
  return useQuery({
    queryKey: ["orders", "table", tableNumber || 0, orderIds],
    staleTime: 30_000,
    queryFn: async () => {
      let query = supabase.from("orders").select("*");

      if (tableNumber && tableNumber > 0 && orderIds.length > 0) {
        // Fetch both table's active orders AND specific session orders
        const orderIdsStr = orderIds.map((id) => `"${id}"`).join(",");
        query = query.or(`table_id.eq.${tableNumber},id.in.(${orderIdsStr})`);
      } else if (tableNumber && tableNumber > 0) {
        query = query.eq("table_id", tableNumber);
      } else if (orderIds.length > 0) {
        query = query.in("id", orderIds);
      } else {
        return [];
      }

      const { data: orders, error: ordersErr } = await query
        .in("status", [
          "sent",
          "preparing",
          "ready",
          "served",
          "billing",
          "paid",
        ])
        .order("created_at", { ascending: false });

      if (ordersErr) throw ordersErr;
      if (!orders || orders.length === 0) return [];

      const foundOrderIds = orders.map((o) => o.id);
      const { data: items, error: itemsErr } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", foundOrderIds);

      if (itemsErr) throw itemsErr;

      return (orders as DbOrder[]).map((order) => ({
        ...order,
        items: (items as DbOrderItem[]).filter((i) => i.order_id === order.id),
      }));
    },
    enabled:
      (tableNumber !== undefined && tableNumber > 0) || orderIds.length > 0,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tableId,
      items,
      total,
      customerName,
    }: {
      tableId: number;
      items: CartItem[];
      total: number;
      customerName?: string;
    }) => {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      // Convert items to database format for RPC
      const orderItems = items.map((item) => ({
        menu_item_id: item.menuItem.id,
        name: item.menuItem.name,
        price: Number(item.menuItem.price),
        quantity: item.quantity,
        modifiers: item.modifiers,
        special_instructions: item.specialInstructions || null,
      }));

      // Use Atomic RPC to prevent orphan orders
      const { data, error } = await (supabase.rpc as any)("create_order_with_items", {
        order_data: {
          order_number: orderNumber,
          table_id: tableId > 0 ? tableId : null,
          total,
          type: "dine-in",
          status: "sent",
          customer_name: customerName || null,
        },
        items_data: orderItems,
      });

      if (error) throw error;
      return data as DbOrder;
    },
    onSuccess: () => {
      // Robust partial invalidation
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      const previousAll = queryClient.getQueryData(["orders", "all"]);
      const previousLive = queryClient.getQueryData(["orders", "with-items", "live"]);

      // Update both potential dashboard queries optimistically
      queryClient.setQueryData(["orders", "all"], (old: DbOrder[] = []) =>
        old.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      queryClient.setQueryData(["orders", "with-items", "live"], (old: any[] = []) =>
        old.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      return { previousAll, previousLive };
    },
    onError: (err, variables, context) => {
      if (context?.previousAll) queryClient.setQueryData(["orders", "all"], context.previousAll);
      if (context?.previousLive) queryClient.setQueryData(["orders", "with-items", "live"], context.previousLive);
    },
    onSettled: () => {
      // 5. Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
    },
  });
}

export function useUpdateTableOrdersStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tableId,
      status,
    }: {
      tableId: number;
      status: string;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("table_id", tableId)
        .in("status", ["sent", "preparing", "ready", "served"]); // Only update active ones
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
    },
  });
}
