import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useSupabaseQuery, useSoftDelete, useShopSettings, getNextJobId } from "@/hooks/useSupabaseData";
import { supabase } from "@/services/supabase";
import { Plus, Search, MoreVertical, Trash2, FileText, AlertCircle, Pencil, Share2, ConciergeBell } from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/lib/invoice";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { formatTrackingId } from "@/utils/idGenerator";

// Quick service catalog for job creation (mirrors ServicesManagement seed)
const SERVICE_CATALOG = [
  { label: 'Screen Replacement', price: 800, problem: 'Screen replacement needed' },
  { label: 'Battery Replacement', price: 350, problem: 'Battery replacement needed' },
  { label: 'Charging Port Repair', price: 200, problem: 'Charging port not working' },
  { label: 'Motherboard Repair', price: 500, problem: 'Motherboard/chip-level repair required' },
  { label: 'Water Damage Treatment', price: 400, problem: 'Water damage — ultrasonic cleaning required' },
  { label: 'Laptop Screen Repair', price: 1500, problem: 'Laptop screen replacement needed' },
  { label: 'Laptop Keyboard Replacement', price: 700, problem: 'Keyboard replacement needed' },
  { label: 'RAM / SSD Upgrade', price: 300, problem: 'RAM/SSD upgrade requested' },
  { label: 'TV Panel Repair', price: 1200, problem: 'TV LED panel fault — repair needed' },
  { label: 'Printer Head Cleaning', price: 150, problem: 'Printer head cleaning & alignment' },
  { label: 'Other / Custom', price: 0, problem: '' },
];

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

// Define allowed next statuses for each status
const nextStatuses: Record<JobStatus, JobStatus[]> = {
  'Received': ['In Progress'],
  'In Progress': ['Ready', 'Delivered', 'Rejected', 'Unrepairable'],
  'Ready': ['Delivered'],
  'Delivered': [],
  'Rejected': ['In Progress'],
  'Unrepairable': ['In Progress'],
};

