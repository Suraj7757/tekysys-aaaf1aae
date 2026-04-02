import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderUserMenu } from "@/components/HeaderUserMenu";
import { WhatsAppHelpButton } from "@/components/WhatsAppHelpButton";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
            </div>
            <HeaderUserMenu />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
