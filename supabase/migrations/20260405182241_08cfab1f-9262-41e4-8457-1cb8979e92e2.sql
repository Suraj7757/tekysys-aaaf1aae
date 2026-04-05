
DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);

DROP POLICY IF EXISTS "Anyone can insert OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can read OTP by email" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can delete OTP" ON public.otp_codes;

CREATE POLICY "Authenticated insert OTP" ON public.otp_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read OTP" ON public.otp_codes FOR SELECT USING (true);
CREATE POLICY "Authenticated update OTP" ON public.otp_codes FOR UPDATE USING (true);
CREATE POLICY "Authenticated delete OTP" ON public.otp_codes FOR DELETE USING (true);
