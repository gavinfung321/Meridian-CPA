import { supabase } from "./supabase";

export const BOOKING_SETTINGS_KEY = "booking";
export const DEFAULT_MAX_BOOKING_DAYS_ADVANCE = 90;
export const MIN_MAX_BOOKING_DAYS_ADVANCE = 1;
export const MAX_MAX_BOOKING_DAYS_ADVANCE = 365;

export type BookingAppSettings = {
  max_booking_days_advance: number;
};

function normalizeMaxBookingDays(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_MAX_BOOKING_DAYS_ADVANCE;
  return Math.min(
    MAX_MAX_BOOKING_DAYS_ADVANCE,
    Math.max(MIN_MAX_BOOKING_DAYS_ADVANCE, Math.round(parsed)),
  );
}

export function getMaxBookableCutoff(maxDays: number): Date {
  const cutoff = new Date();
  cutoff.setHours(23, 59, 59, 999);
  cutoff.setDate(cutoff.getDate() + maxDays);
  return cutoff;
}

export function isSessionWithinBookingWindow(startTime: string, maxDays: number): boolean {
  return new Date(startTime).getTime() <= getMaxBookableCutoff(maxDays).getTime();
}

export async function fetchBookingAppSettings(): Promise<BookingAppSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", BOOKING_SETTINGS_KEY)
    .maybeSingle();

  if (error) throw error;

  const value = data?.value as Record<string, unknown> | undefined;
  return {
    max_booking_days_advance: normalizeMaxBookingDays(value?.max_booking_days_advance),
  };
}

export async function updateBookingAppSettings(
  maxBookingDaysAdvance: number,
  updatedBy: string,
): Promise<{ error: string | null }> {
  const max_booking_days_advance = normalizeMaxBookingDays(maxBookingDaysAdvance);

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: BOOKING_SETTINGS_KEY,
      value: { max_booking_days_advance },
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    },
    { onConflict: "key" },
  );

  return { error: error?.message ?? null };
}
