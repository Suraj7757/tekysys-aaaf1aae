import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { store } from "@/lib/store";
import { Search } from "lucide-react";

const methodColors: Record<string, string> = {
  'Cash': 'bg-success/10 text-success',
  'UPI/QR': 'bg-info/10 text-info',
  'Due': 'bg-warning/10 text-warning',
};

export default function Payments() {
  const [payments] = useState(store.getPayments());
  const [search, setSearch] = useState("");

  const filtered = payments.filter(p =>
    p.jobId.toLowerCase().includes(search.toLowerCase()) ||
    p.method.toLowerCase().includes(search.toLowerCase()) ||
    (p.qrReceiver || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Payments">
      <div className="space-y-4 animate-fade-in">
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
                  <th className="text-left p-3 font-semibold">Admin (50%)</th>
                  <th className="text-left p-3 font-semibold">Staff (50%)</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Settled</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-semibold text-primary">{p.jobId}</td>
                    <td className="p-3 font-semibold">₹{p.amount.toLocaleString()}</td>
                    <td className="p-3"><Badge className={`${methodColors[p.method]} border-0 text-xs`}>{p.method}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{p.qrReceiver || '—'}</td>
                    <td className="p-3">₹{p.adminShare.toLocaleString()}</td>
                    <td className="p-3">₹{p.staffShare.toLocaleString()}</td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant={p.settled ? "default" : "outline"} className="text-xs">{p.settled ? 'Yes' : 'No'}</Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{p.createdAt}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No payments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
