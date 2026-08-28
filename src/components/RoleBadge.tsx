import { BadgeCheck, Shield, User } from "lucide-react";
import type { UserRole, UserStatus } from "../types/database";
import { cn } from "../lib/utils";

const roleStyles: Record<UserRole, string> = {
  admin: "bg-[#0F2A1D] text-white",
  client: "bg-[#C9A84C] text-[#0F2A1D]",
  user: "bg-[#EDECE6] text-[#0F2A1D]",
};

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  client: BadgeCheck,
  user: User,
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const Icon = roleIcons[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        roleStyles[role],
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {role}
    </span>
  );
}

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        status === "active"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700",
        className,
      )}
    >
      {status}
    </span>
  );
}

interface MockupBannerProps {
  label?: string;
}

export function MockupBanner({
  label = "Mockup — data shown for layout testing only",
}: MockupBannerProps) {
  return (
    <div className="mb-6 rounded-lg border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-3 text-sm text-[#0F2A1D]/80">
      {label}
    </div>
  );
}
