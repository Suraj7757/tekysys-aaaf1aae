import { useLocation } from 'react-router-dom';
import { SidebarNavLink } from '@/components/SidebarNavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Users, Wrench, IndianRupee, ArrowLeftRight, Package, ShoppingCart,
  FileText, Settings, Trash2, Smartphone, MessageCircle, Wallet, Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ADMIN_WHATSAPP = '917070888119';
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
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Trash', url: '/trash', icon: Trash2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, role } = useAuth();
  const collapsed = state === 'collapsed';
  const isAdmin = user?.email === ADMIN_EMAIL || role === 'admin';

  const openWhatsApp = () => {
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hello Admin, I need help with RepairDesk CRM')}`, '_blank');
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar pt-4">
        <div className={`px-4 pb-4 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Smartphone className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-sidebar-foreground">RepairDesk</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">Main Menu</SidebarGroupLabel>
          <SidebarMenu>
            {mainItems.map(item => (
              <SidebarNavLink key={item.url} to={item.url} icon={item.icon} label={item.title} active={location.pathname === item.url} collapsed={collapsed} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">Management</SidebarGroupLabel>
          <SidebarMenu>
            {secondaryItems.map(item => (
              <SidebarNavLink key={item.url} to={item.url} icon={item.icon} label={item.title} active={location.pathname === item.url} collapsed={collapsed} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">Admin</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarNavLink to="/admin" icon={Shield} label="Admin Panel" active={location.pathname === '/admin'} collapsed={collapsed} />
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">Support</SidebarGroupLabel>
          <SidebarMenu>
            <button
              onClick={openWhatsApp}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
            >
              <MessageCircle className="h-4 w-4 text-green-500 shrink-0" />
              {!collapsed && <span>WhatsApp Help</span>}
            </button>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
