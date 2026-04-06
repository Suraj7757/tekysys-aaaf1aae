
-- Fix overly permissive otp_codes policies
DROP POLICY IF EXISTS "Authenticated delete OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Authenticated insert OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Authenticated read OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Authenticated update OTP" ON public.otp_codes;

CREATE POLICY "Service role manages OTP" ON public.otp_codes FOR ALL TO service_role USING (true) WITH CHECK (true);
