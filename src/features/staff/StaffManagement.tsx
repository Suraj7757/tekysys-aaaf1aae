import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users, Shield, Mail, Phone, MoreVertical, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSupabaseQuery } from '@/hooks/useSupabaseData';
import { supabase } from '@/services/supabase';

export default function StaffManagement() {
  const { user } = useAuth();
  const { data: staffMembers, refetch } = useSupabaseQuery<any>('user_roles');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff'
  });

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real app, this would involve inviting the user via email
      // For now, we'll simulate adding a staff member to the user_roles table
      // Note: This needs proper backend logic to link with auth.users
      toast.info('Staff invitation feature coming soon! (Simulation)');
      setIsAddOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Staff Management">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" /> Team Management
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">Manage your shop's technicians, receptionists and admins.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20 gap-2">
            <UserPlus className="h-4 w-4" /> Invite Staff Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/10 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Staff</p>
                  <p className="text-3xl font-black text-foreground">{staffMembers?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-500/5 border-emerald-500/10 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Now</p>
                  <p className="text-3xl font-black text-foreground">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/10 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Roles Defined</p>
                  <p className="text-3xl font-black text-foreground">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl ring-1 ring-white/5 overflow-hidden border-0">
          <CardHeader className="bg-card/50 border-b pb-4">
            <CardTitle className="text-xl font-black tracking-tight">Staff Directory</CardTitle>
            <CardDescription>View and manage all members with access to this shop.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Staff Member</TableHead>
                  <TableHead className="font-bold">Contact</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Access</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers?.map((member: any, i: number) => (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
                          {member.user_id.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Member {i + 1}</p>
                          <p className="text-xs text-muted-foreground">ID: {member.user_id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> <span>staff-{i+1}@repairxpert.com</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-lg px-2 py-0.5 font-bold uppercase text-[10px] ${member.role === 'admin' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600/20 bg-green-500/5 gap-1.5 px-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" /> Full Access
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                {(!staffMembers || staffMembers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-12 w-12 opacity-20 mb-4" />
                        <p className="font-medium">No staff members found.</p>
                        <Button variant="link" onClick={() => setIsAddOpen(true)}>Invite your first technician</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invite Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="gradient-primary p-6 text-center">
              <UserPlus className="h-10 w-10 text-primary-foreground/20 mx-auto mb-2" />
              <DialogTitle className="text-2xl font-black text-primary-foreground tracking-tight">Staff Invitation</DialogTitle>
              <DialogDescription className="text-primary-foreground/70 font-medium">Invite a new member to join your shop dashboard.</DialogDescription>
            </div>
            <div className="p-6 space-y-5 bg-card">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input 
                  placeholder="e.g. Rahul Sharma" 
                  className="rounded-xl border-2 focus-visible:ring-primary h-12"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="rahul@example.com" 
                  className="rounded-xl border-2 focus-visible:ring-primary h-12"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mobile Number</Label>
                <Input 
                  placeholder="+91 00000 00000" 
                  className="rounded-xl border-2 focus-visible:ring-primary h-12"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assign Role</Label>
                <Select value={newStaff.role} onValueChange={(v) => setNewStaff({...newStaff, role: v})}>
                  <SelectTrigger className="rounded-xl border-2 h-12">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="staff">Technician (Can manage jobs)</SelectItem>
                    <SelectItem value="receptionist">Receptionist (Can manage customers)</SelectItem>
                    <SelectItem value="admin">Manager (Full access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button className="flex-1 rounded-xl h-12 font-black shadow-lg shadow-primary/20" onClick={handleAddStaff} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
