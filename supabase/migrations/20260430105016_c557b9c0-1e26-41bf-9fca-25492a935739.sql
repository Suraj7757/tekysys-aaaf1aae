CREATE TABLE public.automation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  auto_whatsapp_status BOOLEAN NOT NULL DEFAULT true,
  pending_threshold_days INTEGER NOT NULL DEFAULT 3,
  daily_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  low_stock_alerts BOOLEAN NOT NULL DEFAULT true,
  payment_reminders BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automation settings"
  ON public.automation_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automation settings"
  ON public.automation_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automation settings"
  ON public.automation_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_automation_settings_updated_at
  BEFORE UPDATE ON public.automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();