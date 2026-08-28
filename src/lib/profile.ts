export function buildFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function getPasswordResetRedirectUrl(): string {
  return `${window.location.origin}/reset-password`;
}
