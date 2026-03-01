import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import type { MenuItem, ModifierGroup } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';

interface MenuItemModalProps {
  item?: MenuItem | null;
  onSave: (data: Omit<MenuItem, 'id'>) => void;
  onClose: () => void;
}

const categoryOptions = ['Starters', 'Mains', 'Pizza', 'Pasta', 'Grills', 'Desserts', 'Drinks'];

const MenuItemModal: React.FC<MenuItemModalProps> = ({ item, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Starters');
  const [available, setAvailable] = useState(true);
  const [prepTime, setPrepTime] = useState('');
  const [modifiers, setModifiers] = useState<ModifierGroup[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toString());
      setCategory(item.category);
      setAvailable(item.available);
      setPrepTime(item.prepTime?.toString() || '');
      setModifiers(item.modifiers || []);
      setImageUrl(item.image || '');
    }
  }, [item]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('menu-images').upload(fileName, file);
    if (error) {
      console.error('Upload error:', error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(fileName);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      price: parseFloat(price) || 0,
      category,
      available,
      image: imageUrl,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      modifiers: modifiers.length > 0 ? modifiers : undefined,
    });
    onClose();
  };

  const addModifierGroup = () => {
    setModifiers(prev => [...prev, { name: '', required: false, maxSelect: 1, options: [{ name: '', price: 0 }] }]);
  };

  const removeModifierGroup = (idx: number) => {
    setModifiers(prev => prev.filter((_, i) => i !== idx));
  };

  const updateModGroup = (idx: number, field: string, value: any) => {
    setModifiers(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const addModOption = (groupIdx: number) => {
    setModifiers(prev => prev.map((g, i) => i === groupIdx ? { ...g, options: [...g.options, { name: '', price: 0 }] } : g));
  };

  const removeModOption = (groupIdx: number, optIdx: number) => {
    setModifiers(prev => prev.map((g, i) => i === groupIdx ? { ...g, options: g.options.filter((_, oi) => oi !== optIdx) } : g));
  };

  const updateModOption = (groupIdx: number, optIdx: number, field: string, value: any) => {
    setModifiers(prev => prev.map((g, i) => i === groupIdx ? {
      ...g,
      options: g.options.map((o, oi) => oi === optIdx ? { ...o, [field]: value } : o)
    } : g));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border shadow-elevated w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Image</label>
            <div className="flex items-center gap-3">
              {imageUrl && (
                <img src={imageUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
              )}
              <label className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover:bg-secondary transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-muted border-none rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Truffle Burrata"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full bg-muted border-none rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Short description..."
            />
          </div>

          {/* Price + Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="w-full bg-muted border-none rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-muted border-none rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Prep time + Available row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Prep Time (min)</label>
              <input
                type="number"
                min="0"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                className="w-full bg-muted border-none rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Optional"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={e => setAvailable(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-foreground">Available</span>
              </label>
            </div>
          </div>

          {/* Modifiers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Modifier Groups</label>
              <button type="button" onClick={addModifierGroup} className="text-xs text-primary font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Group
              </button>
            </div>
            {modifiers.map((group, gi) => (
              <div key={gi} className="bg-muted/50 rounded-xl p-3 mb-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={group.name}
                    onChange={e => updateModGroup(gi, 'name', e.target.value)}
                    placeholder="Group name (e.g. Doneness)"
                    className="flex-1 bg-card border-none rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    <input type="checkbox" checked={group.required} onChange={e => updateModGroup(gi, 'required', e.target.checked)} className="w-3 h-3 accent-primary" />
                    Required
                  </label>
                  <button type="button" onClick={() => removeModifierGroup(gi)} className="text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {group.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2 pl-2">
                    <input
                      value={opt.name}
                      onChange={e => updateModOption(gi, oi, 'name', e.target.value)}
                      placeholder="Option name"
                      className="flex-1 bg-card border-none rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={opt.price}
                      onChange={e => updateModOption(gi, oi, 'price', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-card border-none rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="$0"
                    />
                    <button type="button" onClick={() => removeModOption(gi, oi)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addModOption(gi)} className="text-xs text-muted-foreground hover:text-foreground pl-2">
                  + Add option
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-xl text-sm font-medium">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-gradient-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium">
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MenuItemModal;
