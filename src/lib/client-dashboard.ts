import {
  computeClientDashboardStats,
  fetchClientBookings,
  type ClientBookingRow,
} from "./client-bookings";
import { formatSessionSchedule, formatPrice } from "./session-admin";
import { supabase } from "./supabase";
import type { PublicSessionCard } from "./public-sessions";
import type { BookingStatus, UserRole } from "../types/database";

export type ClientActivityFilter = "all" | "you" | "firm";

export type ClientUpcomingRow = {
  id: string;
  bookingId: string;
  sessionTitle: string;
  sessionTypeLabel: string;
  startTime: string;
  location: string;
  status: BookingStatus;
};

export type ClientRecentActivity = {
  id: string;
  bookingId: string;
  actionLabel: string;
  sessionTitle: string;
  timestamp: string;
  status: BookingStatus;
  actor: "you" | "firm";
};

export type ClientNotificationItem = {
  id: string;
  bookingId: string;
  headline: string;
  sessionTitle: string;
  scheduleLabel: string;
  status: BookingStatus;
  timestamp: string;
};

export type ClientBookingHistoryEntry = {
  id: number;
  action: string;
  oldStatus: BookingStatus | null;
  newStatus: BookingStatus | null;
  notes: string | null;
  createdAt: string;
  actor: "you" | "firm";
  label: string;
};

type BookingHistoryRow = {
  id: number;
  booking_id: string;
  action: string;
  old_status: BookingStatus | null;
  new_status: BookingStatus | null;
  notes: string | null;
  created_at: string;
  changer: {
    role: UserRole;
    first_name: string;
    last_name: string;
  } | null;
  booking: {
    session: { title: string } | null;
  } | null;
};

type ActivityBookingRow = {
  id: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  session: { title: string } | null;
};

const MS_48H = 48 * 60 * 60 * 1000;
const MS_24H = 24 * 60 * 60 * 1000;

function historyActor(changer: BookingHistoryRow["changer"]): "you" | "firm" {
  return changer?.role === "admin" ? "firm" : "you";
}

function clientActionLabel(
  action: string,
  oldStatus: BookingStatus | null,
  newStatus: BookingStatus | null,
  actor: "you" | "firm",
): string {
  if (action === "CREATE") {
    return actor === "firm" ? "Meridian created a booking for you" : "You requested a booking";
  }
  if (newStatus === "confirmed") {
    return actor === "firm" ? "Meridian confirmed your booking" : "Your booking was confirmed";
  }
  if (newStatus === "rejected") {
    return "Meridian declined your request";
  }
  if (newStatus === "cancelled") {
    return actor === "you" ? "You cancelled your booking" : "Meridian cancelled your booking";
  }
  if (oldStatus !== newStatus && newStatus) {
    return `Booking updated to ${newStatus}`;
  }
  return "Booking updated";
}

function historyToClientActivity(row: BookingHistoryRow): ClientRecentActivity {
  const actor = historyActor(row.changer);
  const status = row.new_status ?? row.old_status ?? "pending";
  return {
    id: `history-${row.id}`,
    bookingId: row.booking_id,
    actionLabel: clientActionLabel(row.action, row.old_status, row.new_status, actor),
    sessionTitle: row.booking?.session?.title ?? "Session",
    timestamp: row.created_at,
    status,
    actor,
  };
}

function synthesizeClientActivity(row: ActivityBookingRow): ClientRecentActivity[] {
  const title = row.session?.title ?? "Session";
  const createdMs = new Date(row.created_at).getTime();
  const updatedMs = new Date(row.updated_at).getTime();
  const events: ClientRecentActivity[] = [
    {
      id: `${row.id}-create`,
      bookingId: row.id,
      actionLabel: "You requested a booking",
      sessionTitle: title,
      timestamp: row.created_at,
      status: "pending",
      actor: "you",
    },
  ];

  if (row.status === "pending") return events;

  const changeTimestamp = row.cancelled_at ?? row.updated_at;

  if (row.status === "confirmed") {
    events.push({
      id: `${row.id}-confirmed`,
      bookingId: row.id,
      actionLabel: "Meridian confirmed your booking",
      sessionTitle: title,
      timestamp: changeTimestamp,
      status: "confirmed",
      actor: "firm",
    });
  } else if (row.status === "rejected") {
    events.push({
      id: `${row.id}-rejected`,
      bookingId: row.id,
      actionLabel: "Meridian declined your request",
      sessionTitle: title,
      timestamp: changeTimestamp,
      status: "rejected",
      actor: "firm",
    });
  } else if (row.status === "cancelled") {
    const actor: "you" | "firm" = updatedMs - createdMs < 60_000 ? "you" : "firm";
    events.push({
      id: `${row.id}-cancelled`,
      bookingId: row.id,
      actionLabel:
        actor === "you" ? "You cancelled your booking" : "Meridian cancelled your booking",
      sessionTitle: title,
      timestamp: changeTimestamp,
      status: "cancelled",
      actor,
    });
  }

  return events;
}

