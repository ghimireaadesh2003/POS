import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ChefHat, UtensilsCrossed } from 'lucide-react';
import { useOrdersWithItems, useUpdateOrderStatus } from '@/hooks/useOrders';

const KitchenDisplay: React.FC = () => {
  const { data: kitchenOrders = [], isLoading } = useOrdersWithItems();
  const updateStatus = useUpdateOrderStatus();

  const handleStart = (orderId: string) => {
    updateStatus.mutate({ orderId, status: 'preparing' });
  };

  const handleReady = (orderId: string) => {
    updateStatus.mutate({ orderId, status: 'ready' });
  };

  const handleServed = (orderId: string) => {
    updateStatus.mutate({ orderId, status: 'served' });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Kitchen Display</h1>
        <p className="text-muted-foreground text-sm mt-1">{kitchenOrders.length} active orders</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading orders...</div>
      ) : kitchenOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No active orders — kitchen is clear! 🎉</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchenOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-card rounded-xl border-2 p-5 ${
                order.status === 'sent' ? 'border-info' : order.status === 'preparing' ? 'border-warning' : 'border-success'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{order.order_number}</h3>
                  <p className="text-xs text-muted-foreground">
                    {order.type === 'dine-in' ? `Table ${order.table_id}` : order.customer_name}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)}m ago
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium text-foreground">{item.quantity}× {item.name}</span>
                    {item.special_instructions && (
                      <span className="text-xs text-warning italic ml-2">"{item.special_instructions}"</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {order.status === 'sent' ? (
                  <button
                    onClick={() => handleStart(order.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-warning/10 text-warning py-2.5 rounded-lg text-sm font-medium hover:bg-warning/20 transition-colors"
                  >
                    <ChefHat className="w-4 h-4" /> Start Preparing
                  </button>
                ) : order.status === 'preparing' ? (
                  <button
                    onClick={() => handleReady(order.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-success/10 text-success py-2.5 rounded-lg text-sm font-medium hover:bg-success/20 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Ready
                  </button>
                ) : (
                  <button
                    onClick={() => handleServed(order.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary py-2.5 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <UtensilsCrossed className="w-4 h-4" /> Mark Served
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
