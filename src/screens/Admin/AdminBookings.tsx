import { Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import {
  AdminTablePagination,
  DEFAULT_TABLE_PAGE_SIZE,
} from "../../components/AdminTablePagination";
import { useAuth } from "../../contexts/AuthContext";
import { useBookingNotifications } from "../../hooks/useBookingNotifications";
import { AdminSortableTh, toggleSortDirection } from "../../components/AdminSortableTh";
import {
  ADMIN_BOOKING_SELECT,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [sessionTypes, setSessionTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<BookingDateRangeFilter>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState<AdminBookingRow | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [sort, setSort] = useState(getDefaultBookingSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_TABLE_PAGE_SIZE);

  const loadBookings = useCallback(async (): Promise<AdminBookingRow[]> => {
    setError(null);

    const [bookingsResult, typesResult] = await Promise.all([
      supabase.from("bookings").select(ADMIN_BOOKING_SELECT),
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

  useBookingNotifications(
    useCallback(() => {
      void loadBookings().catch(() => undefined);
    }, [loadBookings]),
  );

  const bookingIdFromUrl = searchParams.get("booking");
  const statusFromUrl = searchParams.get("status");
  const sessionFromUrl = searchParams.get("session");

  useEffect(() => {
    if (!statusFromUrl) return;
    if (
      statusFromUrl === "pending" ||
      statusFromUrl === "confirmed" ||
      statusFromUrl === "cancelled" ||
      statusFromUrl === "rejected"
    ) {
      setStatusFilter(statusFromUrl);
    }
  }, [statusFromUrl]);

  useEffect(() => {
    setSessionFilter(sessionFromUrl ?? "all");
  }, [sessionFromUrl]);

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
    () =>
      filterAdminBookings(
        bookings,
        statusFilter,
        sessionTypeFilter,
        dateRange,
        customFrom,
        customTo,
        searchQuery,
        sessionFilter,
      ),
    [bookings, statusFilter, sessionTypeFilter, dateRange, customFrom, customTo, searchQuery, sessionFilter],
  );

  const sessionFilterTitle = useMemo(() => {
    if (sessionFilter === "all") return null;
    const match = bookings.find((booking) => booking.session?.id === sessionFilter);
    return match?.session?.title ?? "Selected session";
  }, [bookings, sessionFilter]);

  const sortedBookings = useMemo(
    () => sortAdminBookings(filteredBookings, sort.column, sort.direction),
    [filteredBookings, sort.column, sort.direction],
  );

  const totalPages = Math.max(1, Math.ceil(sortedBookings.length / pageSize));

  const paginatedBookings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedBookings.slice(start, start + pageSize);
  }, [sortedBookings, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [
    statusFilter,
    sessionTypeFilter,
    dateRange,
    customFrom,
    customTo,
    searchQuery,
    sessionFilter,
    sort.column,
    sort.direction,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

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
    searchQuery,
    sessionFilter,
  );

  const clearSessionFilter = () => {
    setSessionFilter("all");
    setSearchParams(
      (params) => {
        params.delete("session");
        return params;
      },
      { replace: true },
    );
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    if (searchParams.has("booking")) {
      setSearchParams(
        (params) => {
          params.delete("booking");
          return params;
        },
        { replace: true },
      );
    }
  };

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

        {sessionFilter !== "all" && sessionFilterTitle ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2.5 text-sm">
            <span className="text-[#0F2A1D]/60">Showing bookings for</span>
            <span className="font-medium text-[#0F2A1D]">{sessionFilterTitle}</span>
            <button
              type="button"
              onClick={clearSessionFilter}
              className="ml-auto text-xs font-medium text-[#0F2A1D]/70 underline-offset-2 hover:text-[#0F2A1D] hover:underline"
            >
              Clear session filter
            </button>
          </div>
        ) : null}

        <BookingFilters
          statusFilter={statusFilter}
          sessionTypeFilter={sessionTypeFilter}
          dateRange={dateRange}
          customFrom={customFrom}
          customTo={customTo}
          sessionTypes={sessionTypes}
          resultCount={sortedBookings.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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
                {filtersActive
                  ? sessionFilter !== "all"
                    ? "No bookings for this session match your filters."
                    : "No bookings match your filters."
                  : "No bookings yet."}
              </p>
            </div>
          ) : (
            <>
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[#EDECE6] bg-[#F9F9F6]">{bookingTableHeader}</thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
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
              <AdminTablePagination
                totalCount={sortedBookings.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </div>
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        open={selectedBooking !== null}
        onClose={closeBookingModal}
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
