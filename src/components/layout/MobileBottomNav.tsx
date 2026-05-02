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
import { motion } from "framer-motion";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/jobs", icon: Wrench, label: "Jobs" },
    { to: "/jobs?new=1", icon: Plus, label: "Add", primary: true },
    { to: "/sells", icon: ShoppingCart, label: "Sells" },
    { to: "#menu", icon: Menu, label: "More", isMenu: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 rounded-3xl glass shadow-2xl border border-white/20 dark:border-white/10 h-16 flex items-center justify-around px-2 backdrop-blur-xl bg-background/70 dark:bg-background/50 supports-[backdrop-filter]:bg-background/40">
      {items.map((item) => {
        const active = location.pathname === item.to.split("?")[0] && !item.isMenu;
        const Icon = item.icon;

        if (item.primary) {
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="relative -top-5 flex flex-col items-center justify-center group outline-none"
              aria-label={item.label}
            >
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-xl ring-4 ring-background text-white hover:shadow-primary/30 transition-all z-10"
              >
                <Icon className="h-7 w-7" strokeWidth={2.5} />
              </motion.div>
            </button>
          );
        }

        if (item.isMenu) {
          return (
            <button
              key={item.label}
              onClick={() => setOpenMobile(true)}
              className="relative flex flex-col items-center justify-center w-14 h-14 outline-none"
              aria-label="Menu"
            >
              <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="h-6 w-6 mb-1" strokeWidth={2} />
                <span className="text-[10px] font-semibold tracking-wide">More</span>
              </motion.div>
            </button>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="relative flex flex-col items-center justify-center w-14 h-14 outline-none"
          >
            {active && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl z-0"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
            <motion.div whileTap={{ scale: 0.9 }} className={cn(
              "flex flex-col items-center z-10 transition-colors duration-300",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <Icon className={cn("h-6 w-6 mb-1", active && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]")} strokeWidth={active ? 2.5 : 2} />
              <span className={cn("text-[10px] tracking-wide", active ? "font-bold" : "font-semibold")}>
                {item.label}
              </span>
            </motion.div>
          </NavLink>
        );
      })}
    </nav>
  );
}
