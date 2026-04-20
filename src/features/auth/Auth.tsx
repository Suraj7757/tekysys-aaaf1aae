import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Smartphone, Mail, Lock, User, Gift, Tag, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>((searchParams.get('mode') as AuthMode) || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Email is required'); return; }
    
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error } = await sendPasswordReset(email);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Magic reset link sent to your email!');
          setMode('login');
        }
      } else if (mode === 'login') {
        if (!password) { toast.error('Password is required'); setLoading(false); return; }
        const { error } = await signIn(email, password);
        if (error) toast.error(error);
        else toast.success('Welcome back!');
      } else if (mode === 'signup') {
        if (!password) { toast.error('Password is required'); setLoading(false); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); setLoading(false); return; }
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Account created successfully!');
          // In "normal signup without verification", the user is usually logged in automatically 
          // or needs to log in if confirmation is ON in Supabase.
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-8">
      <Card className="w-full max-w-md shadow-2xl border-primary/5 bg-card/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 gradient-primary opacity-50" />
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary shadow-2xl shadow-primary/30 rotate-3 transform transition-transform hover:rotate-0">
            <Smartphone className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter text-foreground">
            MSM <span className="text-primary italic">CRM</span>
          </CardTitle>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest px-8">
            {mode === 'login' && 'Premium Business Access'}
            {mode === 'signup' && 'Partner Registration'}
            {mode === 'forgot' && 'Account Recovery'}
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Business Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                  <Input 
                    className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-1 transition-all" 
                    placeholder="E.g. Mobile Hub" 
                    value={displayName} 
                    onChange={e => setDisplayName(e.target.value)} 
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                <Input 
                  className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-1 transition-all" 
                  type="email" 
                  placeholder="admin@msmcrm.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Secret Key</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                  <Input 
                    className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-1 transition-all font-mono" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required={mode !== 'forgot'}
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Ref Code</Label>
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-400" />
                    <Input className="pl-9 h-10 bg-muted/30 border-0 text-xs" placeholder="Optional" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Coupon</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400" />
                    <Input className="pl-9 h-10 bg-muted/30 border-0 text-xs" placeholder="OFF20" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 gradient-primary transition-all active:scale-95" disabled={loading}>
              {loading ? 'Processing...' : mode === 'login' ? 'Enter Dashboard' : mode === 'signup' ? 'Claim My License' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-muted-foreground/10 text-center space-y-4">
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
                className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
                type="button"
              >
                {mode === 'login' ? 'Create Account' : 'Back to Login'}
              </button>
              {mode === 'login' && (
                <button 
                  onClick={() => setMode('forgot')} 
                  className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                  type="button"
                >
                  Forgot Key?
                </button>
              )}
              {mode === 'forgot' && (
                <button 
                  onClick={() => setMode('login')} 
                  className="text-[11px] font-bold uppercase tracking-widest text-primary transition-colors"
                  type="button"
                >
                  Recall Access
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Link to="/track" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-2">
                <Tag className="h-3 w-3" /> External Order Tracking
              </Link>
              <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary">
                Return to Global Home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
        Secured by MSM Enterprise Infrastructure
      </p>
    </div>
  );
}
