import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  Plus,
  ShoppingCart,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/jobs", icon: Wrench, label: "Jobs" },
    { to: "/jobs?new=1", icon: Plus, label: "Add", primary: true },
    { to: "/sells", icon: ShoppingCart, label: "Sells" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border h-16 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {items.map((item) => {
        const active = location.pathname === item.to.split("?")[0];
        const Icon = item.icon;
        if (item.primary) {
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className="flex flex-col items-center justify-center -mt-6"
              aria-label={item.label}
            >
              <span className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center shadow-lg ring-4 ring-background hover:scale-105 transition-transform">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </span>
              <span className="text-[10px] font-medium mt-1 text-muted-foreground">
                {item.label}
              </span>
            </button>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </NavLink>
        );
      })}
      <button
        onClick={() => setOpenMobile(true)}
        className="flex flex-col items-center justify-center px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
        <span className="text-[10px] font-medium mt-0.5">More</span>
      </button>
    </nav>
  );
}
