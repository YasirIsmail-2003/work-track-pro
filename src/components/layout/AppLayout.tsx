import { Link, useLocation, Outlet } from "react-router-dom";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface AppLayoutProps {
  role: "employee" | "admin";
}

export function AppLayout({ role }: AppLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const employeeLinks = [
    { path: "/app/employee", label: "Dashboard" },
    { path: "/app/employee/tasks", label: "Tasks" },
    { path: "/app/employee/time", label: "Time Tracking" },
    { path: "/app/employee/timesheets", label: "Timesheets" },
    { path: "/app/employee/leave", label: "Leave" },
  ];

  const adminLinks = [
    { path: "/app/admin", label: "Dashboard" },
    { path: "/app/admin/now", label: "Live Now" },
    { path: "/app/admin/employees", label: "Employees" },
    { path: "/app/admin/onboarding", label: "Onboarding" },
    { path: "/app/admin/tasks", label: "Tasks" },
    { path: "/app/admin/clients", label: "Clients" },
    { path: "/app/admin/timesheets", label: "Timesheets" },
  ];

  const links = role === "employee" ? employeeLinks : adminLinks;

  const NavLinks = () => (
    <>
      {links.map((link) => {
        const isActive = location.pathname === link.path || 
          (link.path !== `/app/${role}` && location.pathname.startsWith(link.path));
        
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo (drop your logo image at /public/logo-worktrack.png) */}
            <Link to={`/app/${role}`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-primary flex items-center justify-center">
                  <img src="/logo-worktrack.png" alt="WorkTrack Pro" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg">WorkTrack Pro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLinks />
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-xs">
                  3
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">
                        {role === "employee" ? "Employee" : "Administrator"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Preferences</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu trigger */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col gap-2 mt-8">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}