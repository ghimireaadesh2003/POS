import React, { createContext, useContext, useCallback } from 'react';
import { type MenuItem } from '@/data/mockData';
import { categories as defaultCategories } from '@/data/mockData';
import { useMenuItems } from '@/hooks/useMenuItems';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface MenuContextType {
  menuItems: MenuItem[];
  categories: string[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be inside MenuProvider');
  return ctx;
};

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: menuItems = [] } = useMenuItems();
  const queryClient = useQueryClient();

  const categories = (() => {
    const cats = [...new Set(menuItems.map(i => i.category))];
    return ['All', ...cats];
  })();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['menu-items'] });

  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    await supabase.from('menu_items').insert({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available,
      modifiers: item.modifiers ? JSON.parse(JSON.stringify(item.modifiers)) : [],
      prep_time: item.prepTime ?? null,
      meal_period: item.mealPeriod ?? 'all-day',
      image: item.image || '',
    });
    invalidate();
  }, []);

  const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.available !== undefined) dbUpdates.available = updates.available;
    if (updates.modifiers !== undefined) dbUpdates.modifiers = JSON.parse(JSON.stringify(updates.modifiers));
    if (updates.prepTime !== undefined) dbUpdates.prep_time = updates.prepTime;
    if (updates.mealPeriod !== undefined) dbUpdates.meal_period = updates.mealPeriod;
    if (updates.image !== undefined) dbUpdates.image = updates.image;

    await supabase.from('menu_items').update(dbUpdates).eq('id', id);
    invalidate();
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    await supabase.from('menu_items').delete().eq('id', id);
    invalidate();
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', id);
    invalidate();
  }, [menuItems]);

  return (
    <MenuContext.Provider value={{ menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability }}>
      {children}
    </MenuContext.Provider>
  );
};
