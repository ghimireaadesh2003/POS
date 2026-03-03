-- ============================================================
-- SQL: Enable Realtime for all POS tables
-- Run this in your Supabase SQL Editor if realtime updates aren't appearing
-- ============================================================

DO $$ 
BEGIN
  -- Add tables to the realtime publication if they aren't already there
  -- This is required for Supabase Realtime to work
  
  -- Create publication if it doesn't exist (unlikely in Supabase but safe)
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Add tables (wrapped in exception blocks in case they are already added)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_requests;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- Verify which tables are in the publication
  -- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
END $$;
