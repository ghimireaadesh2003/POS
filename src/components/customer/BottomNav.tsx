import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UtensilsCrossed,
  ClipboardList,
  Receipt,
  MessageSquare,
  History,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const tabs = [
  { label: "Menu", icon: UtensilsCrossed, path: "/menu" },
  { label: "Orders", icon: ClipboardList, path: "/order-status" },
  { label: "History", icon: History, path: "/order-history" },
  { label: "Bill", icon: Receipt, path: "/bill" },
  { label: "Feedback", icon: MessageSquare, path: "/feedback" },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors relative ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <div className="relative">
                <tab.icon className="w-5 h-5" />
                {tab.path === "/order-status" && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
