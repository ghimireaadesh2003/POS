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

  if (isLoading && !latestOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Loading your order...</p>
      </div>
    );
  }

  // If the order is paid, show a Thank You screen
  if (latestOrder?.status === 'paid') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-primary fill-primary" />
          </div>
        </motion.div>
        <h2 className="font-display text-3xl font-semibold text-foreground mb-4">Thank You!</h2>
        <p className="text-muted-foreground text-lg mb-8">We hope you enjoyed your meal. See you again soon!</p>
        <button 
          onClick={() => navigate('/menu')}
          className="bg-gradient-primary text-primary-foreground px-10 py-4 rounded-2xl font-semibold shadow-elevated"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  // PRIORITY 1: SHOW LIVE STATUS IF ORDER EXISTS
  if (latestOrder) {
    // Status-aware hero icon config
    const heroConfig = {
      sent: { icon: Check, bg: 'bg-info/10', color: 'text-info', label: 'Order Placed!' },
      preparing: { icon: ChefHat, bg: 'bg-warning/10', color: 'text-warning', label: 'Being Prepared' },
      ready: { icon: Bell, bg: 'bg-success/10', color: 'text-success', label: 'Order Ready!' },
      served: { icon: UtensilsCrossed, bg: 'bg-primary/10', color: 'text-primary', label: 'Enjoy Your Meal!' },
      billing: { icon: Receipt, bg: 'bg-warning/10', color: 'text-warning', label: 'Processing Payment' },
      paid: { icon: Check, bg: 'bg-success/10', color: 'text-success', label: 'Payment Completed' },
    };
    
    const hero = heroConfig[latestOrder.status as keyof typeof heroConfig] || heroConfig.sent;
    const HeroIcon = hero.icon;

    return (
      <div className="pb-8">
        <div className="px-6 py-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
            <div className={`w-20 h-20 ${hero.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <HeroIcon className={`w-10 h-10 ${hero.color}`} />
            </div>
          </motion.div>

          <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
            {hero.label}
          </h2>
          <p className="text-muted-foreground text-sm mb-2">{latestOrder?.order_number}</p>
          <p className="text-muted-foreground text-xs mb-8">
            Placed {new Date(latestOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>

          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-8">
            <Clock className="w-4 h-4" />
            <span>Total: <strong className="text-foreground">${Number(latestOrder?.total || 0).toFixed(2)}</strong></span>
          </div>

          {/* Timeline */}
          <div className="flex justify-between items-start max-w-sm mx-auto mb-10 px-2">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex || latestOrder?.status === 'served' || latestOrder?.status === 'billing';
              const isActive = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative">
                  {/* Connector Line */}
                  {idx < statusSteps.length - 1 && (
                    <div className="absolute top-4 left-[50%] w-full h-[2px] bg-muted">
                      <div 
                        className="h-full bg-success transition-all duration-500" 
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${
                    isCompleted ? 'bg-success text-success-foreground' : 
                    isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <button 
              onClick={() => navigate('/bill')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-primary text-primary-foreground py-4 rounded-2xl font-semibold shadow-elevated"
            >
              <Receipt className="w-5 h-5" />
              View Bill & Pay
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/menu')}
                className="flex-1 bg-muted/50 text-foreground py-3.5 rounded-xl font-medium text-sm border border-border"
              >
                Order More
              </button>
              <button 
                onClick={() => navigate('/feedback')}
                className="flex-1 bg-muted/50 text-foreground py-3.5 rounded-xl font-medium text-sm border border-border"
              >
                Give Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PRIORITY 2: SHOW CART REVIEW IF ITEMS EXIST
  if (items.length > 0) {
    return (
      <div className="px-4 py-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Review Your Order
            </h2>
            <p className="text-xs text-muted-foreground">Table {tableNumber}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={`${item.menuItem.id}-${idx}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-xl border border-border p-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground">
                      {item.menuItem.name}
                    </h3>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.modifiers
                          .map((m) => m.selected.join(", "))
                          .join(" · ")}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" />
                        {item.specialInstructions}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary active:scale-95 transition-transform"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-sm text-foreground">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Enhanced Total Card */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-6 shadow-sm space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Service charge (5%)</span>
            <span>${(total * 0.05).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax (8%)</span>
            <span>${(total * 0.08).toFixed(2)}</span>
          </div>
          <div className="border-t border-dashed border-border pt-3 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total amount</span>
            <span className="text-xl font-bold text-primary">${(total * 1.13).toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full bg-gradient-primary text-primary-foreground py-4 rounded-2xl font-bold text-base shadow-elevated active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {placing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Place Order — ${(total * 1.13).toFixed(2)}
            </>
          )}
        </button>
      </div>
    );
  }

  // PRIORITY 3: EMPTY STATE
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">No active orders</h2>
      <p className="text-muted-foreground text-sm mb-8">You haven't added anything to your cart or placed any orders yet for Table {tableNumber}.</p>
      <div className="space-y-3 w-full max-w-[240px]">
        <button 
          onClick={() => navigate('/menu')}
          className="w-full bg-gradient-primary text-primary-foreground py-3 rounded-xl font-medium text-sm shadow-card"
        >
          Go to Menu
        </button>
        <button 
          onClick={() => navigate('/order-history')}
          className="w-full bg-muted text-foreground py-3 rounded-xl font-medium text-sm"
        >
          Order History
        </button>
      </div>
    </div>
  );
};

export default OrderStatusPage;
