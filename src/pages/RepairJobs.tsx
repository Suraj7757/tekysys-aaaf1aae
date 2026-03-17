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
import { store } from "@/lib/store";
import { RepairJob, JobStatus, PaymentMethod } from "@/lib/types";
import { Plus, Search, MoreVertical, Trash2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/lib/invoice";

const statusColors: Record<JobStatus, string> = {
  'Received': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-info/10 text-info',
  'Ready': 'bg-warning/10 text-warning',
  'Delivered': 'bg-success/10 text-success',
  'Rejected': 'bg-destructive/10 text-destructive',
  'Unrepairable': 'bg-destructive/10 text-destructive',
};

const allStatuses: JobStatus[] = ['Received', 'In Progress', 'Ready', 'Delivered', 'Rejected', 'Unrepairable'];

export default function RepairJobs() {
  const [jobs, setJobs] = useState(store.getJobs());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearType, setClearType] = useState<'all' | 'delivered'>('all');

  // Create job form
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problem, setProblem] = useState("");
  const [technician, setTechnician] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  // Payment form
  const settings = store.getSettings();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [qrReceiver, setQrReceiver] = useState(settings.qrReceivers[0] || "Admin QR");
  const [customQr, setCustomQr] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const filtered = jobs.filter(j => {
    const matchSearch = j.jobId.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.customerMobile.includes(search) ||
      j.deviceBrand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleMobileSearch = (mobile: string) => {
    setCustomerMobile(mobile);
    const existing = store.findCustomerByMobile(mobile);
    if (existing) {
      setCustomerName(existing.name);
      toast.info(`Customer found: ${existing.name}`);
    }
  };

  const handleCreateJob = () => {
    if (!customerName || !customerMobile || !deviceBrand || !problem) {
      toast.error("Please fill all required fields");
      return;
    }
    let customer = store.findCustomerByMobile(customerMobile);
    if (!customer) {
      customer = { id: crypto.randomUUID(), name: customerName, mobile: customerMobile, createdAt: new Date().toISOString().split('T')[0] };
      store.addCustomer(customer);
    }
    const job: RepairJob = {
      id: crypto.randomUUID(), jobId: store.nextJobId(), customerId: customer.id,
      customerName, customerMobile, deviceBrand, deviceModel, problemDescription: problem,
      technicianName: technician || undefined, status: 'Received',
      estimatedCost: parseFloat(estimatedCost) || 0,
      createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0],
    };
    store.addJob(job);
    setJobs(store.getJobs());
    setCreateOpen(false);
    resetCreateForm();
    toast.success(`Job ${job.jobId} created`);
  };

  const resetCreateForm = () => {
    setCustomerMobile(""); setCustomerName(""); setDeviceBrand("");
    setDeviceModel(""); setProblem(""); setTechnician(""); setEstimatedCost("");
  };

  const changeStatus = (job: RepairJob, newStatus: JobStatus) => {
    if (newStatus === 'Delivered') {
      setSelectedJob(job);
      setPaymentAmount(job.estimatedCost.toString());
      setPaymentOpen(true);
      return;
    }
    store.updateJob(job.id, { status: newStatus });
    setJobs(store.getJobs());
    toast.success(`Job ${job.jobId} → ${newStatus}`);
  };

  const handleDeleteJob = (job: RepairJob) => {
    store.deleteJob(job.id);
    setJobs(store.getJobs());
    toast.success(`Job ${job.jobId} deleted`);
  };

  const handlePayment = () => {
    if (!selectedJob) return;
    const amount = parseFloat(paymentAmount) || 0;
    const receiver = qrReceiver === 'Custom' ? customQr : qrReceiver;
    const adminPct = settings.adminSharePercent / 100;
    const staffPct = settings.staffSharePercent / 100;

    store.updateJob(selectedJob.id, { status: 'Delivered', deliveredAt: new Date().toISOString().split('T')[0] });
    store.addPayment({
      id: crypto.randomUUID(), jobId: selectedJob.jobId, repairJobId: selectedJob.id,
      amount, method: paymentMethod,
      qrReceiver: paymentMethod === 'UPI/QR' ? receiver : undefined,
      adminShare: amount * adminPct, staffShare: amount * staffPct,
      settled: false, createdAt: new Date().toISOString().split('T')[0],
    });
    setJobs(store.getJobs());
    setPaymentOpen(false);
    setSelectedJob(null);
    toast.success(`Job ${selectedJob.jobId} delivered & payment recorded`);
  };

  const handleClearJobs = () => {
    if (clearType === 'all') store.clearAllJobs();
    else store.clearDeliveredJobs();
    setJobs(store.getJobs());
    setClearConfirmOpen(false);
    toast.success(clearType === 'all' ? 'All jobs cleared' : 'Delivered jobs cleared');
  };

  const handleInvoice = (job: RepairJob) => {
    const payment = store.getPayments().find(p => p.repairJobId === job.id);
    generateInvoicePDF(job, payment, settings);
  };

  return (
    <Layout title="Repair Jobs">
      <div className="space-y-4 animate-fade-in">
        {/* Toolbar */}
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

        {/* Jobs Table */}
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
                {filtered.map(job => (
                  <tr key={job.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-semibold text-primary">{job.jobId}</td>
                    <td className="p-3">
                      <div>{job.customerName}</div>
                      <div className="text-xs text-muted-foreground">{job.customerMobile}</div>
                    </td>
                    <td className="p-3 hidden md:table-cell">{job.deviceBrand} {job.deviceModel}</td>
                    <td className="p-3 hidden lg:table-cell max-w-48 truncate">{job.problemDescription}</td>
                    <td className="p-3">
                      <Badge className={`${statusColors[job.status]} border-0 text-xs`}>{job.status}</Badge>
                    </td>
                    <td className="p-3 font-semibold">₹{job.estimatedCost.toLocaleString()}</td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {allStatuses.filter(s => s !== job.status).map(s => (
                            <DropdownMenuItem key={s} onClick={() => changeStatus(job, s)}>
                              → {s}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          {job.status === 'Delivered' && (
                            <DropdownMenuItem onClick={() => handleInvoice(job)}>
                              <FileText className="h-4 w-4 mr-2" /> Invoice PDF
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteJob(job)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No jobs found</td></tr>
                )}
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
            <DialogHeader><DialogTitle>Record Payment — {selectedJob?.jobId}</DialogTitle></DialogHeader>
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
                      {settings.qrReceivers.map(qr => (
                        <SelectItem key={qr} value={qr}>{qr}</SelectItem>
                      ))}
                      <SelectItem value="Custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  {qrReceiver === 'Custom' && (
                    <Input className="mt-2" placeholder="Enter QR name" value={customQr} onChange={e => setCustomQr(e.target.value)} />
                  )}
                </div>
              )}
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Admin Share ({settings.adminSharePercent}%)</span><span className="font-semibold">₹{((parseFloat(paymentAmount) || 0) * settings.adminSharePercent / 100).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Staff Share ({settings.staffSharePercent}%)</span><span className="font-semibold">₹{((parseFloat(paymentAmount) || 0) * settings.staffSharePercent / 100).toLocaleString()}</span></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button onClick={handlePayment}>Confirm Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Confirm Dialog */}
        <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" /> Confirm Clear</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              {clearType === 'all' ? 'This will delete ALL jobs and their payments. This cannot be undone.' : 'This will delete all delivered jobs and their payments.'}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClearConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleClearJobs}>Yes, Clear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
