import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import type { MenuItem, ModifierGroup, MealPeriod } from '@/data/mockData';

interface DbMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  available: boolean;
  modifiers: unknown;
  prep_time: number | null;
  meal_period: string | null;
}

function mapDbToMenuItem(db: DbMenuItem): MenuItem {
  return {
    id: db.id,
    name: db.name,
    description: db.description || '',
    price: Number(db.price),
    image: db.image || '',
    category: db.category,
    available: db.available,
    modifiers: (db.modifiers as ModifierGroup[]) || [],
    prepTime: db.prep_time ?? undefined,
    mealPeriod: (db.meal_period as MealPeriod) || 'all-day',
  };
}

export function useMenuItems() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('menu-items-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at');
      if (error) throw error;
      return (data as DbMenuItem[]).map(mapDbToMenuItem);
    },
  });
}

export function useCategories() {
  const { data: items } = useMenuItems();
  if (!items) return ['All'];
  const cats = [...new Set(items.map(i => i.category))];
  return ['All', ...cats];
}
