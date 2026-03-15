import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { store } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Reports() {
  const jobs = store.getJobs();
  const payments = store.getPayments();
  const settlements = store.getSettlements();

  const revenueByMethod = useMemo(() => [
    { name: 'Cash', amount: payments.filter(p => p.method === 'Cash').reduce((s, p) => s + p.amount, 0) },
    { name: 'UPI/QR', amount: payments.filter(p => p.method === 'UPI/QR').reduce((s, p) => s + p.amount, 0) },
    { name: 'Due', amount: payments.filter(p => p.method === 'Due').reduce((s, p) => s + p.amount, 0) },
  ], [payments]);

  const settlementData = useMemo(() =>
    settlements.map((s, i) => ({
      name: `Cycle ${i + 1}`,
      revenue: s.totalRevenue,
      admin: s.adminShare,
      staff: s.staffShare,
    }))
  , [settlements]);

  return (
    <Layout title="Reports">
      <div className="space-y-6 animate-fade-in">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card"><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Jobs</p>
            <p className="text-2xl font-bold mt-1">{jobs.length}</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold mt-1">₹{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Job Value</p>
            <p className="text-2xl font-bold mt-1">₹{payments.length ? Math.round(payments.reduce((s, p) => s + p.amount, 0) / payments.length).toLocaleString() : 0}</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Settlements</p>
            <p className="text-2xl font-bold mt-1">{settlements.length}</p>
          </CardContent></Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Revenue by Payment Method</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMethod}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="hsl(234,85%,55%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Settlement Cycles</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                {settlementData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={settlementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(234,85%,55%)" strokeWidth={2} />
                      <Line type="monotone" dataKey="admin" stroke="hsl(152,69%,40%)" strokeWidth={2} />
                      <Line type="monotone" dataKey="staff" stroke="hsl(38,92%,50%)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Complete settlements to see data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
