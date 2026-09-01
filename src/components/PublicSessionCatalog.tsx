import { CalendarDays, LayoutList, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookSessionModal } from "./BookSessionModal";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { isDashboardUserRole } from "../lib/auth-routes";
import {
  buildUserSessionBookingMap,
  createClientBooking,
  fetchClientBookings,
  type UserSessionBooking,
} from "../lib/client-bookings";
import { fetchClientCalendarSessions } from "../lib/client-sessions";
import { countActiveBookings, startOfWeek } from "../lib/session-admin";
import { fetchPublicSessions, type PublicSessionCard } from "../lib/public-sessions";
import {
  clearPendingBookSessionId,
  setPendingBookSessionId,
} from "../lib/pending-book-session";
import { Language, translations } from "../lib/translations";
import { cn } from "../lib/utils";
import {
  SessionsCalendarView,
  type CalendarSessionRow,
} from "../screens/Admin/catalog/SessionsCalendarView";
import {
  BookingFilters,
  type SessionLocationFilter,
  type SessionTypeFilter,
} from "../screens/Desktop/sections/BookingSection/BookingFilters";
import { SessionCard } from "../screens/Desktop/sections/BookingSection/SessionCard";

type BookViewMode = "list" | "calendar";
type CatalogVariant = "landing" | "portal";

export type PublicSessionCatalogProps = {
  lang: Language;
  locale: "en-HK" | "zh-HK";
  variant: CatalogVariant;
  onContactClick?: () => void;
  /** Portal: controlled session id from ?session= URL */
  openSessionId?: string | null;
  onOpenSessionChange?: (sessionId: string | null) => void;
  /** Landing: called after successful booking with success message */
  onBookingSuccess?: (message: string) => void;
};

function sessionMatchesFilters(
  session: PublicSessionCard,
  typeFilter: SessionTypeFilter,
  locationFilter: SessionLocationFilter,
  searchQuery: string,
): boolean {
  if (typeFilter !== "all" && session.typeFilter !== typeFilter) return false;
  if (locationFilter !== "all" && session.locationFilter !== locationFilter) return false;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (normalizedQuery && !session.title.toLowerCase().includes(normalizedQuery)) return false;
  return true;
}

