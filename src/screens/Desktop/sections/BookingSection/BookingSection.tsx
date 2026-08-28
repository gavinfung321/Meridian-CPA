import { useState, useMemo } from "react";
import { Language, translations } from "../../../../lib/translations";
import { BookingFilters, SessionLocationFilter, SessionTypeFilter } from "./BookingFilters";
import { SessionCard } from "./SessionCard";
import { MOCK_SESSIONS } from "./data/sessions";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface BookingSectionProps {
  lang: Language;
  onBookClick: () => void;
}

export const BookingSection = ({ lang, onBookClick }: BookingSectionProps) => {
  const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>("all");
  const [locationFilter, setLocationFilter] = useState<SessionLocationFilter>("all");
  
  const [headerRef, headerVisible] = useScrollAnimation<HTMLDivElement>(0.1);
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>(0.1);

  const t = translations[lang];

  const filteredSessions = useMemo(() => {
    return MOCK_SESSIONS.filter((session) => {
      if (typeFilter !== "all" && session.typeFilter !== typeFilter) return false;
      if (locationFilter !== "all" && session.locationFilter !== locationFilter) return false;
      return true;
    });
  }, [typeFilter, locationFilter]);

  return (
    <section 
      id="booking"
      className="flex w-full flex-col items-center bg-[#F9F9F6] px-6 py-24 sm:px-12 sm:py-28 lg:px-[152px] scroll-mt-24 border-t border-[#EDECE6]"
    >
      <div className="flex w-full max-w-[1180px] flex-col gap-10">
        <header 
          ref={headerRef}
          className={`flex flex-col gap-3 scroll-hidden scroll-fade-up ${headerVisible ? "scroll-visible" : ""}`}
        >
          <div className="text-sm font-semibold tracking-wider text-[#C9A84C] uppercase">
            {t.booking?.label}
          </div>
          <h2 className="font-serif text-[2.4rem] font-bold text-[#0F2A1D] tracking-tight leading-tight">
            {t.booking?.title}
          </h2>
          <p className="max-w-[600px] text-[1.05rem] text-[#2C3E35] leading-relaxed mt-2">
            {t.booking?.subtitle}
          </p>
          <div className="h-px w-10 bg-[#C9A84C] mt-4" aria-hidden="true" />
        </header>

        <div 
          ref={gridRef}
          className={`scroll-hidden scroll-fade-up stagger-2 ${gridVisible ? "scroll-visible" : ""}`}
        >
          <BookingFilters 
            lang={lang}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
          />

          {filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map(session => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  lang={lang} 
                  onBook={onBookClick} 
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500 bg-white border border-[#EDECE6] rounded-xl">
              No sessions found matching your filters.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
