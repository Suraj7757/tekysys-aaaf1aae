import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Gift, Copy, Share2, Monitor, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [todayViews, setTodayViews] = useState(0);
  const [loading, setLoading] = useState(true);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const [walletR, txR, wdR, profileR, refR, adsR, viewsR] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('withdraw_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('referrals').select('*').eq('referrer_id', user.id),
      supabase.from('ads').select('*').eq('active', true),
      supabase.from('ad_views').select('*').eq('user_id', user.id).gte('created_at', today),
    ]);
    setWallet(walletR.data);
    setTransactions(txR.data || []);
    setWithdrawals(wdR.data || []);
    setProfile(profileR.data);
    setReferrals(refR.data || []);
    setAds(adsR.data || []);
    setTodayViews(viewsR.data?.length || 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) { toast.error('Enter valid amount'); return; }
    if (amount > Number(wallet?.balance || 0)) { toast.error('Insufficient balance'); return; }
    const { error } = await supabase.from('withdraw_requests').insert({ user_id: user!.id, amount } as any);
    if (error) toast.error('Failed to submit');
    else { toast.success('Withdrawal request submitted'); setWithdrawOpen(false); setWithdrawAmount(''); fetchData(); }
  };

  const watchAd = async (ad: any) => {
    if (todayViews >= (ad.daily_limit || 10)) { toast.error('Daily ad limit reached'); return; }
    if (ad.link_url) window.open(ad.link_url, '_blank');
    // Record view and earn
    await supabase.from('ad_views').insert({ user_id: user!.id, ad_id: ad.id, earned: ad.reward_amount } as any);
    await supabase.from('wallet_transactions').insert({ user_id: user!.id, type: 'earning', source: 'ad', amount: ad.reward_amount, description: `Watched ad: ${ad.title}` } as any);
    await supabase.from('wallets').update({
      balance: Number(wallet.balance) + Number(ad.reward_amount),
      total_earned: Number(wallet.total_earned) + Number(ad.reward_amount),
    } as any).eq('user_id', user!.id);
    toast.success(`Earned ₹${ad.reward_amount}!`);
    fetchData();
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success('Referral code copied!');
    }
  };

  const shareReferral = () => {
    const code = profile?.referral_code || '';
    const text = `Join RepairDesk CRM with my referral code: ${code}\n${window.location.origin}/auth?mode=signup&ref=${code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <Layout title="Wallet"><p className="text-center p-8 text-muted-foreground">Loading...</p></Layout>;

  return (
    <Layout title="Wallet & Earnings">
      <div className="space-y-6 animate-fade-in">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Wallet className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">₹{Number(wallet?.balance || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Balance</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <ArrowDownCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">₹{Number(wallet?.total_earned || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <ArrowUpCircle className="h-6 w-6 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">₹{Number(wallet?.total_withdrawn || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Withdrawn</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Gift className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </CardContent></Card>
        </div>

        <Button onClick={() => setWithdrawOpen(true)} className="w-full md:w-auto">
          <ArrowUpCircle className="h-4 w-4 mr-1" /> Request Withdrawal
        </Button>

        {/* Referral Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Gift className="h-4 w-4" /> Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="bg-muted px-4 py-2 rounded-lg font-mono text-lg font-bold text-foreground">{profile?.referral_code || 'N/A'}</div>
              <Button size="sm" variant="outline" onClick={copyReferralCode}><Copy className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={shareReferral}><Share2 className="h-4 w-4" /></Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Share with friends to earn rewards on their signup!</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="transactions">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="ads">Watch & Earn</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-3 mt-4">
            {transactions.length === 0 && <p className="text-center text-muted-foreground py-8">No transactions yet</p>}
            {transactions.map(tx => (
              <Card key={tx.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description || tx.source}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`font-bold ${tx.type === 'earning' ? 'text-green-600' : 'text-destructive'}`}>
                    {tx.type === 'earning' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ads" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">Today's views: {todayViews} | Watch ads to earn rewards!</p>
            {ads.length === 0 && <p className="text-center text-muted-foreground py-8">No ads available</p>}
            {ads.map(ad => (
              <Card key={ad.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{ad.title}</p>
                    <p className="text-xs text-muted-foreground">{ad.description}</p>
                    <Badge variant="outline" className="mt-1">Earn ₹{Number(ad.reward_amount).toFixed(2)}</Badge>
                  </div>
                  <Button size="sm" onClick={() => watchAd(ad)}>
                    <Monitor className="h-4 w-4 mr-1" /> Watch
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-3 mt-4">
            {withdrawals.length === 0 && <p className="text-center text-muted-foreground py-8">No withdrawal requests</p>}
            {withdrawals.map(w => (
              <Card key={w.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">₹{Number(w.amount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>{w.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Request Withdrawal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Available balance: ₹{Number(wallet?.balance || 0).toFixed(2)}</p>
              <div><Label>Amount (₹)</Label><Input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Enter amount" /></div>
            </div>
            <DialogFooter><Button onClick={handleWithdraw}>Submit Request</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
