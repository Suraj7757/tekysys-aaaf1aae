import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Gift, Award, Save } from "lucide-react";
import { toast } from "sonner";

interface Settings {
  enabled: boolean;
  points_per_rupee: number;
  rupee_per_point: number;
  signup_bonus: number;
  min_redeem_points: number;
}

export default function Loyalty() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    enabled: true,
    points_per_rupee: 1,
    rupee_per_point: 0.1,
    signup_bonus: 50,
    min_redeem_points: 100,
  });
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [setRes, custRes] = await Promise.all([
      (supabase as any)
        .from("loyalty_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      (supabase as any)
        .from("customers")
        .select("id, name, mobile, points")
        .eq("user_id", user.id)
        .eq("deleted", false)
        .order("points", { ascending: false })
        .limit(20),
    ]);
    if (setRes.data) setSettings(setRes.data);
    setTopCustomers(custRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase as any).from("loyalty_settings").upsert(
      {
        ...settings,
        user_id: user.id,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Loyalty settings saved");
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="h-7 w-7 text-primary" /> Loyalty & Rewards
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Reward repeat customers with points they can redeem.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Program Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable loyalty program</Label>
                <p className="text-xs text-muted-foreground">
                  Customers earn points on every payment.
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(v) =>
                  setSettings({ ...settings, enabled: v })
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Points per ₹1 spent</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.points_per_rupee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      points_per_rupee: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>₹ value per point</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.rupee_per_point}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rupee_per_point: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Signup bonus (points)</Label>
                <Input
                  type="number"
                  value={settings.signup_bonus}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      signup_bonus: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Minimum redeem points</Label>
                <Input
                  type="number"
                  value={settings.min_redeem_points}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      min_redeem_points: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40">
              Example: ₹1000 payment ={" "}
              <b>{(1000 * settings.points_per_rupee).toFixed(0)} points</b>,
              worth{" "}
              <b>
                ₹
                {(
                  1000 *
                  settings.points_per_rupee *
                  settings.rupee_per_point
                ).toFixed(2)}
              </b>
              .
            </div>
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" /> Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : topCustomers.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                No customers with points yet.
              </p>
            ) : (
              <div className="space-y-2">
                {topCustomers.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.mobile}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary">
                        {c.points || 0} pts
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ≈ ₹
                        {((c.points || 0) * settings.rupee_per_point).toFixed(
                          2,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
