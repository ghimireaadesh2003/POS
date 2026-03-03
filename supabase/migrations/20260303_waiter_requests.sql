-- Waiter Requests table: stores customer service requests from QR-code ordering
CREATE TABLE public.waiter_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INT NOT NULL REFERENCES public.restaurant_tables(id),
  request_type TEXT NOT NULL DEFAULT 'help',
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.waiter_requests ENABLE ROW LEVEL SECURITY;

-- Customers (unauthenticated) can create requests
CREATE POLICY "Anyone can create waiter requests"
  ON public.waiter_requests FOR INSERT WITH CHECK (true);

-- Anyone can view requests (needed for customer confirmation + admin dashboard)
CREATE POLICY "Anyone can view waiter requests"
  ON public.waiter_requests FOR SELECT USING (true);

-- Only admins can update (acknowledge/resolve) requests
CREATE POLICY "Admins can update waiter requests"
  ON public.waiter_requests FOR UPDATE USING (public.is_admin());

-- Only admins can delete requests
CREATE POLICY "Admins can delete waiter requests"
  ON public.waiter_requests FOR DELETE USING (public.is_admin());

-- Enable Supabase Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_requests;
