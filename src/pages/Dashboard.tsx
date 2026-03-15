import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store } from "@/lib/store";
import { Wrench, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, IndianRupee, Smartphone, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['hsl(234,85%,55%)', 'hsl(152,69%,40%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)'];

export default function Dashboard() {
  const jobs = store.getJobs();
  const payments = store.getPayments();
  const settlements = store.getSettlements();
  const inventory = store.getInventory();

  const stats = useMemo(() => {
    const unsettledPayments = payments.filter(p => !p.settled);
    const cashTotal = payments.filter(p => p.method === 'Cash').reduce((s, p) => s + p.amount, 0);
    const upiTotal = payments.filter(p => p.method === 'UPI/QR').reduce((s, p) => s + p.amount, 0);
    const dueTotal = payments.filter(p => p.method === 'Due').reduce((s, p) => s + p.amount, 0);
    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const unsettledEarnings = unsettledPayments.reduce((s, p) => s + p.amount, 0);
    const adminShare = unsettledPayments.reduce((s, p) => s + p.adminShare, 0);
    const staffShare = unsettledPayments.reduce((s, p) => s + p.staffShare, 0);

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status !== 'Delivered').length,
      completedJobs: jobs.filter(j => j.status === 'Delivered').length,
      totalRevenue, unsettledEarnings, cashTotal, upiTotal, dueTotal, adminShare, staffShare,
      monthlyRevenue: totalRevenue,
    };
  }, [jobs, payments]);

  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock);

  const paymentPieData = [
    { name: 'Cash', value: stats.cashTotal },
    { name: 'UPI/QR', value: stats.upiTotal },
    { name: 'Due', value: stats.dueTotal },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Received', count: jobs.filter(j => j.status === 'Received').length },
    { name: 'In Progress', count: jobs.filter(j => j.status === 'In Progress').length },
    { name: 'Ready', count: jobs.filter(j => j.status === 'Ready').length },
    { name: 'Delivered', count: jobs.filter(j => j.status === 'Delivered').length },
  ];

  // QR-wise totals
  const qrPayments = payments.filter(p => p.method === 'UPI/QR');
  const qrTotals: Record<string, number> = {};
  qrPayments.forEach(p => {
    const key = p.qrReceiver || 'Unknown';
    qrTotals[key] = (qrTotals[key] || 0) + p.amount;
  });

  return (
    <Layout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Monthly Earnings Banner */}
        <Card className="gradient-primary border-0 shadow-card">
          <CardContent className="py-5 px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-foreground/80">Full Month Earnings (Admin)</p>
                <p className="text-3xl font-extrabold text-primary-foreground mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-foreground/80">Unsettled Balance</p>
                <p className="text-2xl font-bold text-primary-foreground mt-1">₹{stats.unsettledEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Wrench} label="Total Jobs" value={stats.totalJobs} sub={`${stats.activeJobs} active`} variant="primary" />
          <StatCard icon={IndianRupee} label="Cash" value={`₹${stats.cashTotal.toLocaleString()}`} sub="Total cash" variant="success" />
          <StatCard icon={Smartphone} label="UPI/QR" value={`₹${stats.upiTotal.toLocaleString()}`} sub="Digital payments" variant="info" />
          <StatCard icon={AlertTriangle} label="Due" value={`₹${stats.dueTotal.toLocaleString()}`} sub="Pending dues" variant="warning" />
        </div>

        {/* Settlement Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Admin Share (50%)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">₹{stats.adminShare.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Unsettled admin earnings</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Staff Share (50%)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">₹{stats.staffShare.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Unsettled staff earnings</p>
              <p className="text-xs text-muted-foreground">Settlements this month: {settlements.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Jobs by Status</CardTitle>
            </CardHeader>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Payment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {paymentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ₹${value}`}>
                        {paymentPieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No payment data yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR-wise Totals & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">QR-wise Payment Totals</CardTitle>
            </CardHeader>
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
              ) : (
                <p className="text-sm text-muted-foreground">No QR payments yet</p>
              )}
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
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">{item.quantity} left</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">All stock levels are good</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, sub, variant }: { icon: any; label: string; value: string | number; sub: string; variant: 'primary' | 'success' | 'warning' | 'info' }) {
  const bgMap = { primary: 'gradient-primary', success: 'gradient-success', warning: 'gradient-warning', info: 'gradient-info' };
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
          </div>
          <div className={`h-9 w-9 rounded-lg ${bgMap[variant]} flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
