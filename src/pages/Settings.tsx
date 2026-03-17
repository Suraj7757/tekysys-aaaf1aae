import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";
import { ShopSettings } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(store.getSettings());
  const [newQr, setNewQr] = useState("");

  const update = (key: keyof ShopSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addQr = () => {
    if (!newQr.trim()) return;
    if (settings.qrReceivers.includes(newQr.trim())) { toast.error("Already exists"); return; }
    update('qrReceivers', [...settings.qrReceivers, newQr.trim()]);
    setNewQr("");
  };

  const removeQr = (qr: string) => {
    update('qrReceivers', settings.qrReceivers.filter(q => q !== qr));
  };

  const handleSave = () => {
    // Ensure shares add to 100
    if (settings.adminSharePercent + settings.staffSharePercent !== 100) {
      toast.error("Admin + Staff share must equal 100%");
      return;
    }
    store.saveSettings(settings);
    toast.success("Settings saved successfully");
  };

  return (
    <Layout title="Settings">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-sm font-semibold">Shop Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div><Label>Shop Name</Label><Input value={settings.shopName} onChange={e => update('shopName', e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={settings.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div><Label>Address</Label><Input value={settings.address} onChange={e => update('address', e.target.value)} /></div>
            <div><Label>GSTIN</Label><Input value={settings.gstin} onChange={e => update('gstin', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-sm font-semibold">Revenue Split</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><Label>Admin Share %</Label><Input type="number" value={settings.adminSharePercent} onChange={e => update('adminSharePercent', parseInt(e.target.value) || 0)} /></div>
            <div><Label>Staff Share %</Label><Input type="number" value={settings.staffSharePercent} onChange={e => update('staffSharePercent', parseInt(e.target.value) || 0)} /></div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-sm font-semibold">QR Receivers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {settings.qrReceivers.map(qr => (
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

        <Button onClick={handleSave} className="w-full sm:w-auto">Save Settings</Button>
      </div>
    </Layout>
  );
}
