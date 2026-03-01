import { supabase } from '@/integrations/supabase/client';

const menuItemsData = [
  { name: 'Truffle Burrata', description: 'Creamy burrata with truffle honey, toasted sourdough & arugula', price: 16.50, category: 'Starters', available: true, meal_period: 'all-day', modifiers: [{ name: 'Add-ons', required: false, maxSelect: 3, options: [{ name: 'Extra truffle oil', price: 3 }, { name: 'Prosciutto', price: 4 }] }] },
  { name: 'Crispy Calamari', description: 'Lightly fried with saffron aioli and charred lemon', price: 14, category: 'Starters', available: true, meal_period: 'all-day' },
  { name: 'Beef Carpaccio', description: 'Thinly sliced wagyu with rocket, parmesan & caper berries', price: 18, category: 'Starters', available: true, meal_period: 'dinner' },
  { name: 'Wagyu Ribeye', description: 'Grade A5 wagyu, bone marrow butter, roasted garlic jus', price: 58, category: 'Grills', available: true, prep_time: 25, meal_period: 'dinner', modifiers: [{ name: 'Doneness', required: true, maxSelect: 1, options: [{ name: 'Rare', price: 0 }, { name: 'Medium Rare', price: 0 }, { name: 'Medium', price: 0 }, { name: 'Well Done', price: 0 }] }, { name: 'Sides', required: false, maxSelect: 2, options: [{ name: 'Truffle fries', price: 5 }, { name: 'Grilled asparagus', price: 4 }, { name: 'Mashed potatoes', price: 4 }] }] },
  { name: 'Pan-Seared Salmon', description: 'Atlantic salmon, citrus beurre blanc, fennel slaw', price: 34, category: 'Mains', available: true, prep_time: 18, meal_period: 'lunch' },
  { name: 'Lamb Shank', description: 'Slow-braised 8hr lamb, polenta, gremolata', price: 38, category: 'Mains', available: true, prep_time: 15, meal_period: 'dinner' },
  { name: 'Margherita DOP', description: 'San Marzano, fior di latte, fresh basil, EVO', price: 18, category: 'Pizza', available: true, prep_time: 12, meal_period: 'all-day' },
  { name: 'Truffle Mushroom Pizza', description: 'Wild mushroom, truffle cream, fontina, thyme', price: 24, category: 'Pizza', available: true, meal_period: 'all-day' },
  { name: 'Lobster Linguine', description: 'Half lobster, cherry tomato, chili, white wine', price: 32, category: 'Pasta', available: true, meal_period: 'dinner' },
  { name: 'Cacio e Pepe', description: 'Handmade tonnarelli, pecorino romano, black pepper', price: 20, category: 'Pasta', available: true, meal_period: 'all-day' },
  { name: 'Tiramisu', description: 'Classic mascarpone, espresso-soaked savoiardi', price: 14, category: 'Desserts', available: true, meal_period: 'all-day' },
  { name: 'Panna Cotta', description: 'Vanilla bean, seasonal berry compote', price: 12, category: 'Desserts', available: true, meal_period: 'all-day' },
  { name: 'Espresso Martini', description: 'Vodka, fresh espresso, coffee liqueur', price: 16, category: 'Drinks', available: true, meal_period: 'dinner' },
  { name: 'Negroni', description: 'Gin, Campari, sweet vermouth', price: 15, category: 'Drinks', available: true, meal_period: 'dinner' },
  { name: 'Sparkling Water', description: 'San Pellegrino 750ml', price: 6, category: 'Drinks', available: true, meal_period: 'all-day' },
  { name: 'Chicken Milanese', description: 'Crispy breaded chicken, arugula, cherry tomatoes', price: 26, category: 'Mains', available: true, meal_period: 'lunch' },
  { name: 'Eggs Benedict', description: 'Poached eggs, hollandaise, English muffin, prosciutto', price: 18, category: 'Mains', available: true, meal_period: 'breakfast' },
  { name: 'Avocado Toast', description: 'Smashed avocado, poached egg, chili flakes, sourdough', price: 14, category: 'Starters', available: true, meal_period: 'breakfast' },
  { name: 'Granola Bowl', description: 'House granola, Greek yogurt, seasonal berries, honey', price: 12, category: 'Starters', available: true, meal_period: 'breakfast' },
];

const tablesData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  seats: [2, 4, 4, 6, 2, 4, 8, 4, 2, 6, 4, 4, 2, 4, 6, 8, 2, 4, 4, 10][i],
  status: 'free',
  revenue: Math.floor(Math.random() * 800) + 200,
  avg_dine_time: Math.floor(Math.random() * 30) + 40,
}));

