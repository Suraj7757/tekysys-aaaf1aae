import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCheck, CreditCard, Wrench, UserPlus, Package, RotateCcw, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'payment' | 'job' | 'customer' | 'refund' | 'inventory';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  payment:   { icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-100' },
  job:       { icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-100' },
  customer:  { icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  refund:    { icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-100' },
  inventory: { icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    // Realtime subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        payload => setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 19)])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await (supabase as any).from('notifications').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (data) setNotifications(data);
  };

  const markAllRead = async () => {
    if (!user) return;
    await (supabase as any).from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await (supabase as any).from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted">
          <Bell className="h-4.5 w-4.5" style={{ height: '1.1rem', width: '1.1rem' }} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse" style={{ height: '1.1rem', width: '1.1rem' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-xl rounded-2xl border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600">
          <div className="flex items-center gap-2 text-white">
            <Bell className="h-4 w-4" />
            <span className="font-bold text-sm">Notifications</span>
            {unread > 0 && <Badge className="bg-white/30 text-white border-0 text-[10px] h-4 px-1">{unread}</Badge>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-violet-200 hover:text-white text-xs flex items-center gap-1 transition-colors">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => {
              const cfg = typeConfig[n.type] || typeConfig.job;
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors group ${!n.read ? 'bg-violet-50/50 dark:bg-violet-950/10' : ''}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.read && <div className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />}
                    <button onClick={e => dismiss(n.id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
