// ...imports remain same
const secondaryItems = [
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Sells", url: "/sells", icon: CreditCard },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Trash", url: "/trash", icon: Trash2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { role } = useAuth();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar pt-4">
        {/* header/logo */}
        {/* Main Menu group unchanged */}
        {/* Management group uses secondaryItems.map(...) */}
        {/* NOTE: removed the role === 'admin' Users menu block entirely */}
      </SidebarContent>
    </Sidebar>
  );
}
