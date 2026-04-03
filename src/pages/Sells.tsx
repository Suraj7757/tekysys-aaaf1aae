import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseQuery, useShopSettings } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Search, Package, Minus, Plus, Share2, FileText } from 'lucide-react';
import { toast } from 'sonner';

async function getNextSellId(userId: string): Promise<string> {
  const { data, error } = await supabase.rpc('next_sell_id', { _user_id: userId });
  if (error) throw error;
  return data as string;
}

export default function Sells() {
  const { user } = useAuth();
  const { data: inventory, refetch: refetchInventory } = useSupabaseQuery<any>('inventory');
  const { data: sells, refetch: refetchSells } = useSupabaseQuery<any>('sells' as any);
  const { settings } = useShopSettings();
  const [search, setSearch] = useState('');
  const [sellOpen, setSellOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [sellPrice, setSellPrice] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [tab, setTab] = useState<'shop' | 'history'>('shop');

  const filtered = inventory.filter((i: any) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openSell = (item: any) => {
    setSelectedItem(item);
    setQty(1);
    setSellPrice(String(item.sell_price));
    setCustomerName('');
    setCustomerMobile('');
    setPaymentMethod('Cash');
    setSellOpen(true);
  };

  const handleSell = async () => {
    if (!selectedItem || !user) return;
    if (qty > selectedItem.quantity) { toast.error('Not enough stock'); return; }
    if (!customerName.trim()) { toast.error('Customer name required'); return; }

    const sellId = await getNextSellId(user.id);
    const total = qty * (parseFloat(sellPrice) || 0);
    const newQty = selectedItem.quantity - qty;

    await supabase.from('inventory').update({ quantity: newQty }).eq('id', selectedItem.id);
    await supabase.from('sells' as any).insert({
      user_id: user.id,
      sell_id: sellId,
      inventory_item_id: selectedItem.id,
      item_name: selectedItem.name,
      item_sku: selectedItem.sku,
      quantity: qty,
      sell_price: parseFloat(sellPrice) || 0,
      total,
      customer_name: customerName,
      customer_mobile: customerMobile,
      payment_method: paymentMethod,
      status: 'Completed',
    } as any);

    refetchInventory();
    refetchSells();
    setSellOpen(false);
    toast.success(`Sold ${qty}x ${selectedItem.name} — ${sellId}`);
  };

  const shareWhatsApp = (sell: any) => {
    const shopName = settings?.shop_name || 'RepairDesk';
    const msg = `*${shopName} - Sale Receipt*\n\nSale ID: ${sell.sell_id}\nItem: ${sell.item_name}\nQty: ${sell.quantity}\nTotal: ₹${Number(sell.total).toLocaleString()}\nPayment: ${sell.payment_method}\n\nTrack your order: ${window.location.origin}/track?id=${sell.sell_id}`;
    window.open(`https://wa.me/${(sell.customer_mobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Layout title="Sell Inventory">
      <div className="space-y-4 animate-fade-in">
        <div className="flex gap-2 mb-4">
          <Button variant={tab === 'shop' ? 'default' : 'outline'} size="sm" onClick={() => setTab('shop')}>
            <ShoppingCart className="h-4 w-4 mr-1" /> Shop
          </Button>
          <Button variant={tab === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setTab('history')}>
            <FileText className="h-4 w-4 mr-1" /> Sales History
          </Button>
        </div>

        {tab === 'shop' && (
          <>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item: any) => (
                <Card key={item.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                      </div>
                      <Badge className={`${item.quantity <= item.min_stock ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'} border-0 text-xs`}>
                        Stock: {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">₹{Number(item.sell_price).toLocaleString()}</span>
                      <Button size="sm" onClick={() => openSell(item)} disabled={item.quantity <= 0}>
                        <ShoppingCart className="h-4 w-4 mr-1" /> Sell
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center p-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No items found</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'history' && (
          <Card className="shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-semibold">Sale ID</th>
                    <th className="text-left p-3 font-semibold">Item</th>
                    <th className="text-left p-3 font-semibold hidden sm:table-cell">Customer</th>
                    <th className="text-left p-3 font-semibold">Qty</th>
                    <th className="text-left p-3 font-semibold">Total</th>
                    <th className="text-left p-3 font-semibold hidden md:table-cell">Payment</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(sells as any[]).map((s: any) => (
                    <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-semibold text-primary">{s.sell_id}</td>
                      <td className="p-3">{s.item_name}</td>
                      <td className="p-3 hidden sm:table-cell">{s.customer_name || '—'}</td>
                      <td className="p-3">{s.quantity}</td>
                      <td className="p-3 font-semibold">₹{Number(s.total).toLocaleString()}</td>
                      <td className="p-3 hidden md:table-cell">{s.payment_method}</td>
                      <td className="p-3">
                        {s.customer_mobile && (
                          <Button size="sm" variant="ghost" onClick={() => shareWhatsApp(s)}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(sells as any[]).length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No sales yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Dialog open={sellOpen} onOpenChange={setSellOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Sell — {selectedItem?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">Available Stock: <strong>{selectedItem?.quantity}</strong></p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="text-2xl font-bold w-12 text-center">{qty}</span>
                <Button variant="outline" size="icon" onClick={() => setQty(Math.min(selectedItem?.quantity || 1, qty + 1))}><Plus className="h-4 w-4" /></Button>
              </div>
              <div><Label>Customer Name *</Label><Input placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
              <div><Label>Customer Mobile</Label><Input placeholder="9876543210" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} /></div>
              <div><Label>Sell Price (₹)</Label><Input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} /></div>
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">💵 Cash</SelectItem>
                    <SelectItem value="UPI/QR">📱 UPI/QR</SelectItem>
                    <SelectItem value="Due">📋 Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                <div className="flex justify-between"><span>Total</span><strong>₹{(qty * (parseFloat(sellPrice) || 0)).toLocaleString()}</strong></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSellOpen(false)}>Cancel</Button>
              <Button onClick={handleSell}>Confirm Sale</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
