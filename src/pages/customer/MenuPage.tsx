import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Clock,
  Search,
  X,
  Sun,
  Coffee,
  Moon,
  Sparkles,
} from "lucide-react";
import {
  getCurrentMealPeriod,
  type MenuItem,
  type MealPeriod,
} from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import ModifierModal from "@/components/customer/ModifierModal";
import { useMenuItems } from "@/hooks/useMenuItems";

const mealPeriodConfig: Record<
  MealPeriod,
  { label: string; icon: React.ElementType; color: string }
> = {
  breakfast: { label: "Breakfast", icon: Coffee, color: "text-amber-500" },
  lunch: { label: "Lunch", icon: Sun, color: "text-yellow-500" },
  dinner: { label: "Dinner", icon: Moon, color: "text-indigo-400" },
  "all-day": { label: "All Day", icon: Sparkles, color: "text-primary" },
};

const MenuPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activePeriod, setActivePeriod] = useState<MealPeriod>(
    getCurrentMealPeriod(),
  );
  const { addItem, items, updateQuantity } = useCart();
  const { data: menuItems, isLoading } = useMenuItems();
  const [callWaiterModalOpen, setCallWaiterModalOpen] = useState(false);

  const categories = useMemo(() => {
    if (!menuItems) return ["All"];
    const cats = [...new Set(menuItems.map((i) => i.category))];
    return ["All", ...cats];
  }, [menuItems]);

  const periodMenuItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter(
      (i) =>
        !i.mealPeriod ||
        i.mealPeriod === "all-day" ||
        i.mealPeriod === activePeriod,
    );
  }, [activePeriod, menuItems]);

  const filtered = useMemo(() => {
    let result =
      activeCategory === "All"
        ? periodMenuItems
        : periodMenuItems.filter((i) => i.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [activeCategory, searchQuery, periodMenuItems]);

  const getItemQty = (id: string) => {
    const item = items.find((i) => i.menuItem.id === id);
    return item?.quantity || 0;
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedItem(item);
    } else {
      addItem(item);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">
          Loading menu...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Meal Period Selector */}
      <div className="sticky top-[61px] z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-2">
        <div className="flex gap-1">
          {(["breakfast", "lunch", "dinner"] as MealPeriod[]).map((period) => {
            const cfg = mealPeriodConfig[period];
            const active = activePeriod === period;
            const Icon = cfg.icon;
            return (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-card"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
                {period === getCurrentMealPeriod() && !active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search bar */}
      <div className="sticky top-[113px] z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-9 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category scroll */}
      <div className="sticky top-[169px] z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex overflow-x-auto gap-2 px-4 py-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-gradient-primary text-primary-foreground shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div className="px-4 py-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, idx) => {
            const qty = getItemQty(item.id);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.03 }}
                className={`bg-card rounded-xl shadow-card border border-border p-4 flex gap-4 ${!item.available ? "opacity-50" : ""}`}
              >
                <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-foreground text-sm leading-tight">
                      {item.name}
                    </h3>
                    {item.prepTime && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {item.prepTime}m
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-body font-semibold text-foreground">
                      ${item.price.toFixed(2)}
                    </span>
                    {!item.available ? (
                      <span className="text-xs text-destructive font-medium">
                        Sold out
                      </span>
                    ) : qty > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const cartIdx = items.findIndex(
                              (i) => i.menuItem.id === item.id,
                            );
                            updateQuantity(cartIdx, qty - 1);
                          }}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground active:scale-90 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              No items available for {mealPeriodConfig[activePeriod].label}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <ModifierModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MenuPage;
