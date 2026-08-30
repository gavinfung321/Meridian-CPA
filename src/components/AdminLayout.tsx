import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ManualBookingModal } from "../screens/Admin/ManualBookingModal";
import { AdminNotificationBell } from "./AdminNotificationBell";
import { AdminQuickActionMenu } from "./AdminQuickActionMenu";
import { PortalLayout } from "./PortalLayout";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/sessions", label: "Sessions", icon: CalendarDays, end: false },
  { to: "/admin/bookings", label: "Bookings", icon: BarChart3, end: false },
  { to: "/admin/clients", label: "Clients", icon: Users, end: false },
  { to: "/admin/profile", label: "Profile", icon: User, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

export function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const [manualBookingOpen, setManualBookingOpen] = useState(false);

  return (
    <>
      <PortalLayout
        portalLabel="Admin Console"
        navItems={navItems}
        profilePortal="admin"
        quickActions={
          <AdminQuickActionMenu onManualBooking={() => setManualBookingOpen(true)} />
        }
        notifications={<AdminNotificationBell />}
      >
        {children}
      </PortalLayout>

      <ManualBookingModal
        open={manualBookingOpen}
        onClose={() => setManualBookingOpen(false)}
        onCreated={() => undefined}
      />
    </>
  );
}