export default function RepairJobs() {
  const { user } = useAuth();
  const { data: jobs, refetch } = useSupabaseQuery<any>('repair_jobs');
  const { data: payments, refetch: refetchPayments } = useSupabaseQuery<any>('payments');
  const { softDelete } = useSoftDelete();
  const { settings } = useShopSettings();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearType, setClearType] = useState<'all' | 'delivered'>('all');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problem, setProblem] = useState("");
  const [technician, setTechnician] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const [serviceType, setServiceType] = useState("");
  const [deviceCategory, setDeviceCategory] = useState("Phone");
  const [partCost, setPartCost] = useState("");

  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editProblem, setEditProblem] = useState("");
  const [editTech, setEditTech] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editPartCost, setEditPartCost] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [qrReceiver, setQrReceiver] = useState(settings?.qr_receivers?.[0] || "Admin QR");
  const [customQr, setCustomQr] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const allStatuses: JobStatus[] = ['Received', 'In Progress', 'Ready', 'Delivered', 'Rejected', 'Unrepairable'];

  const filtered = jobs.filter((j: any) => {
    const matchSearch = j.job_id.toLowerCase().includes(search.toLowerCase()) ||
      j.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      j.customer_mobile.includes(search) ||
      j.device_brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#new') {
        setCreateOpen(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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
    let { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).eq('mobile', customerMobile).eq('deleted', false).maybeSingle();
    if (!customer) {
      const { data: newC } = await supabase.from('customers').insert({ user_id: user.id, name: customerName, mobile: customerMobile }).select('id').single();
      customer = newC;
    }
    const rawJobId = await getNextJobId(user.id);
    const jobId = formatTrackingId(user, 'job', rawJobId);
    await supabase.from('repair_jobs').insert({
      user_id: user.id, job_id: jobId, customer_id: customer?.id,
      customer_name: customerName, customer_mobile: customerMobile,
      device_brand: deviceBrand, device_model: deviceModel || null,
      problem_description: problem, technician_name: technician || null,
      status: 'Received' as any, estimated_cost: parseFloat(estimatedCost) || 0,
      part_cost: parseFloat(partCost) || 0,
      device_type: deviceCategory as any,
    });
    refetch();
    setCreateOpen(false);
    setServiceType("");
    setDeviceCategory("Phone");
    setPartCost("");
    setCustomerMobile(""); setCustomerName(""); setDeviceBrand(""); setDeviceModel(""); setProblem(""); setTechnician(""); setEstimatedCost("");
    toast.success(`Job ${jobId} created`);
  };

  const openEdit = (job: any) => {
    setSelectedJob(job);
    setEditName(job.customer_name);
    setEditMobile(job.customer_mobile);
    setEditBrand(job.device_brand);
    setEditModel(job.device_model || '');
    setEditProblem(job.problem_description);
    setEditTech(job.technician_name || '');
    setEditCost(String(job.estimated_cost));
    setEditPartCost(String(job.part_cost || 0));
    setEditOpen(true);
  };

  const handleEditJob = async () => {
    if (!selectedJob || !editName || !editMobile || !editBrand || !editProblem) {
      toast.error("Please fill all required fields"); return;
    }
    await supabase.from('repair_jobs').update({
      customer_name: editName, customer_mobile: editMobile,
      device_brand: editBrand, device_model: editModel || null,
      problem_description: editProblem, technician_name: editTech || null,
      estimated_cost: parseFloat(editCost) || 0,
      part_cost: parseFloat(editPartCost) || 0,
    }).eq('id', selectedJob.id);
    refetch();
    setEditOpen(false);
    setSelectedJob(null);
    toast.success(`Job ${selectedJob.job_id} updated`);
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
    const pCost = parseFloat(partCost) || selectedJob.part_cost || 0;
    const profit = amount - pCost;
    const splitEnabled = settings?.revenue_split_enabled !== false;
    const adminPct = splitEnabled ? (settings?.admin_share_percent ?? 50) / 100 : 1;
    const staffPct = splitEnabled ? (settings?.staff_share_percent ?? 50) / 100 : 0;

    await supabase.from('repair_jobs').update({
      status: 'Delivered' as any,
      delivered_at: new Date().toISOString(),
      part_cost: pCost
    }).eq('id', selectedJob.id);

    await supabase.from('payments').insert({
      user_id: user.id, job_id: selectedJob.job_id, repair_job_id: selectedJob.id,
      amount, method: paymentMethod as any,
      qr_receiver: paymentMethod === 'UPI/QR' ? receiver : null,
      admin_share: amount * adminPct, staff_share: amount * staffPct,
      profit: profit,
    });
    refetch(); refetchPayments();
    setPaymentOpen(false); setSelectedJob(null);
    toast.success(`Job ${selectedJob.job_id} delivered & payment recorded`);
  };

  const handleClearJobs = async () => {
    if (!user) return;
    const now = new Date().toISOString();
    if (clearType === 'all') {
      await supabase.from('repair_jobs').update({ deleted: true, deleted_at: now }).eq('user_id', user.id).eq('deleted', false);
      await supabase.from('payments').update({ deleted: true, deleted_at: now }).eq('user_id', user.id).eq('deleted', false);
      // Reset job counter
      await supabase.from('job_counter').update({ counter: 0 } as any).eq('user_id', user.id);
    } else {
      const deliveredIds = jobs.filter((j: any) => j.status === 'Delivered').map((j: any) => j.id);
      if (deliveredIds.length > 0) {
        await supabase.from('repair_jobs').update({ deleted: true, deleted_at: now }).in('id', deliveredIds);
        await supabase.from('payments').update({ deleted: true, deleted_at: now }).in('repair_job_id', deliveredIds);
      }
    }
    refetch(); refetchPayments();
    setClearConfirmOpen(false);
    toast.success(clearType === 'all' ? 'All jobs cleared & ID reset' : 'Delivered jobs moved to trash');
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

  const shareWhatsApp = (job: any) => {
    const payment = payments.find((p: any) => p.repair_job_id === job.id);
    const shopName = settings?.shop_name || 'RepairDesk';
    let msg = `*${shopName} - Job Update*\n\nJob ID: ${job.job_id}\nCustomer: ${job.customer_name}\nDevice: ${job.device_brand} ${job.device_model || ''}\nProblem: ${job.problem_description}\nStatus: ${job.status}\nEstimated Cost: ₹${Number(job.estimated_cost).toLocaleString()}`;
    if (payment) msg += `\n\nPayment: ₹${Number(payment.amount).toLocaleString()} (${payment.method})`;
    msg += `\n\n📦 Track your order: ${window.location.origin}/track?id=${job.job_id}`;
    const url = `https://wa.me/${job.customer_mobile.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const exportToExcel = () => {
    const headers = ["Job ID", "Date", "Customer", "Mobile", "Device", "Problem", "Status", "Cost"];
    const rows = filtered.map(j => [
      j.job_id,
      new Date(j.created_at).toLocaleDateString(),
      j.customer_name,
      j.customer_mobile,
      `${j.device_brand} ${j.device_model || ''}`,
      j.problem_description,
      j.status,
      j.estimated_cost
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `repair_jobs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Excel (CSV) exported");
  };

  const exportToPDF = () => {
    const doc = jsPDF() as any;
    doc.text("Repair Jobs Report", 14, 15);
    const tableData = filtered.map(j => [
      j.job_id,
      j.customer_name,
      j.device_brand + ' ' + (j.device_model || ''),
      j.status,
      'Rs.' + Number(j.estimated_cost).toLocaleString()
    ]);
    autoTable(doc, {
      head: [['ID', 'Customer', 'Device', 'Status', 'Cost']],
      body: tableData,
      startY: 20,
    });
    doc.save(`repair_jobs_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF exported");
  };

  const qrReceivers = settings?.qr_receivers || ['Admin QR', 'Staff QR', 'Shop QR'];
  const splitEnabled = settings?.revenue_split_enabled !== false;

  return (
    <MainLayout title="Repair Jobs">
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
                <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToExcel}>Export to Excel (CSV)</DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>Export to PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 mr-1" /> Clear</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setClearType('delivered'); setClearConfirmOpen(true); }}>Clear Delivered Jobs</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setClearType('all'); setClearConfirmOpen(true); }} className="text-destructive">Clear All Jobs (Reset ID)</DropdownMenuItem>
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
                {filtered.map((job: any) => {
                  const allowedNext = nextStatuses[job.status as JobStatus] || [];
                  return (
                    <tr key={job.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-semibold text-primary cursor-pointer hover:underline" onClick={() => { setSelectedJob(job); setDetailsOpen(true); }}>{job.job_id}</td>
                      <td className="p-3"><div>{job.customer_name}</div><div className="text-xs text-muted-foreground">{job.customer_mobile}</div></td>
                      <td className="p-3 hidden md:table-cell">{job.device_brand} {job.device_model}</td>
                      <td className="p-3 hidden lg:table-cell max-w-48 truncate">{job.problem_description}</td>
                      <td className="p-3"><Badge className={`${statusColors[job.status] || ''} border-0 text-xs`}>{job.status}</Badge></td>
                      <td className="p-3 font-semibold">₹{Number(job.estimated_cost).toLocaleString()}</td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button size="sm" variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedJob(job); setDetailsOpen(true); }}><FileText className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(job)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            {allowedNext.length > 0 && <DropdownMenuSeparator />}
                            {allowedNext.map(s => (
                              <DropdownMenuItem key={s} onClick={() => changeStatus(job, s)}>→ {s}</DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleInvoice(job)}><FileText className="h-4 w-4 mr-2" /> Invoice PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => shareWhatsApp(job)}><Share2 className="h-4 w-4 mr-2" /> WhatsApp</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteJob(job)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
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
              {/* Service picker */}
              <div>
                <Label className="flex items-center gap-1"><ConciergeBell className="h-3.5 w-3.5 text-primary" /> Service Type (from catalog)</Label>
                <Select value={serviceType} onValueChange={v => {
                  setServiceType(v);
                  const svc = SERVICE_CATALOG.find(s => s.label === v);
                  if (svc && svc.problem) setProblem(svc.problem);
                  if (svc && svc.price > 0) setEstimatedCost(String(svc.price));
                }}>
                  <SelectTrigger><SelectValue placeholder="Pick a service (optional)" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATALOG.map(s => <SelectItem key={s.label} value={s.label}>{s.label}{s.price > 0 ? ` — ₹${s.price}` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Customer Mobile *</Label><Input placeholder="9876543210" value={customerMobile} onChange={e => handleMobileSearch(e.target.value)} /></div>
                <div><Label>Customer Name *</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Device Type *</Label>
                  <Select value={deviceCategory} onValueChange={setDeviceCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Phone', 'Laptop', 'Tablet', 'PC', 'TV', 'AC', 'Fridge', 'Cooler', 'Other'].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Device Brand *</Label><Input placeholder="Samsung, iPhone..." value={deviceBrand} onChange={e => setDeviceBrand(e.target.value)} /></div>
              </div>
              <div><Label>Device Model</Label><Input placeholder="Galaxy S23" value={deviceModel} onChange={e => setDeviceModel(e.target.value)} /></div>
              <div><Label>Problem Description *</Label><Textarea placeholder="Describe the issue..." value={problem} onChange={e => setProblem(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Technician</Label><Input placeholder="Technician name" value={technician} onChange={e => setTechnician(e.target.value)} /></div>
                <div><Label>Estimated Cost (₹)</Label><Input type="number" placeholder="0" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} /></div>
              </div>
              <div><Label>Part Cost (₹)</Label><Input type="number" placeholder="0" value={partCost} onChange={e => setPartCost(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateJob}>Create Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Job — {selectedJob?.job_id}</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Customer Mobile *</Label><Input value={editMobile} onChange={e => setEditMobile(e.target.value)} /></div>
                <div><Label>Customer Name *</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Device Brand *</Label><Input value={editBrand} onChange={e => setEditBrand(e.target.value)} /></div>
                <div><Label>Device Model</Label><Input value={editModel} onChange={e => setEditModel(e.target.value)} /></div>
              </div>
              <div><Label>Problem Description *</Label><Textarea value={editProblem} onChange={e => setEditProblem(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Technician</Label><Input value={editTech} onChange={e => setEditTech(e.target.value)} /></div>
                <div><Label>Estimated Cost (₹)</Label><Input type="number" value={editCost} onChange={e => setEditCost(e.target.value)} /></div>
              </div>
              <div><Label>Part Cost (₹)</Label><Input type="number" value={editPartCost} onChange={e => setEditPartCost(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditJob}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Record Payment — {selectedJob?.job_id}</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Final Amount (₹)</Label><Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div>
                <div><Label>Part Cost (₹)</Label><Input type="number" value={partCost} onChange={e => setPartCost(e.target.value)} /></div>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">Estimated Profit</span>
                  <span className="text-sm font-bold text-primary">₹{(parseFloat(paymentAmount) - parseFloat(partCost || "0") || 0).toLocaleString()}</span>
                </div>
              </div>
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
              {splitEnabled && (
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>Admin Share ({settings?.admin_share_percent ?? 50}%)</span><span className="font-semibold">₹{((parseFloat(paymentAmount) || 0) * (settings?.admin_share_percent ?? 50) / 100).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Staff Share ({settings?.staff_share_percent ?? 50}%)</span><span className="font-semibold">₹{((parseFloat(paymentAmount) || 0) * (settings?.staff_share_percent ?? 50) / 100).toLocaleString()}</span></div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button onClick={handlePayment}>Confirm Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Job Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Job Details — {selectedJob?.job_id}</DialogTitle></DialogHeader>
            {selectedJob && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-semibold">{selectedJob.customer_name}</p></div>
                  <div><p className="text-xs text-muted-foreground">Mobile</p><p className="font-semibold">{selectedJob.customer_mobile}</p></div>
                  <div><p className="text-xs text-muted-foreground">Device</p><p className="font-semibold">{selectedJob.device_brand} {selectedJob.device_model}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedJob.status]}>{selectedJob.status}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Cost</p><p className="font-semibold">₹{Number(selectedJob.estimated_cost).toLocaleString()}</p></div>
                  <div><p className="text-xs text-muted-foreground">Date</p><p className="font-semibold">{new Date(selectedJob.created_at).toLocaleDateString()}</p></div>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Problem Description</p>
                  <p className="text-sm p-3 bg-muted rounded-lg">{selectedJob.problem_description}</p>
                </div>
                {selectedJob.technician_name && (
                  <div><p className="text-xs text-muted-foreground">Technician</p><p className="font-medium">{selectedJob.technician_name}</p></div>
                )}
                {selectedJob.delivered_at && (
                  <div><p className="text-xs text-muted-foreground">Delivered At</p><p className="font-medium text-success">{new Date(selectedJob.delivered_at).toLocaleString()}</p></div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Confirm */}
        <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" /> Move to Trash?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              {clearType === 'all' ? 'All jobs will be moved to trash and job ID counter will reset to 1.' : 'All delivered jobs will be moved to trash.'}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClearConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleClearJobs}>Yes, Move to Trash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
