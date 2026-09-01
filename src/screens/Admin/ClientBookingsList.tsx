import { Eye } from "lucide-react";
import {
  bookingStatusStyles,
  formatBookingCreatedDate,
  formatBookingPrice,
  formatBookingShortDate,
  getBookingSessionTypeLabel,
  type AdminBookingRow,
} from "../../lib/booking-admin";
import { adminTableRowInteractiveClassName, adminTableViewButtonClassName } from "../../lib/table-styles";
import type { BookingStatus } from "../../types/database";

interface ClientBookingsListProps {
  bookings: AdminBookingRow[];
  loading: boolean;
  onSelectBooking: (booking: AdminBookingRow) => void;
}

export function ClientBookingsList({
  bookings,
  loading,
  onSelectBooking,
}: ClientBookingsListProps): JSX.Element {
  if (loading) {
    return <p className="text-sm text-[#0F2A1D]/60">Loading bookings…</p>;
  }

  if (bookings.length === 0) {
    return <p className="text-sm text-[#0F2A1D]/60">No bookings yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
          <tr>
            <th className="px-4 py-3 font-medium">Session</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Booked</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className={adminTableRowInteractiveClassName}
              onClick={() => onSelectBooking(booking)}
            >
              <td className="px-4 py-4">
                <p className="font-medium text-[#0F2A1D]">
                  {booking.session?.title ?? "Unknown session"}
                </p>
                <p className="mt-0.5 text-xs text-[#0F2A1D]/55">
                  {getBookingSessionTypeLabel(booking)}
                </p>
              </td>
              <td className="px-4 py-4">
                {booking.session?.start_time
                  ? formatBookingShortDate(booking.session.start_time)
                  : "—"}
              </td>
              <td className="px-4 py-4">
                {booking.session ? formatBookingPrice(booking.session.price) : "—"}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    bookingStatusStyles[booking.status as BookingStatus]
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4">{formatBookingCreatedDate(booking.created_at)}</td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  title="View booking"
                  aria-label={`View booking for ${booking.session?.title ?? "session"}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectBooking(booking);
                  }}
                  className={adminTableViewButtonClassName}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