const ACTIVITY_STATUS_RANK: Record<BookingStatus, number> = {
  confirmed: 4,
  rejected: 3,
  cancelled: 3,
  pending: 1,
};

function activityRecencyRank(event: ClientRecentActivity): number {
  const historyMatch = event.id.match(/^history-(\d+)$/);
  if (historyMatch) return Number(historyMatch[1]);
  return ACTIVITY_STATUS_RANK[event.status] * 1000;
}

function compareClientActivity(a: ClientRecentActivity, b: ClientRecentActivity): number {
  const timeDiff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  if (timeDiff !== 0) return timeDiff;
  return activityRecencyRank(b) - activityRecencyRank(a);
}

function mergeBookingActivity(
  row: ActivityBookingRow,
  historyEvents: ClientRecentActivity[],
): ClientRecentActivity[] {
  const synthesized = synthesizeClientActivity(row);
  if (historyEvents.length === 0) return synthesized;

  const merged = [...historyEvents];
  for (const syn of synthesized) {
    const alreadyLogged = historyEvents.some(
      (event) => event.status === syn.status && event.actor === syn.actor,
    );
    if (!alreadyLogged) merged.push(syn);
  }
  return merged;
}

function buildClientActivityFeed(
  bookings: ActivityBookingRow[],
  historyEvents: ClientRecentActivity[],
): ClientRecentActivity[] {
  const historyByBooking = new Map<string, ClientRecentActivity[]>();
  for (const event of historyEvents) {
    const existing = historyByBooking.get(event.bookingId) ?? [];
    existing.push(event);
    historyByBooking.set(event.bookingId, existing);
  }

  const allEvents = bookings.flatMap((row) =>
    mergeBookingActivity(row, historyByBooking.get(row.id) ?? []),
  );

  return allEvents.sort(compareClientActivity).slice(0, 12);
}

function sessionTypeLabel(booking: ClientBookingRow): string {
  const session = booking.session;
  if (!session) return "Session";
  return session.title;
}

export function buildClientUpcomingRows(
  bookings: ClientBookingRow[],
  limit = 5,
): ClientUpcomingRow[] {
  const now = Date.now();

  return bookings
    .filter((booking) => {
      if (booking.status !== "pending" && booking.status !== "confirmed") return false;
      const start = booking.session?.start_time;
      return start ? new Date(start).getTime() >= now : false;
    })
    .sort(
      (a, b) =>
        new Date(a.session?.start_time ?? 0).getTime() -
        new Date(b.session?.start_time ?? 0).getTime(),
    )
    .slice(0, limit)
    .map((booking) => ({
      id: booking.id,
      bookingId: booking.id,
      sessionTitle: booking.session?.title ?? "Session",
      sessionTypeLabel: sessionTypeLabel(booking),
      startTime: booking.session?.start_time ?? "",
      location: booking.session?.location ?? "—",
      status: booking.status,
    }));
}

