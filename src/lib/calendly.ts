const CALENDLY_SCRIPT_URL = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_STYLE_URL = "https://assets.calendly.com/assets/external/widget.css";
const SCRIPT_LOAD_TIMEOUT_MS = 12_000;

/** Meridian brand tokens — keep in sync with site CSS */
export const MERIDIAN_BRAND = {
  primary: "0F2A1D",
  accent: "C9A84C",
  background: "F9F9F6",
  text: "2C3E35",
} as const;

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
  useBrandFilter: boolean;
}

export interface CalendlyPrefill {
  name?: string;
  email?: string;
  customAnswers?: Record<string, string>;
}

export interface BookCallPreflightData {
  name: string;
  email: string;
  /** Must exactly match a Calendly Objective dropdown option (see serviceLines in translations). */
  objective: string;
  briefContext: string;
}

export type BookCallServiceLine = "audit" | "tax" | "bookkeeping" | "secretarial" | "advisory";

export interface CalendlyPageSettings {
  backgroundColor?: string;
  hideEventTypeDetails?: boolean;
  hideLandingPageDetails?: boolean;
  hideGdprBanner?: boolean;
  primaryColor?: string;
  textColor?: string;
}

export interface CalendlyEmbedOptions {
  utmContent: CalendlyUtmContent;
  prefill?: CalendlyPrefill;
}

export interface CalendlyInlineOptions extends CalendlyEmbedOptions {
  parentElement: HTMLElement;
}

export function toCalendlyPrefill(data: BookCallPreflightData): CalendlyPrefill {
  const prefill: CalendlyPrefill = {
    name: data.name.trim(),
    email: data.email.trim(),
    customAnswers: {
      // Maps to Calendly invitee questions in order: 1) Objective, 2) Brief Context
      a1: data.objective.trim(),
    },
  };

  const briefContext = data.briefContext.trim();
  if (briefContext) {
    prefill.customAnswers!.a2 = briefContext;
  }

  return prefill;
}

declare global {
  interface Window {
    Calendly?: {
      q?: unknown[];
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: CalendlyPrefill;
        utm?: Record<string, string>;
        pageSettings?: CalendlyPageSettings;
        resize?: boolean;
      }) => void;
      initPopupWidget: (options: {
        url: string;
        prefill?: CalendlyPrefill;
        utm?: Record<string, string>;
        pageSettings?: CalendlyPageSettings;
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
        MERIDIAN_BRAND.primary,
    ),
    textColor: stripHash(
      trimEnv(import.meta.env.VITE_CALENDLY_TEXT_COLOR) ?? MERIDIAN_BRAND.text,
    ),
    backgroundColor: stripHash(
      trimEnv(import.meta.env.VITE_CALENDLY_BACKGROUND_COLOR) ??
        trimEnv(import.meta.env.VITE_BRAND_BG) ??
        MERIDIAN_BRAND.background,
    ),
    hideGdprBanner: parseBoolean(
      trimEnv(import.meta.env.VITE_CALENDLY_HIDE_GDPR_BANNER),
      false,
    ),
    useBrandFilter: parseBoolean(trimEnv(import.meta.env.VITE_CALENDLY_BRAND_FILTER), true),
  };
}

/** Full event URL with brand query params — useful for debugging in the browser. */
export function getCalendlyBrandedEventUrl(): string {
  return buildStyledEventUrl(getCalendlyConfig());
}

export function isCalendlyEnabled(): boolean {
  return getCalendlyConfig().enabled;
}

function buildStyledEventUrl(config: CalendlyConfig): string {
  const url = new URL(config.eventUrl);
  url.searchParams.set("primary_color", config.primaryColor);
  url.searchParams.set("text_color", config.textColor);
  url.searchParams.set("background_color", config.backgroundColor);
  url.searchParams.set("hide_event_type_details", "1");
  // embed_domain + embed_type are appended by widget.js — do not set manually.
  if (config.hideGdprBanner) {
    url.searchParams.set("hide_gdpr_banner", "1");
  }
  return url.toString();
}

function buildPageSettings(config: CalendlyConfig): CalendlyPageSettings {
  return {
    backgroundColor: config.backgroundColor,
    textColor: config.textColor,
    primaryColor: config.primaryColor,
    hideEventTypeDetails: true,
    hideLandingPageDetails: true,
    hideGdprBanner: config.hideGdprBanner,
  };
}

