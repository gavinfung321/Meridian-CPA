import { Calendar, Clock, MapPin, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminModal } from "../../components/AdminModal";
import { Button } from "../../components/ui/button";
import {
  bookingStatusStyles,
  formatBookingCreatedDate,
  formatBookingRelativeTime,
} from "../../lib/booking-admin";
import {
  fetchClientBookingHistory,
  formatClientBookingPrice,
  type ClientBookingHistoryEntry,
} from "../../lib/client-dashboard";
import { formatSessionSchedule } from "../../lib/session-admin";
import type { ClientBookingRow } from "../../lib/client-bookings";
import type { BookingStatus } from "../../types/database";

interface ClientBookingDetailModalProps {
  booking: ClientBookingRow | null;
  open: boolean;
  onClose: () => void;
  onCancel?: () => void;
}

export function ClientBookingDetailModal({
  booking,
  open,
  onClose,
  onCancel,
}: ClientBookingDetailModalProps): JSX.Element | null {
  const [history, setHistory] = useState<ClientBookingHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!open || !booking) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    void fetchClientBookingHistory(booking.id)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [booking, open]);

  if (!open || !booking) return null;

  const status = booking.status as BookingStatus;
  const canCancel = status === "pending" || status === "confirmed";
  const session = booking.session;

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={session?.title ?? "Booking details"}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canCancel && onCancel ? (
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={onCancel}
            >
              Cancel booking
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${bookingStatusStyles[status]}`}
          >
            {status}
          </span>
          <span className="text-sm text-[#0F2A1D]/60">
            Requested {formatBookingCreatedDate(booking.created_at)}
          </span>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" aria-hidden />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
                Schedule
              </dt>
              <dd className="mt-1 text-sm text-[#0F2A1D]">
                {session?.start_time ? formatSessionSchedule(session.start_time) : "—"}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" aria-hidden />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
                Location
              </dt>
              <dd className="mt-1 text-sm text-[#0F2A1D]">{session?.location ?? "—"}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" aria-hidden />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
                Price
              </dt>
              <dd className="mt-1 text-sm text-[#0F2A1D]">
                {formatClientBookingPrice(session?.price)}
              </dd>
            </div>
          </div>
        </dl>

        {booking.cancel_reason ? (
          <div className="rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              {status === "rejected" ? "Reason for decline" : "Cancellation reason"}
            </p>
            <p className="mt-1 text-sm text-[#0F2A1D]">{booking.cancel_reason}</p>
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#C9A84C]" aria-hidden />
            <h3 className="text-sm font-semibold text-[#0F2A1D]">Activity</h3>
          </div>
          {historyLoading ? (
            <p className="text-sm text-[#0F2A1D]/60">Loading activity…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-[#0F2A1D]/60">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-3 border-l-2 border-[#EDECE6] pl-4">
              {history.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-[#C9A84C]" />
                  <p className="text-sm font-medium text-[#0F2A1D]">{entry.label}</p>
                  <p className="text-xs text-[#0F2A1D]/50">
                    {entry.actor === "you" ? "You" : "Meridian"} ·{" "}
                    {formatBookingRelativeTime(entry.createdAt)}
                  </p>
                  {entry.notes ? (
                    <p className="mt-1 text-sm text-[#0F2A1D]/70">{entry.notes}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
