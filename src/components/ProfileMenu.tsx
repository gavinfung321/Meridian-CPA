import { ChevronDown, LayoutDashboard, LogOut, Shield, User } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProfileAvatarUrl } from "../hooks/useProfileAvatarUrl";
import { isAdminRole, isDashboardUserRole } from "../lib/auth-routes";
import { getDisplayName } from "../lib/profile";
import { Language, translations } from "../lib/translations";
import { cn } from "../lib/utils";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfileMenuPortal = "admin" | "client" | "public";

interface ProfileMenuProps {
  lang?: Language;
  onNavigate?: () => void;
  variant?: "dark" | "light";
  showName?: boolean;
  portal?: ProfileMenuPortal;
}

function getProfilePath(portal: ProfileMenuPortal): string {
  if (portal === "admin") return "/admin/profile";
  if (portal === "client") return "/dashboard/profile";
  return "/profile";
}

export function ProfileMenu({
  lang = "en",
  onNavigate,
  variant = "dark",
  showName = false,
  portal = "public",
}: ProfileMenuProps): JSX.Element {
  const t = translations[lang].nav;
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const avatarUrl = useProfileAvatarUrl(profile?.avatar_path);
  const displayName = getDisplayName(
    profile?.first_name,
    profile?.last_name,
    profile?.full_name,
  );
  const email = profile?.email ?? user?.email ?? "";
  const profilePath = getProfilePath(portal);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    onNavigate?.();
  };

  const handleLogOut = async () => {
    closeMenu();
    await signOut();
  };

  const triggerClassName =
    variant === "dark"
      ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
      : "border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D] hover:bg-[#EDECE6]";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className={cn(
          "flex items-center border transition-colors",
          showName
            ? "h-10 max-w-[200px] gap-2 rounded-full pl-1 pr-2.5 sm:max-w-[240px] sm:pr-3"
            : "h-9 w-9 justify-center overflow-hidden rounded-full",
          triggerClassName,
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={showName ? `${t.profileMenu} — ${displayName}` : t.profileMenu}
        onClick={() => setOpen((current) => !current)}
      >
        <ProfileAvatar
          avatarUrl={avatarUrl}
          firstName={profile?.first_name}
          lastName={profile?.last_name}
          size="sm"
          className={cn(
            "border-0 bg-[#C9A84C] text-[#0F2A1D]",
            showName ? "h-8 w-8" : "h-full w-full",
          )}
        />
        {showName ? (
          <>
            <span className="min-w-0 truncate text-sm font-medium">{displayName}</span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-[#EDECE6] bg-white shadow-lg"
        >
          <div className="border-b border-[#EDECE6] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[#0F2A1D]">{displayName}</p>
            <p className="truncate text-xs text-[#0F2A1D]/60">{email}</p>
          </div>

          <Link
            to={profilePath}
            role="menuitem"
            onClick={closeMenu}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F2A1D] hover:bg-[#F9F9F6]"
          >
            <User className="h-4 w-4" />
            {t.profile}
          </Link>

          {isDashboardUserRole(profile?.role) ? (
            <Link
              to="/dashboard"
              role="menuitem"
              onClick={closeMenu}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F2A1D] hover:bg-[#F9F9F6]"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t.dashboard}
            </Link>
          ) : null}

          {isAdminRole(profile?.role) ? (
            <Link
              to="/admin"
              role="menuitem"
              onClick={closeMenu}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F2A1D] hover:bg-[#F9F9F6]"
            >
              <Shield className="h-4 w-4" />
              {t.admin}
            </Link>
          ) : null}

          <div className="border-t border-[#EDECE6]">
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogOut()}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t.logOut}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
