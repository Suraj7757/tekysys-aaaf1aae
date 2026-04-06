
-- Promo codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  validity_days INTEGER NOT NULL DEFAULT 30,
  expiry_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment submissions table (UPI UTR verification)
CREATE TABLE public.payment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  utr_number TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  plan TEXT NOT NULL DEFAULT 'pro',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

-- Promo codes: admins manage, all authenticated can read active
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view active promo codes" ON public.promo_codes FOR SELECT TO authenticated USING (active = true);

-- Payment submissions: users can insert/view own, admins can view/update all
CREATE POLICY "Users can insert own payment submissions" ON public.payment_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own payment submissions" ON public.payment_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payment submissions" ON public.payment_submissions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update payment submissions" ON public.payment_submissions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', true);

-- Storage RLS for payment screenshots
CREATE POLICY "Users can upload payment screenshots" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-screenshots');
CREATE POLICY "Anyone can view payment screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'payment-screenshots');
