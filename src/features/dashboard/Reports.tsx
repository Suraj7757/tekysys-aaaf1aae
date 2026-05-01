import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseQuery } from "@/hooks/useSupabaseData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  Download,
  Filter,
  Users,
  Wrench,
  IndianRupee,
  RotateCcw,
  Package,
  Search,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const { data: jobs } = useSupabaseQuery<any>("repair_jobs");
  const { data: payments } = useSupabaseQuery<any>("payments");
  const { data: settlements } = useSupabaseQuery<any>("settlement_cycles");
  const { data: customers } = useSupabaseQuery<any>("customers");
  const { data: inventory } = useSupabaseQuery<any>("inventory");
  const { data: sells } = useSupabaseQuery<any>("sells");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Advanced Filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((j: any) => {
      const date = new Date(j.created_at).toISOString().split("T")[0];
      const matchesDate =
        (!startDate || date >= startDate) && (!endDate || date <= endDate);
      const matchesStatus = status === "all" || j.status === status;
      const matchesCustomer =
        !customerSearch ||
        j.customer_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        j.customer_mobile?.includes(customerSearch);
      return matchesDate && matchesStatus && matchesCustomer;
    });
  }, [jobs, startDate, endDate, status, customerSearch]);

  const stats = useMemo(() => {
    const totalRev = payments.reduce(
      (s: number, p: any) => s + Number(p.amount),
      0,
    );
    const totalProfit = settlements.reduce(
      (s: number, sc: any) =>
        s + (Number(sc.total_revenue) - Number(sc.staff_share)),
      0,
    );
    const returnCount = jobs.filter((j: any) => j.status === "Rejected").length;
    return { totalRev, totalProfit, returnCount };
  }, [payments, settlements, jobs]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Business Performance Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = filteredJobs.map((j: any) => [
      j.job_id,
      j.customer_name,
      j.device_model,
      j.status,
      `Rs.${j.estimated_cost || 0}`,
      new Date(j.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Job ID", "Customer", "Device", "Status", "Cost", "Date"]],
      body: tableData,
    });

    doc.save(`report_${new Date().getTime()}.pdf`);
    toast.success("PDF exported successfully");
  };

  const exportCSV = () => {
    const headers = [
      "Job ID",
      "Customer",
      "Mobile",
      "Device",
      "Status",
      "Cost",
      "Created At",
    ];
    const rows = filteredJobs.map((j: any) => [
      j.job_id,
      j.customer_name,
      j.customer_mobile,
      j.device_model,
      j.status,
      j.estimated_cost,
      new Date(j.created_at).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report_${new Date().getTime()}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  const revenueByMethod = [
    {
      name: "Cash",
      value: payments
        .filter((p: any) => p.method === "Cash")
        .reduce((s: number, p: any) => s + Number(p.amount), 0),
    },
    {
      name: "UPI/QR",
      value: payments
        .filter((p: any) => p.method === "UPI/QR")
        .reduce((s: number, p: any) => s + Number(p.amount), 0),
    },
    {
      name: "Due",
      value: payments
        .filter((p: any) => p.method === "Due")
        .reduce((s: number, p: any) => s + Number(p.amount), 0),
    },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

  return (
    <MainLayout title="Advanced Reports">
      <div className="space-y-6 animate-fade-in pb-10">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Business Intelligence
            </h2>
            <p className="text-sm text-muted-foreground">
              Analyze your shop's performance and growth.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl border-2 font-bold gap-2 flex-1 md:flex-none"
            >
              <Filter className="h-4 w-4" /> Filters{" "}
              {showFilters ? (
                <ChevronDown className="h-4 w-4 rotate-180" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={exportPDF}
              variant="outline"
              className="rounded-xl border-2 border-primary text-primary hover:bg-primary/5 font-bold gap-2"
            >
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button onClick={exportCSV} className="rounded-xl font-bold gap-2">
              <FileText className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Date Range
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Customer / Mobile
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search..."
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Job Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-11 rounded-xl font-bold">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Ready">Ready</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setStatus("all");
                      setCustomerSearch("");
                    }}
                    className="w-full h-11 rounded-xl text-muted-foreground font-bold"
                  >
                    Reset All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg border-0 bg-primary text-primary-foreground rounded-3xl overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <IndianRupee className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Total Revenue
              </p>
              <p className="text-3xl font-black mt-1">
                ₹{stats.totalRev.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-emerald-500 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Total Customers
              </p>
              <p className="text-3xl font-black mt-1">{customers.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-blue-500 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Jobs Completed
              </p>
              <p className="text-3xl font-black mt-1">
                {jobs.filter((j: any) => j.status === "Delivered").length}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-orange-500 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <RotateCcw className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Rejected / Returns
              </p>
              <p className="text-3xl font-black mt-1">{stats.returnCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight">
                Revenue Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByMethod}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueByMethod.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => `₹${v.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {revenueByMethod.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-xs font-bold">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight">
                Jobs Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMethod}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fontWeight: "bold" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fontWeight: "bold" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.05)" }} />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Data Table */}
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black tracking-tight">
              Detailed Breakdown ({filteredJobs.length} results)
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="p-4 text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                    ID
                  </th>
                  <th className="p-4 text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                    Customer
                  </th>
                  <th className="p-4 text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                    Device
                  </th>
                  <th className="p-4 text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                    Status
                  </th>
                  <th className="p-4 text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                    Estimated Cost
                  </th>
                  <th className="p-4 text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/10">
                {filteredJobs.slice(0, 50).map((j: any) => (
                  <tr
                    key={j.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-primary">
                      {j.job_id}
                    </td>
                    <td className="p-4 font-bold">{j.customer_name}</td>
                    <td className="p-4 text-muted-foreground">
                      {j.device_brand} {j.device_model}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                          j.status === "Delivered"
                            ? "bg-success/10 text-success"
                            : j.status === "Ready"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      ₹{Number(j.estimated_cost).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(j.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-20 text-center text-muted-foreground font-bold"
                    >
                      No results matching filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredJobs.length > 50 && (
            <div className="p-4 bg-muted/20 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Showing first 50 results. Use export for full data.
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
