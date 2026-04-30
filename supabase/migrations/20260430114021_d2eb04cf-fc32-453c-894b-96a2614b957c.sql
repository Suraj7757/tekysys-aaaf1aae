-- ============ 1) MULTI-SHOP / BRANCHES ============
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  address text DEFAULT '',
  phone text DEFAULT '',
  is_primary boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_branches_user ON public.branches(user_id);
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own branches" ON public.branches
  FOR ALL TO authenticated
  USING (auth.uid() = user_id AND public.is_not_banned())
  WITH CHECK (auth.uid() = user_id AND public.is_not_banned());

CREATE TRIGGER trg_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add branch_id to existing entity tables (nullable so legacy rows still work)
ALTER TABLE public.repair_jobs ADD COLUMN branch_id uuid;
ALTER TABLE public.sells ADD COLUMN branch_id uuid;
ALTER TABLE public.inventory ADD COLUMN branch_id uuid;
ALTER TABLE public.payments ADD COLUMN branch_id uuid;
CREATE INDEX idx_repair_jobs_branch ON public.repair_jobs(branch_id);
CREATE INDEX idx_sells_branch ON public.sells(branch_id);
CREATE INDEX idx_inventory_branch ON public.inventory(branch_id);
CREATE INDEX idx_payments_branch ON public.payments(branch_id);

-- ============ 2) LOYALTY & REWARDS ============
CREATE TABLE public.loyalty_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  points_per_rupee numeric NOT NULL DEFAULT 1,           -- 1 point per ₹1 spent
  rupee_per_point numeric NOT NULL DEFAULT 0.10,         -- 1 point = ₹0.10 on redeem
  signup_bonus integer NOT NULL DEFAULT 50,
  min_redeem_points integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own loyalty settings" ON public.loyalty_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_loyalty_settings_updated_at
  BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.customers ADD COLUMN points integer NOT NULL DEFAULT 0;

CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('earn','redeem','adjust','signup_bonus')),
  points integer NOT NULL,
  reference_type text,        -- 'job' | 'sell' | 'manual'
  reference_id text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_loyalty_tx_customer ON public.loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_tx_user ON public.loyalty_transactions(user_id);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own loyalty tx" ON public.loyalty_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners insert own loyalty tx" ON public.loyalty_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.is_not_banned());

-- ============ 3) EXPENSES & PROFIT ============
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  branch_id uuid,
  category text NOT NULL DEFAULT 'Other',     -- Rent, Salary, Utilities, Parts, Marketing, Other
  amount numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text DEFAULT 'Cash',
  deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, expense_date);
CREATE INDEX idx_expenses_branch ON public.expenses(branch_id);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own expenses" ON public.expenses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id AND public.is_not_banned())
  WITH CHECK (auth.uid() = user_id AND public.is_not_banned());
CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 4) PUBLIC CUSTOMER BOOKING PORTAL ============
ALTER TABLE public.shop_settings ADD COLUMN booking_slug text UNIQUE;
ALTER TABLE public.shop_settings ADD COLUMN booking_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,        -- shop owner this booking belongs to
  branch_id uuid,
  customer_name text NOT NULL,
  customer_mobile text NOT NULL,
  customer_email text,
  device_brand text NOT NULL,
  device_model text DEFAULT '',
  problem_description text NOT NULL,
  preferred_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','converted')),
  converted_job_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_user ON public.booking_requests(user_id, status);
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own bookings" ON public.booking_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners update own bookings" ON public.booking_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners delete own bookings" ON public.booking_requests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- Anyone (anon + authenticated) can create a booking via the public form
CREATE POLICY "Anyone can create booking" ON public.booking_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public lookup for the booking page: returns shop_id + name from a slug
CREATE OR REPLACE FUNCTION public.get_shop_by_slug(_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'user_id', user_id,
    'shop_name', shop_name,
    'address', address,
    'phone', phone,
    'booking_enabled', booking_enabled
  )
  FROM public.shop_settings
  WHERE booking_slug = _slug AND booking_enabled = true
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_shop_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shop_by_slug(text) TO anon, authenticated;