const inventoryData = [
  { name: 'Wagyu Beef A5', category: 'Proteins', current_stock: 8, unit: 'kg', min_stock: 5, max_stock: 30, cost_per_unit: 120, daily_usage: 3, waste: 0.2 },
  { name: 'Atlantic Salmon', category: 'Proteins', current_stock: 12, unit: 'kg', min_stock: 8, max_stock: 25, cost_per_unit: 28, daily_usage: 4, waste: 0.5 },
  { name: 'Burrata Cheese', category: 'Dairy', current_stock: 3, unit: 'kg', min_stock: 5, max_stock: 15, cost_per_unit: 32, daily_usage: 2, waste: 0.3 },
  { name: 'San Marzano Tomatoes', category: 'Produce', current_stock: 20, unit: 'cans', min_stock: 10, max_stock: 50, cost_per_unit: 4.5, daily_usage: 6, waste: 0 },
  { name: 'Truffle Oil', category: 'Condiments', current_stock: 2, unit: 'bottles', min_stock: 3, max_stock: 10, cost_per_unit: 45, daily_usage: 0.5, waste: 0 },
  { name: 'Fresh Lobster', category: 'Proteins', current_stock: 6, unit: 'pcs', min_stock: 4, max_stock: 15, cost_per_unit: 38, daily_usage: 3, waste: 0.1 },
  { name: 'Mascarpone', category: 'Dairy', current_stock: 5, unit: 'kg', min_stock: 3, max_stock: 12, cost_per_unit: 18, daily_usage: 1.5, waste: 0.1 },
  { name: 'Pecorino Romano', category: 'Dairy', current_stock: 4, unit: 'kg', min_stock: 3, max_stock: 10, cost_per_unit: 22, daily_usage: 1, waste: 0 },
  { name: 'Pizza Dough', category: 'Prepared', current_stock: 18, unit: 'balls', min_stock: 15, max_stock: 40, cost_per_unit: 2, daily_usage: 10, waste: 2 },
  { name: 'Espresso Beans', category: 'Beverages', current_stock: 7, unit: 'kg', min_stock: 5, max_stock: 20, cost_per_unit: 35, daily_usage: 2, waste: 0 },
];

const customersData = [
  { name: 'Emma Wilson', email: 'emma@mail.com', phone: '+1 555-0101', total_visits: 32, total_spent: 2840, points: 1420, tier: 'Platinum', favorite_item: 'Wagyu Ribeye', last_visit: '2026-02-12T20:00:00Z' },
  { name: 'James Chen', email: 'james@mail.com', phone: '+1 555-0102', total_visits: 18, total_spent: 1560, points: 780, tier: 'Gold', favorite_item: 'Lobster Linguine', last_visit: '2026-02-11T19:00:00Z' },
  { name: 'Sarah Johnson', email: 'sarah@mail.com', phone: '+1 555-0103', total_visits: 12, total_spent: 980, points: 490, tier: 'Silver', favorite_item: 'Truffle Burrata', last_visit: '2026-02-10T18:30:00Z' },
  { name: 'Michael Brown', email: 'michael@mail.com', phone: '+1 555-0104', total_visits: 8, total_spent: 640, points: 320, tier: 'Silver', favorite_item: 'Cacio e Pepe', last_visit: '2026-02-09T20:00:00Z' },
  { name: 'Lisa Park', email: 'lisa@mail.com', phone: '+1 555-0105', total_visits: 5, total_spent: 380, points: 190, tier: 'Bronze', favorite_item: 'Margherita DOP', last_visit: '2026-02-08T12:30:00Z' },
  { name: 'David Kim', email: 'david@mail.com', phone: '+1 555-0106', total_visits: 22, total_spent: 2100, points: 1050, tier: 'Gold', favorite_item: 'Espresso Martini', last_visit: '2026-02-12T21:00:00Z' },
  { name: 'Anna Martinez', email: 'anna@mail.com', phone: '+1 555-0107', total_visits: 3, total_spent: 180, points: 90, tier: 'Bronze', favorite_item: 'Tiramisu', last_visit: '2026-02-06T19:30:00Z' },
];

const couponsData = [
  { code: 'WELCOME20', discount: '20% off', usage_count: 45, status: 'Active' },
  { code: 'BIRTHDAY10', discount: '$10 off', usage_count: 12, status: 'Active' },
  { code: 'LOYALTY50', discount: '$50 off', usage_count: 3, status: 'Active' },
];

export async function seedDatabase() {
  console.log('Seeding menu items...');
  const { error: menuError } = await supabase
    .from('menu_items')
    .upsert(menuItemsData as any[], { onConflict: 'name' });
  if (menuError) {
    console.error('Menu seed error:', menuError);
    const { error: insertError } = await supabase.from('menu_items').insert(menuItemsData as any[]);
    if (insertError) console.error('Menu insert error:', insertError);
    else console.log('Menu items inserted');
  } else {
    console.log('Menu items seeded');
  }

  console.log('Seeding tables...');
  const { error: tableError } = await supabase
    .from('restaurant_tables')
    .upsert(tablesData as any[], { onConflict: 'id' });
  if (tableError) console.error('Tables seed error:', tableError);
  else console.log('Tables seeded');

  console.log('Seeding inventory...');
  const { error: invError } = await (supabase as any).from('inventory_items').insert(inventoryData);
  if (invError) console.error('Inventory seed error:', invError);
  else console.log('Inventory seeded');

  console.log('Seeding customers...');
  const { error: custError } = await (supabase as any).from('customers').insert(customersData);
  if (custError) console.error('Customer seed error:', custError);
  else console.log('Customers seeded');

  console.log('Seeding coupons...');
  const { error: couponError } = await (supabase as any).from('coupons').insert(couponsData);
  if (couponError) console.error('Coupon seed error:', couponError);
  else console.log('Coupons seeded');

  return { success: true };
}
