import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAutomationSettings } from "@/hooks/useAutomation";
import { Zap } from "lucide-react";

export function AutomationSettingsCard() {
  const { settings, save, loading } = useAutomationSettings();

  if (loading) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> Automation & Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row
          label="Auto WhatsApp on status change"
          desc="Job status update hone par customer ko WhatsApp draft khulega"
          checked={settings.auto_whatsapp_status}
          onChange={(v) => save({ auto_whatsapp_status: v })}
        />
        <Row
          label="Pending job reminders"
          desc="Stuck jobs ke liye dashboard pe alert"
          checked={settings.daily_digest_enabled}
          onChange={(v) => save({ daily_digest_enabled: v })}
        />
        <Row
          label="Low stock alerts"
          desc="Inventory minimum tak pahunchne par notify"
          checked={settings.low_stock_alerts}
          onChange={(v) => save({ low_stock_alerts: v })}
        />
        <Row
          label="Payment due reminders"
          desc="Pending payments ke liye follow-up alerts"
          checked={settings.payment_reminders}
          onChange={(v) => save({ payment_reminders: v })}
        />
        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <div>
            <Label className="text-sm">Pending threshold (days)</Label>
            <p className="text-xs text-muted-foreground">Itne din se stuck job → alert</p>
          </div>
          <Input
            type="number"
            min={1}
            max={30}
            value={settings.pending_threshold_days}
            onChange={(e) => save({ pending_threshold_days: parseInt(e.target.value) || 3 })}
            className="w-20 h-9 text-center"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
