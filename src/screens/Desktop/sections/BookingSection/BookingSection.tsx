import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookSessionModal } from "../../../../components/BookSessionModal";
import { useAuth } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";
import { createClientBooking } from "../../../../lib/client-bookings";
import { translations, Language } from "../../../../lib/translations";
import { fetchPublicSessions, type PublicSessionCard } from "../../../../lib/public-sessions";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";
import { BookingFilters, SessionLocationFilter, SessionTypeFilter } from "./BookingFilters";
import { SessionCard } from "./SessionCard";

interface BookingSectionProps {
  lang: Language;
}

export const BookingSection = ({ lang }: BookingSectionProps) => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>("all");
  const [locationFilter, setLocationFilter] = useState<SessionLocationFilter>("all");
  const [sessions, setSessions] = useState<PublicSessionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookSession, setBookSession] = useState<PublicSessionCard | null>(null);
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  const [headerRef, headerVisible] = useScrollAnimation<HTMLDivElement>(0.1);
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>(0.1);

  const t = translations[lang];
  const locale = lang === "zh" ? "zh-HK" : "en-HK";

  useEffect(() => {
    let cancelled = false;

    void fetchPublicSessions(locale)
      .then((data) => {
        if (!cancelled) setSessions(data);
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load sessions.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (typeFilter !== "all" && session.typeFilter !== typeFilter) return false;
      if (locationFilter !== "all" && session.locationFilter !== locationFilter) return false;
      return true;
    });
  }, [sessions, typeFilter, locationFilter]);

  const handleBookSession = (session: PublicSessionCard) => {
    setBookSuccess(null);
    if (!user) {
      navigate("/login", { state: { from: "/", bookSessionId: session.id } });
      return;
    }
    if (profile?.role === "admin") {
      navigate("/admin/bookings");
      return;
    }
    setBookError(null);
    setBookSession(session);
  };

  const handleConfirmBooking = async () => {
    if (!user || !bookSession) return;
    setBookSubmitting(true);
    setBookError(null);
    try {
      await createClientBooking(bookSession.id, user.id);
      setBookSession(null);
      const message =
        lang === "zh"
          ? "預約請求已提交，等待審批。"
          : "Booking request submitted — pending firm approval.";
      setBookSuccess(message);
      showToast(message);
      const data = await fetchPublicSessions(locale);
      setSessions(data);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Booking failed.";
      setBookError(message);
      showToast(message, "error");
    } finally {
      setBookSubmitting(false);
    }
  };

  return (
    <section
      id="booking"
      className="scroll-mt-24 flex w-full flex-col items-center border-t border-[#EDECE6] bg-[#F9F9F6] px-6 py-24 sm:px-12 sm:py-28 lg:px-[152px]"
    >
      <div className="flex w-full max-w-[1180px] flex-col gap-10">
        <header
          ref={headerRef}
          className={`scroll-hidden scroll-fade-up flex flex-col gap-3 ${headerVisible ? "scroll-visible" : ""}`}
        >
          <div className="text-sm font-semibold uppercase tracking-wider text-[#C9A84C]">
            {t.booking?.label}
          </div>
          <h2 className="font-serif text-[2.4rem] font-bold leading-tight tracking-tight text-[#0F2A1D]">
            {t.booking?.title}
          </h2>
          <p className="mt-2 max-w-[600px] text-[1.05rem] leading-relaxed text-[#2C3E35]">
            {t.booking?.subtitle}
          </p>
          <div className="mt-4 h-px w-10 bg-[#C9A84C]" aria-hidden="true" />
        </header>

        {bookSuccess ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {bookSuccess}{" "}
            {user ? (
              <button
                type="button"
                onClick={() => navigate("/dashboard/bookings")}
                className="font-medium underline"
              >
                {lang === "zh" ? "查看我的預約" : "View my bookings"}
              </button>
            ) : null}
          </div>
        ) : null}

        <div
          ref={gridRef}
          className={`scroll-hidden scroll-fade-up stagger-2 ${gridVisible ? "scroll-visible" : ""}`}
        >
          <BookingFilters
            lang={lang}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
          />

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-72 animate-pulse rounded-xl border border-[#EDECE6] bg-white"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
              {error}
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  lang={lang}
                  onBook={() => handleBookSession(session)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#EDECE6] bg-white py-20 text-center text-gray-500">
              {sessions.length === 0
                ? lang === "zh"
                  ? "暫無可預約時段。"
                  : "No upcoming sessions available."
                : lang === "zh"
                  ? "沒有符合篩選條件的時段。"
                  : "No sessions found matching your filters."}
            </div>
          )}
        </div>
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
    </section>
  );
};
