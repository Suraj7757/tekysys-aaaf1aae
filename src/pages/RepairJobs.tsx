import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { store } from "@/lib/store";
import { RepairJob, JobStatus, PaymentMethod } from "@/lib/types";
import { Plus, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<JobStatus, string> = {
  'Received': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-info/10 text-info',
  'Ready': 'bg-warning/10 text-warning',
  'Delivered': 'bg-success/10 text-success',
};

const statusFlow: JobStatus[] = ['Received', 'In Progress', 'Ready', 'Delivered'];

export default function RepairJobs() {
  const [jobs, setJobs] = useState(store.getJobs());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);

  // Create job form
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problem, setProblem] = useState("");
  const [technician, setTechnician] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [qrReceiver, setQrReceiver] = useState("Admin QR");
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
    // Auto-create customer if not exists
    let customer = store.findCustomerByMobile(customerMobile);
    if (!customer) {
      customer = { id: crypto.randomUUID(), name: customerName, mobile: customerMobile, createdAt: new Date().toISOString().split('T')[0] };
      store.addCustomer(customer);
    }

    const job: RepairJob = {
      id: crypto.randomUUID(),
      jobId: store.nextJobId(),
      customerId: customer.id,
      customerName, customerMobile, deviceBrand, deviceModel,
      problemDescription: problem,
      technicianName: technician || undefined,
      status: 'Received',
      estimatedCost: parseFloat(estimatedCost) || 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
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

  const advanceStatus = (job: RepairJob) => {
    const currentIdx = statusFlow.indexOf(job.status);
    if (currentIdx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIdx + 1];

    if (nextStatus === 'Delivered') {
      setSelectedJob(job);
      setPaymentAmount(job.estimatedCost.toString());
      setPaymentOpen(true);
      return;
    }

    store.updateJob(job.id, { status: nextStatus });
    setJobs(store.getJobs());
    toast.success(`Job ${job.jobId} → ${nextStatus}`);
  };

  const handlePayment = () => {
    if (!selectedJob) return;
    const amount = parseFloat(paymentAmount) || 0;
    const receiver = qrReceiver === 'Custom' ? customQr : qrReceiver;

    store.updateJob(selectedJob.id, { status: 'Delivered', deliveredAt: new Date().toISOString().split('T')[0] });

    store.addPayment({
      id: crypto.randomUUID(),
      jobId: selectedJob.jobId,
      repairJobId: selectedJob.id,
      amount,
      method: paymentMethod,
      qrReceiver: paymentMethod === 'UPI/QR' ? receiver : undefined,
      adminShare: amount * 0.5,
      staffShare: amount * 0.5,
      settled: false,
      createdAt: new Date().toISOString().split('T')[0],
    });

    setJobs(store.getJobs());
    setPaymentOpen(false);
    setSelectedJob(null);
    toast.success(`Job ${selectedJob.jobId} delivered & payment recorded`);
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
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusFlow.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Job
          </Button>
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
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Technician</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Amount</th>
                  <th className="text-left p-3 font-semibold">Action</th>
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
                    <td className="p-3 hidden md:table-cell">{job.technicianName || '—'}</td>
                    <td className="p-3">
                      <Badge className={`${statusColors[job.status]} border-0 text-xs`}>{job.status}</Badge>
                    </td>
                    <td className="p-3 font-semibold">₹{job.estimatedCost.toLocaleString()}</td>
                    <td className="p-3">
                      {job.status !== 'Delivered' && (
                        <Button size="sm" variant="outline" onClick={() => advanceStatus(job)} className="text-xs">
                          {statusFlow[statusFlow.indexOf(job.status) + 1]} <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No jobs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Job Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Repair Job</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Customer Mobile *</Label>
                  <Input placeholder="9876543210" value={customerMobile} onChange={e => handleMobileSearch(e.target.value)} />
                </div>
                <div>
                  <Label>Customer Name *</Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Device Brand *</Label>
                  <Input placeholder="Samsung, iPhone..." value={deviceBrand} onChange={e => setDeviceBrand(e.target.value)} />
                </div>
                <div>
                  <Label>Device Model</Label>
                  <Input placeholder="Galaxy S23" value={deviceModel} onChange={e => setDeviceModel(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Problem Description *</Label>
                <Textarea placeholder="Describe the issue..." value={problem} onChange={e => setProblem(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Technician</Label>
                  <Input placeholder="Technician name" value={technician} onChange={e => setTechnician(e.target.value)} />
                </div>
                <div>
                  <Label>Estimated Cost (₹)</Label>
                  <Input type="number" placeholder="0" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} />
                </div>
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
            <DialogHeader>
              <DialogTitle>Record Payment — {selectedJob?.jobId}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
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
                      <SelectItem value="Admin QR">Admin QR</SelectItem>
                      <SelectItem value="Staff QR">Staff QR</SelectItem>
                      <SelectItem value="Custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  {qrReceiver === 'Custom' && (
                    <Input className="mt-2" placeholder="Enter QR name" value={customQr} onChange={e => setCustomQr(e.target.value)} />
                  )}
                </div>
              )}
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Admin Share (50%)</span><span className="font-semibold">₹{((parseFloat(paymentAmount) || 0) * 0.5).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Staff Share (50%)</span><span className="font-semibold">₹{((parseFloat(paymentAmount) || 0) * 0.5).toLocaleString()}</span></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button onClick={handlePayment}>Confirm Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
