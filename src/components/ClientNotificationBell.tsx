import { Bell } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBookingNotifications } from "../hooks/useBookingNotifications";
import {
  buildClientNotificationItems,
  countClientNotificationBadge,
  type ClientNotificationItem,
} from "../lib/client-dashboard";
import { fetchClientBookings } from "../lib/client-bookings";
import { formatBookingRelativeTime, bookingStatusStyles } from "../lib/booking-admin";
import type { BookingStatus } from "../types/database";

const DROPDOWN_LIMIT = 8;

export function ClientNotificationBell(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ClientNotificationItem[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const bookings = await fetchClientBookings(user.id);
      setItems(buildClientNotificationItems(bookings).slice(0, DROPDOWN_LIMIT));
    } catch {
      // Keep last known list on transient errors.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useBookingNotifications(loadNotifications, Boolean(user));

  useEffect(() => {
    if (!open) return;

    void loadNotifications();

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
  }, [open, loadNotifications]);

  const badgeCount = countClientNotificationBadge(items);
  const badgeLabel =
    badgeCount > 0
      ? `${badgeCount} notification${badgeCount === 1 ? "" : "s"} need attention`
      : "Notifications";

  const handleSelectBooking = (bookingId: string) => {
    setOpen(false);
    navigate(`/dashboard/bookings?booking=${bookingId}`);
  };

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
        {badgeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9A84C] px-1 text-[10px] font-semibold text-[#0F2A1D]">
            {badgeCount > 9 ? "9+" : badgeCount}
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
              Your bookings{badgeCount > 0 ? ` (${badgeCount})` : ""}
            </p>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-[#0F2A1D]/60">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#0F2A1D]/60">No bookings need attention.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelectBooking(item.bookingId)}
                    className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-[#F9F9F6]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-[#0F2A1D]">
                        {item.headline}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${bookingStatusStyles[item.status as BookingStatus]}`}
                      >
                        {item.status}
                      </span>
                    </span>
                    <span className="truncate text-sm text-[#0F2A1D]/70">
                      {item.sessionTitle}
                      {item.scheduleLabel ? ` · ${item.scheduleLabel}` : ""}
                    </span>
                    <span className="text-xs text-[#0F2A1D]/50">
                      Updated {formatBookingRelativeTime(item.timestamp)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-[#EDECE6] py-1">
            <Link
              to="/dashboard#activity"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-[#0F2A1D] hover:bg-[#F9F9F6]"
            >
              View all activity →
            </Link>
            <Link
              to="/dashboard/bookings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-[#0F2A1D] hover:bg-[#F9F9F6]"
            >
              View my bookings →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
