import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Trash2, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  user_id: string;
  display_name: string;
  email?: string;
  created_at: string;
  role?: 'admin' | 'staff';
}

export default function UserManagement() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!user || role !== 'admin') return;
    setLoading(true);

    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');

    const roleMap: Record<string, 'admin' | 'staff'> = {};
    roles?.forEach(r => { roleMap[r.user_id] = r.role as 'admin' | 'staff'; });

    const combined: UserProfile[] = (profiles || []).map(p => ({
      user_id: p.user_id,
      display_name: p.display_name || 'Unknown',
      created_at: p.created_at,
      role: roleMap[p.user_id] || 'staff',
    }));

    setUsers(combined);
    setLoading(false);
  }, [user, role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeRole = async (userId: string, newRole: 'admin' | 'staff') => {
    const { data: existing } = await supabase.from('user_roles').select('id').eq('user_id', userId).maybeSingle();
    if (existing) {
      await supabase.from('user_roles').update({ role: newRole } as any).eq('user_id', userId);
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: newRole } as any);
    }
    toast.success(`Role updated to ${newRole}`);
    fetchUsers();
  };

  const handleRemoveUser = async () => {
    if (!targetUser) return;
    await supabase.from('user_roles').delete().eq('user_id', targetUser.user_id);
    await supabase.from('profiles').delete().eq('user_id', targetUser.user_id);
    toast.success('User removed from system');
    setConfirmOpen(false);
    setTargetUser(null);
    fetchUsers();
  };

  if (role !== 'admin') {
    return <Layout title="User Management"><p className="p-8 text-center text-muted-foreground">Admin access required</p></Layout>;
  }

  return (
    <Layout title="User Management">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Registered Users ({users.length})</h3>
        </div>

        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Role</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Joined</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.user_id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {u.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">{u.display_name}</span>
                          {u.user_id === user?.id && <Badge variant="outline" className="ml-1 text-[10px]">You</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Select value={u.role || 'staff'} onValueChange={(v) => changeRole(u.user_id, v as 'admin' | 'staff')} disabled={u.user_id === user?.id}>
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin"><div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</div></SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {u.user_id !== user?.id && (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { setTargetUser(u); setConfirmOpen(true); }}>
                          <Trash2 className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {loading && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>}
                {!loading && users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" /> Remove User
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Remove <strong>{targetUser?.display_name}</strong> from the system? Their profile and role will be deleted.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRemoveUser}>Remove</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
