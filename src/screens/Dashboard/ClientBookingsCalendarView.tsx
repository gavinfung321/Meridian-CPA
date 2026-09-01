import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "../../components/ui/button";
import { bookingStatusStyles } from "../../lib/booking-admin";
import type { ClientBookingRow } from "../../lib/client-bookings";
import {
  addCalendarDays,
  formatSessionTimeShort,
  formatWeekRangeLabel,
  isSameCalendarDay,
  startOfWeek,
} from "../../lib/session-admin";
import { cn } from "../../lib/utils";
import type { BookingStatus } from "../../types/database";

interface ClientBookingsCalendarViewProps {
  bookings: ClientBookingRow[];
  weekStart: Date;
  onWeekStartChange: (date: Date) => void;
  onBookingClick: (booking: ClientBookingRow) => void;
}

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function bookingCardClassName(status: BookingStatus): string {
  if (status === "pending") {
    return "border-l-[3px] border-[#EDECE6] border-l-[#C9A84C] bg-[#C9A84C]/10 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/15";
  }
  if (status === "confirmed") {
    return "border-l-[3px] border-[#EDECE6] border-l-emerald-500 bg-emerald-50/60 hover:border-emerald-500/40 hover:bg-emerald-50";
  }
  if (status === "cancelled" || status === "rejected") {
    return "border-[#EDECE6] bg-[#F9F9F6]/80 opacity-75 hover:bg-[#F9F9F6]";
  }
  return "border-[#EDECE6] bg-[#F9F9F6] hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5";
}

export function ClientBookingsCalendarView({
  bookings,
  weekStart,
  onWeekStartChange,
  onBookingClick,
}: ClientBookingsCalendarViewProps): JSX.Element {
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, index) => addCalendarDays(weekStart, index));

  const bookingsByDay = weekDays.reduce<Record<string, ClientBookingRow[]>>((groups, day) => {
    groups[dayKey(day)] = [];
    return groups;
  }, {});

  for (const booking of bookings) {
    const startTime = booking.session?.start_time;
    if (!startTime) continue;
    const key = dayKey(new Date(startTime));
    if (bookingsByDay[key]) {
      bookingsByDay[key].push(booking);
    }
  }

  for (const key of Object.keys(bookingsByDay)) {
    bookingsByDay[key].sort(
      (a, b) =>
        new Date(a.session?.start_time ?? 0).getTime() -
        new Date(b.session?.start_time ?? 0).getTime(),
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
          const dayBookings = bookingsByDay[key] ?? [];
          const isToday = isSameCalendarDay(day, today);
          const singleBookingDay = dayBookings.length === 1;

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
                {dayBookings.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-[#EDECE6] bg-[#F9F9F6]/60 px-2 py-4 text-center">
                    <p className="text-xs text-[#0F2A1D]/45">No bookings</p>
                  </div>
                ) : (
                  dayBookings.map((booking) => {
                    const startTime = booking.session?.start_time;
                    return (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => onBookingClick(booking)}
                        className={cn(
                          "flex flex-col text-left transition-colors",
                          singleBookingDay ? "flex-1" : "min-h-[128px]",
                          "rounded-lg border px-2.5 py-2",
                          bookingCardClassName(booking.status as BookingStatus),
                        )}
                      >
                        <div className="mb-1 min-h-[20px] shrink-0">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize",
                              bookingStatusStyles[booking.status as BookingStatus],
                            )}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-snug text-[#0F2A1D]">
                          {booking.session?.title ?? "Session"}
                        </p>
                        {startTime ? (
                          <p className="mt-1 flex shrink-0 items-center gap-1 text-[11px] text-[#C9A84C]">
                            <Clock className="h-3 w-3 shrink-0" aria-hidden />
                            {formatSessionTimeShort(startTime)}
                          </p>
                        ) : null}
                        {booking.session?.location ? (
                          <p className="mt-auto flex shrink-0 items-start gap-1 pt-2 text-[11px] text-[#0F2A1D]/60">
                            <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                            <span className="line-clamp-2">{booking.session.location}</span>
                          </p>
                        ) : null}
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
