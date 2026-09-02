import { useCallback } from "react";
import {
  CalendlyUtmContent,
  getCalendlyConfig,
  isCalendlyEnabled,
  openCalendlyPopupWidget,
} from "../lib/calendly";

interface UseCalendlyBookingOptions {
  onFallback?: () => void;
}

export function useCalendlyBooking(options: UseCalendlyBookingOptions = {}) {
  const { onFallback } = options;

  const openCalendlyPopup = useCallback(
    async (utmContent: CalendlyUtmContent) => {
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

      try {
        await openCalendlyPopupWidget({ utmContent });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[Calendly] Popup failed:", error);
        }
        onFallback?.();
      }
    },
    [onFallback],
  );

  return {
    openCalendlyPopup,
    calendlyEnabled: isCalendlyEnabled(),
  };
}
