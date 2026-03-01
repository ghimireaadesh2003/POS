import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartBar: React.FC = () => {
  const { itemCount, total } = useCart();
  const navigate = useNavigate();

  if (itemCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto p-4"
    >
      <button
        onClick={() => navigate('/cart')}
        className="w-full bg-gradient-primary text-primary-foreground rounded-2xl px-6 py-4 flex items-center justify-between shadow-elevated active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          </div>
          <span className="font-medium text-sm">View Cart</span>
        </div>
        <span className="font-semibold">${total.toFixed(2)}</span>
      </button>
    </motion.div>
  );
};

export default CartBar;
