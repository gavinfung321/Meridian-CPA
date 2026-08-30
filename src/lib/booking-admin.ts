import { assertSessionBookable } from "./client-bookings";
import { formatSessionSchedule, formatPrice } from "./session-admin";
import { getDisplayName } from "./profile";
import { supabase } from "./supabase";
import type { BookingStatus } from "../types/database";

export type BookingStatusFilter = "all" | BookingStatus;

export type BookingDateRangeFilter = "all" | "today" | "week" | "month" | "custom";

export const BOOKING_STATUS_FILTER_OPTIONS: Array<{ id: BookingStatusFilter; label: string }> = [
  { id: "all", label: "All statuses" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "rejected", label: "Rejected" },
];

export const BOOKING_DATE_RANGE_OPTIONS: Array<{
  id: BookingDateRangeFilter;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "custom", label: "Custom" },
];

export const bookingStatusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  rejected: "bg-gray-100 text-gray-600",
};

export type AdminBookingRow = {
  id: string;
  status: BookingStatus;
  cancel_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  session: {
    id: string;
    title: string;
    start_time: string;
    price: number;
    location: string | null;
    session_type: {
      id: string;
      name: string;
      category: { name: string } | null;
    } | null;
  } | null;
};

export const ADMIN_BOOKING_SELECT = `
  id,
  status,
  cancel_reason,
  cancelled_at,
  created_at,
  user:profiles!bookings_user_id_fkey (
    id,
    first_name,
    last_name,
    email
  ),
  session:sessions!bookings_session_id_fkey (
    id,
    title,
    start_time,
    price,
    location,
    session_type:session_types (
      id,
      name,
      category:categories ( name )
    )
  )
`;

export async function fetchAdminPendingBookings(limit = 8): Promise<{
  bookings: AdminBookingRow[];
  total: number;
}> {
  const { data, error, count } = await supabase
    .from("bookings")
    .select(ADMIN_BOOKING_SELECT, { count: "exact" })
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return {
    bookings: (data ?? []) as AdminBookingRow[],
    total: count ?? 0,
  };
}

export function formatBookingRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return formatBookingCreatedDate(iso);
}

const HK_TIMEZONE = "Asia/Hong_Kong";

function toHKDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const read = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: read("year"), month: read("month"), day: read("day") };
}

function hkDateKey(date: Date): string {
  const { year, month, day } = toHKDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function startOfHKWeek(date: Date): string {
  const { year, month, day } = toHKDateParts(date);
  const utcGuess = new Date(Date.UTC(year, month - 1, day));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: HK_TIMEZONE,
    weekday: "short",
  }).format(date);

  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const daysFromMonday = (weekdayIndex + 6) % 7;
  utcGuess.setUTCDate(utcGuess.getUTCDate() - daysFromMonday);
  return hkDateKey(utcGuess);
}

function addHKDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return hkDateKey(next);
}

export function matchesBookingDateRange(
  sessionStartTime: string | undefined,
  range: BookingDateRangeFilter,
  customFrom: string,
  customTo: string,
): boolean {
  if (range === "all" || !sessionStartTime) return range === "all";

  const sessionDate = new Date(sessionStartTime);
  const now = new Date();
  const sessionKey = hkDateKey(sessionDate);
  const todayKey = hkDateKey(now);

  if (range === "today") return sessionKey === todayKey;

  if (range === "week") {
    const weekStart = startOfHKWeek(now);
    const weekEnd = addHKDays(weekStart, 6);
    return sessionKey >= weekStart && sessionKey <= weekEnd;
  }

  if (range === "month") {
    const sessionParts = toHKDateParts(sessionDate);
    const nowParts = toHKDateParts(now);
    return sessionParts.year === nowParts.year && sessionParts.month === nowParts.month;
  }

  if (range === "custom") {
    if (customFrom && sessionKey < customFrom) return false;
    if (customTo && sessionKey > customTo) return false;
    return true;
  }

  return true;
}

export function matchesBookingSearch(booking: AdminBookingRow, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const name = getBookingClientName(booking).toLowerCase();
  const email = booking.user?.email?.toLowerCase() ?? "";
  const sessionTitle = booking.session?.title?.toLowerCase() ?? "";

  return (
    name.includes(normalized) ||
    email.includes(normalized) ||
    sessionTitle.includes(normalized)
  );
}

export function filterAdminBookings(
  bookings: AdminBookingRow[],
  statusFilter: BookingStatusFilter,
  sessionTypeFilter: string,
  dateRange: BookingDateRangeFilter,
  customFrom: string,
  customTo: string,
  searchQuery = "",
): AdminBookingRow[] {
  return bookings.filter((booking) => {
    if (statusFilter !== "all" && booking.status !== statusFilter) return false;

    if (sessionTypeFilter !== "all") {
      const typeId = booking.session?.session_type?.id;
      if (typeId !== sessionTypeFilter) return false;
    }

    if (
      !matchesBookingDateRange(
        booking.session?.start_time,
        dateRange,
        customFrom,
        customTo,
      )
    ) {
      return false;
    }

    if (!matchesBookingSearch(booking, searchQuery)) return false;

    return true;
  });
}

export function getBookingClientName(booking: AdminBookingRow): string {
  const user = booking.user;
  if (!user) return "Unknown client";
  return getDisplayName(
    user.first_name,
    user.last_name,
    `${user.first_name} ${user.last_name}`.trim(),
  );
}

