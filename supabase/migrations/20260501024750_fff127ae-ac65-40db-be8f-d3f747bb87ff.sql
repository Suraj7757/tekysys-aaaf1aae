
-- ============ SHOP REVIEWS ============
CREATE TABLE public.shop_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,            -- shop owner being reviewed
  job_id text,                      -- optional linked tracking id
  customer_name text NOT NULL,
  customer_mobile text,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  status text NOT NULL DEFAULT 'approved', -- approved | hidden | pending
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX shop_reviews_user_id_idx ON public.shop_reviews(user_id);
CREATE INDEX shop_reviews_status_idx ON public.shop_reviews(status);

ALTER TABLE public.shop_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit review"
  ON public.shop_reviews FOR INSERT TO anon, authenticated
  WITH CHECK (rating BETWEEN 1 AND 5 AND length(customer_name) > 0);

CREATE POLICY "Public can view approved reviews"
  ON public.shop_reviews FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Owner views own reviews"
  ON public.shop_reviews FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner moderates own reviews"
  ON public.shop_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner deletes own reviews"
  ON public.shop_reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin manage all reviews"
  ON public.shop_reviews FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public summary RPC
CREATE OR REPLACE FUNCTION public.get_shop_rating_summary(_user_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'count', COUNT(*),
    'average', COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
  )
  FROM public.shop_reviews
  WHERE user_id = _user_id AND status = 'approved'
$$;

REVOKE EXECUTE ON FUNCTION public.get_shop_rating_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shop_rating_summary(uuid) TO anon, authenticated;

-- ============ WHATSAPP BUSINESS CONFIG ============
CREATE TABLE public.whatsapp_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  phone_number_id text NOT NULL DEFAULT '',
  access_token text NOT NULL DEFAULT '',
  business_account_id text DEFAULT '',
  template_received text DEFAULT 'job_received',
  template_in_progress text DEFAULT 'job_in_progress',
  template_ready text DEFAULT 'job_ready',
  template_delivered text DEFAULT 'job_delivered',
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own WA config"
  ON public.whatsapp_config FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manages all WA config"
  ON public.whatsapp_config FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_wa_config_updated
  BEFORE UPDATE ON public.whatsapp_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
