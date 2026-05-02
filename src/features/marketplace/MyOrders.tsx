import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const STATUS_COLOR: Record<string, string> = {
  placed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  accepted: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  packed: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  shipped: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("marketplace_orders")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [user?.id]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md text-center p-8">
        <h2 className="text-xl font-bold mb-2">Login to view orders</h2>
        <Button asChild className="mt-4"><Link to="/auth">Login</Link></Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm"><Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-1" /> Marketplace</Link></Button>
          <h1 className="font-bold">My Orders</h1>
          <div />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No orders yet</h3>
            <Button asChild><Link to="/marketplace">Start Shopping</Link></Button>
          </Card>
        ) : (
          orders.map((o) => (
            <Card key={o.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base font-mono">{o.order_number}</CardTitle>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className={STATUS_COLOR[o.fulfillment_status] || ""}>
                    {o.fulfillment_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.isArray(o.items) && o.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{it.title} × {it.quantity}</span>
                    <span>₹{it.line_total}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{o.total}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Payment: {o.payment_method.toUpperCase()} · {o.payment_status}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
