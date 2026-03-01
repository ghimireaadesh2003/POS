import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MoreHorizontal, Eye, EyeOff, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useMenu } from '@/contexts/MenuContext';
import MenuItemModal from '@/components/admin/MenuItemModal';
import type { MenuItem } from '@/data/mockData';

const MenuManagement: React.FC = () => {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = useMenu();
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);

  const handleSave = (data: Omit<MenuItem, 'id'>) => {
    if (editingItem) {
      updateMenuItem(editingItem.id, data);
    } else {
      addMenuItem(data);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{menuItems.length} items across {categories.length - 1} categories</p>
        </div>
        <button onClick={handleAdd} className="bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full bg-muted border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Search menu items..." />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 px-5 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
          <span></span><span>Item</span><span>Category</span><span>Price</span><span>Status</span><span>Actions</span>
        </div>
        {filtered.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.02 }}
            className="grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 items-center px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab" />
            <div>
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">{item.category}</span>
            <span className="text-sm font-semibold text-foreground">${item.price.toFixed(2)}</span>
            <button
              onClick={() => toggleAvailability(item.id)}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${
                item.available ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}
            >
              {item.available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {item.available ? 'Live' : 'Hidden'}
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => handleEdit(item)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {deleteConfirm === item.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => { deleteMenuItem(item.id); setDeleteConfirm(null); }} className="text-xs text-destructive font-medium px-2 py-1 bg-destructive/10 rounded-lg">
                    Confirm
                  </button>
                  <button onClick={() => setDeleteConfirm(null)} className="text-xs text-muted-foreground px-2 py-1">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(item.id)} className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-muted">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <MenuItemModal
            item={editingItem}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditingItem(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuManagement;
