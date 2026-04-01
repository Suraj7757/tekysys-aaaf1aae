import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseQuery, useShopSettings } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Search, Package, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Sells() {
  const { user } = useAuth();
  const { data: inventory, refetch } = useSupabaseQuery<any>('inventory');
  const { settings } = useShopSettings();
  const [search, setSearch] = useState('');
  const [sellOpen, setSellOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [sellPrice, setSellPrice] = useState('');

  const filtered = inventory.filter((i: any) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openSell = (item: any) => {
    setSelectedItem(item);
    setQty(1);
    setSellPrice(String(item.sell_price));
    setSellOpen(true);
  };

  const handleSell = async () => {
    if (!selectedItem || !user) return;
    if (qty > selectedItem.quantity) { toast.error('Not enough stock'); return; }
    const newQty = selectedItem.quantity - qty;
    await supabase.from('inventory').update({ quantity: newQty }).eq('id', selectedItem.id);
    refetch();
    setSellOpen(false);
    toast.success(`Sold ${qty}x ${selectedItem.name}`);
  };

  return (
    <Layout title="Sell Inventory">
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items to sell..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
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
                  <Badge className={`${item.quantity <= item.min_stock ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'} border-0 text-xs`}>
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

        <Dialog open={sellOpen} onOpenChange={setSellOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Sell — {selectedItem?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Available Stock: <strong>{selectedItem?.quantity}</strong></p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="text-2xl font-bold w-12 text-center">{qty}</span>
                <Button variant="outline" size="icon" onClick={() => setQty(Math.min(selectedItem?.quantity || 1, qty + 1))}><Plus className="h-4 w-4" /></Button>
              </div>
              <div><Label>Sell Price (₹)</Label><Input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} /></div>
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
