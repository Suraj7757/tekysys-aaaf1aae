import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CalendarCheck, Copy, ExternalLink, Check, X, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingsAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertBooking, setConvertBooking] = useState<any>(null);
  const [convertForm, setConvertForm] = useState({ technician_name: '', estimated_cost: '' });
  const [slug, setSlug] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [shopRes, bookRes] = await Promise.all([
      (supabase as any).from('shop_settings').select('booking_slug, booking_enabled').eq('user_id', user.id).maybeSingle(),
      (supabase as any).from('booking_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setSlug(shopRes.data?.booking_slug || '');
    setEnabled(shopRes.data?.booking_enabled || false);
    setBookings(bookRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!cleanSlug) { toast.error('Slug required'); return; }
    const { error } = await (supabase as any).from('shop_settings')
      .update({ booking_slug: cleanSlug, booking_enabled: enabled }).eq('user_id', user.id);
    if (error) { toast.error(error.message); return; }
    setSlug(cleanSlug);
    toast.success('Booking page settings saved');
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from('booking_requests').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked ${status}`);
    load();
  };

  const url = slug ? `${window.location.origin}/book/${slug}` : '';
  const copyUrl = () => { navigator.clipboard.writeText(url); toast.success('Link copied'); };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><CalendarCheck className="h-7 w-7 text-primary" /> Customer Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">Public link for customers to submit repair requests.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Public Booking Page</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Enable public booking page</Label><p className="text-xs text-muted-foreground">Customers can submit requests through your link.</p></div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
            <div>
              <Label>Your booking slug</Label>
              <div className="flex gap-2 mt-1">
                <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="my-shop-name" />
                <Button onClick={saveSettings}>Save</Button>
              </div>
            </div>
            {url && enabled && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between gap-2 flex-wrap">
                <code className="text-xs break-all">{url}</code>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyUrl}><Copy className="h-3 w-3 mr-1" /> Copy</Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(url, '_blank')}><ExternalLink className="h-3 w-3 mr-1" /> Open</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Incoming Requests</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-muted-foreground">Loading...</p> : bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No booking requests yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="p-4 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold">{b.customer_name} · {b.customer_mobile}</p>
                        <p className="text-sm text-muted-foreground">{b.device_brand} {b.device_model}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                        b.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                        b.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600' :
                        b.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600'
                      }`}>{b.status}</span>
                    </div>
                    <p className="text-sm">{b.problem_description}</p>
                    <p className="text-xs text-muted-foreground">Submitted {new Date(b.created_at).toLocaleString()}</p>
                    <div className="flex gap-2 pt-1 flex-wrap">
                      {b.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(b.id, 'accepted')}><Check className="h-3 w-3 mr-1" /> Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'rejected')}><X className="h-3 w-3 mr-1" /> Reject</Button>
                        </>
                      )}
                      {(b.status === 'pending' || b.status === 'accepted') && (
                        <Button size="sm" variant="default" className="bg-primary" onClick={() => { setConvertBooking(b); setConvertForm({ technician_name: '', estimated_cost: '' }); setConvertOpen(true); }}>
                          <Wrench className="h-3 w-3 mr-1" /> Convert to Job
                        </Button>
                      )}
                      {b.status === 'converted' && b.converted_job_id && (
                        <Button size="sm" variant="outline" onClick={() => navigate(`/jobs?search=${b.converted_job_id}`)}>
                          View Job: {b.converted_job_id}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Convert to Repair Job</DialogTitle></DialogHeader>
            {convertBooking && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p><b>{convertBooking.customer_name}</b> · {convertBooking.customer_mobile}</p>
                  <p className="text-muted-foreground">{convertBooking.device_brand} {convertBooking.device_model}</p>
                  <p className="mt-1">{convertBooking.problem_description}</p>
                </div>
                <div><Label>Assign Technician (optional)</Label><Input value={convertForm.technician_name} onChange={e => setConvertForm({ ...convertForm, technician_name: e.target.value })} placeholder="Technician name" /></div>
                <div><Label>Estimated Cost (₹)</Label><Input type="number" value={convertForm.estimated_cost} onChange={e => setConvertForm({ ...convertForm, estimated_cost: e.target.value })} placeholder="0" /></div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!convertBooking) return;
                const { data, error } = await (supabase as any).rpc('convert_booking_to_job', {
                  _booking_id: convertBooking.id,
                  _technician_name: convertForm.technician_name || null,
                  _estimated_cost: Number(convertForm.estimated_cost) || 0,
                });
                if (error) { toast.error(error.message); return; }
                toast.success(`Job created: ${data}`);
                setConvertOpen(false);
                load();
              }}>Create Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
