import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import type { MenuItem } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";

interface Props {
  item: MenuItem;
  onClose: () => void;
}

const ModifierModal: React.FC<Props> = ({ item, onClose }) => {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState("");

  const toggleOption = (group: string, option: string, maxSelect: number) => {
    setSelected((prev) => {
      const current = prev[group] || [];
      if (current.includes(option)) {
        return { ...prev, [group]: current.filter((o) => o !== option) };
      }
      if (current.length >= maxSelect) {
        return { ...prev, [group]: [...current.slice(1), option] };
      }
      return { ...prev, [group]: [...current, option] };
    });
  };

  const handleAdd = () => {
    const modifiers = Object.entries(selected).map(([group, options]) => ({
      group,
      selected: options,
    }));
    for (let i = 0; i < qty; i++) {
      addItem(item, modifiers, instructions || undefined);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="bg-card w-full max-w-md rounded-t-3xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-2 flex items-start justify-between border-b border-border/50">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {item.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {item.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {item.modifiers?.map((group) => (
            <div key={group.name}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-sm text-foreground">
                  {group.name}
                </h3>
                {group.required && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Required
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {group.options.map((opt) => {
                  const isSelected = (selected[group.name] || []).includes(
                    opt.name,
                  );
                  return (
                    <button
                      key={opt.name}
                      onClick={() =>
                        toggleOption(group.name, opt.name, group.maxSelect)
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-background hover:bg-muted/30"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">{opt.name}</span>
                      {opt.price > 0 && (
                        <span className="text-xs text-muted-foreground font-medium">
                          +${opt.price.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3">
              Special Instructions
            </h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any allergies or preferences..."
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-border/50 bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-background rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold w-8 text-center tabular-nums">{qty}</span>
              <button 
                onClick={() => setQty(qty + 1)} 
                className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-background rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 bg-gradient-primary text-primary-foreground h-12 rounded-xl font-bold text-sm shadow-elevated active:scale-[0.98] transition-all"
            >
              Add — ${(item.price * qty).toFixed(2)}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ModifierModal;
