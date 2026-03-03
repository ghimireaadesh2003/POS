-- ============================================================
-- RPC: create_order_with_items
-- Purpose: Ensures either the order AND all its items are saved, 
-- or none are. This prevents orphan orders in the database.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  order_data JSONB,
  items_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to bypass common RLS issues during complex inserts
SET search_path = public
AS $$
DECLARE
  new_order_id UUID;
  new_order_record RECORD;
BEGIN
  -- 1. Insert the order
  INSERT INTO public.orders (
    order_number,
    table_id,
    total,
    type,
    status,
    customer_name
  )
  VALUES (
    (order_data->>'order_number'),
    (order_data->>'table_id')::INT,
    (order_data->>'total')::NUMERIC,
    COALESCE(order_data->>'type', 'dine-in'),
    COALESCE(order_data->>'status', 'sent'),
    (order_data->>'customer_name')
  )
  RETURNING id INTO new_order_id;

  -- 2. Insert the items associated with the new order ID
  INSERT INTO public.order_items (
    order_id,
    menu_item_id,
    name,
    price,
    quantity,
    modifiers,
    special_instructions
  )
  SELECT 
    new_order_id,
    (item->>'menu_item_id')::UUID,
    (item->>'name'),
    (item->>'price')::NUMERIC,
    (item->>'quantity')::INT,
    COALESCE(item->'modifiers', '[]'::JSONB),
    (item->>'special_instructions')
  FROM jsonb_array_elements(items_data) AS item;

  -- 3. Return the created order
  SELECT * FROM public.orders WHERE id = new_order_id INTO new_order_record;
  RETURN to_jsonb(new_order_record);
END;
$$;
