import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useShopSettings } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, loading, saveSettings } = useShopSettings();
  const { signOut } = useAuth();
  const [form, setForm] = useState<any>(null);
  const [newQr, setNewQr] = useState("");

  useEffect(() => {
    if (settings && !form) setForm({ ...settings });
  }, [settings]);

  if (loading || !form) return <Layout title="Settings"><div className="p-8 text-center text-muted-foreground">Loading...</div></Layout>;

  const update = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

  const addQr = () => {
    if (!newQr.trim()) return;
    if (form.qr_receivers.includes(newQr.trim())) { toast.error("Already exists"); return; }
    update('qr_receivers', [...form.qr_receivers, newQr.trim()]);
    setNewQr("");
  };

  const removeQr = (qr: string) => update('qr_receivers', form.qr_receivers.filter((q: string) => q !== qr));

  const handleSave = async () => {
    if (form.revenue_split_enabled && (form.admin_share_percent + form.staff_share_percent !== 100)) {
      toast.error("Admin + Staff share must equal 100%"); return;
    }
    const ok = await saveSettings({
      shop_name: form.shop_name,
      phone: form.phone,
      address: form.address,
      gstin: form.gstin,
      admin_share_percent: form.admin_share_percent,
      staff_share_percent: form.staff_share_percent,
      qr_receivers: form.qr_receivers,
      revenue_split_enabled: form.revenue_split_enabled,
    });
    if (ok) toast.success("Settings saved successfully");
  };

  return (
    <Layout title="Settings">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-sm font-semibold">Shop Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div><Label>Shop Name</Label><Input value={form.shop_name} onChange={e => update('shop_name', e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => update('address', e.target.value)} /></div>
            <div><Label>GSTIN</Label><Input value={form.gstin} onChange={e => update('gstin', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Revenue Split</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="split-toggle" className="text-xs text-muted-foreground">Enable Split</Label>
                <Switch id="split-toggle" checked={form.revenue_split_enabled !== false} onCheckedChange={v => update('revenue_split_enabled', v)} />
              </div>
            </div>
          </CardHeader>
          {form.revenue_split_enabled !== false && (
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label>Admin Share %</Label><Input type="number" value={form.admin_share_percent} onChange={e => update('admin_share_percent', parseInt(e.target.value) || 0)} /></div>
              <div><Label>Staff Share %</Label><Input type="number" value={form.staff_share_percent} onChange={e => update('staff_share_percent', parseInt(e.target.value) || 0)} /></div>
            </CardContent>
          )}
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-sm font-semibold">QR Receivers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {form.qr_receivers.map((qr: string) => (
              <div key={qr} className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">{qr}</span>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => removeQr(qr)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input placeholder="New QR receiver name" value={newQr} onChange={e => setNewQr(e.target.value)} onKeyDown={e => e.key === 'Enter' && addQr()} />
              <Button size="sm" onClick={addQr}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave}>Save Settings</Button>
          <Button variant="outline" onClick={signOut}>Logout</Button>
        </div>
      </div>
    </Layout>
  );
}
