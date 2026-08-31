import { CalendarDays, Eye, LayoutList, Search, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { buildAdminSessionBookingsUrl } from "../../../lib/booking-admin";
import {
  filterSessionsBySearch,
  formatAdminSessionCapacity,
  formatPrice,
  formatSessionSchedule,
  getSessionBookingCounts,
  startOfWeek,
  adminInputClassName,
} from "../../../lib/session-admin";
import {
  adminTableRowInteractiveClassName,
  adminTableViewButtonClassName,
} from "../../../lib/table-styles";
import { cn } from "../../../lib/utils";
import { supabase } from "../../../lib/supabase";
import type { Session } from "../../../types/database";
import { SessionCancelModal } from "./SessionCancelModal";
import { SessionFormModal, type SessionFormSavePayload } from "./SessionFormModal";
import { SessionsCalendarView } from "./SessionsCalendarView";
import { TableSkeleton } from "./TableSkeleton";

type SessionRow = Session & {
  session_type: { name: string; category: { name: string } | null } | null;
  bookings: Array<{ status: string }> | null;
};

type SessionStatusFilter = "active" | "cancelled" | "all";
type SessionViewMode = "list" | "calendar";

const SESSION_STATUS_FILTERS: Array<{ id: SessionStatusFilter; label: string }> = [
  { id: "active", label: "Active" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
];

function truncateDescription(text: string | null, max = 48): string {
  if (!text?.trim()) return "—";
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

export function CatalogSessionsTab(): JSX.Element {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<SessionRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<SessionRow | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SessionStatusFilter>("active");
  const [viewMode, setViewMode] = useState<SessionViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const loadSessions = useCallback(async () => {
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("sessions")
      .select(`
        *,
        session_type:session_types (
          name,
          category:categories (name)
        ),
        bookings (status)
      `)
      .order("is_cancelled", { ascending: true })
      .order("start_time", { ascending: true });

    if (fetchError) throw fetchError;
    setSessions((data ?? []) as SessionRow[]);
  }, []);

  const statusFilteredSessions = useMemo(() => {
    if (statusFilter === "all") return sessions;
    if (statusFilter === "cancelled") {
      return sessions.filter((session) => session.is_cancelled);
    }
    return sessions.filter((session) => !session.is_cancelled);
  }, [sessions, statusFilter]);

  const filteredSessions = useMemo(
    () => filterSessionsBySearch(statusFilteredSessions, searchQuery),
    [statusFilteredSessions, searchQuery],
  );

  useEffect(() => {
    void loadSessions()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load sessions.");
      })
      .finally(() => setLoading(false));
  }, [loadSessions]);

  const openEdit = (session: SessionRow) => {
    setEditTarget(session);
  };

  const openEditFromAction = (session: SessionRow, event: MouseEvent) => {
    event.stopPropagation();
    openEdit(session);
  };

  const closeEditModal = () => {
    setEditTarget(null);
  };

  const handleSave = async (payload: SessionFormSavePayload) => {
    if (!editTarget) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editTarget.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Session updated.");
    closeEditModal();
    await loadSessions();
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget || !reason.trim()) return;

    setCancelling(true);
    setError(null);

    const { error: cancelError } = await supabase
      .from("sessions")
      .update({
        is_cancelled: true,
        cancel_reason: reason.trim(),
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cancelTarget.id);

    setCancelling(false);

    if (cancelError) {
      setError(cancelError.message);
      return;
    }

    if (editTarget?.id === cancelTarget.id) {
      closeEditModal();
    }
    setCancelTarget(null);
    await loadSessions();
  };

  const handleReactivate = async (session: SessionRow) => {
    setReactivatingId(session.id);
    setError(null);

    const { error: reactivateError } = await supabase
      .from("sessions")
      .update({
        is_cancelled: false,
        cancel_reason: null,
        cancelled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    setReactivatingId(null);

    if (reactivateError) {
      setError(reactivateError.message);
      return;
    }

    if (editTarget?.id === session.id) {
      closeEditModal();
    }
    await loadSessions();
  };

  const openCancelFromModal = () => {
    if (!editTarget) return;
    setCancelTarget(editTarget);
  };

  const tableHeader = (
    <tr>
      <th className="px-4 py-3 font-medium">Session</th>
      <th className="px-4 py-3 font-medium">Description</th>
      <th className="px-4 py-3 font-medium">Date & Time</th>
      <th className="px-4 py-3 font-medium">Capacity</th>
      <th className="px-4 py-3 font-medium">Price</th>
      <th className="px-4 py-3 font-medium">Status</th>
      <th className="px-4 py-3 text-right font-medium">Actions</th>
    </tr>
  );

  const emptyMessage =
    sessions.length === 0 ? (
      <>
        Use <span className="font-medium text-[#0F2A1D]">+ New Session</span> above to create your
        first bookable slot.
      </>
    ) : searchQuery.trim() ? (
      "No sessions match your search."
    ) : statusFilter === "active" ? (
      "No active sessions scheduled."
    ) : statusFilter === "cancelled" ? (
      "No cancelled sessions."
    ) : (
      "No sessions match this filter."
    );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">
          Upcoming Schedule
          {!loading ? (
            <span className="ml-2 text-base font-normal text-[#0F2A1D]/50">
              ({filteredSessions.length})
            </span>
          ) : null}
        </h2>
        <Button asChild className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
          <Link to="/admin/sessions/new">+ New Session</Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
          {SESSION_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === filter.id
                  ? "bg-[#0F2A1D] text-white shadow-sm"
                  : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-[#0F2A1D] text-white shadow-sm"
                  : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]",
              )}
            >
              <LayoutList className="h-4 w-4" aria-hidden />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                viewMode === "calendar"
                  ? "bg-[#0F2A1D] text-white shadow-sm"
                  : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]",
              )}
            >
              <CalendarDays className="h-4 w-4" aria-hidden />
              Calendar
            </button>
          </div>

          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F2A1D]/35" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sessions…"
              className={`${adminInputClassName} w-full pl-9`}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {viewMode === "calendar" ? (
        <div className="rounded-xl border border-[#EDECE6] bg-white p-4 shadow-sm sm:p-6">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-52 animate-pulse rounded-xl bg-[#EDECE6]" />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">{emptyMessage}</p>
            </div>
          ) : (
            <SessionsCalendarView
              sessions={filteredSessions}
              weekStart={weekStart}
              onWeekStartChange={setWeekStart}
              onSessionClick={openEdit}
            />
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          {loading ? (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
                {tableHeader}
              </thead>
              <tbody>
                <TableSkeleton columns={7} />
              </tbody>
            </table>
          ) : filteredSessions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">{emptyMessage}</p>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
                {tableHeader}
              </thead>
              <tbody>
                {filteredSessions.map((session) => {
                  const counts = getSessionBookingCounts(session.bookings);
                  const capacity = formatAdminSessionCapacity(counts, session.max_slots);
                  const bookingsUrl = buildAdminSessionBookingsUrl(session.id, {
                    status: counts.pending > 0 ? "pending" : "all",
                  });
                  const typeLabel =
                    session.session_type?.category?.name && session.session_type?.name
                      ? `${session.session_type.category.name} · ${session.session_type.name}`
                      : session.type;
                  const descriptionPreview = truncateDescription(session.description);

                  return (
                    <tr
                      key={session.id}
                      className={adminTableRowInteractiveClassName}
                      onClick={() => openEdit(session)}
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-[#0F2A1D]">{session.title}</p>
                        <p className="mt-0.5 text-xs text-[#0F2A1D]/60">{typeLabel}</p>
                      </td>
                      <td
                        className="max-w-xs px-4 py-4 text-[#0F2A1D]/80"
                        title={session.description?.trim() || undefined}
                      >
                        {descriptionPreview}
                      </td>
                      <td className="px-4 py-4">{formatSessionSchedule(session.start_time)}</td>
                      <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                        <Link
                          to={bookingsUrl}
                          title={capacity.title}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#EDECE6] bg-[#F9F9F6] px-2.5 py-1 text-sm font-medium text-[#0F2A1D] transition-colors hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/10"
                        >
                          <Users className="h-3.5 w-3.5 text-[#0F2A1D]/60" aria-hidden />
                          {capacity.primary}
                        </Link>
                        {capacity.subline ? (
                          <Link
                            to={bookingsUrl}
                            className="mt-1 block text-xs text-amber-700 hover:text-amber-800 hover:underline"
                          >
                            {capacity.subline}
                          </Link>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">{formatPrice(Number(session.price))}</td>
                      <td className="px-4 py-4">
                        {session.is_cancelled ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                            Cancelled
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td
                        className="px-4 py-4 text-right"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          title="View session"
                          aria-label={`View ${session.title}`}
                          onClick={(event) => openEditFromAction(session, event)}
                          className={adminTableViewButtonClassName}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <SessionFormModal
        open={editTarget !== null}
        session={editTarget}
        bookingCounts={
          editTarget ? getSessionBookingCounts(editTarget.bookings) : undefined
        }
        saving={saving}
        reactivating={editTarget !== null && reactivatingId === editTarget.id}
        onClose={closeEditModal}
        onSave={(payload) => void handleSave(payload)}
        onRequestCancel={editTarget && !editTarget.is_cancelled ? openCancelFromModal : undefined}
        onReactivate={
          editTarget?.is_cancelled ? () => void handleReactivate(editTarget) : undefined
        }
      />

      <SessionCancelModal
        open={cancelTarget !== null}
        sessionTitle={cancelTarget?.title ?? ""}
        cancelling={cancelling}
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => void handleCancelConfirm(reason)}
      />
    </>
  );
}
