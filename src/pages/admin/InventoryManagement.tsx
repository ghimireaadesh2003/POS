import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingDown, RotateCcw, Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInventory, useDeleteInventoryItem, useUpdateInventoryItem, useAddInventoryItem, type DbInventoryItem } from '@/hooks/useInventory';
import { toast } from 'sonner';

const categories = ['All', 'Proteins', 'Dairy', 'Produce', 'Condiments', 'Prepared', 'Beverages'];

const InventoryManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: inventory = [], isLoading } = useInventory();
  const deleteItem = useDeleteInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const filtered = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const lowStock = inventory.filter(i => Number(i.current_stock) <= Number(i.min_stock));
  const totalWaste = inventory.reduce((s, i) => s + Number(i.waste) * Number(i.cost_per_unit), 0);
  const totalValue = inventory.reduce((s, i) => s + Number(i.current_stock) * Number(i.cost_per_unit), 0);

  const getStockLevel = (item: DbInventoryItem) => (Number(item.current_stock) / Number(item.max_stock)) * 100;
  const isLow = (item: DbInventoryItem) => Number(item.current_stock) <= Number(item.min_stock);
  const daysLeft = (item: DbInventoryItem) => Number(item.daily_usage) > 0 ? Math.floor(Number(item.current_stock) / Number(item.daily_usage)) : 999;

  const handleRestock = (item: DbInventoryItem) => {
    updateItem.mutate({ id: item.id, current_stock: Number(item.max_stock), last_restocked: new Date().toISOString() }, {
      onSuccess: () => toast.success(`${item.name} restocked`),
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">Track ingredients and stock levels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Stock Value', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Package, color: 'text-primary' },
          { label: 'Low Stock Alerts', value: lowStock.length.toString(), icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Daily Waste Cost', value: `$${totalWaste.toFixed(2)}`, icon: TrendingDown, color: 'text-warning' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reorder Suggestions */}
      {lowStock.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" />Reorder Suggestions</h3>
          <div className="space-y-1">
            {lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.name} — <span className="text-muted-foreground">{Number(item.current_stock)} {item.unit} left ({daysLeft(item)} days)</span></span>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleRestock(item)}>
                  <RotateCcw className="w-3 h-3 mr-1" />Reorder
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search ingredients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <Button key={cat} size="sm" variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)} className="whitespace-nowrap">{cat}</Button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium">Ingredient</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Category</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Stock Level</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Days Left</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Waste</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Cost</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium text-foreground">{item.name}</td>
                  <td className="p-4"><Badge variant="secondary">{item.category}</Badge></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <Progress value={getStockLevel(item)} className={`h-2 flex-1 ${isLow(item) ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                      <span className={`text-xs font-medium ${isLow(item) ? 'text-destructive' : 'text-foreground'}`}>{Number(item.current_stock)} {item.unit}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${daysLeft(item) <= 2 ? 'text-destructive' : daysLeft(item) <= 5 ? 'text-warning' : 'text-foreground'}`}>
                      {daysLeft(item) > 100 ? '—' : `${daysLeft(item)}d`}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{Number(item.waste) > 0 ? `${item.waste} ${item.unit}/day` : '—'}</td>
                  <td className="p-4 text-foreground">${Number(item.cost_per_unit)}/{item.unit}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRestock(item)}>
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteItem.mutate(item.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">No inventory items found. Seed the database to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
