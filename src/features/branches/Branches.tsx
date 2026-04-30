import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  is_primary: boolean;
  active: boolean;
}

export default function Branches() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', is_primary: false, active: true });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any).from('branches').select('*').eq('user_id', user.id).order('created_at');
    setBranches(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', address: '', phone: '', is_primary: branches.length === 0, active: true });
    setOpen(true);
  };
  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({ name: b.name, address: b.address || '', phone: b.phone || '', is_primary: b.is_primary, active: b.active });
    setOpen(true);
  };

  const save = async () => {
    if (!user || !form.name.trim()) { toast.error('Branch name required'); return; }
    if (form.is_primary) {
      await (supabase as any).from('branches').update({ is_primary: false }).eq('user_id', user.id);
    }
    if (editing) {
      const { error } = await (supabase as any).from('branches').update(form).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Branch updated');
    } else {
      const { error } = await (supabase as any).from('branches').insert({ ...form, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success('Branch added');
    }
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    const { error } = await (supabase as any).from('branches').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted');
    load();
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Building2 className="h-7 w-7 text-primary" /> Branches</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage multiple shop locations under one account.</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Branch</Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : branches.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
            No branches yet. Add your first location.
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {branches.map(b => (
              <Card key={b.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {b.name}
                      {b.is_primary && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">PRIMARY</span>}
                      {!b.active && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">INACTIVE</span>}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-1 text-muted-foreground">
                  {b.address && <p>📍 {b.address}</p>}
                  {b.phone && <p>📞 {b.phone}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Branch' : 'Add Branch'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Branch - Patna" /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="flex items-center justify-between"><Label>Primary branch</Label><Switch checked={form.is_primary} onCheckedChange={v => setForm({ ...form, is_primary: v })} /></div>
              <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
