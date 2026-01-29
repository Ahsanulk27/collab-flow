import { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-aqua-gradient">
      <DashboardSidebar />
      
      <main className="ml-0 md:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/40 backdrop-blur-xl border-b border-white/30 px-4 py-3 md:px-8 md:py-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces..."
              className="pl-10 bg-white/60"
            />
          </div>
        </header>
        
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
