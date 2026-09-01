/** Minimum password length enforced in signup / reset forms. */
export const MIN_PASSWORD_LENGTH = 6;

export function validatePasswordLength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}
