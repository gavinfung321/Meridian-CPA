import { ProfileAvatar } from "../../components/ProfileAvatar";
import { useProfileAvatarUrl } from "../../hooks/useProfileAvatarUrl";
import type { Profile } from "../../types/database";

interface AdminClientAvatarProps {
  profile: Pick<Profile, "avatar_path" | "first_name" | "last_name">;
}

export function AdminClientAvatar({ profile }: AdminClientAvatarProps): JSX.Element {
  const avatarUrl = useProfileAvatarUrl(profile.avatar_path);

  return (
    <ProfileAvatar
      avatarUrl={avatarUrl}
      firstName={profile.first_name}
      lastName={profile.last_name}
      size="sm"
      className="bg-[#C9A84C] text-[#0F2A1D]"
    />
  );
}
