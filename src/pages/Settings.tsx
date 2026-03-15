import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => toast.success("Settings saved");

  return (
    <Layout title="Settings">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-sm font-semibold">Shop Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div><Label>Shop Name</Label><Input defaultValue="RepairDesk Mobile Shop" /></div>
            <div><Label>Phone</Label><Input defaultValue="+91 98765 43210" /></div>
            <div><Label>Address</Label><Input defaultValue="123 MG Road, Mumbai 400001" /></div>
            <div><Label>GSTIN</Label><Input defaultValue="27AABCU9603R1ZM" /></div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-sm font-semibold">Revenue Split</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><Label>Admin Share %</Label><Input type="number" defaultValue="50" /></div>
            <div><Label>Staff Share %</Label><Input type="number" defaultValue="50" /></div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-sm font-semibold">QR Receivers</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div><Label>Admin QR Name</Label><Input defaultValue="Admin QR" /></div>
            <div><Label>Staff QR Name</Label><Input defaultValue="Staff QR" /></div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full sm:w-auto">Save Settings</Button>
      </div>
    </Layout>
  );
}
