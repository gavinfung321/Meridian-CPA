import { supabase } from "./supabase";
import type { Category, SessionType } from "../types/database";

export const adminInputClassName =
  "w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSessionTimeShort(startTime: string): string {
  return new Intl.DateTimeFormat("en-HK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startTime));
}

export function formatSessionTimeRange(startTime: string, endTime: string): string {
  return `${formatSessionTimeShort(startTime)} – ${formatSessionTimeShort(endTime)}`;
}

export function formatSessionDateLong(startTime: string): string {
  return new Intl.DateTimeFormat("en-HK", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date(startTime));
}

export function startOfWeek(date: Date, weekStartsOn = 1): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const day = value.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  value.setDate(value.getDate() - diff);
  return value;
}

export function addCalendarDays(date: Date, days: number): Date {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addCalendarDays(weekStart, 6);
  const dayFormatter = new Intl.DateTimeFormat("en-HK", { month: "short", day: "numeric" });
  const yearFormatter = new Intl.DateTimeFormat("en-HK", { year: "numeric" });

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${dayFormatter.format(weekStart)} – ${weekEnd.getDate()}, ${yearFormatter.format(weekStart)}`;
  }

  return `${dayFormatter.format(weekStart)} – ${dayFormatter.format(weekEnd)}, ${yearFormatter.format(weekEnd)}`;
}

export function filterSessionsBySearch<
  T extends {
    title: string;
    description?: string | null;
    location: string;
    type: string;
    session_type?: { name: string; category?: { name: string } | null } | null;
  },
>(sessions: T[], query: string): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return sessions;

  return sessions.filter((session) => {
    const typeLabel =
      session.session_type?.category?.name && session.session_type?.name
        ? `${session.session_type.category.name} ${session.session_type.name}`
        : (session.session_type?.name ?? session.type);

    const haystack = [session.title, session.description, session.location, typeLabel]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function formatSessionSchedule(startTime: string): string {
  return new Intl.DateTimeFormat("en-HK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(startTime));
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type SessionTypeWithCategory = SessionType & {
  category: Category | null;
};

export async function fetchSessionTypesWithCategories(): Promise<SessionTypeWithCategory[]> {
  const { data, error } = await supabase
    .from("session_types")
    .select("*, category:categories(*)")
    .order("name");

  if (error) throw error;
  return (data ?? []) as SessionTypeWithCategory[];
}

export type SessionBookingCounts = {
  confirmed: number;
  pending: number;
  reserved: number;
};

export function getSessionBookingCounts(
  bookings: Array<{ status: string }> | null | undefined,
): SessionBookingCounts {
  const rows = bookings ?? [];
  const confirmed = rows.filter((booking) => booking.status === "confirmed").length;
  const pending = rows.filter((booking) => booking.status === "pending").length;
  return { confirmed, pending, reserved: confirmed + pending };
}

export function countActiveBookings(
  bookings: Array<{ status: string }> | null | undefined,
): number {
  return getSessionBookingCounts(bookings).reserved;
}

export type AdminSessionCapacityDisplay = {
  primary: string;
  subline?: string;
  title?: string;
};

export function formatAdminSessionCapacity(
  counts: SessionBookingCounts,
  maxSlots: number,
): AdminSessionCapacityDisplay {
  const primary = `${counts.reserved} / ${maxSlots}`;

  if (counts.pending > 0) {
    const subline =
      counts.pending === 1 ? "1 awaiting approval" : `${counts.pending} awaiting approval`;
    const detailParts: string[] = [];
    if (counts.confirmed > 0) {
      detailParts.push(`${counts.confirmed} confirmed`);
    }
    detailParts.push(subline);
    return {
      primary,
      subline,
      title: `${counts.reserved} of ${maxSlots} slots held (${detailParts.join(" · ")})`,
    };
  }

  return {
    primary,
    title:
      counts.confirmed > 0
        ? `${counts.confirmed} confirmed of ${maxSlots} slots`
        : undefined,
  };
}
