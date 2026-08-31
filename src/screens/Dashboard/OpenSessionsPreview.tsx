import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { buildUserSessionBookingMap, fetchClientBookings } from "../../lib/client-bookings";
import { selectAvailableSessions } from "../../lib/client-dashboard";
import { fetchPublicSessions, type PublicSessionCard } from "../../lib/public-sessions";

const PREVIEW_LIMIT = 3;

type OpenSessionsPreviewProps = {
  variant?: "default" | "compact";
};

export function OpenSessionsPreview({
  variant = "default",
}: OpenSessionsPreviewProps): JSX.Element | null {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PublicSessionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    void Promise.all([fetchPublicSessions("en-HK"), fetchClientBookings(user.id)])
      .then(([publicSessions, bookings]) => {
        if (cancelled) return;
        const registeredIds = new Set(buildUserSessionBookingMap(bookings).keys());
        const available = selectAvailableSessions(publicSessions, PREVIEW_LIMIT + registeredIds.size)
          .filter((session) => !registeredIds.has(session.id))
          .slice(0, PREVIEW_LIMIT);
        setSessions(available);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="mt-8 rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {[1, 2, 3].map((key) => (
            <div key={key} className="h-10 animate-pulse rounded bg-[#EDECE6]" />
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) return null;

  const isCompact = variant === "compact";

  return (
    <section className="mt-8 rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">
            {isCompact ? "Browse more sessions" : "Open sessions"}
          </h2>
          <p className="mt-1 text-sm text-[#0F2A1D]/60">
            {isCompact
              ? "Book another consultation from our open schedule."
              : "A few consultations you can book right now."}
          </p>
        </div>
        <Link
          to="/dashboard/book"
          className="shrink-0 text-sm font-medium text-[#0F2A1D] hover:underline"
        >
          Browse all sessions →
        </Link>
      </div>
      <ul className="divide-y divide-[#EDECE6]">
        {sessions.map((session) => {
          const spotsLeft = session.capacity.total - session.capacity.booked;
          return (
            <li
              key={session.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#0F2A1D]">{session.title}</p>
                <p className="truncate text-sm text-[#0F2A1D]/60">
                  {session.day} {session.time} · {session.location} ·{" "}
                  {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                </p>
              </div>
              <Link
                to={`/dashboard/book?session=${session.id}`}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2A1D]/90"
              >
                Book
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
