import { useEffect, useState } from "react";
import { getSignedProfilePictureUrl } from "../lib/profile-avatar";

export function useProfileAvatarUrl(
  avatarPath: string | null | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!avatarPath) {
      setUrl(null);
      return;
    }

    void getSignedProfilePictureUrl(avatarPath).then((signedUrl) => {
      if (active) setUrl(signedUrl);
    });

    return () => {
      active = false;
    };
  }, [avatarPath]);

  return url;
}
