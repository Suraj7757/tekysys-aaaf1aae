import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Bell, LogOut, Settings, Sun, Moon, Trash2, X } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabaseData';
import { useTheme } from 'next-themes';

export function HeaderUserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: jobs } = useSupabaseQuery<any>('repair_jobs');
  const { data: sells } = useSupabaseQuery<any>('sells' as any);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const { theme, setTheme } = useTheme();

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'U';
  const initial = displayName.charAt(0).toUpperCase();

  const today = new Date().toDateString();
  const newJobsToday = jobs.filter((j: any) => new Date(j.created_at).toDateString() === today);
  const readyJobs = jobs.filter((j: any) => j.status === 'Ready');
  const inProgressJobs = jobs.filter((j: any) => j.status === 'In Progress');
  const newSellsToday = (sells as any[]).filter((s: any) => new Date(s.created_at).toDateString() === today);

  const allNotifications = [
    ...newJobsToday.map((j: any) => ({ id: j.id, text: `New job: ${j.job_id} - ${j.customer_name}`, type: 'new' as const, route: '/jobs' })),
    ...readyJobs.map((j: any) => ({ id: j.id + '-ready', text: `${j.job_id} is Ready for pickup`, type: 'update' as const, route: '/jobs' })),
    ...inProgressJobs.map((j: any) => ({ id: j.id + '-progress', text: `${j.job_id} is In Progress`, type: 'update' as const, route: '/jobs' })),
    ...newSellsToday.map((s: any) => ({ id: s.id + '-sell', text: `New sale: ${s.sell_id} - ${s.item_name}`, type: 'new' as const, route: '/sells' })),
  ];

  const notifications = allNotifications.filter(n => !dismissedIds.has(n.id));

  const clearAllNotifications = () => {
    setDismissedIds(new Set(allNotifications.map(n => n.id)));
    setNotifOpen(false);
  };

  const handleNotifClick = (route: string) => {
    setNotifOpen(false);
    navigate(route);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Popover open={notifOpen} onOpenChange={setNotifOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-3 border-b font-semibold text-sm flex justify-between items-center">
            <span>Notifications ({notifications.length})</span>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearAllNotifications}>
                <X className="h-3 w-3 mr-1" /> Clear All
              </Button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div key={n.id} className="px-3 py-2 border-b last:border-0 hover:bg-muted/50 text-sm cursor-pointer" onClick={() => handleNotifClick(n.route)}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] shrink-0">{n.type === 'new' ? '🆕' : '🔔'}</Badge>
                    <span className="flex-1">{n.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity">
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-2" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
