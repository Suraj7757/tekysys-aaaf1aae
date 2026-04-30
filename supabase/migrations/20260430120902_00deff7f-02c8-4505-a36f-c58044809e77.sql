-- 1. Extend role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'shopkeeper';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'wholesaler';

-- 2. account_type on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'shopkeeper';

-- 3. Update signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _acct text;
  _role app_role;
BEGIN
  _acct := COALESCE(NEW.raw_user_meta_data->>'account_type', 'shopkeeper');
  IF _acct NOT IN ('shopkeeper','wholesaler','customer') THEN _acct := 'shopkeeper'; END IF;

  INSERT INTO public.profiles (user_id, display_name, referral_code, tracking_id, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'RD' || UPPER(SUBSTR(md5(NEW.id::text), 1, 6)),
    'RX' || UPPER(SUBSTR(md5(NEW.id::text || NOW()::text), 1, 6)),
    _acct
  );

  -- map role
  _role := CASE _acct
    WHEN 'wholesaler' THEN 'wholesaler'::app_role
    WHEN 'customer'   THEN 'customer'::app_role
    ELSE 'admin'::app_role  -- shopkeeper is admin of own shop (existing behaviour)
  END;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  -- Wallet & subscription for everyone
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trial', NOW() + INTERVAL '7 days');

  -- Shop-specific tables only for shopkeepers
  IF _acct = 'shopkeeper' THEN
    INSERT INTO public.job_counter (user_id, counter) VALUES (NEW.id, 0);
    INSERT INTO public.sell_counter (user_id, counter) VALUES (NEW.id, 0);
    INSERT INTO public.shop_settings (user_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- 4. wholesale_catalog
CREATE TABLE IF NOT EXISTS public.wholesale_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_name text NOT NULL,
  sku text NOT NULL DEFAULT '',
  category text DEFAULT '',
  bulk_price numeric NOT NULL DEFAULT 0,
  moq integer NOT NULL DEFAULT 1,
  stock integer NOT NULL DEFAULT 0,
  description text DEFAULT '',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wholesale_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own catalog" ON public.wholesale_catalog FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can view active catalog" ON public.wholesale_catalog FOR SELECT TO authenticated
  USING (active = true);
CREATE POLICY "Admins manage all catalog" ON public.wholesale_catalog FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_wholesale_catalog_updated BEFORE UPDATE ON public.wholesale_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. customer_orders
CREATE TABLE IF NOT EXISTS public.customer_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  shopkeeper_id uuid NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customer manage own orders" ON public.customer_orders FOR ALL TO authenticated
  USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Shopkeeper view received orders" ON public.customer_orders FOR SELECT TO authenticated
  USING (auth.uid() = shopkeeper_id);
CREATE POLICY "Shopkeeper update received orders" ON public.customer_orders FOR UPDATE TO authenticated
  USING (auth.uid() = shopkeeper_id);
CREATE POLICY "Admins manage all orders" ON public.customer_orders FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_customer_orders_updated BEFORE UPDATE ON public.customer_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. admin_discounts
CREATE TABLE IF NOT EXISTS public.admin_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  percent numeric NOT NULL DEFAULT 0,
  reason text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage discounts" ON public.admin_discounts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users view own discounts" ON public.admin_discounts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 7. Super admin god-mode policies on existing tables
-- repair_jobs
CREATE POLICY "Admins view all jobs" ON public.repair_jobs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update all jobs" ON public.repair_jobs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete all jobs" ON public.repair_jobs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- sells
CREATE POLICY "Admins view all sells" ON public.sells FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update all sells" ON public.sells FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete all sells" ON public.sells FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- payments
CREATE POLICY "Admins view all payments" ON public.payments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update all payments" ON public.payments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete all payments" ON public.payments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- inventory
CREATE POLICY "Admins view all inventory" ON public.inventory FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update all inventory" ON public.inventory FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete all inventory" ON public.inventory FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- expenses
CREATE POLICY "Admins manage all expenses" ON public.expenses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- branches
CREATE POLICY "Admins manage all branches" ON public.branches FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- booking_requests
CREATE POLICY "Admins view all bookings" ON public.booking_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update all bookings" ON public.booking_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete all bookings" ON public.booking_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- shop_settings
CREATE POLICY "Admins view all shop settings" ON public.shop_settings FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update all shop settings" ON public.shop_settings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- loyalty_settings
CREATE POLICY "Admins manage all loyalty" ON public.loyalty_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- subscriptions admin update
CREATE POLICY "Admins update all subscriptions" ON public.subscriptions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- referrals admin update/delete
CREATE POLICY "Admins update referrals" ON public.referrals FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete referrals" ON public.referrals FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- customers admin
CREATE POLICY "Admins view all customers" ON public.customers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update all customers" ON public.customers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete all customers" ON public.customers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. Admin RPCs
CREATE OR REPLACE FUNCTION public.admin_set_user_plan(_user_id uuid, _plan text, _expires_at timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE public.profiles SET plan_expires_at = _expires_at WHERE user_id = _user_id;
  UPDATE public.subscriptions SET plan = _plan, expires_at = _expires_at, status = CASE WHEN _expires_at > now() THEN 'active' ELSE 'expired' END WHERE user_id = _user_id;
  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (user_id, plan, status, expires_at) VALUES (_user_id, _plan, 'active', _expires_at);
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_plan(uuid, text, timestamptz) FROM anon;

CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role) FROM anon;

CREATE OR REPLACE FUNCTION public.admin_adjust_wallet(_user_id uuid, _delta numeric, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE public.wallets SET balance = balance + _delta,
    total_earned = total_earned + GREATEST(_delta, 0),
    total_withdrawn = total_withdrawn + GREATEST(-_delta, 0)
    WHERE user_id = _user_id;
  INSERT INTO public.wallet_transactions (user_id, amount, type, source, description, status)
  VALUES (_user_id, _delta, CASE WHEN _delta >= 0 THEN 'earning' ELSE 'deduction' END, 'admin', COALESCE(_note,'Admin adjustment'), 'completed');
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_adjust_wallet(uuid, numeric, text) FROM anon;

CREATE OR REPLACE FUNCTION public.admin_apply_discount(_user_id uuid, _percent numeric, _reason text, _expires_at timestamptz DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _id uuid;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  INSERT INTO public.admin_discounts (user_id, percent, reason, expires_at, created_by)
  VALUES (_user_id, _percent, _reason, _expires_at, auth.uid()) RETURNING id INTO _id;
  RETURN _id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_apply_discount(uuid, numeric, text, timestamptz) FROM anon;