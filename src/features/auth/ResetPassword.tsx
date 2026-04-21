import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabase';
import { Smartphone, Lock, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // In Supabase, clicking a reset link creates a session
      if (session || window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token=')) {
        setReady(true);
      }
    };

    handleSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password || password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) { 
      toast.error(error.message); 
    } else { 
      toast.success('Your secret key has been updated!'); 
      setTimeout(() => navigate('/auth'), 2000); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-6 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <Card className="w-full max-w-md shadow-2xl border-primary/5 bg-card/80 backdrop-blur-xl relative overflow-hidden mt-12 md:mt-0">
        <div className="absolute top-0 inset-x-0 h-1 gradient-primary opacity-50" />
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary shadow-2xl shadow-primary/30 rotate-3">
            <KeyRound className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter">Set New Key</CardTitle>
          <CardDescription className="uppercase text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
            {ready ? 'Reset Your MSM CRM Access' : 'Validating Recovery Session...'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {ready ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">New Secret Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                  <Input 
                    className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-1 transition-all" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm Secret Key</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                  <Input 
                    className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-1 transition-all" 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirm} 
                    onChange={e => setConfirm(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 gradient-primary transition-all active:scale-95" disabled={loading}>
                {loading ? 'Updating Identity...' : 'Confirm New Key'}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Awaiting Identity Verification</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
        MSM Enterprise Recovery Portal
      </p>
    </div>
  );
}
