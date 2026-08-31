import { CalendarDays, LayoutList, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookSessionModal } from "../../components/BookSessionModal";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { createClientBooking } from "../../lib/client-bookings";
import { fetchClientCalendarSessions } from "../../lib/client-sessions";
import { countActiveBookings, startOfWeek } from "../../lib/session-admin";
import { fetchPublicSessions, type PublicSessionCard } from "../../lib/public-sessions";
import { cn } from "../../lib/utils";
import {
  SessionsCalendarView,
  type CalendarSessionRow,
} from "../Admin/catalog/SessionsCalendarView";
import {
  BookingFilters,
  type SessionLocationFilter,
  type SessionTypeFilter,
} from "../Desktop/sections/BookingSection/BookingFilters";
import { SessionCard } from "../Desktop/sections/BookingSection/SessionCard";

type BookViewMode = "list" | "calendar";

export function DashboardBookSession(): JSX.Element {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<BookViewMode>("list");
  const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>("all");
  const [locationFilter, setLocationFilter] = useState<SessionLocationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<PublicSessionCard[]>([]);
  const [calendarSessions, setCalendarSessions] = useState<CalendarSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [bookSession, setBookSession] = useState<PublicSessionCard | null>(null);
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setError(null);
    const [cards, calendar] = await Promise.all([
      fetchPublicSessions("en-HK"),
      fetchClientCalendarSessions(),
    ]);
    setSessions(cards);
    setCalendarSessions(calendar as CalendarSessionRow[]);
  }, []);

  useEffect(() => {
    document.title = "Book a session | Meridian CPA";
  }, []);

  useEffect(() => {
    void loadSessions()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load sessions.");
      })
      .finally(() => setLoading(false));
  }, [loadSessions]);

  const sessionIdFromUrl = searchParams.get("session");

  useEffect(() => {
    if (!sessionIdFromUrl || loading) return;
    const match = sessions.find((session) => session.id === sessionIdFromUrl);
    if (match) {
      setBookSession(match);
      setBookError(null);
    }
  }, [sessionIdFromUrl, sessions, loading]);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return sessions.filter((session) => {
      const spotsLeft = session.capacity.total - session.capacity.booked;
      if (spotsLeft <= 0) return false;
      if (typeFilter !== "all" && session.typeFilter !== typeFilter) return false;
      if (locationFilter !== "all" && session.locationFilter !== locationFilter) return false;
      if (normalizedQuery && !session.title.toLowerCase().includes(normalizedQuery)) return false;
      return true;
    });
  }, [sessions, typeFilter, locationFilter, searchQuery]);

  const filteredCalendarSessions = useMemo(() => {
    const bookableIds = new Set(filteredSessions.map((session) => session.id));
    return calendarSessions.filter((session) => {
      if (!bookableIds.has(session.id)) return false;
      const active = countActiveBookings(session.bookings);
      return active < session.max_slots;
    });
  }, [calendarSessions, filteredSessions]);

  const openBookModal = (session: PublicSessionCard) => {
    setBookError(null);
    setBookSession(session);
    setSearchParams(
      (params) => {
        params.set("session", session.id);
        return params;
      },
      { replace: true },
    );
  };

  const closeBookModal = () => {
    setBookSession(null);
    setBookError(null);
    setSearchParams(
      (params) => {
        params.delete("session");
        return params;
      },
      { replace: true },
    );
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
      showToast("Booking request submitted — pending firm approval.");
      await loadSessions();
      navigate("/dashboard/bookings");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Booking failed.";
      setBookError(message);
      showToast(message, "error");
    } finally {
      setBookSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Book a session</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Choose a consultation from our open schedule — list or calendar view.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <BookingFilters
            lang="en"
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  viewMode === "list"
                    ? "bg-[#0F2A1D] text-white shadow-sm"
                    : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]",
                )}
              >
                <LayoutList className="h-4 w-4" aria-hidden />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  viewMode === "calendar"
                    ? "bg-[#0F2A1D] text-white shadow-sm"
                    : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]",
                )}
              >
                <CalendarDays className="h-4 w-4" aria-hidden />
                Calendar
              </button>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F2A1D]/35" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search sessions…"
                className="w-full rounded-lg border border-[#EDECE6] bg-white py-2 pl-9 pr-3 text-sm outline-none ring-[#C9A84C] focus:ring-2"
              />
            </div>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <div className="rounded-xl border border-[#EDECE6] bg-white p-4 shadow-sm sm:p-6">
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="h-52 animate-pulse rounded-xl bg-[#EDECE6]" />
                ))}
              </div>
            ) : filteredCalendarSessions.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-[#0F2A1D]/70">No sessions match your filters this week.</p>
              </div>
            ) : (
              <SessionsCalendarView
                sessions={filteredCalendarSessions}
                weekStart={weekStart}
                onWeekStartChange={setWeekStart}
                onSessionClick={handleCalendarSessionClick}
                showAddOnEmptyDay={false}
              />
            )}
          </div>
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-xl border border-[#EDECE6] bg-white"
              />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#EDECE6] bg-white px-6 py-12 text-center">
            <p className="text-[#0F2A1D]/70">No open sessions match your filters right now.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                lang="en"
                onBook={() => openBookModal(session)}
              />
            ))}
          </div>
        )}
      </div>

      <BookSessionModal
        session={bookSession}
        open={bookSession !== null}
        submitting={bookSubmitting}
        error={bookError}
        onClose={closeBookModal}
        onConfirm={() => void handleConfirmBooking()}
      />
    </DashboardLayout>
  );
}