function buildUtm(
  utmContent: CalendlyUtmContent,
  medium: "popup" | "inline" = "inline",
): Record<string, string> {
  return {
    utm_source: "meridian-site",
    utm_medium: medium,
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

const CALENDLY_INIT_POLL_MS = 50;

function isCalendlyStub(): boolean {
  return Boolean(window.Calendly?.q && Array.isArray(window.Calendly.q));
}

/** True once widget.js has replaced the loader stub with the real API. */
function isCalendlyReady(): boolean {
  return typeof window.Calendly?.initInlineWidget === "function" && !isCalendlyStub();
}

function waitForCalendlyApi(): Promise<void> {
  if (isCalendlyReady()) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const started = Date.now();

    const poll = window.setInterval(() => {
      if (isCalendlyReady()) {
        window.clearInterval(poll);
        resolve();
        return;
      }

      if (Date.now() - started >= SCRIPT_LOAD_TIMEOUT_MS) {
        window.clearInterval(poll);
        reject(new Error("Calendly failed to initialize"));
      }
    }, CALENDLY_INIT_POLL_MS);
  });
}

/** Clears a broken Calendly script so the widget can load again after a failed init. */
export function resetCalendlyScript(): void {
  assetsPromise = null;
  document
    .querySelectorAll(`script[src="${CALENDLY_SCRIPT_URL}"]`)
    .forEach((node) => node.remove());
  delete window.Calendly;
}

function injectCalendlyScript(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_URL;
    script.async = true;

    const timeoutId = window.setTimeout(() => {
      reject(new Error("Calendly script load timed out"));
    }, SCRIPT_LOAD_TIMEOUT_MS);

    script.onload = () => {
      window.clearTimeout(timeoutId);
      waitForCalendlyApi().then(resolve).catch(reject);
    };

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Failed to load Calendly script"));
    };

    document.head.appendChild(script);
  });
}

function loadCalendlyScript(): Promise<void> {
  if (isCalendlyReady()) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${CALENDLY_SCRIPT_URL}"]`,
  );

  if (existing) {
    return waitForCalendlyApi().catch(() => {
      resetCalendlyScript();
      return injectCalendlyScript();
    });
  }

  return injectCalendlyScript();
}

export function loadCalendlyAssets(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Calendly cannot load during SSR"));
  }

  if (isCalendlyReady()) {
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

export async function initCalendlyInlineWidget(
  options: CalendlyInlineOptions,
): Promise<void> {
  const config = getCalendlyConfig();
  if (!config.enabled) {
    throw new Error("Calendly is disabled — set VITE_CALENDLY_URL in .env and restart the dev server");
  }

  await loadCalendlyAssets();

  if (!window.Calendly?.initInlineWidget) {
    throw new Error("Calendly inline API is unavailable");
  }

  options.parentElement.innerHTML = "";
  options.parentElement.style.backgroundColor = `#${config.backgroundColor}`;
  options.parentElement.style.overflowY = "hidden";
  options.parentElement.className = "book-call-calendly-embed h-full w-full min-h-0";
  options.parentElement.classList.toggle("book-call-calendly-brand-filter", config.useBrandFilter);

  const styledUrl = buildStyledEventUrl(config);

  window.Calendly.initInlineWidget({
    url: styledUrl,
    parentElement: options.parentElement,
    prefill: options.prefill,
    utm: buildUtm(options.utmContent, "inline"),
    pageSettings: buildPageSettings(config),
  });

  if (import.meta.env.DEV) {
    console.info("[Calendly] Inline embed initialized with Meridian branding", {
      primaryColor: `#${config.primaryColor}`,
      backgroundColor: `#${config.backgroundColor}`,
      textColor: `#${config.textColor}`,
      brandFilter: config.useBrandFilter,
      testUrl: styledUrl,
      note: "If colors stay blue, enable Calendly Standard+ branding or set brand color in Calendly admin → Account → Branding.",
    });
  }
}

export function destroyCalendlyInlineWidget(parentElement: HTMLElement | null): void {
  if (parentElement) {
    parentElement.innerHTML = "";
    parentElement.classList.remove("book-call-calendly-brand-filter");
  }
}
