-- Ensure is_banned column exists on profiles (used by ban enforcement)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- 1) Make payment-screenshots bucket PRIVATE
UPDATE storage.buckets SET public = false WHERE id = 'payment-screenshots';

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (policyname ILIKE '%payment%screenshot%' OR policyname = 'Anyone can view payment screenshots')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can read own payment screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own payment screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own payment screenshots"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own payment screenshots"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can read all payment screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2) Counter RPC ownership checks
CREATE OR REPLACE FUNCTION public.next_job_id(_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _counter INTEGER;
BEGIN
  IF auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.job_counter SET counter = counter + 1 WHERE user_id = _user_id RETURNING counter INTO _counter;
  IF _counter IS NULL THEN
    INSERT INTO public.job_counter (user_id, counter) VALUES (_user_id, 1) RETURNING counter INTO _counter;
  END IF;
  RETURN 'JOB' || LPAD(_counter::TEXT, 6, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.next_sell_id(_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _counter INTEGER;
BEGIN
  IF auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.sell_counter SET counter = counter + 1 WHERE user_id = _user_id RETURNING counter INTO _counter;
  IF _counter IS NULL THEN
    INSERT INTO public.sell_counter (user_id, counter) VALUES (_user_id, 1) RETURNING counter INTO _counter;
  END IF;
  RETURN 'SELL' || LPAD(_counter::TEXT, 6, '0');
END;
$function$;

-- 3) Ban-enforcement helper
CREATE OR REPLACE FUNCTION public.is_not_banned()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT NOT COALESCE((SELECT is_banned FROM public.profiles WHERE user_id = auth.uid()), false)
$$;

-- repair_jobs
DROP POLICY IF EXISTS "Users can view own jobs" ON public.repair_jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON public.repair_jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.repair_jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.repair_jobs;
CREATE POLICY "Users can view own jobs" ON public.repair_jobs FOR SELECT USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can insert own jobs" ON public.repair_jobs FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can update own jobs" ON public.repair_jobs FOR UPDATE USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can delete own jobs" ON public.repair_jobs FOR DELETE USING (auth.uid() = user_id AND public.is_not_banned());

-- customers
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;
CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id AND public.is_not_banned());

-- payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can update own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can delete own payments" ON public.payments FOR DELETE USING (auth.uid() = user_id AND public.is_not_banned());

-- inventory
DROP POLICY IF EXISTS "Users can view own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can insert own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can update own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can delete own inventory" ON public.inventory;
CREATE POLICY "Users can view own inventory" ON public.inventory FOR SELECT USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can insert own inventory" ON public.inventory FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can update own inventory" ON public.inventory FOR UPDATE USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can delete own inventory" ON public.inventory FOR DELETE USING (auth.uid() = user_id AND public.is_not_banned());

-- sells
DROP POLICY IF EXISTS "Users can view own sells" ON public.sells;
DROP POLICY IF EXISTS "Users can insert own sells" ON public.sells;
DROP POLICY IF EXISTS "Users can update own sells" ON public.sells;
DROP POLICY IF EXISTS "Users can delete own sells" ON public.sells;
CREATE POLICY "Users can view own sells" ON public.sells FOR SELECT USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can insert own sells" ON public.sells FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can update own sells" ON public.sells FOR UPDATE USING (auth.uid() = user_id AND public.is_not_banned());
CREATE POLICY "Users can delete own sells" ON public.sells FOR DELETE USING (auth.uid() = user_id AND public.is_not_banned());