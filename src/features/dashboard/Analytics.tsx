import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseQuery } from "@/hooks/useSupabaseData";
import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wrench, IndianRupee, Users, Package, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Range = "7d" | "30d" | "90d";
const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

interface Job { id: string; created_at: string; status: string; device_brand: string; device_model?: string; problem_description: string; estimated_cost: number; technician_name?: string; customer_id?: string; customer_name: string; delivered_at?: string; }
interface Sell { id: string; created_at: string; total: number; item_name: string; }
interface Inv { id: string; name: string; quantity: number; min_stock: number; cost_price: number; sell_price: number; }

export default function Analytics() {
  const { data: jobs, loading: lj } = useSupabaseQuery<Job>("repair_jobs");
  const { data: sells, loading: ls } = useSupabaseQuery<Sell>("sells");
  const { data: inventory } = useSupabaseQuery<Inv>("inventory");
  const [range, setRange] = useState<Range>("30d");

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const cutoff = useMemo(() => Date.now() - days * 86400000, [days]);

  const jobsInRange = useMemo(() => jobs.filter((j) => new Date(j.created_at).getTime() >= cutoff), [jobs, cutoff]);
  const sellsInRange = useMemo(() => sells.filter((s) => new Date(s.created_at).getTime() >= cutoff), [sells, cutoff]);

  // Revenue trend
  const revenueTrend = useMemo(() => {
    const map = new Map<string, { date: string; jobs: number; sells: number; total: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { date: key.slice(5), jobs: 0, sells: 0, total: 0 });
    }
    jobsInRange.forEach((j) => {
      const k = j.created_at.slice(0, 10);
      const e = map.get(k);
      if (e) { e.jobs += Number(j.estimated_cost) || 0; e.total += Number(j.estimated_cost) || 0; }
    });
    sellsInRange.forEach((s) => {
      const k = s.created_at.slice(0, 10);
      const e = map.get(k);
      if (e) { e.sells += Number(s.total) || 0; e.total += Number(s.total) || 0; }
    });
    return Array.from(map.values());
  }, [jobsInRange, sellsInRange, days]);

  // Top devices
  const topDevices = useMemo(() => {
    const m = new Map<string, number>();
    jobsInRange.forEach((j) => m.set(j.device_brand || "Unknown", (m.get(j.device_brand || "Unknown") || 0) + 1));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [jobsInRange]);

  // Top issues
  const topIssues = useMemo(() => {
    const m = new Map<string, number>();
    jobsInRange.forEach((j) => {
      const k = (j.problem_description || "Other").split(" ").slice(0, 3).join(" ");
      m.set(k, (m.get(k) || 0) + 1);
    });
    return Array.from(m.entries()).map(([issue, count]) => ({ issue, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [jobsInRange]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const m = new Map<string, number>();
    jobsInRange.forEach((j) => m.set(j.status, (m.get(j.status) || 0) + 1));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [jobsInRange]);

  // Top customers
  const topCustomers = useMemo(() => {
    const m = new Map<string, { name: string; jobs: number; revenue: number }>();
    jobsInRange.forEach((j) => {
      const k = j.customer_name || "Unknown";
      const e = m.get(k) || { name: k, jobs: 0, revenue: 0 };
      e.jobs += 1;
      e.revenue += Number(j.estimated_cost) || 0;
      m.set(k, e);
    });
    return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [jobsInRange]);

  // Technician performance
  const techPerf = useMemo(() => {
    const m = new Map<string, { name: string; jobs: number; revenue: number }>();
    jobsInRange.forEach((j) => {
      const k = j.technician_name || "Unassigned";
      const e = m.get(k) || { name: k, jobs: 0, revenue: 0 };
      e.jobs += 1;
      e.revenue += Number(j.estimated_cost) || 0;
      m.set(k, e);
    });
    return Array.from(m.values()).sort((a, b) => b.jobs - a.jobs).slice(0, 5);
  }, [jobsInRange]);

  // KPIs
  const totalRevenue = revenueTrend.reduce((s, d) => s + d.total, 0);
  const totalJobs = jobsInRange.length;
  const delivered = jobsInRange.filter((j) => j.status === "Delivered").length;
  const conversionRate = totalJobs ? Math.round((delivered / totalJobs) * 100) : 0;
  const avgTicket = totalJobs ? Math.round(totalRevenue / totalJobs) : 0;
  const lowStock = inventory.filter((i) => i.quantity <= (i.min_stock || 5)).length;

  const loading = lj || ls;

  return (
    <MainLayout title="Advanced Analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Business Insights</h2>
            <p className="text-muted-foreground text-sm">Deep analytics over last {days} days</p>
          </div>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as Range[]).map((r) => (
              <Button key={r} variant={range === r ? "default" : "outline"} size="sm" onClick={() => setRange(r)}>
                {r === "7d" ? "Week" : r === "30d" ? "Month" : "Quarter"}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <KPI icon={IndianRupee} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} loading={loading} />
          <KPI icon={Wrench} label="Total Jobs" value={totalJobs.toString()} loading={loading} />
          <KPI icon={TrendingUp} label="Conversion" value={`${conversionRate}%`} loading={loading} />
          <KPI icon={Clock} label="Avg Ticket" value={`₹${avgTicket}`} loading={loading} />
          <KPI icon={Package} label="Low Stock" value={lowStock.toString()} loading={loading} accent={lowStock > 0} />
        </div>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="jobs" stroke="hsl(var(--primary))" strokeWidth={2} name="Repair Jobs" />
                  <Line type="monotone" dataKey="sells" stroke="#10b981" strokeWidth={2} name="Sells" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Top Devices</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={topDevices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {topDevices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Top Issues</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer>
                  <BarChart data={topIssues} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" fontSize={11} />
                    <YAxis dataKey="issue" type="category" width={100} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer>
                  <BarChart data={statusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Top Technicians</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-48 w-full" /> : (
                <div className="space-y-2">
                  {techPerf.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
                  {techPerf.map((t, i) => (
                    <div key={t.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{t.name}</p>
                          <p className="text-[11px] text-muted-foreground">{t.jobs} jobs</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold">₹{t.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Top 10 Customers by Revenue</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <div className="space-y-2">
                {topCustomers.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
                {topCustomers.map((c, i) => (
                  <div key={c.name + i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.jobs} jobs</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary">₹{c.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function KPI({ icon: Icon, label, value, loading, accent }: { icon: any; label: string; value: string; loading?: boolean; accent?: boolean }) {
  return (
    <Card className={accent ? "border-destructive/40" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
        {loading ? <Skeleton className="h-7 w-20" /> : (
          <p className={`text-xl font-bold ${accent ? "text-destructive" : ""}`}>{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
