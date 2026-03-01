import React, { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Phone } from "lucide-react";
import { AnimatePresence } from "framer-motion"; // Add this
import BottomNav from "@/components/customer/BottomNav";
import CallWaiterModal from "@/components/customer/CallWaiterModal"; // Adjust path as needed

const CustomerLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setTableNumber, tableNumber } = useCart();

  // 1. Local state to control modal visibility
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);

  useEffect(() => {
    const table = searchParams.get("table");
    if (table) setTableNumber(parseInt(table, 10));
  }, [searchParams, setTableNumber]);

  return (
    <div className="min-h-screen bg-background font-body max-w-md mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground tracking-tight">
              EMBER
            </h1>
            <p className="text-xs text-muted-foreground">Fine Dining & Bar</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 2. Table badge moved next to button for better layout balance */}
            {tableNumber > 0 && (
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md uppercase tracking-wider">
                T-{tableNumber}
              </span>
            )}

            {/* Call Waiter FAB */}
            <button
              onClick={() => setIsWaiterModalOpen(true)}
              className="h-10 bg-gradient-primary rounded-full shadow-elevated flex items-center justify-center gap-2 px-4 text-primary-foreground active:scale-95 transition-transform font-medium text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Waiter</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20">
        <Outlet />
      </main>

      <BottomNav />

      {/* 3. Modal Overlay Layer */}
      <AnimatePresence>
        {isWaiterModalOpen && (
          <CallWaiterModal
            onClose={() => setIsWaiterModalOpen(false)}
            tableNumber={tableNumber || "N/A"}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerLayout;
