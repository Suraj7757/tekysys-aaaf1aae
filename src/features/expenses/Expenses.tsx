import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/AuthContext";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Rent",
  "Salary",
  "Utilities",
  "Parts",
  "Marketing",
  "Travel",
  "Other",
];

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  payment_method: string;
}

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: "Other",
    amount: "",
    description: "",
    expense_date: new Date().toISOString().slice(0, 10),
    payment_method: "Cash",
  });
  const [filterMonth, setFilterMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const start = `${filterMonth}-01`;
    const end = new Date(
      new Date(start).setMonth(new Date(start).getMonth() + 1),
    )
      .toISOString()
      .slice(0, 10);
    const [expRes, payRes] = await Promise.all([
      (supabase as any)
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .eq("deleted", false)
        .gte("expense_date", start)
        .lt("expense_date", end)
        .order("expense_date", { ascending: false }),
      (supabase as any)
        .from("payments")
        .select("amount")
        .eq("user_id", user.id)
        .eq("deleted", false)
        .gte("created_at", start)
        .lt("created_at", end),
    ]);
    setExpenses(expRes.data || []);
    setRevenue(
      (payRes.data || []).reduce(
        (s: number, p: any) => s + Number(p.amount || 0),
        0,
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user, filterMonth]);

  const totalExp = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount), 0),
    [expenses],
  );
  const profit = revenue - totalExp;
  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    expenses.forEach((e) => {
      m[e.category] = (m[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const save = async () => {
    if (!user || !form.amount) {
      toast.error("Amount required");
      return;
    }
    const { error } = await (supabase as any).from("expenses").insert({
      ...form,
      amount: Number(form.amount),
      user_id: user.id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Expense added");
    setOpen(false);
    setForm({ ...form, amount: "", description: "" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any)
      .from("expenses")
      .update({ deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    load();
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wallet className="h-7 w-7 text-primary" /> Expenses & Profit
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track daily expenses and see your real profit.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-40"
            />
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                <TrendingUp className="h-4 w-4" /> REVENUE
              </div>
              <p className="text-3xl font-black mt-2 flex items-center">
                <IndianRupee className="h-6 w-6" />
                {revenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-rose-600 text-sm font-bold">
                <TrendingDown className="h-4 w-4" /> EXPENSES
              </div>
              <p className="text-3xl font-black mt-2 flex items-center">
                <IndianRupee className="h-6 w-6" />
                {totalExp.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card
            className={
              profit >= 0
                ? "ring-2 ring-emerald-500/30"
                : "ring-2 ring-rose-500/30"
            }
          >
            <CardContent className="p-5">
              <div
                className={`flex items-center gap-2 text-sm font-bold ${profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                NET PROFIT
              </div>
              <p className="text-3xl font-black mt-2 flex items-center">
                <IndianRupee className="h-6 w-6" />
                {profit.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {byCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byCategory.map(([cat, amt]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">{cat}</span>
                  <span className="font-mono">₹{amt.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : expenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No expenses this month.
              </p>
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-bold text-sm">
                        {e.category}{" "}
                        <span className="text-muted-foreground font-normal">
                          — {e.description || "No note"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.expense_date} · {e.payment_method}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">
                        ₹{Number(e.amount).toLocaleString()}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(e.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) =>
                    setForm({ ...form, expense_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={form.payment_method}
                  onValueChange={(v) => setForm({ ...form, payment_method: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Cash", "UPI", "Card", "Bank Transfer"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
