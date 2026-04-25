import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabaseQuery } from '@/hooks/useSupabaseData';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';
import { RotateCcw, Search, CheckCircle, IndianRupee, User, Clock, Filter } from 'lucide-react';

const methodBadge: Record<string, string> = {
  cash: 'bg-emerald-100 text-emerald-700',
  upi: 'bg-blue-100 text-blue-700',
  bank_transfer: 'bg-purple-100 text-purple-700',
};

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

export default function AdminRefunds() {
  const { data: refunds, loading, refetch } = useSupabaseQuery<any>('payment_refunds');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = refunds.filter((r: any) => {
    const matchSearch = (r.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.job_id || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRefunded = refunds.filter((r: any) => r.status === 'processed')
    .reduce((s: number, r: any) => s + Number(r.refund_amount), 0);
  const pendingCount = refunds.filter((r: any) => r.status === 'pending').length;

  const markProcessed = async (id: string) => {
    await supabase.from('payment_refunds' as any).update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', id);
    toast.success('Refund marked as processed');
    refetch();
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <p className="text-xs text-orange-100 font-medium">Total Refunded</p>
            <p className="text-xl font-black mt-0.5">₹{totalRefunded.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <p className="text-xs text-amber-100 font-medium">Pending Refunds</p>
            <p className="text-xl font-black mt-0.5">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-slate-600 to-slate-800 text-white">
          <CardContent className="p-4">
            <p className="text-xs text-slate-300 font-medium">Total Records</p>
            <p className="text-xl font-black mt-0.5">{refunds.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by customer or job ID..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'processed'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden shadow-card">
        <CardHeader className="py-3 px-4 border-b bg-muted/30">
          <CardTitle className="text-sm flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-orange-600" />
            Refund Records ({filtered.length})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Job ID</th>
                <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Reason</th>
                <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Method</th>
                <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{r.customer_name || '—'}</p>
                        <p className="text-[10px] text-muted-foreground">{r.customer_phone || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs text-primary">{r.job_id || '—'}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-black text-orange-600">₹{Number(r.refund_amount).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">of ₹{Number(r.original_amount).toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="p-3 text-xs max-w-28 truncate" title={r.refund_reason}>{r.refund_reason || '—'}</td>
                  <td className="p-3">
                    <Badge className={`${methodBadge[r.refund_method] || 'bg-muted text-muted-foreground'} border-0 text-[10px] capitalize`}>
                      {r.refund_method || '—'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={`${statusBadge[r.status] || 'bg-muted'} border-0 text-[10px] capitalize`}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="p-3">
                    {r.status === 'pending' && (
                      <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => markProcessed(r.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Mark Done
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground text-sm">
                  {loading ? 'Loading...' : 'No refund records found'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
