import { Clock, MapPin, Users } from "lucide-react";
import { translations, Language } from "../../../../lib/translations";
import { Session } from "./data/sessions";

type SessionCardProps = {
  session: Session;
  lang: Language;
  onBook: () => void;
};

// Helper to resolve nested keys like "booking.card.booked"
const resolvePath = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

export const SessionCard = ({ session, lang, onBook }: SessionCardProps) => {
  const t = translations[lang];

  const title = resolvePath(t, session.titleKey) || session.titleKey;
  const location = resolvePath(t, session.locationKey) || session.locationKey;
  const ctaText = resolvePath(t, session.ctaTextKey) || session.ctaTextKey;
  
  // Tags could be an array of keys or an array of strings in translation file
  const tagsStr = resolvePath(t, session.tagsKey);
  const tags = Array.isArray(tagsStr) ? tagsStr : [tagsStr];

  const { booked, total } = session.capacity;
  const spotsLeft = total - booked;
  const isPrivate = session.isPrivate;
  
  const capacityLabel = isPrivate 
    ? `1/1 ${resolvePath(t, "booking.card.privateSession")}`
    : `${spotsLeft} ${resolvePath(t, "booking.card.spotsLeft")}`;

  const progressPercent = Math.min(100, Math.max(0, (booked / total) * 100));

  return (
    <div className="flex flex-col border border-[#EDECE6] rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300">
      <div className="p-6 flex-1 flex flex-col">
        {/* Header: Title & Location */}
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className="font-serif text-xl text-[#0F2A1D] font-medium leading-tight">
            {title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
            <MapPin className="w-3 h-3 mr-1" />
            {location}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, idx) => (
            <span 
              key={idx} 
              className={`text-xs px-2.5 py-0.5 rounded-full ${
                idx === 0 
                  ? "bg-[#0F2A1D] text-white" 
                  : "bg-[#C9A84C]/20 text-[#0F2A1D]"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Schedule & Capacity Details */}
        <div className="mt-auto space-y-4 text-sm text-[#2C3E35]">
          <div className="flex items-center justify-between font-medium">
            <span>{session.day} {session.time}</span>
            <span className="flex items-center text-gray-500 font-normal">
              <Clock className="w-4 h-4 mr-1.5" />
              {session.duration} {resolvePath(t, "booking.card.min")}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{capacityLabel}</span>
              {!isPrivate && (
                <span>{booked}/{total} {resolvePath(t, "booking.card.booked")}</span>
              )}
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#C9A84C] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-4 bg-[#F9F9F6] border-t border-[#EDECE6]">
        <button 
          onClick={onBook}
          className="w-full py-2.5 px-4 bg-[#0F2A1D] text-white rounded-lg hover:bg-[#0F2A1D]/90 transition-colors font-medium text-sm"
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
};
