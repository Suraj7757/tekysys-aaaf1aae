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

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success('Logged in!');
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!signupEmail || !signupPassword || !signupName) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName);
      toast.success('Account created! Check email to confirm.');
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { toast.error('Enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success('Password reset link sent to your email!');
    setLoading(false);
    setForgotOpen(false);
  };

  if (forgotOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
              <Smartphone className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Email</Label><Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} /></div>
            <Button className="w-full" onClick={handleForgotPassword} disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Button>
            <Button variant="ghost" className="w-full" onClick={() => setForgotOpen(false)}>Back to Login</Button>
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
              <Button variant="link" className="w-full text-sm" onClick={() => { setForgotOpen(true); setForgotEmail(loginEmail); }}>Forgot Password?</Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 mt-4">
              <div><Label>Display Name</Label><Input value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Your name" /></div>
              <div><Label>Email</Label><Input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" /></div>
              <div><Label>Password</Label><Input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Min 6 characters" /></div>
              <Button className="w-full" onClick={handleSignup} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
