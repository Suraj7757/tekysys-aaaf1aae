import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { Badge } from '@/components/ui/badge';

interface TrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialId?: string;
}

export default function TrackDialog({ open, onOpenChange, initialId = '' }: TrackDialogProps) {
  const [trackId, setTrackId] = useState(initialId);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!trackId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data, error } = await supabase.rpc('track_order', { _tracking_id: trackId });
      if (error) throw error;
      if (!data || (data as any[]).length === 0) setError('No order found with this ID');
      else setResult(data[0]);
    } catch (err: any) {
      setError(err.message || 'Tracking failed');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    'Received': 'bg-slate-100 text-slate-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Ready': 'bg-green-100 text-green-700',
    'Delivered': 'bg-emerald-100 text-emerald-700',
    'Rejected': 'bg-red-100 text-red-700',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-3xl rounded-[2.5rem]">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2 text-white">
              <Search className="h-6 w-6" /> Track Your Order
            </DialogTitle>
            <p className="text-indigo-100 text-sm opacity-80 font-medium">Enter your tracking ID to see real-time status</p>
          </DialogHeader>
          
          <div className="mt-6 flex gap-2">
            <Input 
              value={trackId} 
              onChange={e => setTrackId(e.target.value)} 
              placeholder="e.g. JSAM0042K9X" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl focus:ring-2 focus:ring-white/30"
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
            />
            <Button onClick={handleTrack} disabled={loading} className="bg-white text-indigo-600 hover:bg-white/90 h-12 px-6 rounded-xl font-bold shadow-lg">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Track'}
            </Button>
          </div>
        </div>

        <div className="p-8 min-h-[200px] flex flex-col justify-center items-center bg-background">
          {loading && <Loader2 className="h-10 w-10 animate-spin text-indigo-600 opacity-20" />}
          
          {error && (
            <div className="text-center space-y-2 animate-in fade-in zoom-in-95">
              <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">✕</div>
              <p className="text-sm font-bold text-red-500 uppercase tracking-widest">{error}</p>
            </div>
          )}

          {result && (
            <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start border-b border-muted pb-4">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Order Status</p>
                  <Badge className={`mt-1 font-bold ${statusColors[result.status] || 'bg-muted'} border-0`}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last Updated</p>
                  <p className="text-xs font-bold mt-1">{new Date(result.updated_at || result.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer</p>
                  <p className="font-bold text-sm">{result.customer_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Device / Item</p>
                  <p className="font-bold text-sm">{result.device_model || result.item_name || 'N/A'}</p>
                </div>
              </div>

              {result.problem && (
                <div className="bg-muted/50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Reported Issue</p>
                  <p className="text-sm font-medium italic">"{result.problem}"</p>
                </div>
              )}

              <Button onClick={() => onOpenChange(false)} className="w-full h-12 rounded-xl font-bold bg-muted text-foreground hover:bg-muted/80">
                Close
              </Button>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="text-center space-y-2 opacity-30">
              <Search className="h-12 w-12 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">Awaiting Input</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
