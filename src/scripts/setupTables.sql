-- Run this SQL in your Cloud View > Run SQL to create all required tables
-- Make sure "Test" environment is selected

-- Inventory items
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  current_stock numeric not null default 0,
  unit text not null default 'pcs',
  min_stock numeric not null default 0,
  max_stock numeric not null default 100,
  cost_per_unit numeric not null default 0,
  last_restocked timestamptz default now(),
  daily_usage numeric default 0,
  waste numeric default 0,
  created_at timestamptz default now()
);

-- Customers / CRM
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  total_visits integer default 0,
  total_spent numeric default 0,
  last_visit timestamptz,
  points integer default 0,
  tier text default 'Bronze',
  favorite_item text,
  created_at timestamptz default now()
);

-- Feedback
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  table_id integer references public.restaurant_tables(id),
  order_id uuid references public.orders(id),
  overall_rating integer not null check (overall_rating between 1 and 5),
  food_quality integer check (food_quality between 1 and 5),
  service integer check (service between 1 and 5),
  ambiance integer check (ambiance between 1 and 5),
  value_rating integer check (value_rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Reservations
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  party_size integer not null default 2,
  table_id integer references public.restaurant_tables(id),
  reservation_date date not null,
  time_slot text not null,
  status text default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed', 'no-show')),
  notes text,
  created_at timestamptz default now()
);

-- Coupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount text not null,
  usage_count integer default 0,
  status text default 'Active',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.inventory_items enable row level security;
alter table public.customers enable row level security;
alter table public.feedback enable row level security;
alter table public.reservations enable row level security;
alter table public.coupons enable row level security;

-- Inventory policies
create policy "inventory_select" on public.inventory_items for select using (true);
create policy "inventory_insert" on public.inventory_items for insert to authenticated with check (true);
create policy "inventory_update" on public.inventory_items for update to authenticated using (true) with check (true);
create policy "inventory_delete" on public.inventory_items for delete to authenticated using (true);

-- Customer policies
create policy "customers_select" on public.customers for select using (true);
create policy "customers_insert" on public.customers for insert to authenticated with check (true);
create policy "customers_update" on public.customers for update to authenticated using (true) with check (true);
create policy "customers_delete" on public.customers for delete to authenticated using (true);

-- Feedback policies (anon can submit feedback)
create policy "feedback_select" on public.feedback for select using (true);
create policy "feedback_insert" on public.feedback for insert to anon, authenticated with check (true);

-- Reservation policies (anon can create reservations)
create policy "reservations_select" on public.reservations for select using (true);
create policy "reservations_insert" on public.reservations for insert to anon, authenticated with check (true);
create policy "reservations_update" on public.reservations for update to authenticated using (true) with check (true);
create policy "reservations_delete" on public.reservations for delete to authenticated using (true);

-- Coupon policies
create policy "coupons_select" on public.coupons for select using (true);
create policy "coupons_insert" on public.coupons for insert to authenticated with check (true);
create policy "coupons_update" on public.coupons for update to authenticated using (true) with check (true);
create policy "coupons_delete" on public.coupons for delete to authenticated using (true);

-- Storage bucket for menu images
insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- Storage policies (may need to skip if already exist)
create policy "menu_images_public_read" on storage.objects for select using (bucket_id = 'menu-images');
create policy "menu_images_auth_insert" on storage.objects for insert to authenticated with check (bucket_id = 'menu-images');
create policy "menu_images_auth_update" on storage.objects for update to authenticated using (bucket_id = 'menu-images');
create policy "menu_images_auth_delete" on storage.objects for delete to authenticated using (bucket_id = 'menu-images');
