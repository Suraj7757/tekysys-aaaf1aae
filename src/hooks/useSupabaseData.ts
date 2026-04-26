import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

type TableName = 'customers' | 'repair_jobs' | 'payments' | 'settlement_cycles' | 'inventory' | 'shop_settings' | 'activity_log' | 'sells' | 'payment_submissions' | 'wallets' | 'wallet_transactions' | 'withdraw_requests' | 'profiles' | 'customer_payments' | 'payment_links' | 'payment_refunds' | 'message_logs' | 'customer_feedback' | 'notifications' | 'erp_expenses' | 'erp_leads' | 'erp_tasks';

export function useSupabaseQuery<T>(table: TableName, includeDeleted = false) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase.from(table).select('*') as any;
    if (!['customer_feedback', 'system_config'].includes(table)) {
      query = query.eq('user_id', user.id);
    }
    if (!includeDeleted && !['activity_log', 'shop_settings', 'payment_submissions', 'wallets', 'wallet_transactions', 'withdraw_requests', 'profiles', 'customer_payments', 'payment_links', 'payment_refunds', 'message_logs', 'customer_feedback', 'notifications'].includes(table)) {
      query = query.eq('deleted', false);
    }
    query = query.order('created_at', { ascending: false });
    const { data: result, error } = await query;
    if (error) { console.error(error); toast.error('Failed to load data'); }
    else setData((result as T[]) ?? []);
    setLoading(false);
  }, [user, table, includeDeleted]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, refetch };
}

export function useActivityLog() {
  const { user } = useAuth();

  const logAction = useCallback(async (action: string, entityType: string, entityId?: string, entityName?: string, details?: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      details: details as any,
    });
  }, [user]);

  return { logAction };
}

export function useSoftDelete() {
  const { logAction } = useActivityLog();

  const softDelete = useCallback(async (table: TableName, id: string, entityName?: string) => {
    const { error } = await supabase.from(table).update({
      deleted: true,
      deleted_at: new Date().toISOString(),
    } as any).eq('id', id);
    if (error) { toast.error('Delete failed'); return false; }
    await logAction('deleted', table, id, entityName);
    return true;
  }, [logAction]);

  const restore = useCallback(async (table: TableName, id: string, entityName?: string) => {
    const { error } = await supabase.from(table).update({
      deleted: false,
      deleted_at: null,
    } as any).eq('id', id);
    if (error) { toast.error('Restore failed'); return false; }
    await logAction('restored', table, id, entityName);
    return true;
  }, [logAction]);

  const permanentDelete = useCallback(async (table: TableName, id: string, entityName?: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { toast.error('Permanent delete failed'); return false; }
    await logAction('permanently_deleted', table, id, entityName);
    return true;
  }, [logAction]);

  return { softDelete, restore, permanentDelete };
}

export function useShopSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('shop_settings').select('*').eq('user_id', user.id).maybeSingle();
    setSettings(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = useCallback(async (updates: Record<string, unknown>) => {
    if (!user) return false;
    let payload = { user_id: user.id, ...updates } as any;
    if (settings?.id) { payload.id = settings.id; }
    
    const { error } = await supabase.from('shop_settings').upsert(payload, { onConflict: 'user_id' });
    if (error) { toast.error('Failed to save: ' + error.message); return false; }
    await fetchSettings();
    return true;
  }, [user, settings, fetchSettings]);

  return { settings, loading, saveSettings, refetch: fetchSettings };
}

export async function getNextJobId(userId: string): Promise<string> {
  const { data, error } = await supabase.rpc('next_job_id', { _user_id: userId });
  if (error) throw error;
  return data as string;
}
