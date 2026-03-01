import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChefHat, Bell, UtensilsCrossed, Clock, 
  Loader2, MessageSquare, Trash2, Phone, Heart,
  ArrowLeft, ShoppingBag, Receipt, Plus as PlusIcon, Minus as MinusIcon,
  Send
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useTableOrdersWithItems, usePlaceOrder, type DbOrder } from '@/hooks/useOrders';
import { toast } from 'sonner';

const OrderStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, updateQuantity, removeItem, total, tableNumber, clearCart, orderIds, addPlacedOrderId } = useCart();
  const placeOrder = usePlaceOrder();
  const [placing, setPlacing] = useState(false);
  
  const { data: orders = [], isLoading } = useTableOrdersWithItems(tableNumber, orderIds);

  // Find the latest order for this table from the live query
  const fromQuery = orders[0]; // useTableOrdersWithItems is ordered by created_at desc
  
  // Consolidate the "latest" order from the query results
  const latestOrder = React.useMemo(() => {
    if (orders.length === 0) return null;
    return orders[0]; // Ordered by created_at desc
  }, [orders]);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      // 5% service charge + 8% tax = 13% extra to match BillPage
      const finalTotal = total * 1.13; 
      const newOrder = await placeOrder.mutateAsync({
        tableId: tableNumber,
        items,
        total: finalTotal,
      });
      clearCart();
      addPlacedOrderId(newOrder.id);
      toast.success("Order placed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const statusSteps = [
    { key: 'sent', label: 'Order Sent', icon: Check },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Bell },
    { key: 'served', label: 'Served', icon: UtensilsCrossed },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === latestOrder?.status);

  // --- Rendering logic ---

  if (isLoading && orders.length === 0 && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  const hasNoActivity = orders.length === 0 && items.length === 0;

  if (hasNoActivity) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">No active orders</h2>
        <p className="text-muted-foreground text-sm mb-8">You haven't added anything to your cart or placed any orders yet for Table {tableNumber}.</p>
        <div className="space-y-3 w-full max-w-[240px]">
          <button onClick={() => navigate('/menu')} className="w-full bg-gradient-primary text-primary-foreground py-3 rounded-xl font-medium text-sm shadow-card">
            Go to Menu
          </button>
          <button onClick={() => navigate('/order-history')} className="w-full bg-muted text-foreground py-3 rounded-xl font-medium text-sm">
            Order History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-6">
      <div className="mb-8 px-2">
        <h1 className="font-display text-2xl font-bold text-foreground">Active Orders</h1>
        <p className="text-xs text-muted-foreground">Tracking your session at Table {tableNumber}</p>
      </div>

      {/* 1. ORDERS LIST */}
      <div className="space-y-12 mb-12">
        {orders.map((order, oIdx) => {
            const currentStepIdx = statusSteps.findIndex(s => s.key === order.status);
            const isSettled = order.status === 'paid';
            if (isSettled) return null;

            return (
                <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: oIdx * 0.1 }}
                    className="relative"
                >
                    {/* Hero Section Style for each Order Card */}
                    <div className="text-center mb-8">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                        {(() => {
                            const heroConfig = {
                                sent: { icon: Check, bg: 'bg-info/10', color: 'text-info', label: 'Order Placed!' },
                                preparing: { icon: ChefHat, bg: 'bg-warning/10', color: 'text-warning', label: 'Being Prepared' },
                                ready: { icon: Bell, bg: 'bg-success/10', color: 'text-success', label: 'Order Ready!' },
                                served: { icon: UtensilsCrossed, bg: 'bg-primary/10', color: 'text-primary', label: 'Enjoy Your Meal!' },
                                billing: { icon: Receipt, bg: 'bg-warning/10', color: 'text-warning', label: 'Processing Payment' },
                                paid: { icon: Check, bg: 'bg-success/10', color: 'text-success', label: 'Payment Completed' },
                            };
                            const hero = heroConfig[order.status as keyof typeof heroConfig] || heroConfig.sent;
                            const HeroIcon = hero.icon;
                            return (
                                <div className={`w-16 h-16 ${hero.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                    <HeroIcon className={`w-8 h-8 ${hero.color}`} />
                                </div>
                            );
                        })()}
                        </motion.div>

                        <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                        {(() => {
                            const heroConfig = {
                                sent: 'Order Placed!',
                                preparing: 'Being Prepared',
                                ready: 'Order Ready!',
                                served: 'Enjoy Your Meal!',
                                billing: 'Processing Payment',
                                paid: 'Payment Completed',
                            };
                            return heroConfig[order.status as keyof typeof heroConfig] || 'Order Status';
                        })()}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
                            <span className="font-bold text-foreground/80">{order.order_number}</span>
                            <span>•</span>
                            <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Timeline */}
                        <div className="flex justify-between items-start max-w-sm mx-auto px-4">
                            {statusSteps.map((step, sIdx) => {
                                const isCompleted = sIdx < currentStepIdx || order.status === 'served' || order.status === 'billing';
                                const isActive = sIdx === currentStepIdx;
                                const Icon = step.icon;

                                return (
                                <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative">
                                    {sIdx < statusSteps.length - 1 && (
                                    <div className="absolute top-3.5 left-[50%] w-full h-[1.5px] bg-muted">
                                        <div className="h-full bg-success transition-all duration-500" style={{ width: isCompleted ? '100%' : '0%' }} />
                                    </div>
                                    )}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-colors ${
                                    isCompleted ? 'bg-success text-success-foreground' : 
                                    isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 
                                    'bg-muted text-muted-foreground'
                                    }`}>
                                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className={`text-[9px] font-bold tracking-tight uppercase ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                                    {step.label}
                                    </span>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                    {oIdx < orders.length - 1 && <div className="border-b border-border/50 mx-8 opacity-50" />}
                </motion.div>
            );
        })}
      </div>

      {/* 2. CART SECTION */}
      {items.length > 0 && (
        <div className="mb-12 border-t border-border pt-10">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Pending in Cart</h3>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{items.length} Items</span>
          </div>
          
          <div className="space-y-4 mb-8">
            {items.map((item, idx) => (
              <motion.div key={`${item.menuItem.id}-${idx}`} layout className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-foreground">{item.menuItem.name}</h3>
                    {item.modifiers.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {item.modifiers.map((m) => m.selected.join(", ")).join(" · ")}
                      </p>
                    )}
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-sm text-foreground">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full bg-gradient-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm shadow-elevated active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {placing ? 'Placing Order...' : `Place Additional Order — $${(total * 1.13).toFixed(2)}`}
          </button>
        </div>
      )}

      {/* 3. GLOBAL ACTIONS FOOTER */}
      <div className="space-y-3 mt-12 pt-6 border-t border-border">
          <button 
            onClick={() => navigate('/bill')} 
            className="w-full flex items-center justify-center gap-3 bg-gradient-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm shadow-elevated active:scale-95 transition-transform"
          >
            <Receipt className="w-5 h-5" />
            View Bill & Pay
          </button>
          <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/menu')} 
                className="flex items-center justify-center gap-2 bg-muted/50 hover:bg-muted text-foreground py-3.5 rounded-xl font-bold text-xs border border-border"
              >
                  <PlusIcon className="w-4 h-4" />
                  Order More
              </button>
              <button 
                onClick={() => navigate('/feedback')} 
                className="flex items-center justify-center gap-2 bg-muted/50 hover:bg-muted text-foreground py-3.5 rounded-xl font-bold text-xs border border-border"
              >
                  <MessageSquare className="w-4 h-4" />
                  Give Feedback
              </button>
          </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
