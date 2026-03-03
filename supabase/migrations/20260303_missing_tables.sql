-- ============================================================
-- Migration: Create missing tables referenced by frontend hooks
-- and enable Supabase Realtime publication for all tables.
-- Uses IF NOT EXISTS so it's safe if tables were created manually.
-- ============================================================

-- 1. Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_visits INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_visit TIMESTAMPTZ,
  points INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  favorite_item TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Anyone can view customers') THEN
    CREATE POLICY "Anyone can view customers" ON public.customers FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Admins can manage customers') THEN
    CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- 2. Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount TEXT NOT NULL,
  usage_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Anyone can view coupons') THEN
    CREATE POLICY "Anyone can view coupons" ON public.coupons FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Admins can manage coupons') THEN
    CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- 3. Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  current_stock INT NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  min_stock INT NOT NULL DEFAULT 0,
  max_stock INT NOT NULL DEFAULT 100,
  cost_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_restocked TIMESTAMPTZ NOT NULL DEFAULT now(),
  daily_usage NUMERIC(10,2) NOT NULL DEFAULT 0,
  waste NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Admins can manage inventory') THEN
    CREATE POLICY "Admins can manage inventory" ON public.inventory_items FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- 4. Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  party_size INT NOT NULL DEFAULT 1,
  table_id INT REFERENCES public.restaurant_tables(id),
  reservation_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reservations' AND policyname = 'Anyone can create reservations') THEN
    CREATE POLICY "Anyone can create reservations" ON public.reservations FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reservations' AND policyname = 'Anyone can view reservations') THEN
    CREATE POLICY "Anyone can view reservations" ON public.reservations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reservations' AND policyname = 'Admins can manage reservations') THEN
    CREATE POLICY "Admins can manage reservations" ON public.reservations FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================================
-- 5. Enable Supabase Realtime for ALL tables
-- Wrapped in individual DO blocks so each succeeds independently
-- (a table already in the publication won't cause failure)
-- ============================================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
