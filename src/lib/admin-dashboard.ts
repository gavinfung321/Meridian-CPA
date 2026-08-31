import { countActiveBookings, formatPrice, getSessionBookingCounts } from "./session-admin";
import { getDisplayName } from "./profile";
import { supabase } from "./supabase";
import type { BookingStatus, UserRole } from "../types/database";

export type AdminDashboardMetrics = {
  sessionOccupancyPct: number;
  confirmedRevenue: number;
  confirmedRevenueLabel: string;
  activeClients: number;
  pendingBookings: number;
  totalBookings: number;
  upcomingSessions: number;
};

export type AdminUpcomingBookingRow = {
  id: string;
  bookingId: string;
  sessionId: string;
  clientName: string;
  clientFirstName: string;
  clientLastName: string;
  clientAvatarPath: string | null;
  sessionTitle: string;
  sessionTypeLabel: string;
  startTime: string;
  capacityLabel: string;
  status: BookingStatus;
};

export type ActivityActor = "user" | "admin";

export type ActivityActorFilter = "all" | ActivityActor;

export type AdminRecentActivity = {
  id: string;
  bookingId: string;
  message: string;
  actionLabel: string;
  clientName: string;
  sessionTitle: string;
  clientFirstName: string;
  clientLastName: string;
  clientAvatarPath: string | null;
  timestamp: string;
  status: BookingStatus;
  actor: ActivityActor;
};

type BookingMetricsRow = {
  id: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  user: {
    first_name: string;
    last_name: string;
    avatar_path: string | null;
  } | null;
  session: {
    title: string;
    price: number;
    start_time: string;
    session_type: {
      category: { id: string; name: string } | null;
    } | null;
  } | null;
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
    user: {
      first_name: string;
      last_name: string;
      avatar_path: string | null;
    } | null;
    session: {
      title: string;
    } | null;
  } | null;
};

type SessionOccupancyRow = {
  id: string;
  title: string;
  max_slots: number;
  start_time: string;
  session_type: {
    name: string;
    category: { name: string } | null;
  } | null;
  bookings: Array<{
    id: string;
    status: string;
    user: { first_name: string; last_name: string; avatar_path: string | null } | null;
  }> | null;
};

function upcomingSessionTypeLabel(session: SessionOccupancyRow): string {
  const type = session.session_type;
  if (type?.category?.name && type.name) {
    return `${type.category.name} · ${type.name}`;
  }
  return type?.name ?? session.title;
}

function buildUpcomingBookingRows(
  sessions: SessionOccupancyRow[],
  limit = 5,
): AdminUpcomingBookingRow[] {
  const rows: AdminUpcomingBookingRow[] = [];

  for (const session of sessions) {
    const counts = getSessionBookingCounts(session.bookings);
    const capacityLabel = `${counts.reserved}/${session.max_slots}`;
    const activeBookings = (session.bookings ?? []).filter(
      (booking) => booking.status === "pending" || booking.status === "confirmed",
    );

    for (const booking of activeBookings) {
      const user = booking.user;
      rows.push({
        id: booking.id,
        bookingId: booking.id,
        sessionId: session.id,
        clientName: bookingClientLabel({ user }),
        clientFirstName: user?.first_name ?? "",
        clientLastName: user?.last_name ?? "",
        clientAvatarPath: user?.avatar_path ?? null,
        sessionTitle: session.title,
        sessionTypeLabel: upcomingSessionTypeLabel(session),
        startTime: session.start_time,
        capacityLabel,
        status: booking.status as BookingStatus,
      });
    }
  }

  return rows
    .sort((a, b) => {
      const timeDiff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      if (timeDiff !== 0) return timeDiff;
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return 0;
    })
    .slice(0, limit);
}

function bookingClientLabel(row: {
  user: { first_name: string; last_name: string } | null;
}): string {
  const user = row.user;
  if (!user) return "A client";
  return getDisplayName(user.first_name, user.last_name, "A client");
}

function sessionTitle(row: { session: { title: string } | null } | null): string {
  return row?.session?.title ?? "a session";
}

function historyActor(changer: BookingHistoryRow["changer"]): ActivityActor {
  return changer?.role === "admin" ? "admin" : "user";
}

