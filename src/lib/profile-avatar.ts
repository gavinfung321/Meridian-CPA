import { supabase } from "./supabase";

export const PROFILE_PICTURES_BUCKET = "profile-pictures";
export const MAX_PROFILE_PICTURE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_PROFILE_PICTURE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

function getExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export function buildAvatarStoragePath(userId: string, file: File): string {
  return `${userId}/avatar.${getExtension(file)}`;
}

export function validateProfilePicture(file: File): string | null {
  if (!ALLOWED_PROFILE_PICTURE_TYPES.includes(file.type as (typeof ALLOWED_PROFILE_PICTURE_TYPES)[number])) {
    return "Please upload a JPEG, PNG, WebP, or GIF image.";
  }

  if (file.size > MAX_PROFILE_PICTURE_BYTES) {
    return "Profile picture must be 2 MB or smaller.";
  }

  return null;
}

export async function getSignedProfilePictureUrl(
  avatarPath: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!avatarPath?.trim()) return null;

  const { data, error } = await supabase.storage
    .from(PROFILE_PICTURES_BUCKET)
    .createSignedUrl(avatarPath, expiresIn);

  if (error) {
    console.error("Failed to load profile picture:", error.message);
    return null;
  }

  return data.signedUrl;
}

export async function uploadProfilePicture(
  userId: string,
  file: File,
  currentPath?: string | null,
): Promise<{ path: string | null; error: string | null }> {
  const validationError = validateProfilePicture(file);
  if (validationError) {
    return { path: null, error: validationError };
  }

  const nextPath = buildAvatarStoragePath(userId, file);

  if (currentPath && currentPath !== nextPath) {
    await supabase.storage.from(PROFILE_PICTURES_BUCKET).remove([currentPath]);
  }

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_PICTURES_BUCKET)
    .upload(nextPath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { path: null, error: uploadError.message };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_path: nextPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    return { path: null, error: profileError.message };
  }

  return { path: nextPath, error: null };
}

export async function removeProfilePicture(
  userId: string,
  currentPath?: string | null,
): Promise<{ error: string | null }> {
  if (currentPath) {
    const { error: storageError } = await supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .remove([currentPath]);

    if (storageError) {
      return { error: storageError.message };
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return { error: profileError?.message ?? null };
}