export function formatBookingSessionDate(startTime: string | undefined): string {
  if (!startTime) return "—";
  return formatSessionSchedule(startTime);
}

export function formatBookingCreatedDate(createdAt: string): string {
  return new Intl.DateTimeFormat("en-HK", {
    dateStyle: "medium",
  }).format(new Date(createdAt));
}

export function formatBookingShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-HK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function getBookingSessionTypeLabel(booking: AdminBookingRow): string {
  const typeName = booking.session?.session_type?.name;
  const categoryName = booking.session?.session_type?.category?.name;
  if (typeName && categoryName) return `${categoryName} · ${typeName}`;
  return typeName ?? "—";
}

export function formatBookingPrice(price: number | undefined): string {
  if (price === undefined) return "—";
  return formatPrice(price);
}

export function formatBookingId(id: string): string {
  return `#${id.replace(/-/g, "").slice(0, 8)}`;
}

export function formatBookingLongSessionDate(startTime: string | undefined): string {
  if (!startTime) return "—";
  return new Intl.DateTimeFormat("en-HK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startTime));
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  reason?: string,
): Promise<void> {
  const payload: {
    status: BookingStatus;
    updated_at: string;
    cancel_reason?: string | null;
    cancelled_at?: string | null;
  } = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "rejected" || status === "cancelled") {
    payload.cancel_reason = reason?.trim() || null;
    payload.cancelled_at = new Date().toISOString();
  } else if (status === "confirmed") {
    payload.cancel_reason = null;
    payload.cancelled_at = null;
  }

  const { error } = await supabase.from("bookings").update(payload).eq("id", bookingId);
  if (error) throw error;
}

export function canManageBookingStatus(status: BookingStatus): boolean {
  return status === "pending" || status === "confirmed";
}

export function getBookingActionHint(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "Approve · Reject";
    case "confirmed":
      return "Cancel";
    default:
      return "—";
  }
}

export function hasActiveBookingFilters(
  statusFilter: BookingStatusFilter,
  sessionTypeFilter: string,
  dateRange: BookingDateRangeFilter,
  customFrom: string,
  customTo: string,
  searchQuery = "",
): boolean {
  return (
    statusFilter !== "all" ||
    sessionTypeFilter !== "all" ||
    dateRange !== "all" ||
    Boolean(customFrom) ||
    Boolean(customTo) ||
    Boolean(searchQuery.trim())
  );
}

export type ManualBookingClient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export type ManualBookingSession = {
  id: string;
  title: string;
  start_time: string;
  price: number;
  max_slots: number;
  is_cancelled: boolean;
  bookings: Array<{ status: string; user_id: string }> | null;
};

export async function fetchManualBookingClients(): Promise<ManualBookingClient[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("role", ["user", "client"])
    .eq("status", "active")
    .order("first_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ManualBookingClient[];
}

export async function fetchManualBookingSessions(): Promise<ManualBookingSession[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      id,
      title,
      start_time,
      price,
      max_slots,
      is_cancelled,
      bookings ( status, user_id )
    `)
    .eq("is_cancelled", false)
    .gt("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ManualBookingSession[];
}

export async function createAdminBooking(
  userId: string,
  sessionId: string,
  status: "pending" | "confirmed" = "confirmed",
): Promise<void> {
  await assertSessionBookable(sessionId, userId);

  const { error } = await supabase.from("bookings").insert({
    session_id: sessionId,
    user_id: userId,
    status,
  });

  if (error) throw error;
}

export type BookingSortColumn = "client" | "session" | "date" | "price" | "status";

export type SortDirection = "asc" | "desc";

const STATUS_SORT_ORDER: Record<BookingStatus, number> = {
  pending: 0,
  confirmed: 1,
  cancelled: 2,
  rejected: 3,
};

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, "en-HK", { sensitivity: "base" });
}

function compareNullableStrings(a: string | null | undefined, b: string | null | undefined): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return compareStrings(a, b);
}

function compareNullableNumbers(a: number | null | undefined, b: number | null | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

function compareNullableDates(a: string | null | undefined, b: string | null | undefined): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(a).getTime() - new Date(b).getTime();
}

export function sortAdminBookings(
  bookings: AdminBookingRow[],
  column: BookingSortColumn,
  direction: SortDirection,
): AdminBookingRow[] {
  const sorted = [...bookings].sort((left, right) => {
    let result = 0;

    switch (column) {
      case "client":
        result = compareNullableStrings(
          getBookingClientName(left).toLowerCase(),
          getBookingClientName(right).toLowerCase(),
        );
        break;
      case "session":
        result = compareNullableStrings(left.session?.title, right.session?.title);
        break;
      case "date":
        result = compareNullableDates(
          left.session?.start_time ?? left.created_at,
          right.session?.start_time ?? right.created_at,
        );
        break;
      case "price":
        result = compareNullableNumbers(left.session?.price, right.session?.price);
        break;
      case "status":
        result = STATUS_SORT_ORDER[left.status] - STATUS_SORT_ORDER[right.status];
        break;
    }

    if (result === 0) {
      result = compareNullableDates(left.created_at, right.created_at);
    }

    return direction === "asc" ? result : -result;
  });

  return sorted;
}

export function getDefaultBookingSort(): { column: BookingSortColumn; direction: SortDirection } {
  return { column: "date", direction: "desc" };
}

/** @deprecated use BOOKING_STATUS_FILTER_OPTIONS */
export const BOOKING_STATUS_FILTERS = BOOKING_STATUS_FILTER_OPTIONS;
