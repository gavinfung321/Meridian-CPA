import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { Button } from "../../components/ui/button";
import {
  countActiveBookings,
  formatPrice,
  formatSessionSchedule,
} from "../../lib/session-admin";
import { supabase } from "../../lib/supabase";
import type { Session } from "../../types/database";

type SessionRow = Session & {
  session_type: { name: string; category: { name: string } | null } | null;
  bookings: Array<{ status: string }> | null;
};

export function AdminSessions(): JSX.Element {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    document.title = "Sessions | Admin | Meridian CPA";
  }, []);

  useEffect(() => {
    void loadSessions()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load sessions.");
      })
      .finally(() => setLoading(false));
  }, [loadSessions]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Sessions</h1>
            <p className="mt-2 text-[#0F2A1D]/70">Manage available booking slots.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/taxonomy">Manage taxonomy</Link>
            </Button>
            <Button asChild className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
              <Link to="/admin/sessions/new">+ New session</Link>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          {loading ? (
            <p className="px-4 py-8 text-sm text-[#0F2A1D]/70">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">No sessions yet.</p>
              <Button asChild className="mt-4 bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
                <Link to="/admin/sessions/new">Create your first session</Link>
              </Button>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Session</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Schedule</th>
                  <th className="px-4 py-3 font-medium">Slots</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
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
                    <tr key={session.id} className="border-b border-[#EDECE6] last:border-0">
                      <td className="px-4 py-4 font-medium">{session.title}</td>
                      <td className="px-4 py-4">{typeLabel}</td>
                      <td className="px-4 py-4">{session.location}</td>
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
                        <Link
                          to={`/admin/sessions/edit/${session.id}`}
                          className="font-medium text-[#0F2A1D] hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
