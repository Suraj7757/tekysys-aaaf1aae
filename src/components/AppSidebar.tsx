import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Users, Wrench, IndianRupee, ArrowLeftRight, Package, ShoppingCart,
  FileText, Settings, Trash2, Smartphone,
} from 'lucide-react';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Repair Jobs', url: '/jobs', icon: Wrench },
  { title: 'Payments', url: '/payments', icon: IndianRupee },
  { title: 'Settlements', url: '/settlements', icon: ArrowLeftRight },
];

const secondaryItems = [
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Sells', url: '/sells', icon: ShoppingCart },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Trash', url: '/trash', icon: Trash2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

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
              <NavLink key={item.url} to={item.url} icon={item.icon} label={item.title} active={location.pathname === item.url} collapsed={collapsed} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">Management</SidebarGroupLabel>
          <SidebarMenu>
            {secondaryItems.map(item => (
              <NavLink key={item.url} to={item.url} icon={item.icon} label={item.title} active={location.pathname === item.url} collapsed={collapsed} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
