import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import {
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Clock,
  Info,
  MapPin,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CancelBookingModal } from "../../components/BookSessionModal";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useBookingNotifications } from "../../hooks/useBookingNotifications";
import {
  bookingStatusStyles,
  formatBookingRelativeTime,
} from "../../lib/booking-admin";
import {
  cancelClientBooking,
  type ClientBookingRow,
} from "../../lib/client-bookings";
import {
  buildClientSummaryLine,
  fetchClientDashboardData,
  filterClientActivity,
  formatClientBookingPrice,
  isSessionStartingWithin24h,
  type ClientActivityFilter,
  type ClientRecentActivity,
  type ClientUpcomingRow,
} from "../../lib/client-dashboard";
import { getGreeting } from "../../lib/greeting";
import { formatSessionSchedule, formatSessionTimeShort } from "../../lib/session-admin";
import { cn } from "../../lib/utils";
import type { BookingStatus } from "../../types/database";
import { OpenSessionsPreview } from "./OpenSessionsPreview";
import { ClientBookingDetailModal } from "./ClientBookingDetailModal";

const ACTIVITY_FILTER_OPTIONS: Array<{ id: ClientActivityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "you", label: "You" },
  { id: "firm", label: "Firm" },
];

function MetricInfoTip({ text }: { text: string }): JSX.Element {
  return (
    <span className="group/info relative inline-flex shrink-0">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        className="rounded-full p-0.5 text-[#0F2A1D]/35 transition-colors hover:text-[#0F2A1D]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
        aria-label={text}
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 rounded-lg border border-[#EDECE6] bg-white px-3 py-2 text-left text-xs leading-relaxed text-[#0F2A1D]/80 shadow-md group-hover/info:block group-focus-within/info:block"
      >
        {text}
      </span>
    </span>
  );
}

function MetricCard({
  label,
  value,
  to,
  hint,
  info,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  to?: string;
  hint?: string;
  info?: string;
  icon: ElementType;
  highlight?: boolean;
}): JSX.Element {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        highlight
          ? "border-l-4 border-[#EDECE6] border-l-[#C9A84C] bg-[#C9A84C]/5"
          : "border-[#EDECE6]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <p className="text-sm text-[#0F2A1D]/60">{label}</p>
          {info ? <MetricInfoTip text={info} /> : null}
        </div>
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            highlight ? "text-[#C9A84C]" : "text-[#0F2A1D]/25",
          )}
          aria-hidden
        />
      </div>
      <p className="mt-2 font-serif text-3xl text-[#0F2A1D]">{value}</p>
      <p className={cn("mt-1 min-h-[1rem] text-xs", hint ? "text-[#0F2A1D]/50" : "invisible")}>
        {hint ?? "\u00A0"}
      </p>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
      >
        {body}
      </Link>
    );
  }

  return body;
}

function PhoneNudgeBanner(): JSX.Element {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#EDECE6] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#0F2A1D]">
        <span className="font-medium">Add your phone number</span>
        <span className="text-[#0F2A1D]/70"> — so Meridian can reach you about your booking.</span>
      </p>
      <Link
        to="/dashboard/profile"
        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#0F2A1D] px-4 py-2 text-sm font-medium text-[#0F2A1D] transition-colors hover:bg-[#0F2A1D]/5"
      >
        Complete profile
      </Link>
    </div>
  );
}

function WelcomeBanner(): JSX.Element {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-[#0F2A1D]">Welcome to your client portal</p>
        <p className="mt-1 text-sm text-[#0F2A1D]/70">
          Browse open sessions and submit your first booking request.
        </p>
      </div>
      <Link
        to="/dashboard/book"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0F2A1D]/90"
      >
        Book your first session
      </Link>
    </div>
  );
}

