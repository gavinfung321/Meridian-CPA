import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { formatBookingRelativeTime } from "../lib/booking-admin";
import {
  fetchSessionHistory,
  sessionHistoryActionLabel,
  sessionHistoryActorName,
  type SessionHistoryRow,
} from "../lib/session-history";

interface SessionChangeLogProps {
  sessionId: string;
  refreshKey?: number;
}

export function SessionChangeLog({
  sessionId,
  refreshKey = 0,
}: SessionChangeLogProps): JSX.Element {
  const [rows, setRows] = useState<SessionHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchSessionHistory(sessionId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [sessionId, refreshKey]);

  return (
    <section className="border-t border-[#EDECE6] pt-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#C9A84C]" aria-hidden />
        <h3 className="text-sm font-semibold text-[#0F2A1D]">Change log</h3>
      </div>
      {loading ? (
        <p className="text-sm text-[#0F2A1D]/60">Loading change log…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[#0F2A1D]/60">No changes recorded yet.</p>
      ) : (
        <ul className="max-h-48 space-y-3 overflow-y-auto border-l-2 border-[#EDECE6] pl-4">
          {rows.map((row) => (
            <li key={row.id} className="relative">
              <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-[#C9A84C]" />
              <p className="text-sm font-medium text-[#0F2A1D]">
                {sessionHistoryActionLabel(row.action)}
              </p>
              <p className="text-xs text-[#0F2A1D]/50">
                {sessionHistoryActorName(row.changer)} ·{" "}
                {formatBookingRelativeTime(row.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
