import type { Language } from "./translations";

const STORAGE_KEY = "meridian.lang";

export function getStoredLanguage(): Language {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "en" || value === "zh") return value;
  } catch {
    // Ignore storage failures
  }
  return "en";
}

export function storeLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore
  }
}

export function localeForLanguage(lang: Language): "en-HK" | "zh-HK" {
  return lang === "zh" ? "zh-HK" : "en-HK";
}
