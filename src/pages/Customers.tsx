import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { store } from "@/lib/store";
import { Customer } from "@/lib/types";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const [customers, setCustomers] = useState(store.getCustomers());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search)
  );

  const handleAdd = () => {
    if (!name || !mobile) { toast.error("Name and mobile required"); return; }
    const c: Customer = { id: crypto.randomUUID(), name, mobile, email: email || undefined, address: address || undefined, createdAt: new Date().toISOString().split('T')[0] };
    store.addCustomer(c);
    setCustomers(store.getCustomers());
    setOpen(false);
    setName(""); setMobile(""); setEmail(""); setAddress("");
    toast.success("Customer added");
  };

  const jobs = store.getJobs();

  return (
    <Layout title="Customers">
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or mobile..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Customer</Button>
        </div>

        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Mobile</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Email</th>
                  <th className="text-left p-3 font-semibold">Jobs</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Since</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.mobile}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{c.email || '—'}</td>
                    <td className="p-3">{jobs.filter(j => j.customerId === c.id).length}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{c.createdAt}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>Mobile *</Label><Input value={mobile} onChange={e => setMobile(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Address</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