function createActivityEvent(params: {
  id: string;
  bookingId: string;
  actor: ActivityActor;
  actionLabel: string;
  clientName: string;
  sessionTitle: string;
  clientFirstName?: string;
  clientLastName?: string;
  clientAvatarPath?: string | null;
  timestamp: string;
  status: BookingStatus;
}): AdminRecentActivity {
  const { actionLabel, clientName, sessionTitle } = params;
  return {
    ...params,
    clientFirstName: params.clientFirstName ?? "",
    clientLastName: params.clientLastName ?? "",
    clientAvatarPath: params.clientAvatarPath ?? null,
    message: `${actionLabel} — ${clientName} · ${sessionTitle}`,
  };
}

function historyToActivity(row: BookingHistoryRow): AdminRecentActivity {
  const user = row.booking?.user;
  const clientName = bookingClientLabel({ user: user ?? null });
  const title = sessionTitle(row.booking);
  const actor = historyActor(row.changer);
  const status = row.new_status ?? row.old_status ?? "pending";
  let actionLabel = "Updated booking";

  if (row.action === "CREATE") {
    actionLabel =
      row.new_status === "pending"
        ? "New booking request"
        : actor === "admin"
          ? "Admin created booking"
          : "Created booking";
  } else if (row.new_status === "confirmed") {
    actionLabel = actor === "admin" ? "Confirmed booking" : "Booking confirmed";
  } else if (row.new_status === "rejected") {
    actionLabel = "Rejected booking";
  } else if (row.new_status === "cancelled") {
    actionLabel = "Cancelled booking";
  }

  return createActivityEvent({
    id: `history-${row.id}`,
    bookingId: row.booking_id,
    actor,
    actionLabel,
    clientName,
    sessionTitle: title,
    clientFirstName: user?.first_name ?? "",
    clientLastName: user?.last_name ?? "",
    clientAvatarPath: user?.avatar_path ?? null,
    timestamp: row.created_at,
    status,
  });
}

function synthesizeBookingEvents(row: BookingMetricsRow): AdminRecentActivity[] {
  const client = bookingClientLabel(row);
  const title = row.session?.title ?? "a session";
  const firstName = row.user?.first_name ?? "";
  const lastName = row.user?.last_name ?? "";
  const avatarPath = row.user?.avatar_path ?? null;
  const createdMs = new Date(row.created_at).getTime();
  const updatedMs = new Date(row.updated_at).getTime();
  const events: AdminRecentActivity[] = [];

  const adminCreatedConfirmed =
    row.status === "confirmed" && Math.abs(updatedMs - createdMs) < 3000;

  if (adminCreatedConfirmed) {
    events.push(
      createActivityEvent({
        id: `${row.id}-admin-create`,
        bookingId: row.id,
        actor: "admin",
        actionLabel: "Admin created booking",
        clientName: client,
        sessionTitle: title,
        clientFirstName: firstName,
        clientLastName: lastName,
        clientAvatarPath: avatarPath,
        timestamp: row.created_at,
        status: "confirmed",
      }),
    );
    return events;
  }

  events.push(
    createActivityEvent({
      id: `${row.id}-create`,
      bookingId: row.id,
      actor: "user",
      actionLabel: "New booking request",
      clientName: client,
      sessionTitle: title,
      clientFirstName: firstName,
      clientLastName: lastName,
      clientAvatarPath: avatarPath,
      timestamp: row.created_at,
      status: "pending",
    }),
  );

  if (row.status === "pending") {
    return events;
  }

  const changeTimestamp = row.cancelled_at ?? row.updated_at;

  if (row.status === "confirmed") {
    events.push(
      createActivityEvent({
        id: `${row.id}-confirmed`,
        bookingId: row.id,
        actor: "admin",
        actionLabel: "Confirmed booking",
        clientName: client,
        sessionTitle: title,
        clientFirstName: firstName,
        clientLastName: lastName,
        clientAvatarPath: avatarPath,
        timestamp: changeTimestamp,
        status: "confirmed",
      }),
    );
  } else if (row.status === "rejected") {
    events.push(
      createActivityEvent({
        id: `${row.id}-rejected`,
        bookingId: row.id,
        actor: "admin",
        actionLabel: "Rejected booking",
        clientName: client,
        sessionTitle: title,
        clientFirstName: firstName,
        clientLastName: lastName,
        clientAvatarPath: avatarPath,
        timestamp: changeTimestamp,
        status: "rejected",
      }),
    );
  } else if (row.status === "cancelled") {
    const actor: ActivityActor = updatedMs - createdMs < 60_000 ? "user" : "admin";
    events.push(
      createActivityEvent({
        id: `${row.id}-cancelled`,
        bookingId: row.id,
        actor,
        actionLabel: "Cancelled booking",
        clientName: client,
        sessionTitle: title,
        clientFirstName: firstName,
        clientLastName: lastName,
        clientAvatarPath: avatarPath,
        timestamp: changeTimestamp,
        status: "cancelled",
      }),
    );
  }

  return events;
}

