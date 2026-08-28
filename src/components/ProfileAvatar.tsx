import { cn } from "../lib/utils";
import { getProfileInitials } from "../lib/profile";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: "sm" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  lg: "h-20 w-20 text-2xl",
};

export function ProfileAvatar({
  avatarUrl,
  firstName,
  lastName,
  size = "sm",
  className,
}: ProfileAvatarProps): JSX.Element {
  const initials = getProfileInitials(firstName, lastName);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#EDECE6] bg-[#0F2A1D] font-semibold text-white",
        sizeClasses[size],
        className,
      )}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
