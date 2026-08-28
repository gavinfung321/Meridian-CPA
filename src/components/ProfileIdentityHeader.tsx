import { Camera, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { ProfileAvatar } from "./ProfileAvatar";
import { RoleBadge, StatusBadge } from "./RoleBadge";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useProfileAvatarUrl } from "../hooks/useProfileAvatarUrl";
import { getDisplayName } from "../lib/profile";
import {
  removeProfilePicture,
  uploadProfilePicture,
} from "../lib/profile-avatar";

interface ProfileIdentityHeaderProps {
  showPageTitle?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  onAvatarMessage?: (message: string | null) => void;
  onAvatarError?: (error: string | null) => void;
}

export function ProfileIdentityHeader({
  showPageTitle = false,
  pageTitle = "Profile",
  pageDescription,
  onAvatarMessage,
  onAvatarError,
}: ProfileIdentityHeaderProps): JSX.Element {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const avatarUrl = useProfileAvatarUrl(profile?.avatar_path);
  const displayName = getDisplayName(
    profile?.first_name,
    profile?.last_name,
    profile?.full_name,
  );

  const handleAvatarSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !profile) return;

    setAvatarUploading(true);
    onAvatarError?.(null);
    onAvatarMessage?.(null);

    const result = await uploadProfilePicture(profile.id, file, profile.avatar_path);
    setAvatarUploading(false);

    if (result.error) {
      onAvatarError?.(result.error);
      return;
    }

    await refreshProfile();
    onAvatarMessage?.("Profile picture updated.");
  };

  const handleAvatarRemove = async () => {
    if (!profile?.avatar_path) return;

    setAvatarUploading(true);
    onAvatarError?.(null);
    onAvatarMessage?.(null);

    const result = await removeProfilePicture(profile.id, profile.avatar_path);
    setAvatarUploading(false);

    if (result.error) {
      onAvatarError?.(result.error);
      return;
    }

    await refreshProfile();
    onAvatarMessage?.("Profile picture removed.");
  };

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="relative shrink-0">
        <ProfileAvatar
          avatarUrl={avatarUrl}
          firstName={profile?.first_name}
          lastName={profile?.last_name}
          size="lg"
          className="bg-[#C9A84C] text-[#0F2A1D]"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#EDECE6] bg-white text-[#0F2A1D] shadow-sm hover:bg-[#F9F9F6] disabled:opacity-50"
          aria-label="Change profile picture"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarSelect}
        />
      </div>

      <div className="min-w-0 flex-1">
        {showPageTitle ? (
          <>
            <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">{pageTitle}</h1>
            {pageDescription ? (
              <p className="mt-1 text-sm text-[#0F2A1D]/70">{pageDescription}</p>
            ) : null}
            <p className="mt-3 truncate text-lg font-semibold text-[#0F2A1D]">{displayName}</p>
          </>
        ) : (
          <h1 className="truncate font-serif text-2xl font-semibold text-[#0F2A1D] sm:text-3xl">
            {displayName}
          </h1>
        )}

        <p className="mt-1 truncate text-sm text-[#0F2A1D]/60">
          {profile?.email ?? user?.email}
        </p>

        {profile ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RoleBadge role={profile.role} />
            <StatusBadge status={profile.status} />
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
            className="border-[#EDECE6]"
          >
            {avatarUploading ? "Uploading..." : "Change photo"}
          </Button>
          {profile?.avatar_path ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarUploading}
              onClick={() => void handleAvatarRemove()}
              className="border-[#EDECE6] text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Remove photo
            </Button>
          ) : null}
        </div>

        <p className="mt-2 text-xs text-[#0F2A1D]/50">
          JPEG, PNG, WebP, or GIF. Max 2 MB.
        </p>
      </div>
    </div>
  );
}
