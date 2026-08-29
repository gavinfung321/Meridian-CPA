import { Bell, ChevronLeft, ChevronRight, Menu, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { MeridianLogo } from "./MeridianLogo";
import { ProfileMenu } from "./ProfileMenu";

export interface PortalNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface PortalLayoutProps {
  portalLabel: string;
  navItems: PortalNavItem[];
  profilePortal: "admin" | "client";
  quickActions?: ReactNode;
  children: ReactNode;
}

export function PortalLayout({
  portalLabel,
  navItems,
  profilePortal,
  quickActions,
  children,
}: PortalLayoutProps): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const sidebarOpenOnMobile = mobileOpen;
  const sidebarOpenOnDesktop = !desktopCollapsed;

  return (
    <div className="min-h-screen bg-[#F9F9F6] font-sans text-[#0F2A1D]">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#EDECE6] bg-[#0F2A1D] text-white transition-transform duration-200 lg:static lg:translate-x-0",
            sidebarOpenOnMobile ? "translate-x-0" : "-translate-x-full",
            desktopCollapsed && "lg:-ml-64 lg:overflow-hidden",
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
            <p className="text-xs uppercase tracking-wider text-white/50">{portalLabel}</p>
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
        </aside>

        {!sidebarOpenOnMobile ? (
          <button
            type="button"
            className="fixed left-0 top-24 z-50 flex h-10 w-7 items-center justify-center rounded-r-lg border border-l-0 border-[#EDECE6] bg-white text-[#0F2A1D] shadow-md transition-colors hover:bg-[#F9F9F6] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          className={cn(
            "fixed top-24 z-50 hidden h-10 w-7 items-center justify-center rounded-r-lg border border-l-0 border-[#EDECE6] bg-white text-[#0F2A1D] shadow-md transition-[left] duration-200 hover:bg-[#F9F9F6] lg:flex",
            sidebarOpenOnDesktop ? "left-64" : "left-0",
          )}
          onClick={() => setDesktopCollapsed((collapsed) => !collapsed)}
          aria-label={sidebarOpenOnDesktop ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpenOnDesktop ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu overlay"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#EDECE6] bg-white px-4 py-3 sm:gap-4 sm:px-6 lg:px-10">
            <button
              type="button"
              className="shrink-0 rounded-md p-2 hover:bg-[#F9F9F6] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              {quickActions}

              {quickActions ? (
                <div className="hidden h-6 w-px bg-[#EDECE6] sm:block" aria-hidden="true" />
              ) : null}

              <button
                type="button"
                disabled
                title="Notifications coming soon"
                aria-label="Notifications (coming soon)"
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/40"
              >
                <Bell className="h-4 w-4" />
              </button>

              <ProfileMenu variant="light" showName portal={profilePortal} />
            </div>
          </header>

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
