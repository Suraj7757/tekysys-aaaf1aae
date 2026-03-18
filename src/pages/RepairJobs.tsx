import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseQuery, useSoftDelete, useShopSettings, getNextJobId } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, MoreVertical, Trash2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/lib/invoice";

type JobStatus = 'Received' | 'In Progress' | 'Ready' | 'Delivered' | 'Rejected' | 'Unrepairable';
type PaymentMethod = 'Cash' | 'UPI/QR' | 'Due';

const statusColors: Record<string, string> = {
  'Received': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-info/10 text-info',
  'Ready': 'bg-warning/10 text-warning',
  'Delivered': 'bg-success/10 text-success',
  'Rejected': 'bg-destructive/10 text-destructive',
  'Unrepairable': 'bg-destructive/10 text-destructive',
};

const allStatuses: JobStatus[] = ['Received', 'In Progress', 'Ready', 'Delivered', 'Rejected', 'Unrepairable'];

export default function RepairJobs() {
  const { user } = useAuth();
  const { data: jobs, refetch } = useSupabaseQuery<any>('repair_jobs');
  const { data: payments, refetch: refetchPayments } = useSupabaseQuery<any>('payments');
  const { softDelete } = useSoftDelete();
  const { settings } = useShopSettings();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearType, setClearType] = useState<'all' | 'delivered'>('all');

  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problem, setProblem] = useState("");
  const [technician, setTechnician] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [qrReceiver, setQrReceiver] = useState(settings?.qr_receivers?.[0] || "Admin QR");
  const [customQr, setCustomQr] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const filtered = jobs.filter((j: any) => {
    const matchSearch = j.job_id.toLowerCase().includes(search.toLowerCase()) ||
      j.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      j.customer_mobile.includes(search) ||
      j.device_brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleMobileSearch = async (mobile: string) => {
    setCustomerMobile(mobile);
    if (mobile.length >= 10 && user) {
      const { data } = await supabase.from('customers').select('name').eq('user_id', user.id).eq('mobile', mobile).eq('deleted', false).maybeSingle();
      if (data) { setCustomerName(data.name); toast.info(`Customer found: ${data.name}`); }
    }
  };

  const handleCreateJob = async () => {
    if (!customerName || !customerMobile || !deviceBrand || !problem || !user) {
      toast.error("Please fill all required fields"); return;
    }
    // Ensure customer exists
    let { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).eq('mobile', customerMobile).eq('deleted', false).maybeSingle();
    if (!customer) {
      const { data: newC } = await supabase.from('customers').insert({ user_id: user.id, name: customerName, mobile: customerMobile }).select('id').single();
      customer = newC;
    }
    const jobId = await getNextJobId(user.id);
    await supabase.from('repair_jobs').insert({
      user_id: user.id, job_id: jobId, customer_id: customer?.id,
      customer_name: customerName, customer_mobile: customerMobile,
      device_brand: deviceBrand, device_model: deviceModel || null,
      problem_description: problem, technician_name: technician || null,
      status: 'Received' as any, estimated_cost: parseFloat(estimatedCost) || 0,
    });
    refetch();
    setCreateOpen(false);
    setCustomerMobile(""); setCustomerName(""); setDeviceBrand(""); setDeviceModel(""); setProblem(""); setTechnician(""); setEstimatedCost("");
    toast.success(`Job ${jobId} created`);
  };

  const changeStatus = async (job: any, newStatus: JobStatus) => {
    if (newStatus === 'Delivered') {
      setSelectedJob(job);
      setPaymentAmount(String(job.estimated_cost));
      setPaymentOpen(true);
      return;
    }
    await supabase.from('repair_jobs').update({ status: newStatus as any }).eq('id', job.id);
    refetch();
    toast.success(`Job ${job.job_id} → ${newStatus}`);
  };

  const handleDeleteJob = async (job: any) => {
    const ok = await softDelete('repair_jobs', job.id, job.job_id);
    if (ok) {
      toast("Job moved to trash", {
        action: { label: "Undo", onClick: async () => {
          await supabase.from('repair_jobs').update({ deleted: false, deleted_at: null }).eq('id', job.id);
          refetch();
        }},
        duration: 5000,
      });
      refetch();
    }
  };

  const handlePayment = async () => {
    if (!selectedJob || !user) return;
    const amount = parseFloat(paymentAmount) || 0;
    const receiver = qrReceiver === 'Custom' ? customQr : qrReceiver;
    const adminPct = (settings?.admin_share_percent ?? 50) / 100;
    const staffPct = (settings?.staff_share_percent ?? 50) / 100;

    await supabase.from('repair_jobs').update({ status: 'Delivered' as any, delivered_at: new Date().toISOString() }).eq('id', selectedJob.id);
    await supabase.from('payments').insert({
      user_id: user.id, job_id: selectedJob.job_id, repair_job_id: selectedJob.id,
      amount, method: paymentMethod as any,
      qr_receiver: paymentMethod === 'UPI/QR' ? receiver : null,
      admin_share: amount * adminPct, staff_share: amount * staffPct,
    });
    refetch();
    refetchPayments();
    setPaymentOpen(false);
    setSelectedJob(null);
    toast.success(`Job ${selectedJob.job_id} delivered & payment recorded`);
  };

  const handleClearJobs = async () => {
    if (!user) return;
    const now = new Date().toISOString();
    if (clearType === 'all') {
      await supabase.from('repair_jobs').update({ deleted: true, deleted_at: now }).eq('user_id', user.id).eq('deleted', false);
      await supabase.from('payments').update({ deleted: true, deleted_at: now }).eq('user_id', user.id).eq('deleted', false);
    } else {
      const deliveredIds = jobs.filter((j: any) => j.status === 'Delivered').map((j: any) => j.id);
      if (deliveredIds.length > 0) {
        await supabase.from('repair_jobs').update({ deleted: true, deleted_at: now }).in('id', deliveredIds);
        await supabase.from('payments').update({ deleted: true, deleted_at: now }).in('repair_job_id', deliveredIds);
      }
    }
    refetch(); refetchPayments();
    setClearConfirmOpen(false);
    toast.success(clearType === 'all' ? 'All jobs moved to trash' : 'Delivered jobs moved to trash');
  };

  const handleInvoice = (job: any) => {
    const payment = payments.find((p: any) => p.repair_job_id === job.id);
    const s = settings || { shop_name: 'RepairDesk', phone: '', address: '', gstin: '', admin_share_percent: 50, staff_share_percent: 50, qr_receivers: [] };
    generateInvoicePDF(
      { id: job.id, jobId: job.job_id, customerId: job.customer_id, customerName: job.customer_name, customerMobile: job.customer_mobile, deviceBrand: job.device_brand, deviceModel: job.device_model || '', problemDescription: job.problem_description, status: job.status, estimatedCost: Number(job.estimated_cost), createdAt: job.created_at, updatedAt: job.updated_at, deliveredAt: job.delivered_at },
      payment ? { id: payment.id, jobId: payment.job_id, repairJobId: payment.repair_job_id, amount: Number(payment.amount), method: payment.method, qrReceiver: payment.qr_receiver, adminShare: Number(payment.admin_share), staffShare: Number(payment.staff_share), settled: payment.settled, createdAt: payment.created_at } : undefined,
      { shopName: s.shop_name, phone: s.phone, address: s.address, gstin: s.gstin, adminSharePercent: s.admin_share_percent, staffSharePercent: s.staff_share_percent, qrReceivers: s.qr_receivers }
    );
  };

  const qrReceivers = settings?.qr_receivers || ['Admin QR', 'Staff QR', 'Shop QR'];

  return (
    <Layout title="Repair Jobs">
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 mr-1" /> Clear</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setClearType('delivered'); setClearConfirmOpen(true); }}>Clear Delivered Jobs</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setClearType('all'); setClearConfirmOpen(true); }} className="text-destructive">Clear All Jobs</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" /> New Job</Button>
          </div>
        </div>

        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Job ID</th>
                  <th className="text-left p-3 font-semibold">Customer</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Device</th>
                  <th className="text-left p-3 font-semibold hidden lg:table-cell">Problem</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Amount</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job: any) => (
                  <tr key={job.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-semibold text-primary">{job.job_id}</td>
                    <td className="p-3"><div>{job.customer_name}</div><div className="text-xs text-muted-foreground">{job.customer_mobile}</div></td>
                    <td className="p-3 hidden md:table-cell">{job.device_brand} {job.device_model}</td>
                    <td className="p-3 hidden lg:table-cell max-w-48 truncate">{job.problem_description}</td>
                    <td className="p-3"><Badge className={`${statusColors[job.status] || ''} border-0 text-xs`}>{job.status}</Badge></td>
                    <td className="p-3 font-semibold">₹{Number(job.estimated_cost).toLocaleString()}</td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button size="sm" variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {allStatuses.filter(s => s !== job.status).map(s => (
                            <DropdownMenuItem key={s} onClick={() => changeStatus(job, s)}>→ {s}</DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          {job.status === 'Delivered' && (
                            <DropdownMenuItem onClick={() => handleInvoice(job)}><FileText className="h-4 w-4 mr-2" /> Invoice PDF</DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteJob(job)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (<tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No jobs found</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Job Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Repair Job</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Customer Mobile *</Label><Input placeholder="9876543210" value={customerMobile} onChange={e => handleMobileSearch(e.target.value)} /></div>
                <div><Label>Customer Name *</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Device Brand *</Label><Input placeholder="Samsung, iPhone..." value={deviceBrand} onChange={e => setDeviceBrand(e.target.value)} /></div>
                <div><Label>Device Model</Label><Input placeholder="Galaxy S23" value={deviceModel} onChange={e => setDeviceModel(e.target.value)} /></div>
              </div>
              <div><Label>Problem Description *</Label><Textarea placeholder="Describe the issue..." value={problem} onChange={e => setProblem(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Technician</Label><Input placeholder="Technician name" value={technician} onChange={e => setTechnician(e.target.value)} /></div>
                <div><Label>Estimated Cost (₹)</Label><Input type="number" placeholder="0" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateJob}>Create Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Record Payment — {selectedJob?.job_id}</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div><Label>Amount (₹)</Label><Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div>
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">💵 Cash</SelectItem>
                    <SelectItem value="UPI/QR">📱 UPI/QR</SelectItem>
                    <SelectItem value="Due">📋 Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentMethod === 'UPI/QR' && (
                <div>
                  <Label>QR Receiver</Label>
                  <Select value={qrReceiver} onValueChange={setQrReceiver}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {qrReceivers.map((qr: string) => (<SelectItem key={qr} value={qr}>{qr}</SelectItem>))}
                      <SelectItem value="Custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  {qrReceiver === 'Custom' && (<Input className="mt-2" placeholder="Enter QR name" value={customQr} onChange={e => setCustomQr(e.target.value)} />)}
                </div>
              )}
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Admin Share ({settings?.admin_share_percent ?? 50}%)</span><span className="font-semibold">₹{((parseFloat(paymentAmount) || 0) * (settings?.admin_share_percent ?? 50) / 100).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Staff Share ({settings?.staff_share_percent ?? 50}%)</span><span className="font-semibold">₹{((parseFloat(paymentAmount) || 0) * (settings?.staff_share_percent ?? 50) / 100).toLocaleString()}</span></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button onClick={handlePayment}>Confirm Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Confirm */}
        <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" /> Move to Trash?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              {clearType === 'all' ? 'All jobs will be moved to trash.' : 'All delivered jobs will be moved to trash.'}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClearConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleClearJobs}>Yes, Move to Trash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
