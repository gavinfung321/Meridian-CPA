import { Bell } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBookingNotifications } from "../hooks/useBookingNotifications";
import {
  formatBookingRelativeTime,
  formatBookingShortDate,
  fetchAdminPendingBookings,
  getBookingClientName,
  type AdminBookingRow,
} from "../lib/booking-admin";

const DROPDOWN_LIMIT = 8;

export function AdminNotificationBell(): JSX.Element {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [total, setTotal] = useState(0);

  const loadPending = useCallback(async () => {
    try {
      const result = await fetchAdminPendingBookings(DROPDOWN_LIMIT);
      setBookings(result.bookings);
      setTotal(result.total);
    } catch {
      // Keep last known list on transient errors.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  useBookingNotifications(loadPending);

  useEffect(() => {
    if (!open) return;

    void loadPending();

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, loadPending]);

  const handleSelectBooking = (bookingId: string) => {
    setOpen(false);
    navigate(`/admin/bookings?booking=${bookingId}`);
  };

  const badgeLabel =
    total > 0 ? `${total} pending booking${total === 1 ? "" : "s"}` : "Notifications";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        title={badgeLabel}
        aria-label={badgeLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/70 transition-colors hover:bg-white"
      >
        <Bell className="h-4 w-4" />
        {total > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9A84C] px-1 text-[10px] font-semibold text-[#0F2A1D]">
            {total > 9 ? "9+" : total}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-lg border border-[#EDECE6] bg-white shadow-lg"
        >
          <div className="border-b border-[#EDECE6] px-4 py-3">
            <p className="text-sm font-semibold text-[#0F2A1D]">
              Pending bookings{total > 0 ? ` (${total})` : ""}
            </p>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-[#0F2A1D]/60">Loading…</p>
          ) : bookings.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#0F2A1D]/60">No pending requests.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelectBooking(booking.id)}
                    className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-[#F9F9F6]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-[#0F2A1D]">
                        {getBookingClientName(booking)}
                      </span>
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium capitalize text-amber-700">
                        pending
                      </span>
                    </span>
                    <span className="truncate text-sm text-[#0F2A1D]/70">
                      {booking.session?.title ?? "Session"}
                      {booking.session?.start_time
                        ? ` · ${formatBookingShortDate(booking.session.start_time)}`
                        : ""}
                    </span>
                    <span className="text-xs text-[#0F2A1D]/50">
                      Submitted {formatBookingRelativeTime(booking.created_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-[#EDECE6] py-1">
            <Link
              to="/admin/bookings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-[#0F2A1D] hover:bg-[#F9F9F6]"
            >
              View all bookings{total > 0 ? ` (${total})` : ""} →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
