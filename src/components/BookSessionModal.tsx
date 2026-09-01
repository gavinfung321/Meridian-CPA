import { CalendarDays, Clock, MapPin } from "lucide-react";
import { FormEvent, useState } from "react";
import { AdminModal } from "./AdminModal";
import { Button } from "./ui/button";
import { adminInputClassName } from "../lib/session-admin";
import { formatPrice } from "../lib/session-admin";
import type { PublicSessionCard } from "../lib/public-sessions";
import {
  getSessionCoverCategoryLabel,
  resolveSessionCoverSrc,
} from "../lib/session-cover-fallback";
import { getSessionFormatKey } from "../lib/session-format";
import { Language, translations } from "../lib/translations";

interface BookSessionModalProps {
  session: PublicSessionCard | null;
  lang: Language;
  open: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function BookSessionModal({
  session,
  lang,
  open,
  submitting,
  error,
  onClose,
  onConfirm,
}: BookSessionModalProps): JSX.Element | null {
  const [coverFailed, setCoverFailed] = useState(false);

  if (!open || !session) return null;

  const t = translations[lang].booking;
  const formatKey = getSessionFormatKey(session.capacity.total);
  const formatLabel = t.format[formatKey];
  const coverSrc = resolveSessionCoverSrc(session);
  const categoryLabel = getSessionCoverCategoryLabel(session, lang);
  const priceLabel =
    session.price > 0 ? formatPrice(session.price) : t.card.free;

  return (
    <AdminModal
      open
      onClose={onClose}
      size="lg"
      title={t.modal.title}
      description={t.modal.subtitle}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {t.modal.backToSchedule}
          </Button>
          <Button
            type="button"
            disabled={submitting}
            className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
            onClick={onConfirm}
          >
            {submitting ? t.modal.confirming : t.modal.confirmBooking}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-4 rounded-xl border border-[#EDECE6] bg-[#F9F9F6] p-4">
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#EDECE6]">
            {coverSrc && !coverFailed ? (
              <img
                src={coverSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0F2A1D]/5 text-xs text-[#0F2A1D]/40">
                {categoryLabel}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#0F2A1D] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                {formatLabel}
              </span>
              <span className="inline-flex rounded-full bg-[#C9A84C]/20 px-2.5 py-0.5 text-[11px] font-medium text-[#0F2A1D]">
                {categoryLabel}
              </span>
            </div>
            <p className="font-serif text-lg font-semibold leading-snug text-[#0F2A1D]">
              {session.title}
            </p>
            <p className="mt-1 text-sm text-[#0F2A1D]/60">{session.sessionTypeName}</p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {t.modal.when}
            </dt>
            <dd className="mt-1.5 text-sm text-[#0F2A1D]">
              {session.day} {session.time}
              <span className="text-[#0F2A1D]/60"> · {session.duration} min</span>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {t.modal.location}
            </dt>
            <dd className="mt-1.5 text-sm text-[#0F2A1D]">{session.location}</dd>
          </div>
        </dl>

        <div className="rounded-xl border border-[#EDECE6] bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#C9A84C]">
            {t.modal.sessionFee}
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold text-[#0F2A1D]">{priceLabel}</p>
          {session.price > 0 ? (
            <p className="mt-1 text-xs text-[#0F2A1D]/60">{t.modal.feeNote}</p>
          ) : null}
        </div>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              {t.modal.statusAfter}
            </dt>
            <dd className="mt-1 text-[#0F2A1D]">{t.modal.statusPending}</dd>
          </div>
        </dl>

        <div className="flex gap-2 rounded-lg border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3 py-2.5 text-xs leading-relaxed text-[#0F2A1D]/80">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" aria-hidden />
          <p>{t.modal.policy}</p>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
    </AdminModal>
  );
}

interface CancelBookingModalProps {
  open: boolean;
  sessionTitle: string;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelBookingModal({
  open,
  sessionTitle,
  submitting,
  error,
  onClose,
  onConfirm,
}: CancelBookingModalProps): JSX.Element | null {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <AdminModal
      open
      onClose={onClose}
      title="Cancel booking"
      description={`Cancel your booking for “${sessionTitle}”.`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Keep booking
          </Button>
          <Button
            type="submit"
            form="cancel-booking-form"
            variant="destructive"
            disabled={submitting || !reason.trim()}
          >
            {submitting ? "Cancelling…" : "Confirm cancellation"}
          </Button>
        </>
      }
    >
      <form id="cancel-booking-form" onSubmit={handleSubmit}>
        <label htmlFor="cancel-booking-reason" className="block text-sm font-medium">
          Reason
        </label>
        <textarea
          id="cancel-booking-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          className={`${adminInputClassName} mt-1`}
          placeholder="e.g. Schedule conflict"
          required
        />
      </form>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </AdminModal>
  );
}
