import { useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery, useShopSettings } from "@/hooks/useSupabaseData";
import { Wrench, AlertTriangle, IndianRupee, Smartphone, Trash2, ConciergeBell, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";

const COLORS = ['hsl(234,85%,55%)', 'hsl(152,69%,40%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)'];

export default function Dashboard() {
  const { data: jobs } = useSupabaseQuery<any>('repair_jobs');
  const { data: payments } = useSupabaseQuery<any>('payments');
  const { data: settlements } = useSupabaseQuery<any>('settlement_cycles');
  const { data: inventory } = useSupabaseQuery<any>('inventory');
  const { data: deletedCustomers } = useSupabaseQuery<any>('customers', true);
  const { data: deletedJobs } = useSupabaseQuery<any>('repair_jobs', true);
  const { settings } = useShopSettings();

  const splitEnabled = settings?.revenue_split_enabled !== false;

  const deletedCount = useMemo(() => {
    return deletedCustomers.filter((c: any) => c.deleted).length + deletedJobs.filter((j: any) => j.deleted).length;
  }, [deletedCustomers, deletedJobs]);

  const { data: erpTasks } = useSupabaseQuery<any>('erp_tasks');
  const { data: erpExpenses } = useSupabaseQuery<any>('erp_expenses');
  const { data: erpLeads } = useSupabaseQuery<any>('erp_leads');

  const stats = useMemo(() => {
    const unsettledPayments = payments.filter((p: any) => !p.settled);
    const cashTotal = payments.filter((p: any) => p.method === 'Cash').reduce((s: number, p: any) => s + Number(p.amount), 0);
    const upiTotal = payments.filter((p: any) => p.method === 'UPI/QR').reduce((s: number, p: any) => s + Number(p.amount), 0);
    const dueTotal = payments.filter((p: any) => p.method === 'Due').reduce((s: number, p: any) => s + Number(p.amount), 0);
    const totalRevenue = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    const unsettledEarnings = unsettledPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    const adminShare = unsettledPayments.reduce((s: number, p: any) => s + Number(p.admin_share), 0);
    const staffShare = unsettledPayments.reduce((s: number, p: any) => s + Number(p.staff_share), 0);
    return { totalJobs: jobs.length, activeJobs: jobs.filter((j: any) => j.status !== 'Delivered').length, completedJobs: jobs.filter((j: any) => j.status === 'Delivered').length, totalRevenue, unsettledEarnings, cashTotal, upiTotal, dueTotal, adminShare, staffShare };
  }, [jobs, payments]);

  const lowStockItems = inventory.filter((i: any) => i.quantity <= i.min_stock);

  const paymentPieData = [
    { name: 'Cash', value: stats.cashTotal },
    { name: 'UPI/QR', value: stats.upiTotal },
    { name: 'Due', value: stats.dueTotal },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Received', count: jobs.filter((j: any) => j.status === 'Received').length },
    { name: 'In Progress', count: jobs.filter((j: any) => j.status === 'In Progress').length },
    { name: 'Ready', count: jobs.filter((j: any) => j.status === 'Ready').length },
    { name: 'Delivered', count: jobs.filter((j: any) => j.status === 'Delivered').length },
  ];

  const qrPayments = payments.filter((p: any) => p.method === 'UPI/QR');
  const qrTotals: Record<string, number> = {};
  qrPayments.forEach((p: any) => { const key = p.qr_receiver || 'Unknown'; qrTotals[key] = (qrTotals[key] || 0) + Number(p.amount); });

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        <Card className="gradient-primary border-0 shadow-2xl shadow-primary/30 overflow-hidden relative group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardContent className="py-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <p className="text-sm font-bold text-primary-foreground/70 uppercase tracking-widest">Total Platform Revenue</p>
              <h2 className="text-5xl font-black text-primary-foreground tracking-tight">₹{stats.totalRevenue.toLocaleString()}</h2>
              <p className="text-xs text-primary-foreground/60 flex items-center gap-1 mt-2">
                <Badge variant="secondary" className="bg-white/20 border-0 text-white text-[10px] h-5">+12.5% from last month</Badge>
              </p>
            </div>
            <div className="flex gap-8 border-l border-white/10 pl-8 h-full items-center">
              <div>
                <p className="text-xs font-bold text-primary-foreground/60 uppercase tracking-widest">Unsettled</p>
                <p className="text-3xl font-black text-primary-foreground">₹{stats.unsettledEarnings.toLocaleString()}</p>
              </div>
              <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
              <div>
                <p className="text-xs font-bold text-primary-foreground/60 uppercase tracking-widest">Dues</p>
                <p className="text-3xl font-black text-primary-foreground">₹{stats.dueTotal.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <StatCard icon={Wrench} label="Total Jobs" value={stats.totalJobs} sub={`${stats.activeJobs} active`} variant="primary" link="/jobs" />
          <StatCard icon={Smartphone} label="Track Order" value="Search ID" sub="Customer tracking" variant="info" link="/track" />
          <StatCard icon={IndianRupee} label="Cash" value={`₹${stats.cashTotal.toLocaleString()}`} sub="In-hand cash" variant="success" link="/payments" />
          <StatCard icon={Smartphone} label="Digital" value={`₹${stats.upiTotal.toLocaleString()}`} sub="UPI & QR" variant="info" link="/payments" />
          <StatCard icon={ConciergeBell} label="Services" value="Catalog" sub="Manage all services" variant="info" link="/services" />
          <StatCard icon={AlertTriangle} label="Low Stock" value={lowStockItems.length} sub="Items needing restock" variant="warning" link="/inventory" />
        </div>

        {splitEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Admin Share ({settings?.admin_share_percent ?? 50}%)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">₹{stats.adminShare.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Unsettled admin earnings</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Staff Share ({settings?.staff_share_percent ?? 50}%)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">₹{stats.staffShare.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Unsettled staff earnings</p>
                <p className="text-xs text-muted-foreground">Settlements: {settlements.length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Jobs by Status</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(234,85%,55%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Payment Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                {paymentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }: any) => `${name}: ₹${value}`}>
                        {paymentPieData.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Legend /><Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (<div className="h-full flex items-center justify-center text-muted-foreground text-sm">No payment data yet</div>)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">QR-wise Payment Totals</CardTitle></CardHeader>
            <CardContent>
              {Object.keys(qrTotals).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(qrTotals).map(([name, amount]) => (
                    <div key={name} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-sm font-bold">₹{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (<p className="text-sm text-muted-foreground">No QR payments yet</p>)}
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.sku}</p></div>
                      <Badge variant="destructive" className="text-xs">{item.quantity} left</Badge>
                    </div>
                  ))}
                </div>
              ) : (<p className="text-sm text-muted-foreground">All stock levels are good</p>)}
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Modules Overview */}
        <div className="mt-8 mb-4 flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground"><Building2 className="h-6 w-6 text-primary"/> Enterprise ERP Highlights</h3>
            <p className="text-sm text-muted-foreground mt-1">Live data from your advanced modules</p>
          </div>
          <Link to="/enterprise">
            <Button variant="default" size="sm" className="font-bold shadow-md">Manage All ERP Modules</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center">
                Pending Tasks <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">{erpTasks.filter((t:any)=>!t.done).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3 mt-2">
                 {erpTasks.slice(0, 3).map((t:any) => <div key={t.id} className="text-sm truncate flex items-center gap-2">{t.done ? '✅' : '⏳'} <span className={t.done ? 'line-through text-muted-foreground' : 'font-medium'}>{t.title}</span></div>)}
                 {erpTasks.length === 0 && <p className="text-xs text-muted-foreground italic">No tasks created yet.</p>}
               </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center">
                Recent Leads <Badge variant="secondary" className="bg-green-500/10 text-green-600">{erpLeads.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3 mt-2">
                 {erpLeads.slice(0, 3).map((l:any) => <div key={l.id} className="text-sm truncate flex justify-between items-center"><span className="font-medium">👤 {l.name}</span> <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{l.phone}</span></div>)}
                 {erpLeads.length === 0 && <p className="text-xs text-muted-foreground italic">No leads captured yet.</p>}
               </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center">
                Total ERP Expenses <Badge variant="secondary" className="bg-red-500/10 text-red-600">₹{erpExpenses.reduce((a:any,b:any)=>a+b.amount,0).toLocaleString()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3 mt-2">
                 {erpExpenses.slice(0, 3).map((e:any) => <div key={e.id} className="text-sm truncate flex justify-between items-center"><span className="font-medium">{e.desc}</span> <span className="text-destructive font-bold">₹{e.amount}</span></div>)}
                 {erpExpenses.length === 0 && <p className="text-xs text-muted-foreground italic">No expenses recorded yet.</p>}
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub, variant, link }: { icon: any; label: string; value: string | number; sub: string; variant: 'primary' | 'success' | 'warning' | 'info'; link?: string }) {
  const bgMap = { primary: 'gradient-primary', success: 'gradient-success', warning: 'gradient-warning', info: 'gradient-info' };
  const borderMap = { primary: 'border-primary/10', success: 'border-success/10', warning: 'border-warning/10', info: 'border-info/10' };
  
  const content = (
    <Card className={`h-full border ${borderMap[variant]} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card/50 backdrop-blur-md group overflow-hidden`}>
      <CardContent className="p-6 relative">
        <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black tracking-tight">{value}</p>
            <p className="text-[11px] font-medium text-muted-foreground/80 mt-1 flex items-center gap-1 group-hover:text-primary transition-colors italic">
              {sub}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-xl ${bgMap[variant]} flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) return <Link to={link}>{content}</Link>;
  return content;
}
