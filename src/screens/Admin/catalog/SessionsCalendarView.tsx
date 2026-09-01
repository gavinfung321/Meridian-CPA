import { ChevronLeft, ChevronRight, Clock, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { bookingStatusStyles } from "../../../lib/booking-admin";
import type { UserSessionBooking } from "../../../lib/client-bookings";
import {
  addCalendarDays,
  formatPrice,
  formatSessionTimeRange,
  formatWeekRangeLabel,
  getSessionBookingCounts,
  isSameCalendarDay,
  startOfWeek,
} from "../../../lib/session-admin";
import { cn } from "../../../lib/utils";
import type { Session } from "../../../types/database";

export type CalendarSessionRow = Session & {
  session_type: { name: string; category: { name: string } | null } | null;
  bookings: Array<{ status: string }> | null;
};

interface SessionsCalendarViewProps {
  sessions: CalendarSessionRow[];
  weekStart: Date;
  onWeekStartChange: (date: Date) => void;
  onSessionClick: (session: CalendarSessionRow) => void;
  showAddOnEmptyDay?: boolean;
  userSessionBookings?: Map<string, UserSessionBooking>;
}

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function SessionsCalendarView({
  sessions,
  weekStart,
  onWeekStartChange,
  onSessionClick,
  showAddOnEmptyDay = true,
  userSessionBookings,
}: SessionsCalendarViewProps): JSX.Element {
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, index) => addCalendarDays(weekStart, index));

  const sessionsByDay = weekDays.reduce<Record<string, CalendarSessionRow[]>>((groups, day) => {
    groups[dayKey(day)] = [];
    return groups;
  }, {});

  for (const session of sessions) {
    const sessionDay = new Date(session.start_time);
    const key = dayKey(sessionDay);
    if (sessionsByDay[key]) {
      sessionsByDay[key].push(session);
    }
  }

  for (const key of Object.keys(sessionsByDay)) {
    sessionsByDay[key].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#0F2A1D]">{formatWeekRangeLabel(weekStart)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[#EDECE6]"
            onClick={() => onWeekStartChange(startOfWeek(today))}
          >
            Today
          </Button>
          <div className="inline-flex rounded-lg border border-[#EDECE6] bg-white">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => onWeekStartChange(addCalendarDays(weekStart, -7))}
              className="rounded-l-lg p-2 text-[#0F2A1D]/70 hover:bg-[#F9F9F6] hover:text-[#0F2A1D]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next week"
              onClick={() => onWeekStartChange(addCalendarDays(weekStart, 7))}
              className="rounded-r-lg border-l border-[#EDECE6] p-2 text-[#0F2A1D]/70 hover:bg-[#F9F9F6] hover:text-[#0F2A1D]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid auto-rows-fr items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {weekDays.map((day) => {
          const key = dayKey(day);
          const daySessions = sessionsByDay[key] ?? [];
          const isToday = isSameCalendarDay(day, today);
          const singleSessionDay = daySessions.length === 1;

          return (
            <div
              key={key}
              className={cn(
                "flex h-full min-h-[220px] flex-col rounded-xl border bg-white p-3 shadow-sm",
                isToday ? "border-[#C9A84C]/50 ring-1 ring-[#C9A84C]/20" : "border-[#EDECE6]",
              )}
            >
              <div className="mb-3 shrink-0 border-b border-[#EDECE6] pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0F2A1D]/45">
                  {new Intl.DateTimeFormat("en-HK", { weekday: "short" }).format(day)}
                </p>
                <p className={cn("font-serif text-2xl", isToday ? "text-[#C9A84C]" : "text-[#0F2A1D]")}>
                  {String(day.getDate()).padStart(2, "0")}
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2">
                {daySessions.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-[#EDECE6] bg-[#F9F9F6]/60 px-2 py-4 text-center">
                    <p className="text-xs text-[#0F2A1D]/45">No sessions</p>
                    {showAddOnEmptyDay ? (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-8 text-[#0F2A1D]/60 hover:text-[#0F2A1D]"
                      >
                        <Link to="/admin/sessions/new">
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  daySessions.map((session) => {
                    const counts = getSessionBookingCounts(session.bookings);
                    const fillPct =
                      session.max_slots > 0
                        ? Math.min(100, Math.round((counts.reserved / session.max_slots) * 100))
                        : 0;
                    const userBooking = userSessionBookings?.get(session.id);
                    const registeredLabel =
                      userBooking?.status === "pending" ? "Awaiting approval" : "Registered";

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => onSessionClick(session)}
                        className={cn(
                          "flex flex-col text-left transition-colors",
                          singleSessionDay ? "flex-1" : "min-h-[128px]",
                          "rounded-lg border px-2.5 py-2 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5",
                          session.is_cancelled
                            ? "border-red-200 bg-red-50/40 opacity-75"
                            : userBooking
                              ? userBooking.status === "pending"
                                ? "border-l-[3px] border-[#EDECE6] border-l-[#C9A84C] bg-[#C9A84C]/10"
                                : "border-l-[3px] border-[#EDECE6] border-l-emerald-500 bg-emerald-50/60"
                              : "border-[#EDECE6] bg-[#F9F9F6]",
                        )}
                      >
                        <div className="mb-1 min-h-[20px] shrink-0">
                          {userBooking ? (
                            <span
                              className={cn(
                                "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize",
                                bookingStatusStyles[userBooking.status],
                              )}
                            >
                              {registeredLabel}
                            </span>
                          ) : null}
                        </div>
                        <p className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-snug text-[#0F2A1D]">
                          {session.title}
                        </p>
                        <p className="mt-1 flex shrink-0 items-center gap-1 text-[11px] text-[#C9A84C]">
                          <Clock className="h-3 w-3 shrink-0" aria-hidden />
                          {formatSessionTimeRange(session.start_time, session.end_time)}
                        </p>
                        <div className="mt-auto shrink-0 pt-2">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#0F2A1D]/60">
                            <span className="inline-flex items-center gap-0.5">
                              <Users className="h-3 w-3" aria-hidden />
                              {counts.reserved}/{session.max_slots}
                            </span>
                            <span>{formatPrice(Number(session.price))}</span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#EDECE6]">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                session.is_cancelled ? "bg-red-300" : "bg-[#C9A84C]",
                              )}
                              style={{ width: `${Math.max(fillPct, fillPct > 0 ? 8 : 0)}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
