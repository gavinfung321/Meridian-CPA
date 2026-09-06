import { useCallback, useState } from "react";
import { CalendlyUtmContent, getCalendlyConfig, isCalendlyEnabled } from "../lib/calendly";

interface UseCalendlyBookingOptions {
  onFallback?: () => void;
}

export function useCalendlyBooking(options: UseCalendlyBookingOptions = {}) {
  const { onFallback } = options;
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [preflightUtm, setPreflightUtm] = useState<CalendlyUtmContent | null>(null);

  const requestBookCall = useCallback(
    (utmContent: CalendlyUtmContent) => {
      if (!isCalendlyEnabled()) {
        if (import.meta.env.DEV) {
          const config = getCalendlyConfig();
          console.warn(
            "[Calendly] Disabled — add VITE_CALENDLY_URL to .env, save the file, and restart npm run dev",
            { eventUrl: config.eventUrl || "(empty)" },
          );
        }
        onFallback?.();
        return;
      }

      setPreflightUtm(utmContent);
      setPreflightOpen(true);
    },
    [onFallback],
  );

  const cancelPreflight = useCallback(() => {
    setPreflightOpen(false);
    setPreflightUtm(null);
  }, []);

  return {
    requestBookCall,
    preflightOpen,
    preflightUtm,
    cancelPreflight,
    calendlyEnabled: isCalendlyEnabled(),
  };
}
