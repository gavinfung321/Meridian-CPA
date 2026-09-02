const CALENDLY_SCRIPT_URL = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_STYLE_URL = "https://assets.calendly.com/assets/external/widget.css";
const SCRIPT_LOAD_TIMEOUT_MS = 12_000;

export type CalendlyUtmContent =
  | "hero-book-now"
  | "header-contact"
  | "services-cta"
  | "booking-banner"
  | "contact-section";

export interface CalendlyConfig {
  enabled: boolean;
  eventUrl: string;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  hideGdprBanner: boolean;
}

export interface CalendlyPopupOptions {
  utmContent: CalendlyUtmContent;
  prefill?: {
    name?: string;
    email?: string;
  };
}

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: {
        url: string;
        prefill?: CalendlyPopupOptions["prefill"];
        utm?: Record<string, string>;
      }) => void;
    };
  }
}

let assetsPromise: Promise<void> | null = null;

function trimEnv(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

function stripHash(hex: string): string {
  return hex.replace(/^#/, "");
}

export function getCalendlyConfig(): CalendlyConfig {
  // Vite only inlines env vars when accessed statically — not import.meta.env[variableName].
  const eventUrl =
    trimEnv(import.meta.env.VITE_CALENDLY_EVENT_URL) ??
    trimEnv(import.meta.env.VITE_CALENDLY_URL) ??
    "";
  const explicitEnabled = trimEnv(import.meta.env.VITE_CALENDLY_ENABLED);
  const enabled =
    explicitEnabled !== undefined
      ? parseBoolean(explicitEnabled, true)
      : Boolean(eventUrl);

  return {
    enabled: enabled && Boolean(eventUrl),
    eventUrl,
    primaryColor: stripHash(
      trimEnv(import.meta.env.VITE_CALENDLY_PRIMARY_COLOR) ??
        trimEnv(import.meta.env.VITE_BRAND_PRIMARY) ??
        "0F2A1D",
    ),
    textColor: stripHash(trimEnv(import.meta.env.VITE_CALENDLY_TEXT_COLOR) ?? "2C3E35"),
    backgroundColor: stripHash(
      trimEnv(import.meta.env.VITE_CALENDLY_BACKGROUND_COLOR) ??
        trimEnv(import.meta.env.VITE_BRAND_BG) ??
        "F9F9F6",
    ),
    hideGdprBanner: parseBoolean(
      trimEnv(import.meta.env.VITE_CALENDLY_HIDE_GDPR_BANNER),
      false,
    ),
  };
}

export function isCalendlyEnabled(): boolean {
  return getCalendlyConfig().enabled;
}

function buildStyledEventUrl(config: CalendlyConfig): string {
  const url = new URL(config.eventUrl);
  url.searchParams.set("primary_color", config.primaryColor);
  url.searchParams.set("text_color", config.textColor);
  url.searchParams.set("background_color", config.backgroundColor);
  url.searchParams.set("hide_landing_page_details", "1");
  if (config.hideGdprBanner) {
    url.searchParams.set("hide_gdpr_banner", "1");
  }
  return url.toString();
}

function buildUtm(utmContent: CalendlyUtmContent): Record<string, string> {
  return {
    utm_source: "meridian-site",
    utm_medium: "popup",
    utm_content: utmContent,
  };
}

function ensureCalendlyStyles(): void {
  if (document.querySelector(`link[href="${CALENDLY_STYLE_URL}"]`)) return;

  const link = document.createElement("link");
  link.href = CALENDLY_STYLE_URL;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

function loadCalendlyScript(): Promise<void> {
  if (window.Calendly) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CALENDLY_SCRIPT_URL}"]`,
    );

    if (existing) {
      if (window.Calendly) {
        resolve();
        return;
      }

      const onReady = () => {
        if (window.Calendly) resolve();
        else reject(new Error("Calendly script loaded but Calendly is unavailable"));
      };

      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Calendly script")),
        { once: true },
      );

      // Script may have finished loading before listeners were attached.
      window.setTimeout(() => {
        if (window.Calendly) resolve();
      }, 0);
      return;
    }

    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_URL;
    script.async = true;

    const timeoutId = window.setTimeout(() => {
      reject(new Error("Calendly script load timed out"));
    }, SCRIPT_LOAD_TIMEOUT_MS);

    script.onload = () => {
      window.clearTimeout(timeoutId);
      if (window.Calendly) resolve();
      else reject(new Error("Calendly script loaded but Calendly is unavailable"));
    };

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Failed to load Calendly script"));
    };

    document.head.appendChild(script);
  });
}

export function loadCalendlyAssets(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Calendly cannot load during SSR"));
  }

  if (window.Calendly) {
    ensureCalendlyStyles();
    return Promise.resolve();
  }

  if (!assetsPromise) {
    assetsPromise = (async () => {
      ensureCalendlyStyles();
      await loadCalendlyScript();
    })().catch((error) => {
      assetsPromise = null;
      throw error;
    });
  }

  return assetsPromise;
}

export async function openCalendlyPopupWidget(
  options: CalendlyPopupOptions,
): Promise<void> {
  const config = getCalendlyConfig();
  if (!config.enabled) {
    throw new Error("Calendly is disabled — set VITE_CALENDLY_URL in .env and restart the dev server");
  }

  await loadCalendlyAssets();

  if (!window.Calendly?.initPopupWidget) {
    throw new Error("Calendly popup API is unavailable");
  }

  window.Calendly.initPopupWidget({
    url: buildStyledEventUrl(config),
    prefill: options.prefill,
    utm: buildUtm(options.utmContent),
  });
}
