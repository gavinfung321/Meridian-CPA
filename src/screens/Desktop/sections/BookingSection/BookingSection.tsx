import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicSessionCatalog } from "../../../../components/PublicSessionCatalog";
import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface BookingSectionProps {
  lang: Language;
  onContactClick: () => void;
}

export const BookingSection = ({ lang, onContactClick }: BookingSectionProps) => {
  const navigate = useNavigate();
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  const [headerRef, headerVisible] = useScrollAnimation<HTMLDivElement>(0.1);
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>(0.1);

  const t = translations[lang];
  const locale = lang === "zh" ? "zh-HK" : "en-HK";

  return (
    <section
      id="booking"
      className="scroll-mt-24 flex w-full flex-col items-center border-t border-[#EDECE6] bg-[#F9F9F6] px-6 py-24 sm:px-12 sm:py-28 lg:px-[152px]"
    >
      <div className="flex w-full max-w-[1180px] flex-col gap-10">
        <header
          ref={headerRef}
          className={`scroll-hidden scroll-fade-up flex flex-col gap-3 ${headerVisible ? "scroll-visible" : ""}`}
        >
          <div className="text-sm font-semibold uppercase tracking-wider text-[#C9A84C]">
            {t.booking?.label}
          </div>
          <h2 className="font-serif text-[2.4rem] font-bold leading-tight tracking-tight text-[#0F2A1D]">
            {t.booking?.title}
          </h2>
          <p className="mt-2 max-w-[600px] text-[1.05rem] leading-relaxed text-[#2C3E35]">
            {t.booking?.subtitle}
          </p>
          <div className="mt-4 h-px w-10 bg-[#C9A84C]" aria-hidden="true" />
        </header>

        {bookSuccess ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {bookSuccess}{" "}
            <button
              type="button"
              onClick={() => navigate("/dashboard/bookings")}
              className="font-medium underline"
            >
              {lang === "zh" ? "查看我的預約" : "View my bookings"}
            </button>
          </div>
        ) : null}

        <div
          ref={gridRef}
          className={`scroll-hidden scroll-fade-up stagger-2 ${gridVisible ? "scroll-visible" : ""}`}
        >
          <PublicSessionCatalog
            lang={lang}
            locale={locale}
            variant="landing"
            onContactClick={onContactClick}
            onBookingSuccess={(message) => setBookSuccess(message)}
          />
        </div>
      </div>
    </section>
  );
};
