
DROP POLICY IF EXISTS "Anyone can delete OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can insert OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can read OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP" ON public.otp_codes;

CREATE POLICY "Anyone can insert OTP" ON public.otp_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read OTP by email" ON public.otp_codes FOR SELECT USING (true);
CREATE POLICY "Anyone can update OTP" ON public.otp_codes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete OTP" ON public.otp_codes FOR DELETE USING (true);
