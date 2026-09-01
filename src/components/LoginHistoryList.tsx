import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { formatBookingRelativeTime } from "../lib/booking-admin";
import {
  fetchUserLoginHistory,
  formatLoginUserAgent,
  type UserLoginHistoryRow,
} from "../lib/login-history";

interface LoginHistoryListProps {
  userId: string;
}

export function LoginHistoryList({ userId }: LoginHistoryListProps): JSX.Element {
  const [rows, setRows] = useState<UserLoginHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchUserLoginHistory(userId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <section className="border-t border-[#EDECE6] pt-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#C9A84C]" aria-hidden />
        <h3 className="text-sm font-semibold text-[#0F2A1D]">Login history</h3>
      </div>
      {loading ? (
        <p className="text-sm text-[#0F2A1D]/60">Loading login history…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[#0F2A1D]/60">No logins recorded yet.</p>
      ) : (
        <ul className="max-h-48 space-y-3 overflow-y-auto divide-y divide-[#EDECE6]">
          {rows.map((row) => (
            <li key={row.id} className="pt-3 first:pt-0">
              <p className="text-sm font-medium text-[#0F2A1D]">
                {formatBookingRelativeTime(row.login_time)}
              </p>
              <p className="mt-0.5 text-xs text-[#0F2A1D]/55">
                {formatLoginUserAgent(row.user_agent)}
              </p>
              {row.ip_address ? (
                <p className="text-xs text-[#0F2A1D]/45">IP: {row.ip_address}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
