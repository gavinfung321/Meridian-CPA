import { Calendar, Check, Clock, MapPin, Tag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminModal } from "../../components/AdminModal";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  bookingStatusStyles,
  canManageBookingStatus,
  canReinstateBooking,
  formatBookingCreatedDate,
  formatBookingId,
  formatBookingLongSessionDate,
  formatBookingPrice,
  formatBookingRelativeTime,
  getBookingClientName,
  getBookingSessionTypeLabel,
  reinstateAdminBooking,
  updateBookingStatus,
  type AdminBookingRow,
} from "../../lib/booking-admin";
import {
  fetchAdminBookingHistory,
  type BookingHistoryTimelineEntry,
} from "../../lib/booking-history-display";
import type { BookingStatus } from "../../types/database";
import { BookingReasonModal, type BookingReasonAction } from "./BookingReasonModal";

interface BookingDetailModalProps {
  booking: AdminBookingRow | null;
  open: boolean;
  onClose: () => void;
  onViewClient?: (userId: string) => void;
  onUpdated: (bookingId: string) => void;
}

export function BookingDetailModal({
  booking,
  open,
  onClose,
  onViewClient,
  onUpdated,
}: BookingDetailModalProps): JSX.Element | null {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasonAction, setReasonAction] = useState<BookingReasonAction | null>(null);
  const [history, setHistory] = useState<BookingHistoryTimelineEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    setError(null);
    setReasonAction(null);
    setSaving(false);
  }, [booking?.id, open]);

  useEffect(() => {
    if (!open || !booking) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    void fetchAdminBookingHistory(booking.id)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [booking, open]);

  if (!open || !booking) return null;

  const clientName = getBookingClientName(booking);
  const status = booking.status as BookingStatus;
  const showManageStatus = canManageBookingStatus(status);
  const showReinstate = canReinstateBooking(status);

  const handleApprove = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateBookingStatus(booking.id, "confirmed", {
        changedBy: profile?.id,
      });
      showToast("Booking approved.");
      onUpdated(booking.id);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to approve booking.");
    } finally {
      setSaving(false);
    }
  };

  const handleReinstate = async () => {
    const sessionId = booking.session?.id;
    const userId = booking.user?.id;
    if (!sessionId || !userId) {
      setError("Missing session or client on this booking.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await reinstateAdminBooking(booking.id, sessionId, userId, profile?.id ?? userId);
      showToast("Booking reinstated as confirmed.");
      onUpdated(booking.id);
    } catch (reinstateError) {
      setError(
        reinstateError instanceof Error
          ? reinstateError.message
          : "Failed to reinstate booking.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReasonConfirm = async (reason: string) => {
    if (!reasonAction) return;
    setSaving(true);
    setError(null);
    try {
      const nextStatus: BookingStatus = reasonAction === "reject" ? "rejected" : "cancelled";
      await updateBookingStatus(booking.id, nextStatus, {
        reason,
        changedBy: profile?.id,
      });
      setReasonAction(null);
      showToast(reasonAction === "reject" ? "Booking rejected." : "Booking cancelled.");
      onUpdated(booking.id);
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Failed to update booking status.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (reasonAction) {
    return (
      <BookingReasonModal
        open
        action={reasonAction}
        clientName={clientName}
        saving={saving}
        onClose={() => setReasonAction(null)}
        onConfirm={(reason) => void handleReasonConfirm(reason)}
      />
    );
  }

  return (
    <AdminModal
      open
      onClose={onClose}
      title="Booking details"
      description={`Booking ${formatBookingId(booking.id)}`}
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">Client</p>
          <div className="mt-1 flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-[#0F2A1D]/50" />
            <div className="min-w-0">
              <p className="font-medium text-[#0F2A1D]">{clientName}</p>
              <p className="truncate text-sm text-[#0F2A1D]/60">{booking.user?.email ?? "—"}</p>
              {booking.user?.id && onViewClient ? (
                <button
                  type="button"
                  onClick={() => onViewClient(booking.user!.id)}
                  className="mt-1 text-sm font-medium text-[#0F2A1D] underline-offset-2 hover:underline"
                >
                  View client profile
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">Status</p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${bookingStatusStyles[status]}`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-4 py-4">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#0F2A1D]/50" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">Session</p>
            <p className="mt-1 font-medium text-[#0F2A1D]">{booking.session?.title ?? "—"}</p>
            <p className="mt-0.5 text-sm text-[#0F2A1D]/60">{getBookingSessionTypeLabel(booking)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              Date & time
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F2A1D]">
              {formatBookingLongSessionDate(booking.session?.start_time)}
            </p>
            <p className="mt-0.5 text-xs text-[#0F2A1D]/50">
              Booked {formatBookingCreatedDate(booking.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#0F2A1D]/50" />
            <span className="text-sm text-[#0F2A1D]">{formatBookingPrice(booking.session?.price)}</span>
          </div>
          {booking.session?.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0F2A1D]/50" />
              <span className="text-sm text-[#0F2A1D]/70">{booking.session.location}</span>
            </div>
          ) : null}
        </div>
      </div>

      {booking.cancel_reason ? (
        <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-red-700/70">
            {status === "rejected" ? "Rejection reason" : "Cancellation reason"}
          </p>
          <p className="mt-1 text-sm text-red-800">{booking.cancel_reason}</p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : null}

      {showManageStatus ? (
        <div className="mt-6 border-t border-[#EDECE6] pt-4">
          <p className="text-sm font-medium text-[#0F2A1D]">Manage status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {status === "pending" ? (
              <>
                <Button
                  type="button"
                  disabled={saving}
                  className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  onClick={() => void handleApprove()}
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  {saving ? "Approving…" : "Approve"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => setReasonAction("reject")}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : null}
            {status === "confirmed" ? (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => setReasonAction("cancel")}
              >
                <X className="mr-1.5 h-4 w-4" />
                Cancel booking
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {showReinstate ? (
        <div className="mt-6 border-t border-[#EDECE6] pt-4">
          <p className="text-sm font-medium text-[#0F2A1D]">Reinstate booking</p>
          <p className="mt-1 text-sm text-[#0F2A1D]/60">
            {status === "rejected"
              ? "Approve this request again if the issue is resolved and the session slot is still available."
              : "Confirm this booking again if the client is returning to the same session slot."}
          </p>
          <div className="mt-3">
            <Button
              type="button"
              disabled={saving}
              className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              onClick={() => void handleReinstate()}
            >
              <Check className="mr-1.5 h-4 w-4" />
              {saving ? "Reinstating…" : "Reinstate as confirmed"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-[#EDECE6] pt-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#C9A84C]" aria-hidden />
          <h3 className="text-sm font-semibold text-[#0F2A1D]">Activity</h3>
        </div>
        {historyLoading ? (
          <p className="text-sm text-[#0F2A1D]/60">Loading activity…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-[#0F2A1D]/60">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-3 border-l-2 border-[#EDECE6] pl-4">
            {history.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-[#C9A84C]" />
                <p className="text-sm font-medium text-[#0F2A1D]">{entry.label}</p>
                <p className="text-xs text-[#0F2A1D]/50">
                  {entry.actorLabel} · {formatBookingRelativeTime(entry.createdAt)}
                </p>
                {entry.notes ? (
                  <p className="mt-1 text-sm text-[#0F2A1D]/70">{entry.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminModal>
  );
}
