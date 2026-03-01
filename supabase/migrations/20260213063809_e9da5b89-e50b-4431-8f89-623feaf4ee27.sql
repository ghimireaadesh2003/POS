
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Convenience: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- RLS on user_roles: only admins
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- 4. Menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Mains',
  available BOOLEAN NOT NULL DEFAULT true,
  modifiers JSONB DEFAULT '[]',
  prep_time INT,
  meal_period TEXT DEFAULT 'all-day',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read available items; admins can read all
CREATE POLICY "Anyone can view available menu items" ON public.menu_items FOR SELECT USING (available = true OR public.is_admin());
CREATE POLICY "Admins can insert menu items" ON public.menu_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update menu items" ON public.menu_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete menu items" ON public.menu_items FOR DELETE USING (public.is_admin());

-- 5. Restaurant tables
CREATE TABLE public.restaurant_tables (
  id INT PRIMARY KEY,
  seats INT NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'free',
  current_order UUID,
  revenue NUMERIC(10,2) DEFAULT 0,
  avg_dine_time INT DEFAULT 45
);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tables" ON public.restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Admins can manage tables" ON public.restaurant_tables FOR ALL USING (public.is_admin());

-- 6. Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  table_id INT REFERENCES public.restaurant_tables(id),
  status TEXT NOT NULL DEFAULT 'sent',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'dine-in',
  customer_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can place orders (QR code ordering); admins can see all
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());

-- 7. Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  modifiers JSONB DEFAULT '[]',
  special_instructions TEXT
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE USING (public.is_admin());

-- 8. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Seed menu items from mock data
INSERT INTO public.menu_items (name, description, price, category, available, prep_time, meal_period, modifiers) VALUES
  ('Truffle Burrata', 'Creamy burrata with truffle honey, toasted sourdough & arugula', 16.50, 'Starters', true, NULL, 'all-day', '[{"name":"Add-ons","required":false,"maxSelect":3,"options":[{"name":"Extra truffle oil","price":3},{"name":"Prosciutto","price":4}]}]'),
  ('Crispy Calamari', 'Lightly fried with saffron aioli and charred lemon', 14.00, 'Starters', true, NULL, 'all-day', '[]'),
  ('Beef Carpaccio', 'Thinly sliced wagyu with rocket, parmesan & caper berries', 18.00, 'Starters', true, NULL, 'dinner', '[]'),
  ('Wagyu Ribeye', 'Grade A5 wagyu, bone marrow butter, roasted garlic jus', 58.00, 'Grills', true, 25, 'dinner', '[{"name":"Doneness","required":true,"maxSelect":1,"options":[{"name":"Rare","price":0},{"name":"Medium Rare","price":0},{"name":"Medium","price":0},{"name":"Well Done","price":0}]},{"name":"Sides","required":false,"maxSelect":2,"options":[{"name":"Truffle fries","price":5},{"name":"Grilled asparagus","price":4},{"name":"Mashed potatoes","price":4}]}]'),
  ('Pan-Seared Salmon', 'Atlantic salmon, citrus beurre blanc, fennel slaw', 34.00, 'Mains', true, 18, 'lunch', '[]'),
  ('Lamb Shank', 'Slow-braised 8hr lamb, polenta, gremolata', 38.00, 'Mains', true, 15, 'dinner', '[]'),
  ('Margherita DOP', 'San Marzano, fior di latte, fresh basil, EVO', 18.00, 'Pizza', true, 12, 'all-day', '[]'),
  ('Truffle Mushroom Pizza', 'Wild mushroom, truffle cream, fontina, thyme', 24.00, 'Pizza', true, NULL, 'all-day', '[]'),
  ('Lobster Linguine', 'Half lobster, cherry tomato, chili, white wine', 32.00, 'Pasta', true, NULL, 'dinner', '[]'),
  ('Cacio e Pepe', 'Handmade tonnarelli, pecorino romano, black pepper', 20.00, 'Pasta', true, NULL, 'all-day', '[]'),
  ('Tiramisu', 'Classic mascarpone, espresso-soaked savoiardi', 14.00, 'Desserts', true, NULL, 'all-day', '[]'),
  ('Panna Cotta', 'Vanilla bean, seasonal berry compote', 12.00, 'Desserts', true, NULL, 'all-day', '[]'),
  ('Espresso Martini', 'Vodka, fresh espresso, coffee liqueur', 16.00, 'Drinks', true, NULL, 'dinner', '[]'),
  ('Negroni', 'Gin, Campari, sweet vermouth', 15.00, 'Drinks', true, NULL, 'dinner', '[]'),
  ('Sparkling Water', 'San Pellegrino 750ml', 6.00, 'Drinks', true, NULL, 'all-day', '[]'),
  ('Chicken Milanese', 'Crispy breaded chicken, arugula, cherry tomatoes', 26.00, 'Mains', false, NULL, 'lunch', '[]'),
  ('Eggs Benedict', 'Poached eggs, hollandaise, English muffin, prosciutto', 18.00, 'Mains', true, NULL, 'breakfast', '[]'),
  ('Avocado Toast', 'Smashed avocado, poached egg, chili flakes, sourdough', 14.00, 'Starters', true, NULL, 'breakfast', '[]'),
  ('Granola Bowl', 'House granola, Greek yogurt, seasonal berries, honey', 12.00, 'Starters', true, NULL, 'breakfast', '[]');

-- 10. Seed restaurant tables
INSERT INTO public.restaurant_tables (id, seats, status) VALUES
  (1,2,'free'),(2,4,'occupied'),(3,4,'free'),(4,6,'occupied'),(5,2,'free'),
  (6,4,'billing'),(7,8,'occupied'),(8,4,'occupied'),(9,2,'free'),(10,6,'free'),
  (11,4,'free'),(12,4,'occupied'),(13,2,'free'),(14,4,'free'),(15,6,'reserved'),
  (16,8,'free'),(17,2,'free'),(18,4,'occupied'),(19,4,'free'),(20,10,'free');