async function fetchBookingHistoryActivity(limit = 24): Promise<AdminRecentActivity[]> {
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
        user:profiles!bookings_user_id_fkey ( first_name, last_name, avatar_path ),
        session:sessions!bookings_session_id_fkey ( title )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return ((data ?? []) as BookingHistoryRow[]).map(historyToActivity);
}

function buildRecentActivityFeed(
  bookings: BookingMetricsRow[],
  historyEvents: AdminRecentActivity[],
): AdminRecentActivity[] {
  const bookingsWithHistory = new Set(historyEvents.map((event) => event.bookingId));

  const synthesized = bookings
    .filter((row) => !bookingsWithHistory.has(row.id))
    .flatMap((row) => synthesizeBookingEvents(row));

  return [...historyEvents, ...synthesized]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 12);
}

export function filterRecentActivity(
  events: AdminRecentActivity[],
  filter: ActivityActorFilter,
): AdminRecentActivity[] {
  if (filter === "all") return events;
  return events.filter((event) => event.actor === filter);
}

export async function fetchAdminDashboardMetrics(): Promise<{
  metrics: AdminDashboardMetrics;
  upcomingBookings: AdminUpcomingBookingRow[];
  recentActivity: AdminRecentActivity[];
}> {
  const now = new Date().toISOString();

  const [bookingsResult, sessionsResult, clientsResult, historyResult] = await Promise.all([
    supabase
      .from("bookings")
      .select(`
        id,
        status,
        created_at,
        updated_at,
        cancelled_at,
        user:profiles!bookings_user_id_fkey ( first_name, last_name, avatar_path ),
        session:sessions!bookings_session_id_fkey (
          title,
          price,
          start_time,
          session_type:session_types (
            category:categories ( id, name )
          )
        )
      `)
      .order("updated_at", { ascending: false }),
    supabase
      .from("sessions")
      .select(`
        id,
        title,
        max_slots,
        start_time,
        session_type:session_types (
          name,
          category:categories ( name )
        ),
        bookings (
          id,
          status,
          user:profiles!bookings_user_id_fkey ( first_name, last_name, avatar_path )
        )
      `)
      .eq("is_cancelled", false)
      .gte("start_time", now)
      .order("start_time", { ascending: true })
      .limit(24),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client")
      .eq("status", "active"),
    fetchBookingHistoryActivity(24).catch(() => [] as AdminRecentActivity[]),
  ]);

  if (bookingsResult.error) throw bookingsResult.error;
  if (sessionsResult.error) throw sessionsResult.error;
  if (clientsResult.error) throw clientsResult.error;

  const bookings = (bookingsResult.data ?? []) as BookingMetricsRow[];
  const sessions = (sessionsResult.data ?? []) as SessionOccupancyRow[];

  let totalSlots = 0;
  let bookedSlots = 0;
  for (const session of sessions) {
    totalSlots += session.max_slots;
    bookedSlots += countActiveBookings(session.bookings);
  }

  const sessionOccupancyPct =
    totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  const confirmedRevenue = bookings
    .filter((row) => row.status === "confirmed")
    .reduce((sum, row) => sum + Number(row.session?.price ?? 0), 0);

  const pendingBookings = bookings.filter((row) => row.status === "pending").length;

  const upcomingBookings = buildUpcomingBookingRows(sessions);

  const recentActivity = buildRecentActivityFeed(bookings, historyResult);

  return {
    metrics: {
      sessionOccupancyPct,
      confirmedRevenue,
      confirmedRevenueLabel: formatPrice(confirmedRevenue),
      activeClients: clientsResult.count ?? 0,
      pendingBookings,
      totalBookings: bookings.length,
      upcomingSessions: sessions.length,
    },
    upcomingBookings,
    recentActivity,
  };
}

export async function fetchAdminPendingBookingsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) throw error;
  return count ?? 0;
}