function PendingBanner({ count }: { count: number }): JSX.Element {
  const label = count === 1 ? "1 booking" : `${count} bookings`;
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <BellRing className="h-5 w-5 shrink-0 text-[#C9A84C]" aria-hidden />
        <p className="text-sm text-[#0F2A1D]">
          <span className="font-medium">{label} awaiting firm approval</span>
          <span className="text-[#0F2A1D]/70"> — we will notify you once confirmed.</span>
        </p>
      </div>
      <Link
        to="/dashboard/bookings?status=pending"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0F2A1D]/90"
      >
        View pending
      </Link>
    </div>
  );
}

function SoonBanner({ title }: { title: string }): JSX.Element {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 shrink-0 text-[#C9A84C]" aria-hidden />
        <p className="text-sm text-[#0F2A1D]">
          <span className="font-medium">Starting soon:</span> {title}
        </p>
      </div>
      <Link
        to="/dashboard/bookings?status=upcoming"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0F2A1D]/90"
      >
        View details
      </Link>
    </div>
  );
}

function BannedBanner(): JSX.Element {
  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
      <p className="text-sm font-medium text-red-800">Your account is suspended</p>
      <p className="mt-1 text-sm text-red-700">
        Contact Meridian CPA if you believe this is an error.
      </p>
      <a
        href="mailto:info@meridiancpa.com"
        className="mt-3 inline-block text-sm font-medium text-red-800 underline"
      >
        Contact the firm
      </a>
    </div>
  );
}

function UpcomingBookingRow({ item }: { item: ClientUpcomingRow }): JSX.Element {
  return (
    <li>
      <Link
        to={`/dashboard/bookings?booking=${item.bookingId}`}
        className="group flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#F9F9F6]"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F2A1D]/5">
          <CalendarDays className="h-4 w-4 text-[#0F2A1D]/50" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#0F2A1D]">{item.sessionTitle}</p>
          <p className="truncate text-sm text-[#0F2A1D]/65">
            {formatSessionTimeShort(item.startTime)} · {item.location}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start pt-0.5">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              bookingStatusStyles[item.status as BookingStatus],
            )}
          >
            {item.status}
          </span>
          <ArrowUpRight
            className="h-4 w-4 text-[#0F2A1D]/25 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </div>
      </Link>
    </li>
  );
}

function ActivityTimelineRow({ item }: { item: ClientRecentActivity }): JSX.Element {
  return (
    <li>
      <Link
        to={`/dashboard/bookings?booking=${item.bookingId}`}
        className="group flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#F9F9F6]"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15">
          <BellRing className="h-4 w-4 text-[#C9A84C]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#0F2A1D]">{item.actionLabel}</p>
          <p className="truncate text-sm text-[#0F2A1D]/65">{item.sessionTitle}</p>
          <p className="mt-0.5 text-xs text-[#0F2A1D]/45">
            {item.actor === "you" ? "You" : "Meridian"} ·{" "}
            {formatBookingRelativeTime(item.timestamp)}
          </p>
        </div>
        <div className="shrink-0 self-start pt-0.5">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              bookingStatusStyles[item.status as BookingStatus],
            )}
          >
            {item.status}
          </span>
        </div>
      </Link>
    </li>
  );
}

