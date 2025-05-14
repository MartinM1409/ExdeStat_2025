import { useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, X, User, Settings } from "lucide-react";
import Sidebar from "@/components/sidebar";
import logoPath from "@assets/Logo_USMF_80 cerc 2025 color.png";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin, isSemiAdmin } = useAuth();
  const [, navigate] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow-md z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={logoPath} alt="University Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-bold font-heading">Examen de Stat 2025</h1>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-white hover:bg-primary/90 px-2">
                  <span className="mr-1">{user?.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(isAdmin || isSemiAdmin) && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar - hidden on mobile by default */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:static md:translate-x-0 z-20 h-[calc(100vh-56px)] w-64 transition-transform duration-300 ease-in-out md:transition-none`}
        >
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Close sidebar overlay on mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>

        {/* Mobile sidebar toggle */}
        <button
          className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg md:hidden z-20"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}
