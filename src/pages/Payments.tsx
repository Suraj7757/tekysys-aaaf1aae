import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseQuery, useShopSettings } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Search, Pencil } from "lucide-react";
import { toast } from "sonner";

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

  const filtered = payments.filter((p: any) =>
    p.job_id.toLowerCase().includes(search.toLowerCase()) ||
    p.method.toLowerCase().includes(search.toLowerCase()) ||
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

  return (
    <Layout title="Payments">
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
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-semibold text-primary">{p.job_id}</td>
                    <td className="p-3 font-semibold">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="p-3"><Badge className={`${methodColors[p.method] || ''} border-0 text-xs`}>{p.method}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{p.qr_receiver || '—'}</td>
                    {splitEnabled && <td className="p-3">₹{Number(p.admin_share).toLocaleString()}</td>}
                    {splitEnabled && <td className="p-3">₹{Number(p.staff_share).toLocaleString()}</td>}
                    <td className="p-3 hidden md:table-cell"><Badge variant={p.settled ? "default" : "outline"} className="text-xs">{p.settled ? 'Yes' : 'No'}</Badge></td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
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
      </div>
    </Layout>
  );
}
