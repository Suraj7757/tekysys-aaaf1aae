import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseQuery } from "./useSupabaseData";
import { toast } from "sonner";

interface AutoSettings {
  id?: string;
  user_id?: string;
  auto_whatsapp_status: boolean;
  pending_threshold_days: number;
  daily_digest_enabled: boolean;
  low_stock_alerts: boolean;
  payment_reminders: boolean;
}

const DEFAULTS: AutoSettings = {
  auto_whatsapp_status: true,
  pending_threshold_days: 3,
  daily_digest_enabled: true,
  low_stock_alerts: true,
  payment_reminders: true,
};

export function useAutomationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AutoSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("automation_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setSettings(data);
      setLoading(false);
    })();
  }, [user]);

  const save = async (updates: Partial<AutoSettings>) => {
    if (!user) return false;
    const merged = { ...settings, ...updates, user_id: user.id };
    const { error } = await (supabase as any)
      .from("automation_settings")
      .upsert(merged, { onConflict: "user_id" });
    if (error) { toast.error("Save failed"); return false; }
    setSettings(merged);
    return true;
  };

  return { settings, loading, save };
}

interface Job { id: string; job_id: string; status: string; updated_at: string; customer_name: string; }
interface Inv { id: string; name: string; quantity: number; min_stock: number; }

export function useAutomationAlerts() {
  const { settings } = useAutomationSettings();
  const { data: jobs } = useSupabaseQuery<Job>("repair_jobs");
  const { data: inventory } = useSupabaseQuery<Inv>("inventory");

  const pendingJobs = useMemo(() => {
    const cutoff = Date.now() - settings.pending_threshold_days * 86400000;
    return jobs.filter(
      (j) => j.status !== "Delivered" && j.status !== "Ready" && new Date(j.updated_at).getTime() < cutoff
    );
  }, [jobs, settings.pending_threshold_days]);

  const lowStockItems = useMemo(
    () => inventory.filter((i) => settings.low_stock_alerts && i.quantity <= (i.min_stock || 5)),
    [inventory, settings.low_stock_alerts]
  );

  return { pendingJobs, lowStockItems, settings };
}
