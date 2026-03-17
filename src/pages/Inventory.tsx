import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { store } from "@/lib/store";
import { InventoryItem } from "@/lib/types";
import { Plus, Search, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Inventory() {
  const [items, setItems] = useState(store.getInventory());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', minStock: '', costPrice: '', sellPrice: '', gstPercent: '18' });

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.sku) { toast.error("Name and SKU required"); return; }
    const item: InventoryItem = {
      id: crypto.randomUUID(), name: form.name, sku: form.sku, category: form.category,
      quantity: parseInt(form.quantity) || 0, minStock: parseInt(form.minStock) || 5,
      costPrice: parseFloat(form.costPrice) || 0, sellPrice: parseFloat(form.sellPrice) || 0,
      gstPercent: parseFloat(form.gstPercent) || 18, updatedAt: new Date().toISOString().split('T')[0],
    };
    store.addInventoryItem(item);
    setItems(store.getInventory());
    setOpen(false);
    setForm({ name: '', sku: '', category: '', quantity: '', minStock: '', costPrice: '', sellPrice: '', gstPercent: '18' });
    toast.success("Item added");
  };

  const handleDelete = (id: string, name: string) => {
    store.deleteInventoryItem(id);
    setItems(store.getInventory());
    toast.success(`${name} removed`);
  };

  return (
    <Layout title="Inventory">
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
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
                {filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium flex items-center gap-2">
                        {item.name}
                        {item.quantity <= item.minStock && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell font-mono text-xs">{item.sku}</td>
                    <td className="p-3 hidden md:table-cell">{item.category}</td>
                    <td className="p-3">
                      <Badge className={`${item.quantity <= item.minStock ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'} border-0 text-xs`}>
                        {item.quantity}
                      </Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell">₹{item.costPrice}</td>
                    <td className="p-3 font-semibold">₹{item.sellPrice}</td>
                    <td className="p-3 hidden md:table-cell">{item.gstPercent}%</td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id, item.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No items found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
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
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
