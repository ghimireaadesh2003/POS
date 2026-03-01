export type MealPeriod = 'breakfast' | 'lunch' | 'dinner' | 'all-day';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  modifiers?: ModifierGroup[];
  prepTime?: number;
  mealPeriod?: MealPeriod;
  comboId?: string;
}

export interface ComboMeal {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  originalPrice: number;
  comboPrice: number;
  mealPeriod?: MealPeriod;
  active: boolean;
}

export function getCurrentMealPeriod(): MealPeriod {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  return 'dinner';
}

export function getMenuForPeriod(period: MealPeriod): MenuItem[] {
  return menuItems.filter(i => !i.mealPeriod || i.mealPeriod === 'all-day' || i.mealPeriod === period);
}

export function getCombosForPeriod(period: MealPeriod): ComboMeal[] {
  return comboMeals.filter(c => c.active && (!c.mealPeriod || c.mealPeriod === 'all-day' || c.mealPeriod === period));
}

export interface ModifierGroup {
  name: string;
  required: boolean;
  maxSelect: number;
  options: { name: string; price: number }[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  modifiers: { group: string; selected: string[] }[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  table: number;
  items: CartItem[];
  status: 'sent' | 'preparing' | 'ready' | 'served' | 'cancelled';
  total: number;
  createdAt: string;
  type: 'dine-in' | 'takeaway' | 'delivery';
  customerName?: string;
}

export interface TableInfo {
  id: number;
  seats: number;
  status: 'free' | 'occupied' | 'billing' | 'reserved';
  currentOrder?: string;
  revenue: number;
  avgDineTime: number;
}

export const categories = [
  'All', 'Starters', 'Mains', 'Pizza', 'Pasta', 'Grills', 'Desserts', 'Drinks'
];

export const menuItems: MenuItem[] = [
  {
    id: '1', name: 'Truffle Burrata', description: 'Creamy burrata with truffle honey, toasted sourdough & arugula', price: 16.50, image: '', category: 'Starters', available: true, mealPeriod: 'all-day',
    modifiers: [{ name: 'Add-ons', required: false, maxSelect: 3, options: [{ name: 'Extra truffle oil', price: 3 }, { name: 'Prosciutto', price: 4 }] }],
  },
  { id: '2', name: 'Crispy Calamari', description: 'Lightly fried with saffron aioli and charred lemon', price: 14, image: '', category: 'Starters', available: true, mealPeriod: 'all-day' },
  { id: '3', name: 'Beef Carpaccio', description: 'Thinly sliced wagyu with rocket, parmesan & caper berries', price: 18, image: '', category: 'Starters', available: true, mealPeriod: 'dinner' },
  {
    id: '4', name: 'Wagyu Ribeye', description: 'Grade A5 wagyu, bone marrow butter, roasted garlic jus', price: 58, image: '', category: 'Grills', available: true, prepTime: 25, mealPeriod: 'dinner',
    modifiers: [
      { name: 'Doneness', required: true, maxSelect: 1, options: [{ name: 'Rare', price: 0 }, { name: 'Medium Rare', price: 0 }, { name: 'Medium', price: 0 }, { name: 'Well Done', price: 0 }] },
      { name: 'Sides', required: false, maxSelect: 2, options: [{ name: 'Truffle fries', price: 5 }, { name: 'Grilled asparagus', price: 4 }, { name: 'Mashed potatoes', price: 4 }] },
    ],
  },
  { id: '5', name: 'Pan-Seared Salmon', description: 'Atlantic salmon, citrus beurre blanc, fennel slaw', price: 34, image: '', category: 'Mains', available: true, prepTime: 18, mealPeriod: 'lunch' },
  { id: '6', name: 'Lamb Shank', description: 'Slow-braised 8hr lamb, polenta, gremolata', price: 38, image: '', category: 'Mains', available: true, prepTime: 15, mealPeriod: 'dinner' },
  { id: '7', name: 'Margherita DOP', description: 'San Marzano, fior di latte, fresh basil, EVO', price: 18, image: '', category: 'Pizza', available: true, prepTime: 12, mealPeriod: 'all-day' },
  { id: '8', name: 'Truffle Mushroom Pizza', description: 'Wild mushroom, truffle cream, fontina, thyme', price: 24, image: '', category: 'Pizza', available: true, mealPeriod: 'all-day' },
  { id: '9', name: 'Lobster Linguine', description: 'Half lobster, cherry tomato, chili, white wine', price: 32, image: '', category: 'Pasta', available: true, mealPeriod: 'dinner' },
  { id: '10', name: 'Cacio e Pepe', description: 'Handmade tonnarelli, pecorino romano, black pepper', price: 20, image: '', category: 'Pasta', available: true, mealPeriod: 'all-day' },
  { id: '11', name: 'Tiramisu', description: 'Classic mascarpone, espresso-soaked savoiardi', price: 14, image: '', category: 'Desserts', available: true, mealPeriod: 'all-day' },
  { id: '12', name: 'Panna Cotta', description: 'Vanilla bean, seasonal berry compote', price: 12, image: '', category: 'Desserts', available: true, mealPeriod: 'all-day' },
  { id: '13', name: 'Espresso Martini', description: 'Vodka, fresh espresso, coffee liqueur', price: 16, image: '', category: 'Drinks', available: true, mealPeriod: 'dinner' },
  { id: '14', name: 'Negroni', description: 'Gin, Campari, sweet vermouth', price: 15, image: '', category: 'Drinks', available: true, mealPeriod: 'dinner' },
  { id: '15', name: 'Sparkling Water', description: 'San Pellegrino 750ml', price: 6, image: '', category: 'Drinks', available: true, mealPeriod: 'all-day' },
  { id: '16', name: 'Chicken Milanese', description: 'Crispy breaded chicken, arugula, cherry tomatoes', price: 26, image: '', category: 'Mains', available: false, mealPeriod: 'lunch' },
  // Breakfast items
  { id: '17', name: 'Eggs Benedict', description: 'Poached eggs, hollandaise, English muffin, prosciutto', price: 18, image: '', category: 'Mains', available: true, mealPeriod: 'breakfast' },
  { id: '18', name: 'Avocado Toast', description: 'Smashed avocado, poached egg, chili flakes, sourdough', price: 14, image: '', category: 'Starters', available: true, mealPeriod: 'breakfast' },
  { id: '19', name: 'Granola Bowl', description: 'House granola, Greek yogurt, seasonal berries, honey', price: 12, image: '', category: 'Starters', available: true, mealPeriod: 'breakfast' },
];

export const comboMeals: ComboMeal[] = [
  {
    id: 'combo-1',
    name: 'Date Night Special',
    description: 'Burrata + Wagyu Ribeye + Tiramisu for two',
    itemIds: ['1', '4', '11'],
    originalPrice: 88.50,
    comboPrice: 74.99,
    mealPeriod: 'dinner',
    active: true,
  },
  {
    id: 'combo-2',
    name: 'Lunch Express',
    description: 'Calamari + Salmon + Panna Cotta',
    itemIds: ['2', '5', '12'],
    originalPrice: 60,
    comboPrice: 49.99,
    mealPeriod: 'lunch',
    active: true,
  },
  {
    id: 'combo-3',
    name: 'Pizza & Pasta Feast',
    description: 'Margherita + Cacio e Pepe + Sparkling Water',
    itemIds: ['7', '10', '15'],
    originalPrice: 44,
    comboPrice: 36.99,
    mealPeriod: 'all-day',
    active: true,
  },
  {
    id: 'combo-4',
    name: 'Breakfast Bundle',
    description: 'Eggs Benedict + Granola Bowl + Sparkling Water',
    itemIds: ['17', '19', '15'],
    originalPrice: 36,
    comboPrice: 28.99,
    mealPeriod: 'breakfast',
    active: true,
  },
];

export const orders: Order[] = [
  { id: 'ORD-001', table: 5, items: [], status: 'preparing', total: 86.50, createdAt: '2026-02-12T12:30:00', type: 'dine-in' },
  { id: 'ORD-002', table: 12, items: [], status: 'sent', total: 124.00, createdAt: '2026-02-12T12:45:00', type: 'dine-in' },
  { id: 'ORD-003', table: 3, items: [], status: 'ready', total: 45.00, createdAt: '2026-02-12T12:15:00', type: 'dine-in' },
  { id: 'ORD-004', table: 0, items: [], status: 'preparing', total: 62.00, createdAt: '2026-02-12T12:50:00', type: 'takeaway', customerName: 'Sarah M.' },
  { id: 'ORD-005', table: 8, items: [], status: 'served', total: 156.00, createdAt: '2026-02-12T11:30:00', type: 'dine-in' },
  { id: 'ORD-006', table: 0, items: [], status: 'sent', total: 38.50, createdAt: '2026-02-12T12:55:00', type: 'delivery', customerName: 'James K.' },
];

export const tables: TableInfo[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  seats: [2, 4, 4, 6, 2, 4, 8, 4, 2, 6, 4, 4, 2, 4, 6, 8, 2, 4, 4, 10][i],
  status: (['free', 'occupied', 'free', 'occupied', 'free', 'billing', 'occupied', 'occupied', 'free', 'free', 'free', 'occupied', 'free', 'free', 'reserved', 'free', 'free', 'occupied', 'free', 'free'] as TableInfo['status'][])[i],
  currentOrder: [undefined, 'ORD-002', undefined, 'ORD-001', undefined, 'ORD-003', undefined, 'ORD-005', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined][i],
  revenue: Math.floor(Math.random() * 800) + 200,
  avgDineTime: Math.floor(Math.random() * 30) + 40,
}));

export const dailyStats = {
  revenue: 4826,
  orders: 67,
  activeTables: 8,
  avgTurnover: 52,
  peakHours: [
    { hour: '11', orders: 5 }, { hour: '12', orders: 12 }, { hour: '13', orders: 15 },
    { hour: '14', orders: 8 }, { hour: '15', orders: 4 }, { hour: '16', orders: 3 },
    { hour: '17', orders: 6 }, { hour: '18', orders: 10 }, { hour: '19', orders: 18 },
    { hour: '20', orders: 22 }, { hour: '21', orders: 16 }, { hour: '22', orders: 8 },
  ],
};
