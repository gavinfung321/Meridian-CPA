export function buildFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function getDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  fullName?: string | null,
): string {
  const built = buildFullName(firstName ?? "", lastName ?? "");
  if (built) return built;
  return fullName?.trim() || "User";
}

export function getProfileInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}

export function getProfileAvatarUrl(
  avatarUrl?: string | null,
): string | null {
  if (!avatarUrl?.trim()) return null;
  return avatarUrl;
}

export function getPasswordResetRedirectUrl(): string {
  return `${window.location.origin}/reset-password`;
}
