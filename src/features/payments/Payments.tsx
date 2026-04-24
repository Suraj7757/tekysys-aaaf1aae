import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useSupabaseQuery, useShopSettings } from "@/hooks/useSupabaseData";
import { supabase } from "@/services/supabase";
import { Search, Pencil, Check, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PaymentMethod = 'Cash' | 'UPI/QR' | 'Due';

const methodColors: Record<string, string> = {
  'Cash': 'bg-success/10 text-success',
  'UPI/QR': 'bg-info/10 text-info',
  'Due': 'bg-warning/10 text-warning',
};

export default function Payments() {
  const { user } = useAuth();
  const { data: payments, loading, refetch } = useSupabaseQuery<any>('payments');
  const { settings } = useShopSettings();
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [editMethod, setEditMethod] = useState<PaymentMethod>("Cash");
  const [editQr, setEditQr] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewPayment, setViewPayment] = useState<any>(null);

  const filtered = payments.filter((p: any) =>
    (p.job_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.method || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.qr_receiver || '').toLowerCase().includes(search.toLowerCase())
  );

  const cashTotal = payments.filter((p: any) => p.method === 'Cash').reduce((s: number, p: any) => s + Number(p.amount), 0);
  const upiTotal = payments.filter((p: any) => p.method === 'UPI/QR').reduce((s: number, p: any) => s + Number(p.amount), 0);
  const dueTotal = payments.filter((p: any) => p.method === 'Due').reduce((s: number, p: any) => s + Number(p.amount), 0);

  const qrTotals: Record<string, number> = {};
  payments.filter((p: any) => p.method === 'UPI/QR').forEach((p: any) => {
    const key = p.qr_receiver || 'Unknown';
    qrTotals[key] = (qrTotals[key] || 0) + Number(p.amount);
  });

  const openEditPayment = (p: any) => {
    setSelectedPayment(p);
    setEditMethod(p.method);
    setEditQr(p.qr_receiver || '');
    setEditAmount(String(p.amount));
    setEditOpen(true);
  };

  const handleEditPayment = async () => {
    if (!selectedPayment || !user) return;
    const amount = parseFloat(editAmount) || Number(selectedPayment.amount);
    const splitEnabled = settings?.revenue_split_enabled !== false;
    const adminPct = splitEnabled ? (settings?.admin_share_percent ?? 50) / 100 : 1;
    const staffPct = splitEnabled ? (settings?.staff_share_percent ?? 50) / 100 : 0;

    await supabase.from('payments').update({
      method: editMethod as any,
      amount,
      qr_receiver: editMethod === 'UPI/QR' ? editQr : null,
      admin_share: amount * adminPct,
      staff_share: amount * staffPct,
    }).eq('id', selectedPayment.id);
    refetch();
    setEditOpen(false);
    toast.success('Payment updated');
  };

  const qrReceivers = settings?.qr_receivers || ['Admin QR', 'Staff QR', 'Shop QR'];
  const splitEnabled = settings?.revenue_split_enabled !== false;

  const { data: customerPayments, refetch: refetchCP } = useSupabaseQuery<any>('payment_submissions');

  const approvePayment = async (p: any) => {
    // 1. Mark payment as approved
    const { error: pErr } = await supabase.from('payment_submissions').update({ status: 'approved' }).eq('id', p.id);
    if (pErr) { toast.error('Failed to approve'); return; }

    // 2. Add to merchant wallet
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user!.id).maybeSingle();
    const newBalance = Number(wallet?.balance || 0) + Number(p.amount);
    
    await supabase.from('wallets').upsert({
       user_id: user!.id,
       balance: newBalance,
       total_earned: Number(wallet?.total_earned || 0) + Number(p.amount)
    } as any);

    // 3. Record transaction
    await supabase.from('wallet_transactions').insert({
       user_id: user!.id,
       type: 'earning',
       source: 'business',
       amount: p.amount,
       description: `Customer payment approved: ${p.tracking_id}`
    } as any);

    toast.success('Payment approved and added to wallet!');
    refetchCP();
  };

  const rejectPayment = async (p: any) => {
     await supabase.from('payment_submissions').update({ status: 'rejected' }).eq('id', p.id);
     toast.error('Payment rejected');
     refetchCP();
  };

  const handleRefund = async (payment: any) => {
    if (!window.confirm("Are you sure you want to refund this payment? It will be deducted from your wallet.")) return;
    
    // Deduct from wallet
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user!.id).maybeSingle();
    const newBalance = Number(wallet?.balance || 0) - Number(payment.amount);
    
    await supabase.from('wallets').upsert({
       user_id: user!.id,
       balance: newBalance,
    } as any);

    // Record refund
    await supabase.from('wallet_transactions').insert({
       user_id: user!.id,
       type: 'withdrawal',
       source: 'business',
       amount: payment.amount,
       description: `Refund for Job: ${payment.job_id}`
    } as any);

    // Mark payment as refunded
    await supabase.from('payments').update({ method: 'Refunded' }).eq('id', payment.id);
    
    toast.success('Payment refunded successfully');
    setDetailsOpen(false);
    refetch();
  };

  return (
    <MainLayout title="Payments">
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium">Total</p><p className="text-xl font-bold mt-1">₹{(cashTotal + upiTotal + dueTotal).toLocaleString()}</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium">💵 Cash</p><p className="text-xl font-bold mt-1 text-success">₹{cashTotal.toLocaleString()}</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium">📱 UPI/QR</p><p className="text-xl font-bold mt-1 text-info">₹{upiTotal.toLocaleString()}</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium">📋 Due</p><p className="text-xl font-bold mt-1 text-warning">₹{dueTotal.toLocaleString()}</p></CardContent></Card>
        </div>

        {Object.keys(qrTotals).length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">QR-wise Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(qrTotals).map(([name, amount]) => (
                  <div key={name} className="bg-muted rounded-lg px-4 py-2">
                    <p className="text-xs text-muted-foreground">{name}</p>
                    <p className="text-lg font-bold">₹{amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Direct Payments ({filtered.length})</TabsTrigger>
            <TabsTrigger value="online">Online Approval ({customerPayments.filter((cp: any) => cp.status === 'pending').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            <Card className="shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold">Job ID</th>
                      <th className="text-left p-3 font-semibold">Amount</th>
                      <th className="text-left p-3 font-semibold">Method</th>
                      <th className="text-left p-3 font-semibold hidden md:table-cell">QR Receiver</th>
                      {splitEnabled && <th className="text-left p-3 font-semibold">Admin</th>}
                      {splitEnabled && <th className="text-left p-3 font-semibold">Staff</th>}
                      <th className="text-left p-3 font-semibold hidden md:table-cell">Settled</th>
                      <th className="text-left p-3 font-semibold hidden md:table-cell">Date</th>
                      <th className="text-left p-3 font-semibold">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setViewPayment(p); setDetailsOpen(true); }}>
                        <td className="p-3 font-mono font-semibold text-primary">{p.job_id}</td>
                        <td className="p-3 font-semibold">₹{Number(p.amount).toLocaleString()}</td>
                        <td className="p-3"><Badge className={`${methodColors[p.method] || 'bg-destructive/10 text-destructive'} border-0 text-xs`}>{p.method}</Badge></td>
                        <td className="p-3 hidden md:table-cell">{p.qr_receiver || '—'}</td>
                        {splitEnabled && <td className="p-3">₹{Number(p.admin_share).toLocaleString()}</td>}
                        {splitEnabled && <td className="p-3">₹{Number(p.staff_share).toLocaleString()}</td>}
                        <td className="p-3 hidden md:table-cell"><Badge variant={p.settled ? "default" : "outline"} className="text-xs">{p.settled ? 'Yes' : 'No'}</Badge></td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="p-3" onClick={e => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditPayment(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (<tr><td colSpan={splitEnabled ? 10 : 8} className="p-8 text-center text-muted-foreground">{loading ? 'Loading...' : 'No payments found'}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="online" className="space-y-4">
            {customerPayments.length === 0 && <p className="text-center py-10 text-muted-foreground">No online payment requests</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerPayments.map((cp: any) => (
                <Card key={cp.id} className={`shadow-md border-l-4 ${cp.status === 'pending' ? 'border-primary' : cp.status === 'approved' ? 'border-success' : 'border-destructive'}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-primary">{cp.tracking_id}</p>
                        <Badge variant={cp.status === 'pending' ? 'secondary' : 'default'} className="text-[10px] uppercase">{cp.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Customer: {cp.customer_name}</p>
                      <p className="text-lg font-black tracking-tight">₹{Number(cp.amount).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">UTR: <span className="text-foreground">{cp.utr_number}</span></p>
                    </div>
                    {cp.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="bg-success hover:bg-success/80 text-white" onClick={() => approvePayment(cp)}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => rejectPayment(cp)}>
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                    {cp.status === 'approved' && <ShieldCheck className="h-8 w-8 text-success opacity-50" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Payment Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Edit Payment — {selectedPayment?.job_id}</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div><Label>Amount (₹)</Label><Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} /></div>
              <div>
                <Label>Payment Method</Label>
                <Select value={editMethod} onValueChange={v => setEditMethod(v as PaymentMethod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">💵 Cash</SelectItem>
                    <SelectItem value="UPI/QR">📱 UPI/QR</SelectItem>
                    <SelectItem value="Due">📋 Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editMethod === 'UPI/QR' && (
                <div>
                  <Label>QR Receiver</Label>
                  <Select value={editQr} onValueChange={setEditQr}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {qrReceivers.map((qr: string) => (<SelectItem key={qr} value={qr}>{qr}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditPayment}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details / Refund Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Job ID</p>
                  <p className="font-mono font-bold text-primary">{viewPayment?.job_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-bold">₹{Number(viewPayment?.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Method</p>
                  <Badge className={`${methodColors[viewPayment?.method] || 'bg-destructive/10 text-destructive'} border-0 mt-1`}>{viewPayment?.method}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{viewPayment ? new Date(viewPayment.created_at).toLocaleDateString() : '—'}</p>
                </div>
              </div>
              {viewPayment?.method === 'UPI/QR' && (
                <div>
                  <p className="text-sm text-muted-foreground">QR Receiver</p>
                  <p className="font-bold">{viewPayment?.qr_receiver || 'N/A'}</p>
                </div>
              )}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
              {viewPayment?.method !== 'Refunded' && (
                <Button variant="destructive" className="w-full" onClick={() => handleRefund(viewPayment)}>
                  Refund Payment
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
