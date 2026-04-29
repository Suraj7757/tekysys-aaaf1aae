import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarNavLink } from './SidebarNavLink';
import {
  Sidebar as BaseSidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Users, Wrench, IndianRupee, ArrowLeftRight, Package, ShoppingCart,
  FileText, Settings, Trash2, Smartphone, MessageCircle, Wallet, Shield, Crown, ConciergeBell, Building2, PlusCircle, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ADMIN_WHATSAPP = '917319884599';
const ADMIN_EMAIL = 'krs715665@gmail.com';

const mainItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Repair Jobs', url: '/jobs', icon: Wrench },
  { title: 'Track Order', url: '/track', icon: Smartphone },
  { title: 'Payments', url: '/payments', icon: IndianRupee },
  { title: 'Settlements', url: '/settlements', icon: ArrowLeftRight },
];

const secondaryItems = [
  { title: 'Services', url: '/services', icon: ConciergeBell },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Sells', url: '/sells', icon: ShoppingCart },
  { title: 'Wallet', url: '/wallet', icon: Wallet },
  { title: 'Subscription', url: '/subscription', icon: Crown },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Enterprise ERP', url: '/enterprise', icon: Building2 },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Trash', url: '/trash', icon: Trash2 },
];

export function Sidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const collapsed = state === 'collapsed';
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [createOpen, setCreateOpen] = useState(false);

  const openWhatsApp = () => {
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hello, I need help with RepairXpert')}`, '_blank');
  };

  const handleCreate = (type: 'job' | 'sell') => {
    setCreateOpen(false);
    if (type === 'job') navigate('/jobs#new');
    else navigate('/sells#new');
  };

  return (
    <>
      <BaseSidebar collapsible="icon" className="border-r-0 shadow-xl ring-1 ring-white/5">
        <SidebarContent className="bg-sidebar pt-6">
          {/* Logo */}
          <div className={`px-6 pb-6 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-sidebar-foreground tracking-tight">RepairXpert</span>
                <span className="text-[10px] text-sidebar-muted font-medium uppercase tracking-widest">v2.0 Pro</span>
              </div>
            )}
          </div>

          {!isAdmin && (
            <>
              {/* Create Button */}
              <SidebarGroup>
                <SidebarGroupLabel className="px-6 text-sidebar-muted/50 text-[10px] font-bold uppercase tracking-widest mb-2">Quick Action</SidebarGroupLabel>
                <div className="px-3 mb-1">
                  <button
                    onClick={() => setCreateOpen(true)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all ${collapsed ? 'justify-center' : ''}`}
                  >
                    <PlusCircle className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>+ Create New</span>}
                  </button>
                </div>
              </SidebarGroup>

              <SidebarGroup className="mt-2">
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
            </>
          )}

          {isAdmin && (
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="px-6 text-sidebar-muted/50 text-[10px] font-bold uppercase tracking-widest mb-2">Admin Dashboard</SidebarGroupLabel>
              <SidebarMenu className="px-3">
                <SidebarNavLink to="/admin" icon={Shield} label="Admin Panel" active={location.pathname === '/admin'} collapsed={collapsed} />
                <SidebarNavLink to="/track" icon={Smartphone} label="Track Order" active={location.pathname === '/track'} collapsed={collapsed} />
                <SidebarNavLink to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} collapsed={collapsed} />
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
                  <MessageCircle className="h-4 w-4 text-green-500" />
                </div>
                {!collapsed && <span className="font-medium">WhatsApp Help</span>}
              </button>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </BaseSidebar>

      {/* Create Popup Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xs p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-card rounded-2xl overflow-hidden">
            <div className="gradient-primary p-5 text-center">
              <h2 className="text-lg font-black text-primary-foreground">Create New</h2>
              <p className="text-xs text-primary-foreground/70 mt-1">Select what you want to create</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCreate('job')}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">Repair Job</p>
                  <p className="text-[10px] text-muted-foreground">New repair case</p>
                </div>
              </button>

              <button
                onClick={() => handleCreate('sell')}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">New Sale</p>
                  <p className="text-[10px] text-muted-foreground">Sell an item</p>
                </div>
              </button>
            </div>
            <div className="px-4 pb-4">
              <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
