const STORAGE_KEY = "meridian.pendingBookSessionId";

export function setPendingBookSessionId(sessionId: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

export function getPendingBookSessionId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearPendingBookSessionId(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
