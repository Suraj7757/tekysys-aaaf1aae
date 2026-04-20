import { useLocation } from 'react-router-dom';
import { SidebarNavLink } from './SidebarNavLink';
import {
  Sidebar as BaseSidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Users, Wrench, IndianRupee, ArrowLeftRight, Package, ShoppingCart,
  FileText, Settings, Trash2, Smartphone, MessageCircle, Wallet, Shield, Crown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ADMIN_WHATSAPP = '917319884599';
const ADMIN_EMAIL = 'krs715665@gmail.com';

const mainItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Repair Jobs', url: '/jobs', icon: Wrench },
  { title: 'Payments', url: '/payments', icon: IndianRupee },
  { title: 'Settlements', url: '/settlements', icon: ArrowLeftRight },
];

const secondaryItems = [
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Sells', url: '/sells', icon: ShoppingCart },
  { title: 'Wallet', url: '/wallet', icon: Wallet },
  { title: 'Subscription', url: '/subscription', icon: Crown },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Trash', url: '/trash', icon: Trash2 },
];

export function Sidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, role } = useAuth();
  const collapsed = state === 'collapsed';
  const isAdmin = user?.email === ADMIN_EMAIL || role === 'admin';

  const openWhatsApp = () => {
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hello Admin, I need help with MSM CRM')}`, '_blank');
  };

  return (
    <BaseSidebar collapsible="icon" className="border-r-0 shadow-xl ring-1 ring-white/5">
      <SidebarContent className="bg-sidebar pt-6">
        <div className={`px-6 pb-6 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Smartphone className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">MSM CRM</span>
              <span className="text-[10px] text-sidebar-muted font-medium uppercase tracking-widest">v2.0 Pro</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-sidebar-muted/50 text-[10px] font-bold uppercase tracking-widest mb-2">Main Menu</SidebarGroupLabel>
          <SidebarMenu className="px-3">
            {mainItems.map(item => (
              <SidebarNavLink key={item.url} to={item.url} icon={item.icon} label={item.title} active={location.pathname === item.url} collapsed={collapsed} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-6 text-sidebar-muted/50 text-[10px] font-bold uppercase tracking-widest mb-2">Management</SidebarGroupLabel>
          <SidebarMenu className="px-3">
            {secondaryItems.map(item => (
              <SidebarNavLink key={item.url} to={item.url} icon={item.icon} label={item.title} active={location.pathname === item.url} collapsed={collapsed} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-sidebar-muted/50 text-[10px] font-bold uppercase tracking-widest mb-2">Admin</SidebarGroupLabel>
            <SidebarMenu className="px-3">
              <SidebarNavLink to="/admin" icon={Shield} label="Admin Panel" active={location.pathname === '/admin'} collapsed={collapsed} />
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto pb-8">
          <SidebarGroupLabel className="px-6 text-sidebar-muted/50 text-[10px] font-bold uppercase tracking-widest mb-2">Support</SidebarGroupLabel>
          <SidebarMenu className="px-3">
            <button
              onClick={openWhatsApp}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group w-full ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                <MessageCircle className="h-4.5 w-4.5 text-green-500" />
              </div>
              {!collapsed && <span className="font-medium">WhatsApp Help</span>}
            </button>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </BaseSidebar>
  );
}
