import { Clock, MapPin } from "lucide-react";
import { bookingStatusStyles } from "../../../../lib/booking-admin";
import type { UserSessionBooking } from "../../../../lib/client-bookings";
import { formatPrice } from "../../../../lib/session-admin";
import { getSessionFormatKey } from "../../../../lib/session-format";
import { translations, Language } from "../../../../lib/translations";
import type { PublicSessionCard } from "../../../../lib/public-sessions";
import { cn } from "../../../../lib/utils";
import { SessionCardCover } from "./SessionCardCover";

type SessionCardProps = {
  session: PublicSessionCard;
  lang: Language;
  onBook: () => void;
  userBooking?: UserSessionBooking | null;
  onViewBooking?: (bookingId: string) => void;
};

function getSessionCardCtaKey(
  total: number,
): "bookConsultation" | "reserveSpot" | "registerNow" {
  if (total <= 1) return "bookConsultation";
  if (total <= 8) return "reserveSpot";
  return "registerNow";
}

const resolvePath = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
};

export const SessionCard = ({
  session,
  lang,
  onBook,
  userBooking = null,
  onViewBooking,
}: SessionCardProps) => {
  const t = translations[lang];
  const minLabel = resolvePath(t as Record<string, unknown>, "booking.card.min") as string;
  const privateLabel = resolvePath(t as Record<string, unknown>, "booking.card.privateSession") as string;
  const spotsLeftLabel = resolvePath(t as Record<string, unknown>, "booking.card.spotsLeft") as string;
  const bookedLabel = resolvePath(t as Record<string, unknown>, "booking.card.booked") as string;
  const ctaKey = getSessionCardCtaKey(session.capacity.total);
  const ctaLabel = resolvePath(t as Record<string, unknown>, `booking.card.${ctaKey}`) as string;
  const formatKey = getSessionFormatKey(session.capacity.total);
  const formatLabel = t.booking.format[formatKey];
  const priceLabel = session.price > 0 ? formatPrice(session.price) : t.booking.card.free;

  const { booked, total } = session.capacity;
  const spotsLeft = total - booked;
  const capacityLabel = session.isPrivate
    ? `1/1 ${privateLabel}`
    : `${spotsLeft} ${spotsLeftLabel}`;

  const progressPercent = total > 0 ? Math.min(100, Math.max(0, (booked / total) * 100)) : 0;
  const isFull = spotsLeft <= 0;
  const isRegistered = Boolean(userBooking);
  const registeredLabel =
    userBooking?.status === "pending"
      ? lang === "zh"
        ? "待審批"
        : "Awaiting approval"
      : lang === "zh"
        ? "已登記"
        : "Registered";

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-shadow duration-300 hover:shadow-lg",
        isRegistered
          ? userBooking?.status === "pending"
            ? "border-l-4 border-[#EDECE6] border-l-[#C9A84C] ring-1 ring-[#C9A84C]/20"
            : "border-l-4 border-[#EDECE6] border-l-emerald-500 ring-1 ring-emerald-500/15"
          : "border-[#EDECE6]",
      )}
    >
      <SessionCardCover session={session} lang={lang} />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="mb-2 inline-flex rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#0F2A1D]">
              {formatLabel}
            </span>
            <h3 className="line-clamp-2 min-h-[3.25rem] font-serif text-xl font-medium leading-tight text-[#0F2A1D]">
              {session.title}
            </h3>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {isRegistered && userBooking ? (
              <span
                className={cn(
                  "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  bookingStatusStyles[userBooking.status],
                )}
              >
                {registeredLabel}
              </span>
            ) : null}
            <div className="flex items-center whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
              <MapPin className="mr-1 h-3 w-3" />
              {session.location}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {session.tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                index === 0 ? "bg-[#0F2A1D] text-white" : "bg-[#C9A84C]/20 text-[#0F2A1D]"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto space-y-4 text-sm text-[#2C3E35]">
          <div className="flex items-center justify-between font-medium">
            <span>
              {session.day} {session.time}
            </span>
            <span className="flex items-center font-normal text-gray-500">
              <Clock className="mr-1.5 h-4 w-4" />
              {session.duration} {minLabel}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[#0F2A1D]">{priceLabel}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{capacityLabel}</span>
              {!session.isPrivate ? (
                <span>
                  {booked}/{total} {bookedLabel}
                </span>
              ) : null}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#C9A84C] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#EDECE6] bg-[#F9F9F6] p-4">
        {isRegistered && userBooking && onViewBooking ? (
          <button
            type="button"
            onClick={() => onViewBooking(userBooking.bookingId)}
            className="w-full rounded-lg border border-[#0F2A1D] bg-white px-4 py-2.5 text-sm font-medium text-[#0F2A1D] transition-colors hover:bg-[#0F2A1D]/5"
          >
            {lang === "zh" ? "查看預約" : "View booking"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onBook}
            disabled={isFull}
            className="w-full rounded-lg bg-[#0F2A1D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0F2A1D]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFull ? (lang === "zh" ? "已滿" : "Full") : ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
};
