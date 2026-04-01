import { Link } from 'react-router-dom';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';

interface SidebarNavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
}

export function SidebarNavLink({ to, icon: Icon, label, active, collapsed }: SidebarNavLinkProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={label}>
        <Link to={to} className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{label}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
