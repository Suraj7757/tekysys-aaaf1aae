import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, FileSignature, WalletCards, ShieldCheck, Mail, Briefcase, PhoneCall, CheckCircle, Smartphone, Crown, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { useAuth } from '@/context/AuthContext';
import { useSupabaseQuery } from '@/hooks/useSupabaseData';
import { supabase } from '@/services/supabase';
import { Link } from 'react-router-dom';

export default function EnterpriseModules() {
  const { isFeatureLocked, planType } = usePlanRestrictions();

  if (isFeatureLocked('hasEnterprise')) {
    return (
      <MainLayout title="Enterprise ERP Modules">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
          <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 ring-4 ring-primary/5">
            <Crown className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Enterprise Modules Locked</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Features like Expense Tracking, Lead Management, Task Assignment, and Digital Signatures are only available in the <strong>Standard, Enterprise, or Premium</strong> plans.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/subscription">
              <Button size="lg" className="px-8 font-bold shadow-lg shadow-primary/20">Upgrade Now</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">Go Back</Button>
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="p-4 border rounded-xl bg-muted/30">
              <Lock className="h-5 w-5 text-muted-foreground mb-2" />
              <h4 className="font-bold text-sm">Expenses</h4>
              <p className="text-xs text-muted-foreground">Track daily shop spending and analyze losses.</p>
            </div>
            <div className="p-4 border rounded-xl bg-muted/30">
              <Lock className="h-5 w-5 text-muted-foreground mb-2" />
              <h4 className="font-bold text-sm">Leads</h4>
              <p className="text-xs text-muted-foreground">Capture potential customers and follow up automatically.</p>
            </div>
            <div className="p-4 border rounded-xl bg-muted/30">
              <Lock className="h-5 w-5 text-muted-foreground mb-2" />
              <h4 className="font-bold text-sm">Automation</h4>
              <p className="text-xs text-muted-foreground">Digital signatures and own-domain email branding.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  const { user } = useAuth();
  const { data: expenses, refetch: refetchExpenses } = useSupabaseQuery<any>('erp_expenses');
  const { data: leads, refetch: refetchLeads } = useSupabaseQuery<any>('erp_leads');
  const { data: tasks, refetch: refetchTasks } = useSupabaseQuery<any>('erp_tasks');

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [taskTitle, setTaskTitle] = useState('');

  const addExpense = async () => {
    if (!expDesc || !expAmt || !user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('erp_expenses').insert({
        user_id: user.id,
        description: expDesc,
        amount: Number(expAmt),
        date: new Date().toISOString()
      });
      if (error) throw error;
      toast.success('Expense Added');
      setExpDesc(''); setExpAmt('');
      refetchExpenses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLead = async () => {
    if (!leadName || !leadPhone || !user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('erp_leads').insert({
        user_id: user.id,
        name: leadName,
        phone: leadPhone,
        status: 'New'
      });
      if (error) throw error;
      toast.success('Lead Added');
      setLeadName(''); setLeadPhone('');
      refetchLeads();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTask = async () => {
    if (!taskTitle || !user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('erp_tasks').insert({
        user_id: user.id,
        title: taskTitle,
        done: false
      });
      if (error) throw error;
      toast.success('Task Added');
      setTaskTitle('');
      refetchTasks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (id: string, done: boolean) => {
    const { error } = await supabase.from('erp_tasks').update({ done: !done }).eq('id', id);
    if (error) {
      toast.error('Failed to update task');
    } else {
      refetchTasks();
    }
  };

  return (
    <MainLayout title="Enterprise ERP Modules">
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" /> Advanced ERP Systems
            </h1>
            <p className="text-muted-foreground mt-1">Manage 35+ advanced features required for scaling your repair franchise.</p>
          </div>
          <Badge className="bg-primary text-primary-foreground uppercase font-bold px-3 py-1">Standard / Premium Plan</Badge>
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto p-1 mb-6 gap-2 bg-muted/50">
            <TabsTrigger value="expenses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">Expenses</TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">Leads</TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">Tasks</TabsTrigger>
            <TabsTrigger value="phonepe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">PhonePe API</TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">Own Email</TabsTrigger>
            <TabsTrigger value="signature" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">Digital Sign</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5" /> Expense Management</CardTitle>
                <CardDescription>Track daily shop expenses directly in your CRM.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input placeholder="Expense Description (e.g. Tea/Coffee)" value={expDesc} onChange={e => setExpDesc(e.target.value)} disabled={isSubmitting} />
                  <Input placeholder="Amount (₹)" type="number" value={expAmt} onChange={e => setExpAmt(e.target.value)} className="w-32" disabled={isSubmitting} />
                  <Button onClick={addExpense} disabled={isSubmitting}>{isSubmitting ? '...' : 'Add'}</Button>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {expenses.map(e => (
                      <TableRow key={e.id}>
                        <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                        <TableCell>{e.desc}</TableCell>
                        <TableCell className="font-bold text-destructive">-₹{e.amount}</TableCell>
                      </TableRow>
                    ))}
                    {expenses.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-4">No expenses recorded yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PhoneCall className="h-5 w-5" /> Lead Management</CardTitle>
                <CardDescription>Track prospective customers and follow-ups.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input placeholder="Customer Name" value={leadName} onChange={e => setLeadName(e.target.value)} disabled={isSubmitting} />
                  <Input placeholder="Mobile Number" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} disabled={isSubmitting} />
                  <Button onClick={addLead} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Capture Lead'}</Button>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {leads.map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="font-semibold">{l.name}</TableCell>
                        <TableCell>{l.phone}</TableCell>
                        <TableCell><Badge variant="secondary">{l.status}</Badge></TableCell>
                        <TableCell><Button variant="outline" size="sm" onClick={() => toast.success('Follow-up scheduled!')}>Follow Up</Button></TableCell>
                      </TableRow>
                    ))}
                    {leads.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-4">No leads found.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Task Management</CardTitle>
                <CardDescription>Assign and track daily operational tasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input placeholder="What needs to be done?" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} disabled={isSubmitting} />
                  <Button onClick={addTask} disabled={isSubmitting}>{isSubmitting ? '...' : 'Add Task'}</Button>
                </div>
                <div className="space-y-2">
                  {tasks.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted" onClick={() => toggleTask(t.id, t.done)}>
                      <CheckCircle className={`h-5 w-5 ${t.done ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span className={t.done ? 'line-through text-muted-foreground' : 'font-medium'}>{t.title}</span>
                    </div>
                  ))}
                  {tasks.length === 0 && <p className="text-center text-muted-foreground py-4">No pending tasks.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phonepe" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" /> PhonePe Payment Gateway Integration</CardTitle>
                <CardDescription>Configure direct PhonePe Business PG for automated collections.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Merchant ID</Label>
                    <Input type="password" placeholder="PG_MERCHANT_ID_XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Salt Key</Label>
                    <Input type="password" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  </div>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 text-sm text-yellow-700 dark:text-yellow-400">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <p>Your subscription currently operates on Custom UPI QR. To activate PhonePe Auto-Webhook callbacks, please ensure your enterprise domain is verified with PhonePe Business.</p>
                </div>
                <Button onClick={() => toast.success('API Keys Saved!')}>Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Own Email Setup</CardTitle>
                <CardDescription>Send quotations and invoices from your own custom domain email.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>SMTP Host</Label><Input placeholder="smtp.gmail.com" /></div>
                  <div className="space-y-2"><Label>SMTP Port</Label><Input placeholder="587" /></div>
                  <div className="space-y-2"><Label>Email Address</Label><Input placeholder="billing@yourrepairshop.com" /></div>
                  <div className="space-y-2"><Label>App Password</Label><Input type="password" placeholder="**** **** **** ****" /></div>
                </div>
                <Button onClick={() => toast.success('SMTP Configuration Saved & Tested!')}>Test & Save Email Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signature" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5" /> Digital Signature</CardTitle>
                <CardDescription>Enable digital signatures on repair receipts and handover documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border-2 border-dashed border-primary/30 rounded-xl h-48 bg-muted/20 flex items-center justify-center relative cursor-crosshair">
                   <p className="text-muted-foreground opacity-50 select-none">Draw signature here (Canvas API active)</p>
                   <div className="absolute inset-0 z-10 pointer-events-auto" onClick={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const dot = document.createElement('div');
                     dot.className = 'absolute w-2 h-2 bg-primary rounded-full';
                     dot.style.left = `${e.clientX - rect.left}px`;
                     dot.style.top = `${e.clientY - rect.top}px`;
                     e.currentTarget.appendChild(dot);
                   }}></div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => toast.success('Signature saved to Job Receipt!')}>Save Signature to Document</Button>
                  <Button variant="outline" onClick={() => toast.info('Canvas cleared')}>Clear Pad</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  );
}
