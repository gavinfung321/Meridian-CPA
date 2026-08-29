import { CalendarDays, LayoutDashboard, User } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "./PortalLayout";
import { Button } from "./ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/bookings", label: "Bookings", icon: CalendarDays, end: false },
  { to: "/dashboard/profile", label: "Profile", icon: User, end: false },
];

export function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  const quickActions = (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="border-[#0F2A1D] text-[#0F2A1D] hover:bg-[#0F2A1D]/5"
    >
      <Link to="/#booking">Book a session</Link>
    </Button>
  );

  return (
    <PortalLayout
      portalLabel="Client Portal"
      navItems={navItems}
      profilePortal="client"
      quickActions={quickActions}
    >
      {children}
    </PortalLayout>
  );
}
