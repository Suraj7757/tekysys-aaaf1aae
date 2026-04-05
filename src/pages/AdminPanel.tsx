import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Wallet, Gift, Monitor, Shield, Search, Trash2, Ban, CheckCircle, XCircle, Plus, Eye, EyeOff } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Ad dialog
  const [adOpen, setAdOpen] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adReward, setAdReward] = useState('0.5');
  const [adLimit, setAdLimit] = useState('10');
  const [adLink, setAdLink] = useState('');

  // User edit dialog
  const [editUser, setEditUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('admin');

  const isAdmin = user?.email === ADMIN_EMAIL || role === 'admin';

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    const [profilesRes, walletsRes, withdrawRes, referralsRes, adsRes, subsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('wallets').select('*'),
      supabase.from('withdraw_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('referrals').select('*').order('created_at', { ascending: false }),
      supabase.from('ads').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*'),
    ]);
    setUsers(profilesRes.data || []);
    setWallets(walletsRes.data || []);
    setWithdrawals(withdrawRes.data || []);
    setReferrals(referralsRes.data || []);
    setAds(adsRes.data || []);
    setSubscriptions(subsRes.data || []);
    setLoading(false);
  };

  const getWallet = (userId: string) => wallets.find(w => w.user_id === userId);
  const getSub = (userId: string) => subscriptions.find(s => s.user_id === userId);

  const handleWithdrawal = async (id: string, status: string) => {
    const { error } = await supabase.from('withdraw_requests').update({ status, processed_at: new Date().toISOString() } as any).eq('id', id);
    if (error) toast.error('Update failed');
    else { toast.success(`Withdrawal ${status}`); fetchAll(); }
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

  const toggleAd = async (id: string, active: boolean) => {
    await supabase.from('ads').update({ active: !active } as any).eq('id', id);
    fetchAll();
  };

  const deleteAd = async (id: string) => {
    await supabase.from('ads').delete().eq('id', id);
    toast.success('Ad deleted');
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

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will remove the user role.')) return;
    await supabase.from('user_roles').delete().eq('user_id', userId);
    toast.success('User role removed');
    fetchAll();
  };

  const filteredUsers = users.filter(u =>
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.referral_code?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Layout title="Admin Panel">
        <Card className="shadow-card"><CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">Only admin users can access this panel.</p>
        </CardContent></Card>
      </Layout>
    );
  }

  if (loading) return <Layout title="Admin Panel"><p className="text-center p-8 text-muted-foreground">Loading...</p></Layout>;

  return (
    <Layout title="Admin Panel">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent></Card>
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
            <Monitor className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{ads.length}</p>
            <p className="text-xs text-muted-foreground">Active Ads</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

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
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => { setEditUser(u); setEditName(u.display_name); }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteUser(u.user_id)}><Trash2 className="h-3 w-3" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                          <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {w.status}
                          </Badge>
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
                  {ads.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No ads created</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-4">
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referred</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {referrals.map(r => {
                    const referrer = users.find(u => u.user_id === r.referrer_id);
                    const referred = users.find(u => u.user_id === r.referred_id);
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{referrer?.display_name || 'Unknown'}</TableCell>
                        <TableCell>{referred?.display_name || 'Unknown'}</TableCell>
                        <TableCell><Badge variant="outline">{r.referral_code}</Badge></TableCell>
                        <TableCell>₹{Number(r.reward_amount).toFixed(2)}</TableCell>
                        <TableCell><Badge>{r.status}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                  {referrals.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No referrals yet</TableCell></TableRow>}
                </TableBody>
              </Table>
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
      </div>
    </Layout>
  );
}