export function buildClientSummaryLine(stats: ReturnType<typeof computeClientDashboardStats>): string {
  const parts: string[] = [];
  if (stats.pendingCount > 0) {
    parts.push(`${stats.pendingCount} pending`);
  }
  if (stats.upcomingCount > 0) {
    parts.push(`${stats.upcomingCount} upcoming`);
  }
  if (stats.completedCount > 0) {
    parts.push(`${stats.completedCount} past`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Book a session to get started";
}

export function filterClientActivity(
  events: ClientRecentActivity[],
  filter: ClientActivityFilter,
): ClientRecentActivity[] {
  if (filter === "all") return events;
  if (filter === "you") return events.filter((event) => event.actor === "you");
  return events.filter((event) => event.actor === "firm");
}

export function isSessionStartingWithin24h(startTime: string | undefined): boolean {
  if (!startTime) return false;
  const start = new Date(startTime).getTime();
  const now = Date.now();
  return start >= now && start - now <= MS_24H;
}

export function selectAvailableSessions(
  sessions: PublicSessionCard[],
  limit = 6,
): PublicSessionCard[] {
  return sessions
    .filter((session) => {
      const spotsLeft = session.capacity.total - session.capacity.booked;
      return spotsLeft > 0;
    })
    .slice(0, limit);
}

/**
 * Badge count: pending bookings + confirmed sessions starting within 48h.
 * v1 simplification — refine with read/unread cursor in a follow-up.
 */
export function countClientNotificationBadge(items: ClientNotificationItem[]): number {
  return items.length;
}

export function buildClientNotificationItems(bookings: ClientBookingRow[]): ClientNotificationItem[] {
  const now = Date.now();
  const horizon = now + MS_48H;

  return bookings
    .filter((booking) => {
      if (booking.status === "pending") return true;
      if (booking.status === "confirmed" && booking.session?.start_time) {
        const start = new Date(booking.session.start_time).getTime();
        return start >= now && start <= horizon;
      }
      return false;
    })
    .sort((a, b) => {
      const aPending = a.status === "pending" ? 0 : 1;
      const bPending = b.status === "pending" ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return (
        new Date(b.updated_at ?? b.created_at).getTime() -
        new Date(a.updated_at ?? a.created_at).getTime()
      );
    })
    .slice(0, 8)
    .map((booking) => {
      const sessionTitle = booking.session?.title ?? "Session";
      const scheduleLabel = booking.session?.start_time
        ? formatSessionSchedule(booking.session.start_time)
        : "";
      let headline = "Pending — awaiting firm approval";
      if (booking.status === "confirmed") {
        headline = "Confirmed — upcoming session";
      }
      return {
        id: booking.id,
        bookingId: booking.id,
        headline,
        sessionTitle,
        scheduleLabel,
        status: booking.status,
        timestamp: booking.updated_at ?? booking.created_at,
      };
    });
}

async function fetchClientBookingHistoryActivity(
  bookingIds: string[],
): Promise<ClientRecentActivity[]> {
  if (bookingIds.length === 0) return [];

  const { data, error } = await supabase
    .from("booking_history")
    .select(`
      id,
      booking_id,
      action,
      old_status,
      new_status,
      notes,
      created_at,
      changer:profiles!booking_history_changed_by_fkey (
        role,
        first_name,
        last_name
      ),
      booking:bookings (
        session:sessions!bookings_session_id_fkey ( title )
      )
    `)
    .in("booking_id", bookingIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as BookingHistoryRow[]).map(historyToClientActivity);
}

export async function fetchClientBookingHistory(
  bookingId: string,
): Promise<ClientBookingHistoryEntry[]> {
  const { data, error } = await supabase
    .from("booking_history")
    .select(`
      id,
      booking_id,
      action,
      old_status,
      new_status,
      notes,
      created_at,
      changer:profiles!booking_history_changed_by_fkey (
        role,
        first_name,
        last_name
      )
    `)
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as Omit<BookingHistoryRow, "booking">[]).map((row) => {
    const actor = historyActor(row.changer);
    return {
      id: row.id,
      action: row.action,
      oldStatus: row.old_status,
      newStatus: row.new_status,
      notes: row.notes,
      createdAt: row.created_at,
      actor,
      label: clientActionLabel(row.action, row.old_status, row.new_status, actor),
    };
  });
}

export async function fetchClientDashboardData(userId: string): Promise<{
  bookings: ClientBookingRow[];
  summary: ReturnType<typeof computeClientDashboardStats>;
  upcoming: ClientUpcomingRow[];
  activity: ClientRecentActivity[];
  notificationItems: ClientNotificationItem[];
}> {
  const bookings = await fetchClientBookings(userId);
  const summary = computeClientDashboardStats(bookings);
  const upcoming = buildClientUpcomingRows(bookings);
  const notificationItems = buildClientNotificationItems(bookings);

  const activityBookings: ActivityBookingRow[] = bookings.map((row) => ({
    id: row.id,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    cancelled_at: row.cancelled_at,
    session: row.session ? { title: row.session.title } : null,
  }));

  let historyEvents: ClientRecentActivity[] = [];
  try {
    historyEvents = await fetchClientBookingHistoryActivity(bookings.map((row) => row.id));
  } catch {
    historyEvents = [];
  }

  const activity = buildClientActivityFeed(activityBookings, historyEvents);

  return {
    bookings,
    summary,
    upcoming,
    activity,
    notificationItems,
  };
}

export function formatClientBookingPrice(price: number | undefined): string {
  if (price === undefined || price === null) return "—";
  return formatPrice(price);
}
