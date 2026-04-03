
-- Update next_job_id to return JOB000001 format (6 digits)
CREATE OR REPLACE FUNCTION public.next_job_id(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _counter INTEGER;
BEGIN
  UPDATE public.job_counter SET counter = counter + 1 WHERE user_id = _user_id RETURNING counter INTO _counter;
  RETURN 'JOB' || LPAD(_counter::TEXT, 6, '0');
END;
$$;

-- Create sell_counter table
CREATE TABLE IF NOT EXISTS public.sell_counter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  counter integer NOT NULL DEFAULT 0
);
ALTER TABLE public.sell_counter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sell counter" ON public.sell_counter FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sell counter" ON public.sell_counter FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sell counter" ON public.sell_counter FOR UPDATE USING (auth.uid() = user_id);

-- Create next_sell_id function
CREATE OR REPLACE FUNCTION public.next_sell_id(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _counter INTEGER;
BEGIN
  UPDATE public.sell_counter SET counter = counter + 1 WHERE user_id = _user_id RETURNING counter INTO _counter;
  IF _counter IS NULL THEN
    INSERT INTO public.sell_counter (user_id, counter) VALUES (_user_id, 1) RETURNING counter INTO _counter;
  END IF;
  RETURN 'SELL' || LPAD(_counter::TEXT, 6, '0');
END;
$$;

-- Create sells table
CREATE TABLE IF NOT EXISTS public.sells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sell_id text NOT NULL,
  inventory_item_id uuid REFERENCES public.inventory(id),
  item_name text NOT NULL,
  item_sku text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  sell_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  customer_name text NOT NULL DEFAULT '',
  customer_mobile text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT 'Cash',
  status text NOT NULL DEFAULT 'Completed',
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);
ALTER TABLE public.sells ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sells" ON public.sells FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sells" ON public.sells FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sells" ON public.sells FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sells" ON public.sells FOR DELETE USING (auth.uid() = user_id);

-- Update handle_new_user to also create sell_counter
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  INSERT INTO public.job_counter (user_id, counter) VALUES (NEW.id, 0);
  INSERT INTO public.sell_counter (user_id, counter) VALUES (NEW.id, 0);
  INSERT INTO public.shop_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Public tracking: create a function to look up tracking info without auth
CREATE OR REPLACE FUNCTION public.track_order(_tracking_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Try repair jobs first
  SELECT jsonb_build_object(
    'type', 'job',
    'tracking_id', rj.job_id,
    'customer_name', rj.customer_name,
    'device_brand', rj.device_brand,
    'device_model', rj.device_model,
    'problem', rj.problem_description,
    'status', rj.status,
    'estimated_cost', rj.estimated_cost,
    'created_at', rj.created_at,
    'delivered_at', rj.delivered_at
  ) INTO result
  FROM public.repair_jobs rj
  WHERE rj.job_id = _tracking_id AND rj.deleted = false
    AND (rj.status != 'Delivered' OR rj.delivered_at > now() - interval '3 days')
  LIMIT 1;

  IF result IS NOT NULL THEN RETURN result; END IF;

  -- Try sells
  SELECT jsonb_build_object(
    'type', 'sell',
    'tracking_id', s.sell_id,
    'item_name', s.item_name,
    'quantity', s.quantity,
    'total', s.total,
    'status', s.status,
    'created_at', s.created_at
  ) INTO result
  FROM public.sells s
  WHERE s.sell_id = _tracking_id AND s.deleted = false
    AND s.created_at > now() - interval '30 days'
  LIMIT 1;

  RETURN result;
END;
$$;
