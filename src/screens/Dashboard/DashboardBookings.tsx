import { Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CancelBookingModal } from "../../components/BookSessionModal";
import {
  AdminTablePagination,
  DEFAULT_TABLE_PAGE_SIZE,
} from "../../components/AdminTablePagination";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useBookingNotifications } from "../../hooks/useBookingNotifications";
import { bookingStatusStyles } from "../../lib/booking-admin";
import {
  CLIENT_BOOKING_STATUS_FILTER_OPTIONS,
  cancelClientBooking,
  fetchClientBookings,
  filterClientBookingsList,
  type ClientBookingRow,
  type ClientBookingStatusFilter,
} from "../../lib/client-bookings";
import { adminTableRowInteractiveClassName } from "../../lib/table-styles";
import { formatSessionSchedule } from "../../lib/session-admin";
import { cn } from "../../lib/utils";
import type { BookingStatus } from "../../types/database";
import { ClientBookingDetailModal } from "./ClientBookingDetailModal";

export function DashboardBookings(): JSX.Element {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<ClientBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClientBookingStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<ClientBookingRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ClientBookingRow | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_TABLE_PAGE_SIZE);

  const loadBookings = useCallback(async (): Promise<ClientBookingRow[]> => {
    if (!user) return [];
    setError(null);
    const rows = await fetchClientBookings(user.id);
    setBookings(rows);
    return rows;
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

  useBookingNotifications(
    useCallback(() => {
      void loadBookings().catch(() => undefined);
    }, [loadBookings]),
    Boolean(user),
  );

  const bookingIdFromUrl = searchParams.get("booking");
  const statusFromUrl = searchParams.get("status");

  useEffect(() => {
    if (!statusFromUrl) return;
    if (
      statusFromUrl === "all" ||
      statusFromUrl === "upcoming" ||
      statusFromUrl === "pending" ||
      statusFromUrl === "past" ||
      statusFromUrl === "cancelled"
    ) {
      setStatusFilter(statusFromUrl);
    }
  }, [statusFromUrl]);

  useEffect(() => {
    if (!bookingIdFromUrl || loading) return;

    const match = bookings.find((booking) => booking.id === bookingIdFromUrl);
    if (match) {
      setSelectedBooking(match);
      return;
    }

    if (bookings.length > 0) {
      setSearchParams(
        (params) => {
          params.delete("booking");
          return params;
        },
        { replace: true },
      );
    }
  }, [bookingIdFromUrl, bookings, loading, setSearchParams]);

  const filteredBookings = useMemo(
    () => filterClientBookingsList(bookings, statusFilter, searchQuery),
    [bookings, statusFilter, searchQuery],
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery, pageSize]);

  const totalCount = filteredBookings.length;
  const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalCount);
  const paginatedBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize);

  const handleStatusFilterChange = (next: ClientBookingStatusFilter) => {
    setStatusFilter(next);
    setSearchParams(
      (params) => {
        if (next === "all") params.delete("status");
        else params.set("status", next);
        return params;
      },
      { replace: true },
    );
  };

  const openBooking = (booking: ClientBookingRow) => {
    setSelectedBooking(booking);
    setSearchParams(
      (params) => {
        params.set("booking", booking.id);
        return params;
      },
      { replace: true },
    );
  };

  const closeBooking = () => {
    setSelectedBooking(null);
    setSearchParams(
      (params) => {
        params.delete("booking");
        return params;
      },
      { replace: true },
    );
  };

  const handleRowClick = (booking: ClientBookingRow) => {
    openBooking(booking);
  };

  const handleViewClick = (event: MouseEvent, booking: ClientBookingRow) => {
    event.stopPropagation();
    openBooking(booking);
  };

  const handleCancelClick = (event: MouseEvent, booking: ClientBookingRow) => {
    event.stopPropagation();
    setCancelTarget(booking);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!user || !cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelClientBooking(cancelTarget.id, user.id, reason);
      setCancelTarget(null);
      setSelectedBooking(null);
      closeBooking();
      showToast("Booking cancelled.");
      await loadBookings();
    } catch (cancelErr) {
      const message = cancelErr instanceof Error ? cancelErr.message : "Cancellation failed.";
      setCancelError(message);
      showToast(message, "error");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">My bookings</h1>
            <p className="mt-2 text-[#0F2A1D]/70">Track your session requests and confirmations.</p>
          </div>
          <Link
            to="/dashboard/book"
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

        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex flex-wrap rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
            {CLIENT_BOOKING_STATUS_FILTER_OPTIONS.map((option) => {
              const active = statusFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleStatusFilterChange(option.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#0F2A1D] text-white shadow-sm"
                      : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by session name…"
            className="w-full rounded-lg border border-[#EDECE6] bg-white px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2 lg:max-w-xs"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          {loading ? (
            <div className="px-4 py-12 text-center text-[#0F2A1D]/60">Loading bookings…</div>
          ) : filteredBookings.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">
                {bookings.length === 0
                  ? "You have no bookings yet."
                  : "No bookings match your filters."}
              </p>
              <Link
                to="/dashboard/book"
                className="mt-4 inline-block text-sm font-medium text-[#0F2A1D] hover:underline"
              >
                Browse available sessions
              </Link>
            </div>
          ) : (
            <>
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
                  {paginatedBookings.map((booking) => {
                    const canCancel =
                      booking.status === "pending" || booking.status === "confirmed";
                    return (
                      <tr
                        key={booking.id}
                        className={adminTableRowInteractiveClassName}
                        onClick={() => handleRowClick(booking)}
                      >
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="View booking"
                              aria-label="View booking"
                              onClick={(event) => handleViewClick(event, booking)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#EDECE6] text-[#0F2A1D]/70 transition-colors hover:bg-[#F9F9F6]"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {canCancel ? (
                              <button
                                type="button"
                                onClick={(event) => handleCancelClick(event, booking)}
                                className="text-sm font-medium text-red-700 hover:underline"
                              >
                                Cancel
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="border-t border-[#EDECE6] px-4 py-3">
                <p className="mb-3 text-sm text-[#0F2A1D]/60">
                  Showing {pageStart} to {pageEnd} of {totalCount}
                </p>
                <AdminTablePagination
                  totalCount={totalCount}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <ClientBookingDetailModal
        booking={selectedBooking}
        open={selectedBooking !== null}
        onClose={closeBooking}
        onCancel={
          selectedBooking &&
          (selectedBooking.status === "pending" || selectedBooking.status === "confirmed")
            ? () => setCancelTarget(selectedBooking)
            : undefined
        }
      />

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
