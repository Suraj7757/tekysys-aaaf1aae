import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Clock, Upload, Tag, IndianRupee, CheckCircle, XCircle, AlertTriangle, QrCode, Copy } from 'lucide-react';
import { toast } from 'sonner';

const UPI_ID = 'patna14@ptyes';

const PLANS = [
  { id: 'free', name: 'Free', price: 0, features: ['5 Repair Jobs', '10 Inventory Items', 'Basic Reports'] },
  { id: 'pro', name: 'Pro', price: 499, features: ['Unlimited Jobs', 'Unlimited Inventory', 'Advanced Reports', 'Wallet & Earnings', 'Referral System', 'Priority Support'] },
  { id: 'enterprise', name: 'Enterprise', price: 1499, features: ['Everything in Pro', 'Multi-staff', 'API Access', 'Custom Branding', 'Ad Revenue System'] },
];

export default function Subscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [payOpen, setPayOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [subR, payR] = await Promise.all([
      supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('payment_submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setSubscription(subR.data);
    setPayments(payR.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isExpired = subscription?.status === 'trial'
    ? new Date(subscription.trial_ends_at) < new Date()
    : subscription?.expires_at ? new Date(subscription.expires_at) < new Date() : false;

  const daysLeft = subscription?.status === 'trial'
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / 86400000))
    : subscription?.expires_at
      ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000))
      : 0;

  const handlePaymentSubmit = async () => {
    if (!utrNumber.trim()) { toast.error('UTR number is required'); return; }
    if (!user) return;
    setSubmitting(true);

    let screenshotUrl = '';
    if (screenshot) {
      const ext = screenshot.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('payment-screenshots').upload(path, screenshot);
      if (uploadErr) { toast.error('Failed to upload screenshot'); setSubmitting(false); return; }
      const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(path);
      screenshotUrl = urlData.publicUrl;
    }

    const plan = PLANS.find(p => p.id === selectedPlan);
    const { error } = await supabase.from('payment_submissions').insert({
      user_id: user.id,
      utr_number: utrNumber.trim(),
      amount: plan?.price || 499,
      screenshot_url: screenshotUrl,
      plan: selectedPlan,
    } as any);

    if (error) toast.error('Failed to submit payment');
    else {
      toast.success('Payment submitted for verification!');
      setPayOpen(false);
      setUtrNumber('');
      setScreenshot(null);
      fetchData();
    }
    setSubmitting(false);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !user) return;
    setApplyingPromo(true);

    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.trim().toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (!promo) { toast.error('Invalid or expired promo code'); setApplyingPromo(false); return; }
    if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) { toast.error('Promo code has expired'); setApplyingPromo(false); return; }
    if (promo.used_count >= promo.usage_limit) { toast.error('Promo code usage limit reached'); setApplyingPromo(false); return; }

    // Activate subscription
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + promo.validity_days);

    await supabase.from('subscriptions').update({
      status: 'active',
      plan: 'pro',
      coupon_code: promo.code,
      expires_at: expiresAt.toISOString(),
    } as any).eq('user_id', user.id);

    await supabase.from('promo_codes').update({
      used_count: promo.used_count + 1,
    } as any).eq('id', promo.id);

    toast.success(`Promo applied! ${promo.validity_days} days activated.`);
    setPromoOpen(false);
    setPromoCode('');
    fetchData();
    setApplyingPromo(false);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied!');
  };

  if (loading) return <Layout title="Subscription"><p className="text-center p-8 text-muted-foreground">Loading...</p></Layout>;

  return (
    <Layout title="Subscription">
      <div className="space-y-6 animate-fade-in max-w-3xl">
        {/* Status Card */}
        <Card className={`shadow-card ${isExpired ? 'border-destructive' : 'border-primary/30'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className={`h-8 w-8 ${isExpired ? 'text-destructive' : 'text-primary'}`} />
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {subscription?.plan?.toUpperCase() || 'FREE'} Plan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Status: <Badge variant={isExpired ? 'destructive' : 'default'}>
                      {isExpired ? 'Expired' : subscription?.status || 'trial'}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="text-right">
                {!isExpired && daysLeft > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className={`font-bold ${daysLeft <= 3 ? 'text-destructive' : 'text-foreground'}`}>
                      {daysLeft} days left
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isExpired && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Subscription Expired</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your subscription has expired. Please renew to continue using all features.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setPayOpen(true)}>
                <IndianRupee className="h-4 w-4 mr-1" /> Pay & Activate
              </Button>
              <Button variant="outline" onClick={() => setPromoOpen(true)}>
                <Tag className="h-4 w-4 mr-1" /> Apply Promo Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <Card key={plan.id} className={`cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground">{plan.name}</h4>
                <p className="text-2xl font-bold text-foreground mt-1">₹{plan.price}<span className="text-sm text-muted-foreground">/mo</span></p>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment History */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No payments submitted yet</p>}
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">UTR: {p.utr_number}</p>
                  <p className="text-xs text-muted-foreground">₹{p.amount} • {p.plan} • {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={p.status === 'approved' ? 'default' : p.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* UPI Payment Dialog */}
        <Dialog open={payOpen} onOpenChange={setPayOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Pay via UPI</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 text-center space-y-3">
                <QrCode className="h-12 w-12 text-primary mx-auto" />
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-bold text-lg text-foreground">{UPI_ID}</span>
                  <Button size="sm" variant="ghost" onClick={copyUPI}><Copy className="h-4 w-4" /></Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Amount: <span className="font-bold text-foreground">₹{PLANS.find(p => p.id === selectedPlan)?.price || 499}</span>
                </p>
                <p className="text-xs text-muted-foreground">Pay using any UPI app (GPay, PhonePe, Paytm, etc.)</p>
              </div>

              <div>
                <Label>UTR / Transaction Number *</Label>
                <Input value={utrNumber} onChange={e => setUtrNumber(e.target.value)} placeholder="Enter 12-digit UTR number" className="mt-1" />
              </div>

              <div>
                <Label>Payment Screenshot (optional)</Label>
                <Input type="file" accept="image/*" onChange={e => setScreenshot(e.target.files?.[0] || null)} className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handlePaymentSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Promo Code Dialog */}
        <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Apply Promo Code</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Promo Code</Label>
                <Input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter promo code" className="mt-1 font-mono" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleApplyPromo} disabled={applyingPromo}>
                {applyingPromo ? 'Applying...' : 'Apply Code'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
