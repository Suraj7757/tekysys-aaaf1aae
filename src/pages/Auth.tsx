import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type AuthStep = 'login' | 'signup' | 'signup-otp' | 'forgot' | 'forgot-otp';

export default function Auth() {
  const { signIn, signUp, sendOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<AuthStep>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpDigits] = useState(6);

  const startOtpTimer = () => {
    setOtpTimer(300); // 5 min
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success('Logged in!');
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const handleSignupSendOTP = async () => {
    if (!signupEmail || !signupPassword || !signupName) { toast.error('Fill all fields'); return; }
    if (signupPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const code = await sendOTP(signupEmail, 'signup');
      console.log('Signup OTP:', code); // For testing - in production use email service
      toast.success(`OTP sent! Code: ${code}`);
      setStep('signup-otp');
      setOtp('');
      startOtpTimer();
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const handleVerifySignupOTP = async () => {
    if (otp.length < otpDigits) { toast.error('Enter complete OTP'); return; }
    setLoading(true);
    try {
      await verifyOTP(signupEmail, otp, 'signup');
      await signUp(signupEmail, signupPassword, signupName);
      toast.success('Account created! Check email to confirm.');
      setStep('login');
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const handleForgotSendOTP = async () => {
    if (!forgotEmail) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      const code = await sendOTP(forgotEmail, 'reset');
      console.log('Reset OTP:', code);
      toast.success(`OTP sent! Code: ${code}`);
      setStep('forgot-otp');
      setOtp('');
      startOtpTimer();
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const handleVerifyResetOTP = async () => {
    if (otp.length < otpDigits) { toast.error('Enter complete OTP'); return; }
    setLoading(true);
    try {
      await verifyOTP(forgotEmail, otp, 'reset');
      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('OTP verified! Password reset link sent to your email.');
      setStep('login');
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const renderOTPInput = () => (
    <div className="flex flex-col items-center gap-3">
      <InputOTP maxLength={otpDigits} value={otp} onChange={setOtp}>
        <InputOTPGroup>
          {Array.from({ length: otpDigits }).map((_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {otpTimer > 0 ? (
        <p className="text-xs text-muted-foreground">OTP expires in <span className="font-bold text-destructive">{formatTimer(otpTimer)}</span></p>
      ) : (
        <p className="text-xs text-destructive font-semibold">OTP expired! Request a new one.</p>
      )}
    </div>
  );

  // OTP verification screens
  if (step === 'signup-otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
              <Smartphone className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
            <p className="text-sm text-muted-foreground">Enter the {otpDigits}-digit code sent to <strong>{signupEmail}</strong></p>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderOTPInput()}
            <Button className="w-full" onClick={handleVerifySignupOTP} disabled={loading || otpTimer === 0}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </Button>
            <Button variant="ghost" className="w-full text-sm" onClick={() => handleSignupSendOTP()} disabled={loading}>
              Resend OTP
            </Button>
            <Button variant="link" className="w-full text-sm" onClick={() => setStep('login')}>Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'forgot' || step === 'forgot-otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
              <Smartphone className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">{step === 'forgot' ? 'Forgot Password' : 'Verify OTP'}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {step === 'forgot' ? 'Enter your email to receive an OTP' : `Enter the ${otpDigits}-digit code sent to ${forgotEmail}`}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'forgot' ? (
              <>
                <div><Label>Email</Label><Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e => e.key === 'Enter' && handleForgotSendOTP()} /></div>
                <Button className="w-full" onClick={handleForgotSendOTP} disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</Button>
              </>
            ) : (
              <>
                {renderOTPInput()}
                <Button className="w-full" onClick={handleVerifyResetOTP} disabled={loading || otpTimer === 0}>
                  {loading ? 'Verifying...' : 'Verify & Reset Password'}
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={handleForgotSendOTP} disabled={loading}>Resend OTP</Button>
              </>
            )}
            <Button variant="link" className="w-full text-sm" onClick={() => setStep('login')}>Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Smartphone className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">RepairDesk</CardTitle>
          <p className="text-sm text-muted-foreground">Mobile Repair Shop Management</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 mt-4">
              <div><Label>Email</Label><Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@shop.com" /></div>
              <div><Label>Password</Label><Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
              <Button className="w-full" onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
              <Button variant="link" className="w-full text-sm" onClick={() => { setStep('forgot'); setForgotEmail(loginEmail); }}>Forgot Password?</Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 mt-4">
              <div><Label>Display Name</Label><Input value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Your name" /></div>
              <div><Label>Email</Label><Input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" /></div>
              <div><Label>Password</Label><Input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Min 6 characters" /></div>
              <Button className="w-full" onClick={handleSignupSendOTP} disabled={loading}>{loading ? 'Sending OTP...' : 'Send OTP & Sign Up'}</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
