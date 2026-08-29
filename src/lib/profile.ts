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

export function formatProfileJoinedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-HK", {
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function formatPhone(
  prefix: string | null | undefined,
  number: string | null | undefined,
): string | null {
  const combined = `${prefix ?? ""}${number ?? ""}`.trim();
  if (!combined) return null;
  if (prefix && number) return `${prefix} ${number}`;
  return combined;
}

export function formatAddress(profile: {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  county?: string | null;
  post_code?: string | null;
  country?: string | null;
}): string | null {
  const parts = [
    profile.address_line1,
    profile.address_line2,
    profile.city,
    profile.county,
    profile.post_code,
    profile.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}
