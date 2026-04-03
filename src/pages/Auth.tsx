import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Smartphone, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast.error('Email and password required'); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error);
    else toast.success('Login successful!');
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password || !displayName) { toast.error('All fields required'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    if (error) toast.error(error);
    else { toast.success('Account created! You can now sign in.'); setMode('login'); }
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
    if (mode === 'login') handleLogin();
    else if (mode === 'signup') handleSignup();
    else handleForgotPassword();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Smartphone className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">RepairDesk</CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create a new account'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <Label>Display Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
              </div>
            )}
            <div>
              <Label>Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            {mode !== 'forgot' && (
              <div>
                <Label>Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
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
            <div className="pt-2 border-t">
              <a href="/track" className="text-primary hover:underline text-sm">📦 Track Your Order</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
