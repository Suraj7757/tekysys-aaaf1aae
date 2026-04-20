import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Smartphone, Mail, Lock, User, Gift, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase';
import {
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>((searchParams.get('mode') as AuthMode) || 'login');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) { toast.error('Email is required'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        data: mode === 'signup' ? { display_name: displayName, referral_code: referralCode } : undefined
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('OTP sent to your email!');
      setShowOtp(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Authenticated successfully!');
      // Navigation is handled by AppRoutes based on session change
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    const { error } = await sendPasswordReset(email);
    if (error) toast.error(error);
    else toast.success('Password reset link sent to your email!');
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') handleForgotPassword();
    else if (!showOtp) handleSendOtp();
    else handleVerifyOtp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/20">
            <Smartphone className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">MSM CRM</CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create a new account — 7 days free trial!'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!showOtp ? (
              <>
                {mode === 'signup' && (
                  <div>
                    <Label>Display Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9 h-11" placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    </div>
                  </div>
                )}
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9 h-11" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-4 py-2">
                <Label className="text-center w-full">Enter 6-digit OTP sent to {email}</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(v) => setOtp(v)}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="rounded-md border h-12 w-10 text-lg font-bold" />
                    <InputOTPSlot index={1} className="rounded-md border h-12 w-10 text-lg font-bold" />
                    <InputOTPSlot index={2} className="rounded-md border h-12 w-10 text-lg font-bold" />
                    <InputOTPSlot index={3} className="rounded-md border h-12 w-10 text-lg font-bold" />
                    <InputOTPSlot index={4} className="rounded-md border h-12 w-10 text-lg font-bold" />
                    <InputOTPSlot index={5} className="rounded-md border h-12 w-10 text-lg font-bold" />
                  </InputOTPGroup>
                </InputOTP>
                <button 
                  type="button" 
                  onClick={() => setShowOtp(false)}
                  className="text-xs text-primary hover:underline"
                >
                  Change Email
                </button>
              </div>
            )}
            {mode === 'signup' && (
              <>
                <div>
                  <Label>Referral Code <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <div className="relative mt-1">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="e.g. RD1A2B3C" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Coupon Code <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <div className="relative mt-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                  </div>
                </div>
              </>
            )}
            <Button type="submit" className="w-full h-11 font-bold text-lg shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? 'Please wait...' : showOtp ? 'Verify OTP' : mode === 'login' ? 'Send Login OTP' : mode === 'signup' ? 'Send Sign Up OTP' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm space-y-2">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('forgot')} className="text-primary hover:underline block w-full">Forgot password?</button>
                <p className="text-muted-foreground">Don't have an account? <button onClick={() => setMode('signup')} className="text-primary hover:underline">Sign Up</button></p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-muted-foreground">Already have an account? <button onClick={() => setMode('login')} className="text-primary hover:underline">Sign In</button></p>
            )}
            {mode === 'forgot' && (
              <button onClick={() => setMode('login')} className="text-primary hover:underline">Back to Sign In</button>
            )}
            <div className="pt-2 border-t space-y-1">
              <Link to="/track" className="text-primary hover:underline text-sm block">📦 Track Your Order</Link>
              <Link to="/" className="text-muted-foreground hover:underline text-xs block">← Back to Home</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
