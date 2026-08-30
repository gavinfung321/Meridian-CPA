import { useCallback, useEffect, useState } from "react";
import { fetchAdminPendingBookingsCount } from "../lib/admin-dashboard";

export function useAdminPendingBookingsCount(enabled = true): number {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const next = await fetchAdminPendingBookingsCount();
      setCount(next);
    } catch {
      // Keep last known count on transient errors.
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
    if (!enabled) return;

    const interval = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(interval);
  }, [enabled, refresh]);

  return count;
}