export function PublicSessionCatalog({
  lang,
  locale,
  variant,
  onContactClick,
  openSessionId,
  onOpenSessionChange,
  onBookingSuccess,
}: PublicSessionCatalogProps): JSX.Element {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const t = translations[lang];

  const [viewMode, setViewMode] = useState<BookViewMode>("list");
  const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>("all");
  const [locationFilter, setLocationFilter] = useState<SessionLocationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<PublicSessionCard[]>([]);
  const [calendarSessions, setCalendarSessions] = useState<CalendarSessionRow[]>([]);
  const [userSessionBookings, setUserSessionBookings] = useState<Map<string, UserSessionBooking>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [bookSession, setBookSession] = useState<PublicSessionCard | null>(null);
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookingsReady, setBookingsReady] = useState(false);
  const handledOpenSessionRef = useRef<string | null>(null);
  const onOpenSessionChangeRef = useRef(onOpenSessionChange);

  useEffect(() => {
    onOpenSessionChangeRef.current = onOpenSessionChange;
  }, [onOpenSessionChange]);

  const isPortal = variant === "portal";
  const accentRing = isPortal ? "ring-[#C9A84C]" : "ring-[#C9A84C]";
  const toggleActive = isPortal ? "bg-[#0F2A1D] text-white shadow-sm" : "bg-[#0F2A1D] text-white shadow-sm";
  const toggleInactive = isPortal
    ? "text-[#0F2A1D]/70 hover:text-[#0F2A1D]"
    : "text-[#2C3E35]/70 hover:text-[#0F2A1D]";
  const searchIconClass = isPortal ? "text-[#0F2A1D]/35" : "text-[#2C3E35]/35";

  const loadUserBookings = useCallback(async () => {
    if (!user) {
      setUserSessionBookings(new Map());
      setBookingsReady(true);
      return;
    }
    setBookingsReady(false);
    const bookings = await fetchClientBookings(user.id);
    setUserSessionBookings(buildUserSessionBookingMap(bookings));
    setBookingsReady(true);
  }, [user]);

  const loadSessions = useCallback(async () => {
    setError(null);
    const [cards, calendar] = await Promise.all([
      fetchPublicSessions(locale),
      fetchClientCalendarSessions(),
    ]);
    setSessions(cards);
    setCalendarSessions(calendar as CalendarSessionRow[]);
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([loadSessions(), loadUserBookings()])
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load sessions.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadSessions, loadUserBookings]);

  useEffect(() => {
    if (!openSessionId) {
      handledOpenSessionRef.current = null;
      return;
    }

    if (loading || !bookingsReady) return;

    if (handledOpenSessionRef.current === openSessionId) return;

    const match = sessions.find((session) => session.id === openSessionId);
    if (!match) {
      if (sessions.length === 0) return;

      handledOpenSessionRef.current = openSessionId;
      showToast(
        lang === "zh" ? "找不到該活動或已不可預約。" : "This session is unavailable or no longer open.",
        "error",
      );
      clearPendingBookSessionId();
      onOpenSessionChangeRef.current?.(null);
      return;
    }

    const existing = userSessionBookings.get(match.id);
    if (existing) {
      handledOpenSessionRef.current = openSessionId;
      clearPendingBookSessionId();
      navigate(`/dashboard/bookings?booking=${existing.bookingId}`, { replace: true });
      return;
    }

    handledOpenSessionRef.current = openSessionId;
    clearPendingBookSessionId();
    setBookSession(match);
    setBookError(null);
  }, [
    openSessionId,
    sessions,
    loading,
    bookingsReady,
    userSessionBookings,
    navigate,
    showToast,
    lang,
  ]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (!sessionMatchesFilters(session, typeFilter, locationFilter, searchQuery)) return false;
      const spotsLeft = session.capacity.total - session.capacity.booked;
      const isRegistered = userSessionBookings.has(session.id);
      return isRegistered || spotsLeft > 0;
    });
  }, [sessions, typeFilter, locationFilter, searchQuery, userSessionBookings]);

  const filteredCalendarSessions = useMemo(() => {
    const visibleIds = new Set(filteredSessions.map((session) => session.id));
    return calendarSessions.filter((session) => {
      if (!visibleIds.has(session.id)) return false;
      const isRegistered = userSessionBookings.has(session.id);
      if (isRegistered) return true;
      const active = countActiveBookings(session.bookings);
      return active < session.max_slots;
    });
  }, [calendarSessions, filteredSessions, userSessionBookings]);

  const viewUserBooking = (bookingId: string) => {
    navigate(`/dashboard/bookings?booking=${bookingId}`);
  };

  const openBookModal = (session: PublicSessionCard) => {
    const existing = userSessionBookings.get(session.id);
    if (existing) {
      viewUserBooking(existing.bookingId);
      return;
    }

    if (!user) {
      setPendingBookSessionId(session.id);
      navigate("/login", { state: { from: "/", bookSessionId: session.id } });
      return;
    }

    if (profile?.role === "admin") {
      navigate("/admin/bookings");
      return;
    }

    setBookError(null);
    setBookSession(session);
    onOpenSessionChange?.(session.id);
  };

  const closeBookModal = () => {
    setBookSession(null);
    setBookError(null);
    clearPendingBookSessionId();
    onOpenSessionChangeRef.current?.(null);
    handledOpenSessionRef.current = null;
  };

  const handleCalendarSessionClick = (session: CalendarSessionRow) => {
    const card = sessions.find((item) => item.id === session.id);
    if (card) openBookModal(card);
  };

  const handleConfirmBooking = async () => {
    if (!user || !bookSession) return;
    setBookSubmitting(true);
    setBookError(null);
    try {
      await createClientBooking(bookSession.id, user.id);
      closeBookModal();
      const message =
        lang === "zh"
          ? "預約請求已提交，等待審批。"
          : "Booking request submitted — pending firm approval.";
      showToast(message);
      await Promise.all([loadSessions(), loadUserBookings()]);

      if (isPortal) {
        navigate("/dashboard/bookings");
      } else {
        onBookingSuccess?.(message);
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Booking failed.";
      setBookError(message);
      showToast(message, "error");
    } finally {
      setBookSubmitting(false);
    }
  };

  const emptyListMessage =
    sessions.length === 0
      ? t.booking.catalog.noSessions
      : t.booking.catalog.noMatches;

  const emptyCalendarMessage = t.booking.catalog.noMatchesWeek;

  return (
    <>
      {error ? (
        <div
          className={cn(
            "mb-4 rounded-lg border px-4 py-3 text-sm",
            isPortal
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {error}
        </div>
      ) : null}

      {variant === "landing" && user && isDashboardUserRole(profile?.role) ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#0F2A1D]/80">{t.portal.manageBanner}</p>
          <Link
            to="/dashboard/book"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2A1D]/90"
          >
            {t.portal.manageLink}
          </Link>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <BookingFilters
          lang={lang}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
          <div
            className={cn(
              "inline-flex shrink-0 rounded-lg border p-1",
              isPortal ? "border-[#EDECE6] bg-[#F9F9F6]" : "border-[#EDECE6] bg-white",
            )}
          >
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                viewMode === "list" ? toggleActive : toggleInactive,
              )}
            >
              <LayoutList className="h-4 w-4 shrink-0" aria-hidden />
              {t.booking.catalog.listView}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                viewMode === "calendar" ? toggleActive : toggleInactive,
              )}
            >
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
              {t.booking.catalog.calendarView}
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                searchIconClass,
              )}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t.booking.catalog.searchPlaceholder}
              className={cn(
                "w-full rounded-lg border border-[#EDECE6] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2",
                accentRing,
              )}
            />
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div
          className={cn(
            "rounded-xl border border-[#EDECE6] p-4 sm:p-6",
            isPortal ? "bg-white shadow-sm" : "bg-white",
          )}
        >
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-52 animate-pulse rounded-xl bg-[#EDECE6]" />
              ))}
            </div>
          ) : filteredCalendarSessions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">{emptyCalendarMessage}</p>
              {typeFilter !== "all" || locationFilter !== "all" || searchQuery.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("all");
                    setLocationFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-sm font-medium text-[#C9A84C] hover:underline"
                >
                  {t.booking.catalog.clearFilters}
                </button>
              ) : null}
            </div>
          ) : (
            <SessionsCalendarView
              sessions={filteredCalendarSessions}
              weekStart={weekStart}
              onWeekStartChange={setWeekStart}
              onSessionClick={handleCalendarSessionClick}
              showAddOnEmptyDay={false}
              userSessionBookings={userSessionBookings}
            />
          )}
        </div>
      ) : loading ? (
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-xl border border-[#EDECE6] bg-white"
            />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#EDECE6] bg-white px-6 py-12 text-center">
          <p className="text-[#0F2A1D]/70">{emptyListMessage}</p>
          {typeFilter !== "all" || locationFilter !== "all" || searchQuery.trim() ? (
            <button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setLocationFilter("all");
                setSearchQuery("");
              }}
              className="mt-4 text-sm font-medium text-[#C9A84C] hover:underline"
            >
              {t.booking.catalog.clearFilters}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              lang={lang}
              userBooking={userSessionBookings.get(session.id) ?? null}
              onViewBooking={viewUserBooking}
              onBook={() => openBookModal(session)}
            />
          ))}
        </div>
      )}

      {variant === "landing" && onContactClick ? (
        <div className="mt-12 rounded-xl border border-[#EDECE6] bg-[#0F2A1D] px-6 py-8 text-center sm:px-10">
          <p className="text-[1.05rem] leading-relaxed text-white/90">
            <span className="font-semibold text-white">{t.booking.banner.title}</span>{" "}
            {t.booking.banner.body}
          </p>
          <Button
            type="button"
            onClick={onContactClick}
            className="mt-5 h-auto rounded-full bg-[#C9A84C] px-8 py-3 text-[15px] font-semibold text-[#0F2A1D] shadow-none transition-all duration-200 hover:scale-[1.03] hover:bg-white"
          >
            {t.contact.btn}
          </Button>
        </div>
      ) : null}

      <BookSessionModal
        session={bookSession}
        lang={lang}
        open={bookSession !== null}
        submitting={bookSubmitting}
        error={bookError}
        onClose={closeBookModal}
        onConfirm={() => void handleConfirmBooking()}
      />
    </>
  );
}
