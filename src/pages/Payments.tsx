import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSupabaseQuery } from "@/hooks/useSupabaseData";
import { Search } from "lucide-react";

const methodColors: Record<string, string> = {
  'Cash': 'bg-success/10 text-success',
  'UPI/QR': 'bg-info/10 text-info',
  'Due': 'bg-warning/10 text-warning',
};

export default function Payments() {
  const { data: payments, loading } = useSupabaseQuery<any>('payments');
  const [search, setSearch] = useState("");

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
                  <th className="text-left p-3 font-semibold">Admin</th>
                  <th className="text-left p-3 font-semibold">Staff</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Settled</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-semibold text-primary">{p.job_id}</td>
                    <td className="p-3 font-semibold">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="p-3"><Badge className={`${methodColors[p.method] || ''} border-0 text-xs`}>{p.method}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{p.qr_receiver || '—'}</td>
                    <td className="p-3">₹{Number(p.admin_share).toLocaleString()}</td>
                    <td className="p-3">₹{Number(p.staff_share).toLocaleString()}</td>
                    <td className="p-3 hidden md:table-cell"><Badge variant={p.settled ? "default" : "outline"} className="text-xs">{p.settled ? 'Yes' : 'No'}</Badge></td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (<tr><td colSpan={8} className="p-8 text-center text-muted-foreground">{loading ? 'Loading...' : 'No payments found'}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
