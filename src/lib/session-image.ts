import { supabase } from "./supabase";

export const SESSION_IMAGES_BUCKET = "session-images";
export const MAX_SESSION_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_SESSION_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

function getExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export function buildSessionImagePath(sessionId: string, file: File): string {
  return `${sessionId}/cover.${getExtension(file)}`;
}

export function validateSessionImage(file: File): string | null {
  if (
    !ALLOWED_SESSION_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_SESSION_IMAGE_TYPES)[number],
    )
  ) {
    return "Please upload a JPEG, PNG, or WebP image.";
  }

  if (file.size > MAX_SESSION_IMAGE_BYTES) {
    return "Session image must be 5 MB or smaller.";
  }

  return null;
}

export function getPublicSessionImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath?.trim()) return null;

  const { data } = supabase.storage.from(SESSION_IMAGES_BUCKET).getPublicUrl(imagePath);
  return data.publicUrl || null;
}

export async function uploadSessionImage(
  sessionId: string,
  file: File,
  currentPath?: string | null,
): Promise<{ path: string | null; error: string | null }> {
  const validationError = validateSessionImage(file);
  if (validationError) {
    return { path: null, error: validationError };
  }

  const nextPath = buildSessionImagePath(sessionId, file);

  if (currentPath && currentPath !== nextPath) {
    await supabase.storage.from(SESSION_IMAGES_BUCKET).remove([currentPath]);
  }

  const { error: uploadError } = await supabase.storage
    .from(SESSION_IMAGES_BUCKET)
    .upload(nextPath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { path: null, error: uploadError.message };
  }

  return { path: nextPath, error: null };
}

export async function removeSessionImage(
  currentPath?: string | null,
): Promise<{ error: string | null }> {
  if (!currentPath) return { error: null };

  const { error } = await supabase.storage.from(SESSION_IMAGES_BUCKET).remove([currentPath]);
  return { error: error?.message ?? null };
}
