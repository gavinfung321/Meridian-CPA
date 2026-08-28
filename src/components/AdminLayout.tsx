import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import { MeridianLogo } from "./MeridianLogo";
import { RoleBadge } from "./RoleBadge";
import { Button } from "./ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/sessions", label: "Sessions", icon: CalendarDays, end: false },
  { to: "/admin/bookings", label: "Bookings", icon: BarChart3, end: false },
  { to: "/admin/clients", label: "Clients", icon: Users, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9F9F6] font-sans text-[#0F2A1D]">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#EDECE6] bg-[#0F2A1D] text-white transition-transform lg:static lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <Link to="/" className="flex items-center gap-2">
              <MeridianLogo variant="light" className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Admin Console</p>
          </div>

          <nav className="flex-1 space-y-1 px-4">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#C9A84C] text-[#0F2A1D]"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 px-4 py-5">
            <div className="flex items-center gap-2 px-3">
              <p className="truncate text-sm font-medium">{profile?.full_name}</p>
              {profile ? <RoleBadge role={profile.role} /> : null}
            </div>
            <p className="truncate px-3 text-xs text-white/60">{profile?.email}</p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void signOut()}
              className="mt-3 w-full justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu overlay"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[#EDECE6] bg-white px-6 py-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-serif text-lg font-semibold">Admin</span>
            <MeridianLogo variant="dark" className="h-7 w-auto" />
          </header>

          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
