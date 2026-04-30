import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, Store, Gift } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [trackingId, setTrackingId] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.email) return;
    (supabase as any).from('booking_requests').select('*').eq('customer_email', user.email).order('created_at', { ascending: false })
      .then(({ data }: any) => setOrders(data || []));
    (supabase as any).from('shop_settings').select('user_id, shop_name, address, phone, booking_slug').eq('booking_enabled', true).limit(20)
      .then(({ data }: any) => setShops(data || []));
  }, [user?.id]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.user_metadata?.display_name || user?.email}</h1>
          <p className="text-muted-foreground text-sm">Track your repairs, browse shops, manage rewards.</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Track Your Repair</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="Enter tracking ID e.g. JSAM0042K9X" value={trackingId} onChange={e => setTrackingId(e.target.value.toUpperCase())} />
            <Button asChild><Link to={`/track${trackingId ? `?id=${trackingId}` : ''}`}>Track</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />My Bookings</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Device</TableHead><TableHead>Problem</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{o.device_brand} {o.device_model}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate">{o.problem_description}</TableCell>
                    <TableCell><Badge variant={o.status === 'converted' ? 'default' : 'outline'}>{o.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No bookings yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />Browse Shops</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shops.map(s => (
                <Card key={s.user_id} className="border-2 hover:border-primary/50 transition">
                  <CardContent className="p-4 space-y-2">
                    <div className="font-bold">{s.shop_name}</div>
                    <div className="text-xs text-muted-foreground">{s.address || 'No address'}</div>
                    <div className="text-xs">{s.phone}</div>
                    {s.booking_slug && <Button asChild size="sm" variant="outline" className="w-full"><Link to={`/book/${s.booking_slug}`}>Book Repair</Link></Button>}
                  </CardContent>
                </Card>
              ))}
              {shops.length === 0 && <p className="text-center text-muted-foreground col-span-full py-6">No shops available yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
