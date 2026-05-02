import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Package, Store, CalendarCheck, Phone, CheckCircle2 } from "lucide-react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [trackingId, setTrackingId] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [requestType, setRequestType] = useState<"repair" | "buy">("repair");
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [form, setForm] = useState({
    device_brand: "",
    device_model: "",
    problem_description: "",
    preferred_date: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.email) return;
    setLoading(true);
    const [ordersRes, shopsRes] = await Promise.all([
      (supabase as any)
        .from("booking_requests")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("shop_settings")
        .select("user_id, shop_name, address, phone, booking_slug")
        .eq("booking_enabled", true)
        .limit(20)
    ]);
    
    setOrders(ordersRes.data || []);
    setShops(shopsRes.data || []);
    if (shopsRes.data && shopsRes.data.length > 0) {
      setSelectedShopId(shopsRes.data[0].user_id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!selectedShopId) {
      toast.error("Please select a shop first");
      return;
    }
    if (!form.device_brand || !form.problem_description) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    const descriptionPrefix = requestType === "buy" ? "[BUY REQUEST] " : "[REPAIR] ";
    const finalDescription = descriptionPrefix + form.problem_description;

    try {
      const { error } = await (supabase as any).from("booking_requests").insert({
        customer_name: user?.user_metadata?.display_name || "Customer",
        customer_mobile: user?.user_metadata?.mobile || "",
        customer_email: user?.email,
        device_brand: form.device_brand,
        device_model: form.device_model,
        problem_description: finalDescription,
        preferred_date: form.preferred_date || null,
        user_id: selectedShopId,
      });

      if (error) {
        toast.error(error.message);
        return;
      }
      
      setSubmitted(true);
      fetchDashboardData(); // Refresh list
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user?.user_metadata?.display_name || user?.email}
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your repairs, browse shops, and place service/buy requests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Create Request Form */}
            <Card className="border-primary/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Store className="h-32 w-32" />
              </div>
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Request Repair or Buy Part
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {submitted ? (
                  <div className="py-8 text-center space-y-4 animate-fade-in">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500" />
                    <h2 className="text-2xl font-bold">Request Sent!</h2>
                    <p className="text-muted-foreground">
                      The shop owner has been notified and will contact you shortly.
                    </p>
                    <Button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({
                          device_brand: "",
                          device_model: "",
                          problem_description: "",
                          preferred_date: "",
                        });
                      }}
                    >
                      Create Another Request
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={submitRequest} className="space-y-5">
                    <div className="flex gap-4 p-1 bg-muted rounded-xl w-fit">
                      <Button
                        type="button"
                        variant={requestType === "repair" ? "default" : "ghost"}
                        onClick={() => setRequestType("repair")}
                        className="rounded-lg px-6"
                      >
                        Repair Device
                      </Button>
                      <Button
                        type="button"
                        variant={requestType === "buy" ? "default" : "ghost"}
                        onClick={() => setRequestType("buy")}
                        className="rounded-lg px-6"
                      >
                        Buy Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Select Shop / Wholesaler *</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
                          value={selectedShopId}
                          onChange={(e) => setSelectedShopId(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select a shop...</option>
                          {shops.map((s) => (
                            <option key={s.user_id} value={s.user_id}>
                              {s.shop_name} {s.address ? `(${s.address})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Device Brand *</Label>
                          <Input
                            placeholder="e.g. Samsung, Apple"
                            value={form.device_brand}
                            onChange={(e) => setForm({ ...form, device_brand: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Device Model</Label>
                          <Input
                            placeholder="e.g. Galaxy S21"
                            value={form.device_model}
                            onChange={(e) => setForm({ ...form, device_model: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>{requestType === "repair" ? "Describe the problem *" : "What do you want to buy? *"}</Label>
                        <Textarea
                          placeholder={requestType === "repair" ? "Screen is cracked..." : "Looking for original charger..."}
                          value={form.problem_description}
                          onChange={(e) => setForm({ ...form, problem_description: e.target.value })}
                          rows={3}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full font-bold" size="lg" disabled={submitting}>
                        {submitting ? "Submitting..." : `Submit ${requestType === "repair" ? "Repair" : "Buy"} Request`}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* My Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  My Requests & Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground py-4">Loading your history...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Device/Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs">
                            {new Date(o.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {o.device_brand} {o.device_model}
                          </TableCell>
                          <TableCell className="text-xs max-w-xs truncate">
                            {o.problem_description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={o.status === "converted" || o.status === "accepted" ? "default" : "outline"}
                              className={o.status === "rejected" ? "bg-destructive text-destructive-foreground" : ""}
                            >
                              {o.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg mt-4"
                          >
                            No requests submitted yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Track Order */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Track Repair Job
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">Enter tracking ID given by the shop to track live repair status.</p>
                <Input
                  placeholder="e.g. JSAM0042K9X"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                />
                <Button className="w-full" asChild>
                  <Link to={`/track${trackingId ? `?id=${trackingId}` : ""}`}>
                    Track Status
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Registered Shops */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Registered Shops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shops.map((s) => (
                    <div key={s.user_id} className="p-4 rounded-xl border hover:border-primary/50 transition bg-card/50">
                      <div className="font-bold text-lg">{s.shop_name}</div>
                      <div className="text-xs text-muted-foreground mt-1 mb-3">
                        {s.address || "No address provided"}
                      </div>
                      
                      <div className="flex gap-2">
                        {s.booking_slug && (
                          <Button
                            asChild
                            size="sm"
                            variant="default"
                            className="flex-1"
                          >
                            <Link to={`/book/${s.booking_slug}`}>Public Page</Link>
                          </Button>
                        )}
                        {s.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-none bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900/50"
                            onClick={() => window.open(`https://wa.me/${s.phone}`, "_blank")}
                          >
                            <Phone className="h-3 w-3 mr-1" /> Call/WA
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {shops.length === 0 && (
                    <p className="text-center text-muted-foreground py-6 border-2 border-dashed rounded-xl">
                      No registered shops found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