export function DashboardOverview(): JSX.Element {
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<ClientBookingRow[]>([]);
  const [upcoming, setUpcoming] = useState<ClientUpcomingRow[]>([]);
  const [activity, setActivity] = useState<ClientRecentActivity[]>([]);
  const [summary, setSummary] = useState<ReturnType<
    typeof import("../../lib/client-bookings").computeClientDashboardStats
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<ClientActivityFilter>("all");
  const [cancelTarget, setCancelTarget] = useState<ClientBookingRow | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [detailBooking, setDetailBooking] = useState<ClientBookingRow | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setError(null);
    const data = await fetchClientDashboardData(user.id);
    setBookings(data.bookings);
    setSummary(data.summary);
    setUpcoming(data.upcoming);
    setActivity(data.activity);
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
    void loadDashboard()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
      })
      .finally(() => setLoading(false));
  }, [user, loadDashboard]);

  useBookingNotifications(
    useCallback(() => {
      void loadDashboard().catch(() => undefined);
    }, [loadDashboard]),
    Boolean(user),
  );

  useEffect(() => {
    const bookSessionId = (location.state as { bookSessionId?: string } | null)?.bookSessionId;
    if (!bookSessionId || !user) return;

    navigate(`/dashboard/book?session=${bookSessionId}`, { replace: true, state: {} });
  }, [location.state, navigate, user]);

  const filteredActivity = useMemo(
    () => filterClientActivity(activity, activityFilter),
    [activity, activityFilter],
  );

  const activityCounts = useMemo(
    () => ({
      all: activity.length,
      you: activity.filter((event) => event.actor === "you").length,
      firm: activity.filter((event) => event.actor === "firm").length,
    }),
    [activity],
  );

  const firstName = profile?.first_name ?? "there";
  const greeting = getGreeting();
  const summaryLine = summary ? buildClientSummaryLine(summary) : null;
  const showPhoneNudge = profile && !profile.phone_number?.trim();
  const isNewUser = profile?.role === "user" && bookings.length === 0;
  const nextSessionSoon =
    summary?.nextBooking?.session?.start_time &&
    isSessionStartingWithin24h(summary.nextBooking.session.start_time)
      ? summary.nextBooking.session.title
      : null;

  const handleCancelConfirm = async (reason: string) => {
    if (!user || !cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelClientBooking(cancelTarget.id, user.id, reason);
      setCancelTarget(null);
      setDetailBooking(null);
      showToast("Booking cancelled.");
      await loadDashboard();
    } catch (cancelErr) {
      const message = cancelErr instanceof Error ? cancelErr.message : "Cancellation failed.";
      setCancelError(message);
      showToast(message, "error");
    } finally {
      setCancelling(false);
    }
  };

  const nextBooking = summary?.nextBooking;
  const canCancelNext =
    nextBooking &&
    (nextBooking.status === "pending" || nextBooking.status === "confirmed");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            {loading ? "Loading your overview…" : summaryLine ?? "Your client portal at a glance."}
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {profile?.status === "banned" ? <BannedBanner /> : null}

        {!loading && profile?.status !== "banned" ? (
          <>
            {isNewUser ? <WelcomeBanner /> : null}
            {!isNewUser && summary && summary.pendingCount > 0 ? (
              <PendingBanner count={summary.pendingCount} />
            ) : null}
            {!isNewUser && nextSessionSoon && summary?.pendingCount === 0 ? (
              <SoonBanner title={nextSessionSoon} />
            ) : null}
            {showPhoneNudge ? <PhoneNudgeBanner /> : null}
          </>
        ) : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-[#EDECE6] bg-white"
              />
            ))}
          </div>
        ) : summary ? (
          <div className="grid gap-6 sm:grid-cols-3">
            <MetricCard
              label="Upcoming"
              value={String(summary.upcomingCount)}
              to="/dashboard/bookings?status=upcoming"
              hint="Future sessions"
              info="Pending and confirmed bookings for sessions that have not started yet."
              icon={CalendarDays}
            />
            <MetricCard
              label="Pending approval"
              value={String(summary.pendingCount)}
              to="/dashboard/bookings?status=pending"
              hint="Awaiting Meridian"
              info="Booking requests submitted and waiting for the firm to confirm or decline."
              icon={BellRing}
              highlight={summary.pendingCount > 0}
            />
            <MetricCard
              label="Past / closed"
              value={String(summary.completedCount)}
              to="/dashboard/bookings?status=past"
              hint="Completed or ended"
              icon={Clock}
            />
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            {loading ? (
              <div className="h-48 animate-pulse rounded-xl border border-[#EDECE6] bg-white" />
            ) : nextBooking ? (
              <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-[#C9A84C]">
                  Next session
                </p>
                <h2 className="mt-1 font-serif text-xl font-semibold text-[#0F2A1D]">
                  {nextBooking.session?.title ?? "Session"}
                </h2>
                <div className="mt-3 space-y-2 text-sm text-[#0F2A1D]/70">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#C9A84C]" aria-hidden />
                    {nextBooking.session?.start_time
                      ? formatSessionSchedule(nextBooking.session.start_time)
                      : "—"}
                  </p>
                  {nextBooking.session?.location ? (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#C9A84C]" aria-hidden />
                      {nextBooking.session.location}
                    </p>
                  ) : null}
                  <p className="text-[#0F2A1D]/60">
                    {formatClientBookingPrice(nextBooking.session?.price)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${bookingStatusStyles[nextBooking.status as BookingStatus]}`}
                  >
                    {nextBooking.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetailBooking(nextBooking)}
                    className="text-sm font-medium text-[#0F2A1D] hover:underline"
                  >
                    View details
                  </button>
                  {canCancelNext ? (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(nextBooking)}
                      className="text-sm font-medium text-red-700 hover:underline"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#EDECE6] bg-white p-8 text-center">
                <p className="text-[#0F2A1D]/70">No upcoming sessions booked.</p>
                <Link
                  to="/dashboard/book"
                  className="mt-4 inline-block rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2A1D]/90"
                >
                  Browse sessions
                </Link>
              </div>
            )}

            <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl font-semibold">Upcoming</h2>
                  <p className="mt-1 text-sm text-[#0F2A1D]/60">Your next scheduled sessions</p>
                </div>
                <Link
                  to="/dashboard/bookings?status=upcoming"
                  className="shrink-0 text-sm font-medium text-[#0F2A1D] hover:underline"
                >
                  View all
                </Link>
              </div>
              {loading ? (
                <div className="mt-6 space-y-4">
                  {[1, 2, 3].map((key) => (
                    <div key={key} className="h-12 animate-pulse rounded bg-[#EDECE6]" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <p className="mt-6 text-sm text-[#0F2A1D]/60">No upcoming bookings yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-[#EDECE6]">
                  {upcoming.map((item) => (
                    <UpcomingBookingRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div
            id="activity"
            className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm lg:col-span-7 scroll-mt-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold">Recent activity</h2>
                <p className="mt-1 text-sm text-[#0F2A1D]/60">
                  Updates on your booking requests
                </p>
              </div>
              <Link
                to="/dashboard/bookings"
                className="shrink-0 text-sm font-medium text-[#0F2A1D] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
              {ACTIVITY_FILTER_OPTIONS.map((option) => {
                const active = activityFilter === option.id;
                const count = activityCounts[option.id];
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActivityFilter(option.id)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#0F2A1D] text-white shadow-sm"
                        : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]",
                    )}
                  >
                    {option.label}
                    <span
                      className={cn(
                        "ml-1.5 tabular-nums",
                        active ? "text-white/70" : "text-[#0F2A1D]/40",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="mt-6 space-y-4">
                {[1, 2, 3, 4].map((key) => (
                  <div key={key} className="h-12 animate-pulse rounded bg-[#EDECE6]" />
                ))}
              </div>
            ) : filteredActivity.length === 0 ? (
              <p className="mt-6 text-sm text-[#0F2A1D]/60">
                {activityFilter === "all"
                  ? "No recent booking activity."
                  : `No ${activityFilter} activity yet.`}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#EDECE6]">
                {filteredActivity.map((item) => (
                  <ActivityTimelineRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {!loading && profile?.status !== "banned" ? (
          <OpenSessionsPreview
            variant={summary && summary.upcomingCount > 0 ? "compact" : "default"}
          />
        ) : null}
      </div>

      <ClientBookingDetailModal
        booking={detailBooking}
        open={detailBooking !== null}
        onClose={() => setDetailBooking(null)}
        onCancel={
          detailBooking &&
          (detailBooking.status === "pending" || detailBooking.status === "confirmed")
            ? () => setCancelTarget(detailBooking)
            : undefined
        }
      />

      <CancelBookingModal
        open={cancelTarget !== null}
        sessionTitle={cancelTarget?.session?.title ?? "Session"}
        submitting={cancelling}
        error={cancelError}
        onClose={() => {
          setCancelTarget(null);
          setCancelError(null);
        }}
        onConfirm={(reason) => void handleCancelConfirm(reason)}
      />
    </DashboardLayout>
  );
}
