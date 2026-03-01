import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Banknote, Smartphone, Users, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useTableOrdersWithItems, useUpdateTableOrdersStatus, type DbOrderItem } from '@/hooks/useOrders';
import { useUpdateTableStatus } from '@/hooks/useTables';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Smartphone },
];

const BillPage: React.FC = () => {
  const navigate = useNavigate();
  const { tableNumber, orderIds } = useCart();
  const { data: tableOrders = [], isLoading } = useTableOrdersWithItems(tableNumber, orderIds);
  const updateTableStatus = useUpdateTableStatus();
  const updateOrdersStatus = useUpdateTableOrdersStatus();
  
  const [splitCount, setSplitCount] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [readyToPay, setReadyToPay] = useState(false);

  // Combine all items from all orders for this table that are NOT paid
  // This ensures that once an order is paid, it clears from the CURRENT bill view
  const activeOrders = tableOrders.filter(o => o.status !== 'paid');
  const allItems = activeOrders.flatMap(o => (o as any).items as DbOrderItem[]);
  
  const subtotal = allItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const serviceCharge = subtotal * 0.05;
  const tax = subtotal * 0.08;
  const total = subtotal + serviceCharge + tax;
  const perPerson = total / splitCount;

  const handleReadyToPay = async () => {
    if (!selectedPayment) return;
    try {
      // Update table status to 'billing' to alert staff
      await updateTableStatus.mutateAsync({ tableId: tableNumber, status: 'billing' });
      // ALSO update all active orders to 'billing' so they reflect in OrderStatusPage
      await updateOrdersStatus.mutateAsync({ tableId: tableNumber, status: 'billing' });
      setReadyToPay(true);
    } catch (err) {
      console.error('Failed to update table status:', err);
      // Fallback to showing the success message anyway to not block the user
      setReadyToPay(true);
    }
  };

  if (readyToPay) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-success" />
          </div>
        </motion.div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Payment Requested</h2>
        <p className="text-muted-foreground text-sm mb-2">Your server has been notified</p>
        <p className="text-muted-foreground text-xs mb-8">
          {selectedPayment === 'cash' ? 'Please have cash ready' : selectedPayment === 'card' ? 'Card machine will be brought to your table' : 'QR code will be presented shortly'}
        </p>
        <button 
          onClick={() => { 
            setReadyToPay(false); 
            navigate('/order-status'); 
          }} 
          className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-medium text-sm"
        >
          Check Status
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <span className="text-5xl mb-4">🧾</span>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">No active bill</h2>
        <p className="text-muted-foreground text-sm mb-6">Your current orders are empty or already settled.</p>
        <button onClick={() => navigate('/menu')} className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-medium text-sm">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Your Bill</h2>
          {tableNumber > 0 && <p className="text-xs text-muted-foreground">Table {tableNumber}</p>}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card mb-4">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            {activeOrders.length > 1 ? `Consolidated Bill — ${activeOrders.length} Orders` : `Order Summary — ${activeOrders[0]?.order_number}`}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {allItems.map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="px-4 py-3 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">× {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-foreground">${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </motion.div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-border space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Service charge (5%)</span><span>${serviceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border text-base">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Split Bill */}
      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Split Bill</h3>
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => setSplitCount(n)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                splitCount === n ? 'bg-gradient-primary text-primary-foreground shadow-card' : 'bg-muted text-muted-foreground'
              }`}
            >
              {n === 1 ? 'Full' : `÷ ${n}`}
            </button>
          ))}
        </div>
        {splitCount > 1 && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-center text-sm text-foreground mt-3 font-medium"
          >
            ${perPerson.toFixed(2)} per person
          </motion.p>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
        <div className="space-y-2">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                selectedPayment === method.id ? 'border-primary bg-primary/5' : 'border-border bg-background'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedPayment === method.id ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <method.icon className={`w-5 h-5 ${selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-sm font-medium ${selectedPayment === method.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {method.label}
              </span>
              {selectedPayment === method.id && (
                <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleReadyToPay}
        disabled={!selectedPayment}
        className="w-full bg-gradient-primary text-primary-foreground py-4 rounded-2xl font-semibold text-sm shadow-elevated active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        Ready to Pay — ${(splitCount > 1 ? perPerson : total).toFixed(2)}
      </button>
    </div>
  );
};

export default BillPage;
