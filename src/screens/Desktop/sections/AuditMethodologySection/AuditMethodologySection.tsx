import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface AuditMethodologySectionProps {
  lang: Language;
}

/* ── SVG Icons ─────────────────────────────────────────────────────────────── */
const icons: Record<string, JSX.Element> = {
  risk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  independence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
      <path d="M5.5 5.5l13 13" />
    </svg>
  ),
  standards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  technology: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 8l3 3-3 3M13 14h4" />
    </svg>
  ),
  communication: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  quality: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M8 11l2 2 4-4" />
    </svg>
  ),
};

export const AuditMethodologySection = ({ lang }: AuditMethodologySectionProps): JSX.Element => {
  const t = translations[lang];
  const m = t.methodology;

  const [headerRef, headerVisible] = useScrollAnimation<HTMLElement>(0.1);
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>(0.05);

  return (
    <section className="flex w-full flex-col items-center bg-[#F9F9F6] px-6 py-24 sm:px-12 lg:px-[152px]">
      <div className="flex w-full max-w-[1180px] flex-col gap-14">

        {/* Header */}
        <header
          ref={headerRef}
          className={`flex flex-col gap-3 scroll-hidden scroll-fade-up ${headerVisible ? "scroll-visible" : ""}`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F2A1D]/50">
            {m.label}
          </span>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[2.4rem] font-bold text-[#0F2A1D] tracking-tight leading-tight">
              {m.title}
            </h2>
            <p className="max-w-[400px] text-[1rem] text-[#2C3E35]/70 leading-relaxed md:text-right">
              {m.subtitle}
            </p>
          </div>
        </header>

        {/* Pillars grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0"
        >
          {m.pillars.map((pillar, idx) => {
            const stagger = Math.min(idx + 1, 6);
            return (
              <div
                key={pillar.title}
                className={`group flex flex-col gap-5 border-b border-[#0F2A1D]/10 py-8 pr-8 scroll-hidden scroll-fade-up stagger-${stagger} ${gridVisible ? "scroll-visible" : ""} ${
                  idx % 3 !== 2 ? "lg:border-r" : ""
                } ${idx % 2 !== 1 ? "sm:border-r lg:border-r-0" : ""} ${
                  idx % 3 !== 2 ? "lg:border-r border-[#0F2A1D]/10" : ""
                }`}
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#0F2A1D]/6 text-[#0F2A1D] transition-colors duration-200 group-hover:bg-[#0F2A1D] group-hover:text-white">
                  {icons[pillar.icon]}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-[16px] font-bold text-[#0F2A1D] leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-[14px] text-[#2C3E35]/70 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
