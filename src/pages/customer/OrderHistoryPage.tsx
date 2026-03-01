import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ReceiptText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTableOrdersWithItems, ORDER_STATUS_STYLES } from '@/hooks/useOrders';
import { useCart } from '@/contexts/CartContext';

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { tableNumber, orderIds } = useCart();
  const { data: orders = [], isLoading } = useTableOrdersWithItems(tableNumber, orderIds);

  // Show all orders fetched for this table session


  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Order History</h2>
          <p className="text-xs text-muted-foreground">{orders.length} orders</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-muted-foreground text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => {
            const statusStyle = ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.sent;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-xl border border-border shadow-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{order.order_number}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.color}`}>
                    {statusStyle.label}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">${Number(order.total).toFixed(2)}</span>
                  <button
                    onClick={() => navigate('/menu')}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium"
                  >
                    Reorder
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
