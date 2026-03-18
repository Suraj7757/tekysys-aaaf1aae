import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseQuery, useSoftDelete } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const { user } = useAuth();
  const { data: customers, loading, refetch } = useSupabaseQuery<any>('customers');
  const { data: jobs } = useSupabaseQuery<any>('repair_jobs');
  const { softDelete } = useSoftDelete();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const filtered = customers.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search)
  );

  const handleAdd = async () => {
    if (!name || !mobile || !user) { toast.error("Name and mobile required"); return; }
    const { error } = await supabase.from('customers').insert({
      user_id: user.id, name, mobile, email: email || null, address: address || null,
    });
    if (error) { toast.error(error.message); return; }
    refetch();
    setOpen(false);
    setName(""); setMobile(""); setEmail(""); setAddress("");
    toast.success("Customer added");
  };

  const handleDelete = async (c: any) => {
    const ok = await softDelete('customers', c.id, c.name);
    if (ok) {
      toast("Customer moved to trash", {
        action: { label: "Undo", onClick: async () => {
          await supabase.from('customers').update({ deleted: false, deleted_at: null }).eq('id', c.id);
          refetch();
        }},
        duration: 5000,
      });
      refetch();
    }
  };

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
                  <th className="text-left p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.mobile}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{c.email || '—'}</td>
                    <td className="p-3">{jobs.filter((j: any) => j.customer_id === c.id).length}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(c)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{loading ? 'Loading...' : 'No customers found'}</td></tr>
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
