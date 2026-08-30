import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CancelBookingModal } from "../../components/BookSessionModal";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { bookingStatusStyles } from "../../lib/booking-admin";
import {
  cancelClientBooking,
  fetchClientBookings,
  type ClientBookingRow,
} from "../../lib/client-bookings";
import { adminTableRowClassName } from "../../lib/table-styles";
import { formatSessionSchedule } from "../../lib/session-admin";
import type { BookingStatus } from "../../types/database";

export function DashboardBookings(): JSX.Element {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ClientBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ClientBookingRow | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user) return;
    setError(null);
    const rows = await fetchClientBookings(user.id);
    setBookings(rows);
  }, [user]);

  useEffect(() => {
    document.title = "Bookings | Meridian CPA";
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadBookings()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load bookings.");
      })
      .finally(() => setLoading(false));
  }, [user, loadBookings]);

  const handleCancelConfirm = async (reason: string) => {
    if (!user || !cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelClientBooking(cancelTarget.id, user.id, reason);
      setCancelTarget(null);
      await loadBookings();
    } catch (cancelErr) {
      setCancelError(cancelErr instanceof Error ? cancelErr.message : "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">My bookings</h1>
            <p className="mt-2 text-[#0F2A1D]/70">Track your session requests and confirmations.</p>
          </div>
          <Link
            to="/#booking"
            className="inline-flex rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2A1D]/90"
          >
            Book a session
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          {loading ? (
            <div className="px-4 py-12 text-center text-[#0F2A1D]/60">Loading bookings…</div>
          ) : bookings.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">You have no bookings yet.</p>
              <Link
                to="/#booking"
                className="mt-4 inline-block text-sm font-medium text-[#0F2A1D] hover:underline"
              >
                Browse available sessions
              </Link>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Session</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const canCancel =
                    booking.status === "pending" || booking.status === "confirmed";
                  return (
                    <tr key={booking.id} className={adminTableRowClassName}>
                      <td className="px-4 py-4 font-medium">
                        {booking.session?.title ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        {booking.session?.start_time
                          ? formatSessionSchedule(booking.session.start_time)
                          : "—"}
                      </td>
                      <td className="px-4 py-4">{booking.session?.location ?? "—"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${bookingStatusStyles[booking.status as BookingStatus]}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(booking)}
                            className="text-sm font-medium text-red-700 hover:underline"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[#0F2A1D]/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CancelBookingModal
        open={cancelTarget !== null}
        sessionTitle={cancelTarget?.session?.title ?? "Session"}
        submitting={cancelling}
        error={cancelError}
        onClose={() => {
          setCancelTarget(null);
          setCancelError(null);
        }}
        onConfirm={(reason) => void handleCancelConfirm(reason)}
      />
    </DashboardLayout>
  );
}
