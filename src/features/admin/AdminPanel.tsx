import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { Users, Wallet, Gift, Monitor, Shield, Search, Trash2, CheckCircle, XCircle, Plus, Tag, IndianRupee, Eye, Image } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'krs715665@gmail.com';

export default function AdminPanel() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [paymentSubs, setPaymentSubs] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Ad dialog
  const [adOpen, setAdOpen] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adReward, setAdReward] = useState('0.5');
  const [adLimit, setAdLimit] = useState('10');
  const [adLink, setAdLink] = useState('');

  // Promo dialog
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoValidity, setPromoValidity] = useState('30');
  const [promoLimit, setPromoLimit] = useState('1');
  const [promoExpiry, setPromoExpiry] = useState('');

  // User edit dialog
  const [editUser, setEditUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('staff');

  // Screenshot preview
  const [previewUrl, setPreviewUrl] = useState('');

  const isAdmin = user?.email === ADMIN_EMAIL || role === 'admin';

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    const [profilesRes, walletsRes, withdrawRes, referralsRes, adsRes, subsRes, paySubsRes, promoRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('wallets').select('*'),
      supabase.from('withdraw_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('referrals').select('*').order('created_at', { ascending: false }),
      supabase.from('ads').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*'),
      supabase.from('payment_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
    ]);
    setUsers(profilesRes.data || []);
    setWallets(walletsRes.data || []);
    setWithdrawals(withdrawRes.data || []);
    setReferrals(referralsRes.data || []);
    setAds(adsRes.data || []);
    setSubscriptions(subsRes.data || []);
    setPaymentSubs(paySubsRes.data || []);
    setPromoCodes(promoRes.data || []);
    setLoading(false);
  };

  const getWallet = (userId: string) => wallets.find(w => w.user_id === userId);
  const getSub = (userId: string) => subscriptions.find(s => s.user_id === userId);

  const handleWithdrawal = async (id: string, status: string) => {
    const { error } = await supabase.from('withdraw_requests').update({ status, processed_at: new Date().toISOString() } as any).eq('id', id);
    if (error) toast.error('Update failed');
    else { toast.success(`Withdrawal ${status}`); fetchAll(); }
  };

  const handlePaymentApproval = async (sub: any, status: string) => {
    await supabase.from('payment_submissions').update({ status, processed_at: new Date().toISOString() } as any).eq('id', sub.id);
    if (status === 'approved') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await supabase.from('subscriptions').update({
        status: 'active', plan: sub.plan, expires_at: expiresAt.toISOString(),
      } as any).eq('user_id', sub.user_id);
    }
    toast.success(`Payment ${status}`);
    fetchAll();
  };

  const handleCreateAd = async () => {
    if (!adTitle || !user) return;
    const { error } = await supabase.from('ads').insert({
      title: adTitle, description: adDesc, reward_amount: parseFloat(adReward) || 0.5,
      daily_limit: parseInt(adLimit) || 10, link_url: adLink, created_by: user.id,
    } as any);
    if (error) toast.error('Failed to create ad');
    else { toast.success('Ad created'); setAdOpen(false); setAdTitle(''); setAdDesc(''); fetchAll(); }
  };

  const handleCreatePromo = async () => {
    if (!promoCode || !user) return;
    const { error } = await supabase.from('promo_codes').insert({
      code: promoCode.toUpperCase(), validity_days: parseInt(promoValidity) || 30,
      usage_limit: parseInt(promoLimit) || 1, created_by: user.id,
      expiry_date: promoExpiry ? new Date(promoExpiry).toISOString() : null,
    } as any);
    if (error) toast.error(error.message);
    else { toast.success('Promo code created'); setPromoOpen(false); setPromoCode(''); fetchAll(); }
  };

  const toggleAd = async (id: string, active: boolean) => {
    await supabase.from('ads').update({ active: !active } as any).eq('id', id);
    fetchAll();
  };

  const deleteAd = async (id: string) => {
    await supabase.from('ads').delete().eq('id', id);
    fetchAll();
  };

  const deletePromo = async (id: string) => {
    await supabase.from('promo_codes').delete().eq('id', id);
    toast.success('Promo deleted');
    fetchAll();
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    await supabase.from('profiles').update({ display_name: editName } as any).eq('user_id', editUser.user_id);
    await supabase.from('user_roles').update({ role: editRole } as any).eq('user_id', editUser.user_id);
    toast.success('User updated');
    setEditUser(null);
    fetchAll();
  };

  const filteredUsers = users.filter(u =>
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.referral_code?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <MainLayout title="Admin Panel">
        <Card className="shadow-card"><CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">Only admin users can access this panel.</p>
        </CardContent></Card>
      </MainLayout>
    );
  }

  if (loading) return <MainLayout title="Admin Panel"><p className="text-center p-8 text-muted-foreground">Loading...</p></MainLayout>;

  return (
    <MainLayout title="Admin Panel">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Wallet className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">₹{wallets.reduce((s, w) => s + Number(w.balance), 0).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Total Wallets</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Gift className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <IndianRupee className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{paymentSubs.filter(p => p.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Pending Payments</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Tag className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{promoCodes.length}</p>
            <p className="text-xs text-muted-foreground">Promo Codes</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="payments">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="promos">Promos</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="trash">Trash (Soft Deleted)</TabsTrigger>
          </TabsList>

          {/* Payment Verification Tab */}
          <TabsContent value="payments" className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">UPI Payment Verification</h3>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>UTR</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Screenshot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {paymentSubs.map(p => {
                    const profile = users.find(u => u.user_id === p.user_id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{profile?.display_name || 'Unknown'}</TableCell>
                        <TableCell className="font-mono text-xs">{p.utr_number}</TableCell>
                        <TableCell className="font-bold">₹{p.amount}</TableCell>
                        <TableCell><Badge variant="outline">{p.plan}</Badge></TableCell>
                        <TableCell>
                          {p.screenshot_url ? (
                            <Button size="sm" variant="ghost" onClick={() => setPreviewUrl(p.screenshot_url)}>
                              <Image className="h-4 w-4" />
                            </Button>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'approved' ? 'default' : p.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-1">
                          {p.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handlePaymentApproval(p, 'approved')}>
                                <CheckCircle className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handlePaymentApproval(p, 'rejected')}>
                                <XCircle className="h-3 w-3 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paymentSubs.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payment submissions</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredUsers.map(u => {
                    const w = getWallet(u.user_id);
                    const sub = getSub(u.user_id);
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.display_name}</TableCell>
                        <TableCell><Badge variant="outline">{u.referral_code || 'N/A'}</Badge></TableCell>
                        <TableCell>₹{Number(w?.balance || 0).toFixed(2)}</TableCell>
                        <TableCell><Badge>{sub?.status || 'N/A'}</Badge></TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => { setEditUser(u); setEditName(u.display_name); }}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promos" className="space-y-4">
            <Button onClick={() => setPromoOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create Promo Code</Button>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {promoCodes.map(pc => (
                    <TableRow key={pc.id}>
                      <TableCell className="font-mono font-bold">{pc.code}</TableCell>
                      <TableCell>{pc.validity_days} days</TableCell>
                      <TableCell>{pc.used_count}/{pc.usage_limit}</TableCell>
                      <TableCell className="text-sm">{pc.expiry_date ? new Date(pc.expiry_date).toLocaleDateString() : 'No expiry'}</TableCell>
                      <TableCell><Badge variant={pc.active ? 'default' : 'secondary'}>{pc.active ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => deletePromo(pc.id)}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {promoCodes.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No promo codes</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-4">
            <Button onClick={() => setAdOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create Ad</Button>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {ads.map(ad => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>₹{Number(ad.reward_amount).toFixed(2)}</TableCell>
                      <TableCell>{ad.daily_limit}/day</TableCell>
                      <TableCell>{ad.impressions}</TableCell>
                      <TableCell><Badge variant={ad.active ? 'default' : 'secondary'}>{ad.active ? 'Active' : 'Paused'}</Badge></TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => toggleAd(ad.id, ad.active)}>{ad.active ? 'Pause' : 'Resume'}</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteAd(ad.id)}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ads.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No ads</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-4">
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {withdrawals.map(w => {
                    const profile = users.find(u => u.user_id === w.user_id);
                    return (
                      <TableRow key={w.id}>
                        <TableCell>{profile?.display_name || 'Unknown'}</TableCell>
                        <TableCell className="font-bold">₹{Number(w.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>{w.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="flex gap-1">
                          {w.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleWithdrawal(w.id, 'approved')}><CheckCircle className="h-3 w-3 mr-1" /> Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleWithdrawal(w.id, 'rejected')}><XCircle className="h-3 w-3 mr-1" /> Reject</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {withdrawals.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No withdrawal requests</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="trash">
            <div className="space-y-4">
               <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                 <p className="text-xs font-bold text-primary uppercase tracking-widest">Trash Recovery Center</p>
                 <p className="text-sm text-muted-foreground">This section shows items that were soft-deleted. Reach out to the items in their respective modules to restore them.</p>
               </div>
               <Card className="shadow-card p-6 text-center">
                 <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                 <p className="text-sm font-medium">Coming Soon: Full Trash Management UI</p>
                 <p className="text-xs text-muted-foreground">Currently, trash data is managed in individual modules (Inventory, Jobs) via the Undo notification.</p>
               </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Ad Dialog */}
        <Dialog open={adOpen} onOpenChange={setAdOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Ad</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={adTitle} onChange={e => setAdTitle(e.target.value)} /></div>
              <div><Label>Description</Label><Input value={adDesc} onChange={e => setAdDesc(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Reward (₹)</Label><Input type="number" value={adReward} onChange={e => setAdReward(e.target.value)} /></div>
                <div><Label>Daily Limit</Label><Input type="number" value={adLimit} onChange={e => setAdLimit(e.target.value)} /></div>
              </div>
              <div><Label>Link URL</Label><Input value={adLink} onChange={e => setAdLink(e.target.value)} placeholder="https://..." /></div>
            </div>
            <DialogFooter><Button onClick={handleCreateAd}>Create Ad</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Promo Dialog */}
        <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Promo Code</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Code</Label><Input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE50" className="font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Validity (days)</Label><Input type="number" value={promoValidity} onChange={e => setPromoValidity(e.target.value)} /></div>
                <div><Label>Usage Limit</Label><Input type="number" value={promoLimit} onChange={e => setPromoLimit(e.target.value)} /></div>
              </div>
              <div><Label>Expiry Date (optional)</Label><Input type="date" value={promoExpiry} onChange={e => setPromoExpiry(e.target.value)} /></div>
            </div>
            <DialogFooter><Button onClick={handleCreatePromo}>Create Promo</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Display Name</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
              <div>
                <Label>Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={handleUpdateUser}>Save Changes</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Screenshot Preview Dialog */}
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl('')}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Payment Screenshot</DialogTitle></DialogHeader>
            {previewUrl && <img src={previewUrl} alt="Payment screenshot" className="w-full rounded-lg" />}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
