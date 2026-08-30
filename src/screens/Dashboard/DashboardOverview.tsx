import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookSessionModal } from "../../components/BookSessionModal";
import { DashboardLayout } from "../../components/DashboardLayout";
import { RoleBadge, StatusBadge } from "../../components/RoleBadge";
import { useAuth } from "../../contexts/AuthContext";
import { bookingStatusStyles } from "../../lib/booking-admin";
import {
  computeClientDashboardStats,
  createClientBooking,
  fetchClientBookings,
  type ClientBookingRow,
} from "../../lib/client-bookings";
import { fetchPublicSessions, type PublicSessionCard } from "../../lib/public-sessions";
import { formatSessionSchedule } from "../../lib/session-admin";
import type { BookingStatus } from "../../types/database";

export function DashboardOverview(): JSX.Element {
  const { profile, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<ClientBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookSession, setBookSession] = useState<PublicSessionCard | null>(null);
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user) return [];
    const rows = await fetchClientBookings(user.id);
    setBookings(rows);
    return rows;
  }, [user]);

  useEffect(() => {
    document.title = "Dashboard | Meridian CPA";
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute(
      "content",
      "View your Meridian CPA dashboard, upcoming bookings, and account overview.",
    );
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadBookings()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load bookings.");
      })
      .finally(() => setLoading(false));
  }, [user, loadBookings]);

  useEffect(() => {
    const bookSessionId = (location.state as { bookSessionId?: string } | null)?.bookSessionId;
    if (!bookSessionId || !user) return;

    void fetchPublicSessions()
      .then((sessions) => {
        const match = sessions.find((session) => session.id === bookSessionId);
        if (match) setBookSession(match);
      })
      .finally(() => {
        navigate(location.pathname, { replace: true, state: {} });
      });
  }, [location.pathname, location.state, navigate, user]);

  const stats = computeClientDashboardStats(bookings);

  const handleConfirmBooking = async () => {
    if (!user || !bookSession) return;
    setBookSubmitting(true);
    setBookError(null);
    try {
      await createClientBooking(bookSession.id, user.id);
      setBookSession(null);
      await loadBookings();
      navigate("/dashboard/bookings");
    } catch (submitError) {
      setBookError(submitError instanceof Error ? submitError.message : "Booking failed.");
    } finally {
      setBookSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">
              Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}
            </h1>
            <p className="mt-2 text-[#0F2A1D]/70">
              Your client portal. Book sessions and manage your profile here.
            </p>
          </div>
          {profile ? (
            <div className="flex items-center gap-2">
              <RoleBadge role={profile.role} />
              <StatusBadge status={profile.status} />
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A1D]/60">Upcoming bookings</p>
            <p className="mt-2 font-serif text-2xl text-[#0F2A1D]">
              {loading ? "—" : stats.upcomingCount}
            </p>
          </div>
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A1D]/60">Pending approval</p>
            <p className="mt-2 font-serif text-2xl text-[#0F2A1D]">
              {loading ? "—" : stats.pendingCount}
            </p>
          </div>
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A1D]/60">Past / closed</p>
            <p className="mt-2 font-serif text-2xl text-[#0F2A1D]">
              {loading ? "—" : stats.completedCount}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 h-36 animate-pulse rounded-xl border border-[#EDECE6] bg-white" />
        ) : stats.nextBooking ? (
          <div className="mt-8 rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#C9A84C]">
                  Next session
                </p>
                <h2 className="mt-1 font-serif text-xl font-semibold text-[#0F2A1D]">
                  {stats.nextBooking.session?.title ?? "Session"}
                </h2>
                <p className="mt-2 text-sm text-[#0F2A1D]/70">
                  {stats.nextBooking.session?.start_time
                    ? formatSessionSchedule(stats.nextBooking.session.start_time)
                    : "—"}
                  {stats.nextBooking.session?.location
                    ? ` · ${stats.nextBooking.session.location}`
                    : ""}
                </p>
              </div>
              <span
                className={`self-start rounded-full px-2.5 py-1 text-xs font-medium capitalize ${bookingStatusStyles[stats.nextBooking.status as BookingStatus]}`}
              >
                {stats.nextBooking.status}
              </span>
            </div>
            <Link
              to="/dashboard/bookings"
              className="mt-4 inline-block text-sm font-medium text-[#0F2A1D] hover:underline"
            >
              View all bookings
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-[#EDECE6] bg-white p-10 text-center">
            <p className="text-[#0F2A1D]/70">No upcoming sessions.</p>
            <Link
              to="/#booking"
              className="mt-4 inline-block rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2A1D]/90"
            >
              Browse sessions
            </Link>
          </div>
        )}
      </div>

      <BookSessionModal
        session={bookSession}
        open={bookSession !== null}
        submitting={bookSubmitting}
        error={bookError}
        onClose={() => {
          setBookSession(null);
          setBookError(null);
        }}
        onConfirm={() => void handleConfirmBooking()}
      />
    </DashboardLayout>
  );
}
