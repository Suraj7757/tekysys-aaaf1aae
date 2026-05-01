import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  IndianRupee,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { useSupabaseQuery } from "@/hooks/useSupabaseData";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Financials() {
  const { data: payments } = useSupabaseQuery<any>("payments");
  const { data: expenses } = useSupabaseQuery<any>("erp_expenses");

  const totalRevenue =
    payments?.reduce(
      (acc: number, p: any) => acc + (Number(p.amount) || 0),
      0,
    ) || 0;
  const totalExpenses =
    expenses?.reduce(
      (acc: number, e: any) => acc + (Number(e.amount) || 0),
      0,
    ) || 0;
  const netProfit = totalRevenue - totalExpenses;

  // Mock data for charts
  const chartData = [
    { name: "Mon", revenue: 4500, expenses: 1200 },
    { name: "Tue", revenue: 5200, expenses: 1500 },
    { name: "Wed", revenue: 4800, expenses: 1100 },
    { name: "Thu", revenue: 6100, expenses: 2000 },
    { name: "Fri", revenue: 5900, expenses: 1800 },
    { name: "Sat", revenue: 7500, expenses: 2500 },
    { name: "Sun", revenue: 3200, expenses: 800 },
  ];

  return (
    <MainLayout title="Financial Analytics">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" /> Shop Financials
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">
              Detailed insights into your shop's revenue, expenses and net
              profit.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl font-bold gap-2">
              <Calendar className="h-4 w-4" /> This Month
            </Button>
            <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
              <Download className="h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-card overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="h-20 w-20 text-emerald-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Total Revenue
              </p>
              <h3 className="text-3xl font-black text-foreground">
                ₹{totalRevenue.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg">
                <TrendingUp className="h-3 w-3" /> +12.5% vs last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-card overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingDown className="h-20 w-20 text-destructive" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Total Expenses
              </p>
              <h3 className="text-3xl font-black text-foreground">
                ₹{totalExpenses.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/10 w-fit px-2 py-1 rounded-lg">
                <TrendingDown className="h-3 w-3" /> +5.2% vs last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-primary overflow-hidden relative group">
            <CardContent className="p-6">
              <div className="absolute right-0 top-0 p-4 opacity-20">
                <Wallet className="h-20 w-20 text-white" />
              </div>
              <p className="text-xs font-bold text-primary-foreground/70 uppercase tracking-widest mb-1">
                Net Profit
              </p>
              <h3 className="text-3xl font-black text-primary-foreground">
                ₹{netProfit.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary-foreground bg-white/20 w-fit px-2 py-1 rounded-lg">
                High Margin
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-card overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <IndianRupee className="h-20 w-20 text-blue-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Avg. Ticket Size
              </p>
              <h3 className="text-3xl font-black text-foreground">
                ₹{(totalRevenue / (payments?.length || 1)).toFixed(0)}
              </h3>
              <p className="mt-4 text-xs text-muted-foreground font-medium">
                Based on {payments?.length || 0} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-0 shadow-xl bg-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Revenue vs
                Expenses
              </CardTitle>
              <CardDescription>
                Visualizing your daily cash flow performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-black">
                Expense Breakdown
              </CardTitle>
              <CardDescription>Where your money is going.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {[
                {
                  label: "Part Purchases",
                  amount: totalExpenses * 0.6,
                  color: "bg-blue-500",
                },
                {
                  label: "Shop Rent",
                  amount: totalExpenses * 0.2,
                  color: "bg-amber-500",
                },
                {
                  label: "Staff Salaries",
                  amount: totalExpenses * 0.15,
                  color: "bg-emerald-500",
                },
                {
                  label: "Miscellaneous",
                  amount: totalExpenses * 0.05,
                  color: "bg-purple-500",
                },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs font-black text-muted-foreground">
                      ₹{item.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(item.amount / (totalExpenses || 1)) * 100}%`,
                      }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card className="shadow-xl ring-1 ring-white/5 overflow-hidden border-0">
          <CardHeader className="bg-card/50 border-b pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black tracking-tight">
                Recent Financial Activity
              </CardTitle>
              <CardDescription>
                A consolidated list of all revenue and expense entries.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 font-bold"
            >
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Transaction</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.slice(0, 5).map((p: any) => (
                  <TableRow
                    key={p.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-bold">
                      Job Payment #{p.job_id}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-emerald-600 bg-emerald-500/5 border-emerald-600/20"
                      >
                        Revenue
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground">
                      {p.method}
                    </TableCell>
                    <TableCell className="text-right font-black text-emerald-600">
                      +₹{p.amount}
                    </TableCell>
                  </TableRow>
                ))}
                {expenses?.slice(0, 5).map((e: any) => (
                  <TableRow
                    key={e.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-bold">{e.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {new Date(e.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-destructive bg-destructive/5 border-destructive/20"
                      >
                        Expense
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground">
                      Cash
                    </TableCell>
                    <TableCell className="text-right font-black text-destructive">
                      -₹{e.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
