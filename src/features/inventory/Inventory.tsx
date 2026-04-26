import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useSupabaseQuery, useSoftDelete } from "@/hooks/useSupabaseData";
import { supabase } from "@/services/supabase";
import { Plus, Search, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Inventory() {
  const { user } = useAuth();
  const { data: items, loading, refetch } = useSupabaseQuery<any>('inventory');
  const { softDelete } = useSoftDelete();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', minStock: '', costPrice: '', sellPrice: '', gstPercent: '18' });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = items.filter((i: any) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.sku || !user) { toast.error("Name and SKU required"); return; }
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await supabase.from('inventory').update({
          name: form.name, sku: form.sku, category: form.category || null,
          quantity: parseInt(form.quantity) || 0, min_stock: parseInt(form.minStock) || 5,
          cost_price: parseFloat(form.costPrice) || 0, sell_price: parseFloat(form.sellPrice) || 0,
          gst_percent: parseFloat(form.gstPercent) || 18,
        }).eq('id', editingItem.id);
        toast.success("Item updated");
      } else {
        await supabase.from('inventory').insert({
          user_id: user.id, name: form.name, sku: form.sku, category: form.category || null,
          quantity: parseInt(form.quantity) || 0, min_stock: parseInt(form.minStock) || 5,
          cost_price: parseFloat(form.costPrice) || 0, sell_price: parseFloat(form.sellPrice) || 0,
          gst_percent: parseFloat(form.gstPercent) || 18,
        });
        toast.success("Item added");
      }
      refetch();
      setOpen(false);
      setEditingItem(null);
      setForm({ name: '', sku: '', category: '', quantity: '', minStock: '', costPrice: '', sellPrice: '', gstPercent: '18' });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      name: item.name, sku: item.sku, category: item.category || '',
      quantity: String(item.quantity), minStock: String(item.min_stock),
      costPrice: String(item.cost_price), sellPrice: String(item.sell_price),
      gstPercent: String(item.gst_percent)
    });
    setOpen(true);
  };

  const handleDelete = async (item: any) => {
    const ok = await softDelete('inventory', item.id, item.name);
    if (ok) {
      toast("Item moved to trash", {
        action: { label: "Undo", onClick: async () => {
          await supabase.from('inventory').update({ deleted: false, deleted_at: null }).eq('id', item.id);
          refetch();
        }},
        duration: 5000,
      });
      refetch();
    }
  };

  return (
    <MainLayout title="Inventory">
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => { setEditingItem(null); setForm({ name: '', sku: '', category: '', quantity: '', minStock: '', costPrice: '', sellPrice: '', gstPercent: '18' }); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
        </div>

        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Item</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">SKU</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Category</th>
                  <th className="text-left p-3 font-semibold">Stock</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Cost</th>
                  <th className="text-left p-3 font-semibold">Sell Price</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">GST</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium flex items-center gap-2">
                        {item.name}
                        {item.quantity <= item.min_stock && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell font-mono text-xs">{item.sku}</td>
                    <td className="p-3 hidden md:table-cell">{item.category}</td>
                    <td className="p-3">
                      <Badge className={`${item.quantity <= item.min_stock ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'} border-0 text-xs`}>
                        {item.quantity}
                      </Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell">₹{Number(item.cost_price)}</td>
                    <td className="p-3 font-semibold">₹{Number(item.sell_price)}</td>
                    <td className="p-3 hidden md:table-cell">{Number(item.gst_percent)}%</td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(item)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (<tr><td colSpan={8} className="p-8 text-center text-muted-foreground">{loading ? 'Loading...' : 'No items found'}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingItem ? 'Edit' : 'Add'} Inventory Item</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>SKU *</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
                <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
                <div><Label>Min Stock</Label><Input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Cost (₹)</Label><Input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} /></div>
                <div><Label>Sell (₹)</Label><Input type="number" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: e.target.value })} /></div>
                <div><Label>GST %</Label><Input type="number" value={form.gstPercent} onChange={e => setForm({ ...form, gstPercent: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleAdd} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : (editingItem ? 'Save Changes' : 'Add Item')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
