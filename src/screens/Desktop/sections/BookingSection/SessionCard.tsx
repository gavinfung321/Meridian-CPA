import { Clock, MapPin } from "lucide-react";
import { translations, Language } from "../../../../lib/translations";
import type { PublicSessionCard } from "../../../../lib/public-sessions";

type SessionCardProps = {
  session: PublicSessionCard;
  lang: Language;
  onBook: () => void;
};

const resolvePath = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
};

export const SessionCard = ({ session, lang, onBook }: SessionCardProps) => {
  const t = translations[lang];
  const minLabel = resolvePath(t as Record<string, unknown>, "booking.card.min") as string;
  const privateLabel = resolvePath(t as Record<string, unknown>, "booking.card.privateSession") as string;
  const spotsLeftLabel = resolvePath(t as Record<string, unknown>, "booking.card.spotsLeft") as string;
  const bookedLabel = resolvePath(t as Record<string, unknown>, "booking.card.booked") as string;
  const defaultCta = resolvePath(t as Record<string, unknown>, "booking.card.bookConsultation") as string;

  const { booked, total } = session.capacity;
  const spotsLeft = total - booked;
  const capacityLabel = session.isPrivate
    ? `1/1 ${privateLabel}`
    : `${spotsLeft} ${spotsLeftLabel}`;

  const progressPercent = total > 0 ? Math.min(100, Math.max(0, (booked / total) * 100)) : 0;
  const isFull = spotsLeft <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#EDECE6] bg-white transition-shadow duration-300 hover:shadow-lg">
      {session.imageUrl ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-[#EDECE6]">
          <img src={session.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl font-medium leading-tight text-[#0F2A1D]">
            {session.title}
          </h3>
          <div className="flex shrink-0 items-center whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
            <MapPin className="mr-1 h-3 w-3" />
            {session.location}
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
        <button
          type="button"
          onClick={onBook}
          disabled={isFull}
          className="w-full rounded-lg bg-[#0F2A1D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0F2A1D]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFull ? (lang === "zh" ? "已滿" : "Full") : defaultCta}
        </button>
      </div>
    </div>
  );
};
