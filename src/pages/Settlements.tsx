import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { store } from "@/lib/store";
import { SettlementCycle } from "@/lib/types";
import { ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Settlements() {
  const [settlements, setSettlements] = useState(store.getSettlements());
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const payments = store.getPayments();
  const unsettled = payments.filter(p => !p.settled);
  const unsettledTotal = unsettled.reduce((s, p) => s + p.amount, 0);
  const unsettledAdmin = unsettled.reduce((s, p) => s + p.adminShare, 0);
  const unsettledStaff = unsettled.reduce((s, p) => s + p.staffShare, 0);

  const handleSettle = () => {
    if (!startDate || !endDate) { toast.error("Select date range"); return; }
    if (unsettled.length === 0) { toast.error("No unsettled payments"); return; }

    const cycle: SettlementCycle = {
      id: crypto.randomUUID(),
      startDate, endDate,
      totalJobs: unsettled.length,
      totalRevenue: unsettledTotal,
      adminShare: unsettledAdmin,
      staffShare: unsettledStaff,
      settledAt: new Date().toISOString().split('T')[0],
      settledBy: 'Admin',
    };

    // Mark payments as settled
    const allPayments = store.getPayments().map(p =>
      !p.settled ? { ...p, settled: true, settlementCycleId: cycle.id } : p
    );
    store.savePayments(allPayments);
    store.addSettlement(cycle);
    setSettlements(store.getSettlements());
    setOpen(false);
    toast.success("Settlement completed!");
  };

  return (
    <Layout title="Settlement Cycles">
      <div className="space-y-4 animate-fade-in">
        {/* Unsettled Summary */}
        <Card className="shadow-card border-l-4 border-l-warning">
          <CardContent className="py-4 px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Unsettled Balance</p>
                <p className="text-2xl font-bold mt-1">₹{unsettledTotal.toLocaleString()}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>Admin: <strong>₹{unsettledAdmin.toLocaleString()}</strong></span>
                  <span>Staff: <strong>₹{unsettledStaff.toLocaleString()}</strong></span>
                  <span>Jobs: <strong>{unsettled.length}</strong></span>
                </div>
              </div>
              <Button onClick={() => setOpen(true)} disabled={unsettled.length === 0}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Settle Done
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settlement History */}
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" /> Settlement History
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Period</th>
                  <th className="text-left p-3 font-semibold">Jobs</th>
                  <th className="text-left p-3 font-semibold">Revenue</th>
                  <th className="text-left p-3 font-semibold">Admin Share</th>
                  <th className="text-left p-3 font-semibold">Staff Share</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Settled On</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(s => (
                  <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{s.startDate} → {s.endDate}</td>
                    <td className="p-3">{s.totalJobs}</td>
                    <td className="p-3 font-semibold">₹{s.totalRevenue.toLocaleString()}</td>
                    <td className="p-3">₹{s.adminShare.toLocaleString()}</td>
                    <td className="p-3">₹{s.staffShare.toLocaleString()}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{s.settledAt}</td>
                  </tr>
                ))}
                {settlements.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No settlements yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Settle Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Complete Settlement</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              </div>
              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Total Jobs</span><strong>{unsettled.length}</strong></div>
                <div className="flex justify-between"><span>Total Revenue</span><strong>₹{unsettledTotal.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Admin Share</span><strong>₹{unsettledAdmin.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Staff Share</span><strong>₹{unsettledStaff.toLocaleString()}</strong></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSettle}>Confirm Settlement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
