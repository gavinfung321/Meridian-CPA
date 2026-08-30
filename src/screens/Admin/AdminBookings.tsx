import { Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { useAuth } from "../../contexts/AuthContext";
import { AdminSortableTh, toggleSortDirection } from "../../components/AdminSortableTh";
import {
  filterAdminBookings,
  formatBookingCreatedDate,
  formatBookingPrice,
  formatBookingShortDate,
  getBookingClientName,
  getDefaultBookingSort,
  hasActiveBookingFilters,
  bookingStatusStyles,
  sortAdminBookings,
  type AdminBookingRow,
  type BookingDateRangeFilter,
  type BookingSortColumn,
  type BookingStatusFilter,
} from "../../lib/booking-admin";
import { fetchSessionTypesWithCategories } from "../../lib/session-admin";
import { adminTableRowInteractiveClassName } from "../../lib/table-styles";
import { supabase } from "../../lib/supabase";
import type { BookingStatus, Profile } from "../../types/database";
import { BookingDetailModal } from "./BookingDetailModal";
import { BookingFilters } from "./BookingFilters";
import { ClientProfileModal } from "./ClientProfileModal";
import { TableSkeleton } from "./catalog/TableSkeleton";

export function AdminBookings(): JSX.Element {
  const { profile: currentProfile } = useAuth();
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [sessionTypes, setSessionTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<BookingDateRangeFilter>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [selectedBooking, setSelectedBooking] = useState<AdminBookingRow | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [sort, setSort] = useState(getDefaultBookingSort);

  const loadBookings = useCallback(async (): Promise<AdminBookingRow[]> => {
    setError(null);

    const [bookingsResult, typesResult] = await Promise.all([
      supabase
        .from("bookings")
        .select(`
          id,
          status,
          cancel_reason,
          cancelled_at,
          created_at,
          user:profiles!bookings_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          session:sessions!bookings_session_id_fkey (
            id,
            title,
            start_time,
            price,
            location,
            session_type:session_types (
              id,
              name,
              category:categories ( name )
            )
          )
        `),
      fetchSessionTypesWithCategories(),
    ]);

    if (bookingsResult.error) throw bookingsResult.error;
    const rows = (bookingsResult.data ?? []) as AdminBookingRow[];
    setBookings(rows);
    setSessionTypes(typesResult.map((type) => ({ id: type.id, name: type.name })));
    return rows;
  }, []);

  useEffect(() => {
    document.title = "Bookings | Admin | Meridian CPA";
  }, []);

  useEffect(() => {
    void loadBookings()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load bookings.");
      })
      .finally(() => setLoading(false));
  }, [loadBookings]);

  const filteredBookings = useMemo(
    () =>
      filterAdminBookings(
        bookings,
        statusFilter,
        sessionTypeFilter,
        dateRange,
        customFrom,
        customTo,
      ),
    [bookings, statusFilter, sessionTypeFilter, dateRange, customFrom, customTo],
  );

  const sortedBookings = useMemo(
    () => sortAdminBookings(filteredBookings, sort.column, sort.direction),
    [filteredBookings, sort.column, sort.direction],
  );

  const handleSortColumn = (column: BookingSortColumn) => {
    setSort((current) => ({
      column,
      direction: toggleSortDirection(current.column, column, current.direction),
    }));
  };

  const bookingTableHeader = (
    <tr>
      <AdminSortableTh
        label="Client"
        active={sort.column === "client"}
        direction={sort.direction}
        onSort={() => handleSortColumn("client")}
      />
      <AdminSortableTh
        label="Session"
        active={sort.column === "session"}
        direction={sort.direction}
        onSort={() => handleSortColumn("session")}
      />
      <AdminSortableTh
        label="Date"
        active={sort.column === "date"}
        direction={sort.direction}
        onSort={() => handleSortColumn("date")}
      />
      <AdminSortableTh
        label="Price"
        active={sort.column === "price"}
        direction={sort.direction}
        onSort={() => handleSortColumn("price")}
      />
      <AdminSortableTh
        label="Status"
        active={sort.column === "status"}
        direction={sort.direction}
        onSort={() => handleSortColumn("status")}
      />
      <th className="px-4 py-3 text-right font-medium text-[#0F2A1D]/60">Actions</th>
    </tr>
  );

  const pendingCount = useMemo(
    () => bookings.filter((booking) => booking.status === "pending").length,
    [bookings],
  );

  const filtersActive = hasActiveBookingFilters(
    statusFilter,
    sessionTypeFilter,
    dateRange,
    customFrom,
    customTo,
  );

  const openBooking = (booking: AdminBookingRow) => {
    setSelectedBooking(booking);
  };

  const openBookingFromAction = (booking: AdminBookingRow, event: MouseEvent) => {
    event.stopPropagation();
    openBooking(booking);
  };

  const handleBookingUpdated = async (bookingId: string) => {
    const rows = await loadBookings();
    setSelectedBooking(rows.find((row) => row.id === bookingId) ?? null);
  };

  const openClientProfile = async (userId: string) => {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      setError(profileError.message);
      return;
    }

    setSelectedProfile(data);
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Bookings</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Review and manage all client booking requests.
            {pendingCount > 0 ? (
              <span className="ml-2 font-medium text-amber-700">
                {pendingCount} pending approval{pendingCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </p>
        </div>

        <BookingFilters
          statusFilter={statusFilter}
          sessionTypeFilter={sessionTypeFilter}
          dateRange={dateRange}
          customFrom={customFrom}
          customTo={customTo}
          sessionTypes={sessionTypes}
          resultCount={sortedBookings.length}
          onStatusChange={setStatusFilter}
          onSessionTypeChange={setSessionTypeFilter}
          onDateRangeChange={setDateRange}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          {loading ? (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6]">{bookingTableHeader}</thead>
              <tbody>
                <TableSkeleton columns={6} rows={4} />
              </tbody>
            </table>
          ) : sortedBookings.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">
                {filtersActive ? "No bookings match your filters." : "No bookings yet."}
              </p>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6]">{bookingTableHeader}</thead>
              <tbody>
                {sortedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={adminTableRowInteractiveClassName}
                    onClick={() => openBooking(booking)}
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-[#0F2A1D]">{getBookingClientName(booking)}</p>
                      <p className="mt-0.5 text-xs text-[#0F2A1D]/60">{booking.user?.email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-4">{booking.session?.title ?? "—"}</td>
                    <td className="px-4 py-4">
                      <p>{formatBookingShortDate(booking.session?.start_time ?? booking.created_at)}</p>
                      <p className="mt-0.5 text-xs text-[#0F2A1D]/50">
                        Booked {formatBookingCreatedDate(booking.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {formatBookingPrice(booking.session?.price)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          bookingStatusStyles[booking.status as BookingStatus]
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td
                      className="px-4 py-4 text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        title="View booking"
                        aria-label={`View booking for ${getBookingClientName(booking)}`}
                        onClick={(event) => openBookingFromAction(booking, event)}
                        className="rounded-md p-2 text-[#0F2A1D]/70 transition-colors hover:bg-[#EDECE6] hover:text-[#0F2A1D]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        open={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        onViewClient={(userId) => {
          setSelectedBooking(null);
          void openClientProfile(userId);
        }}
        onUpdated={(bookingId) => void handleBookingUpdated(bookingId)}
      />

      <ClientProfileModal
        profile={selectedProfile}
        currentUserId={currentProfile?.id}
        open={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        onUpdated={() => void loadBookings()}
      />
    </AdminLayout>
  );
}
