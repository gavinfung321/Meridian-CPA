import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
  countActiveBookings,
  formatPrice,
  formatSessionSchedule,
} from "../../../lib/session-admin";
import { adminTableRowClassName } from "../../../lib/table-styles";
import { supabase } from "../../../lib/supabase";
import type { Session } from "../../../types/database";
import { SessionCancelModal } from "./SessionCancelModal";
import { TableSkeleton } from "./TableSkeleton";

type SessionRow = Session & {
  session_type: { name: string; category: { name: string } | null } | null;
  bookings: Array<{ status: string }> | null;
};

export function CatalogSessionsTab(): JSX.Element {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SessionRow | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

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
      .order("start_time", { ascending: true });

    if (fetchError) throw fetchError;
    setSessions((data ?? []) as SessionRow[]);
  }, []);

  useEffect(() => {
    void loadSessions()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load sessions.");
      })
      .finally(() => setLoading(false));
  }, [loadSessions]);

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

    setCancelTarget(null);
    await loadSessions();
  };

  const handleReactivate = async (sessionId: string) => {
    setReactivatingId(sessionId);
    setError(null);

    const { error: reactivateError } = await supabase
      .from("sessions")
      .update({
        is_cancelled: false,
        cancel_reason: null,
        cancelled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    setReactivatingId(null);

    if (reactivateError) {
      setError(reactivateError.message);
      return;
    }

    await loadSessions();
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">
          Upcoming Schedule
          {!loading ? (
            <span className="ml-2 text-base font-normal text-[#0F2A1D]/50">
              ({sessions.length})
            </span>
          ) : null}
        </h2>
        <Button asChild className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
          <Link to="/admin/sessions/new">+ New Session</Link>
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
        {loading ? (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton columns={6} />
            </tbody>
          </table>
        ) : sessions.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[#0F2A1D]/70">
              Use <span className="font-medium text-[#0F2A1D]">+ New Session</span> above to create
              your first bookable slot.
            </p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const booked = countActiveBookings(session.bookings);
                const typeLabel =
                  session.session_type?.category?.name && session.session_type?.name
                    ? `${session.session_type.category.name} · ${session.session_type.name}`
                    : session.type;

                return (
                  <tr key={session.id} className={adminTableRowClassName}>
                    <td className="px-4 py-4">
                      <p className="font-medium text-[#0F2A1D]">{session.title}</p>
                      <p className="mt-0.5 text-xs text-[#0F2A1D]/60">{typeLabel}</p>
                    </td>
                    <td className="px-4 py-4">{formatSessionSchedule(session.start_time)}</td>
                    <td className="px-4 py-4">
                      {booked} / {session.max_slots}
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
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/admin/sessions/edit/${session.id}`}
                          className="font-medium text-[#0F2A1D] hover:underline"
                        >
                          Edit
                        </Link>
                        {session.is_cancelled ? (
                          <button
                            type="button"
                            disabled={reactivatingId === session.id}
                            onClick={() => void handleReactivate(session.id)}
                            className="font-medium text-[#C9A84C] hover:underline disabled:opacity-50"
                          >
                            {reactivatingId === session.id ? "Reactivating…" : "Reactivate"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(session)}
                            className="font-medium text-red-700 hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
