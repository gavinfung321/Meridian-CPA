import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface WhyUsSectionProps {
  lang: Language;
}

export const WhyUsSection = ({ lang }: WhyUsSectionProps): JSX.Element => {
  const m = translations[lang].whyUs;

  const [sectionRef, sectionVisible] = useScrollAnimation<HTMLElement>(0.1);

  return (
    <section
      id="why-us"
      ref={sectionRef}
      className="flex w-full flex-col items-center bg-[#FFFFFF] px-6 py-20 sm:px-12 sm:py-24 lg:px-[152px] scroll-mt-24"
    >
      <div className="flex w-full max-w-[1180px] flex-col items-center gap-12 md:flex-row md:items-start md:gap-20 lg:gap-28">
        <div
          className={`relative w-full max-w-[420px] shrink-0 scroll-hidden scroll-fade-up ${sectionVisible ? "scroll-visible" : ""}`}
        >
          <div className="overflow-hidden rounded-t-sm rounded-b-[50%]">
            <img
              src="/images/why-us.png"
              alt={m.imageAlt}
              className="aspect-[4/5] w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>

        <div
          className={`flex w-full min-w-0 flex-col gap-7 scroll-hidden scroll-fade-up stagger-2 ${sectionVisible ? "scroll-visible" : ""}`}
        >
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-[clamp(2rem,3vw,2.75rem)] font-bold text-[#0F2A1D] tracking-tight leading-tight">
              {m.title}
            </h2>
            <div className="h-px w-10 bg-[#C9A84C]" aria-hidden="true" />
            <p className="max-w-[36ch] text-[15px] sm:text-[16px] text-[#2C3E35]/65 leading-relaxed">
              {m.subtitle}
            </p>
          </div>

          <ul className="flex flex-col">
            {m.reasons.map((reason) => (
              <li
                key={reason.title}
                className="flex items-start gap-3 border-b border-[#0F2A1D]/10 pb-5 pt-5 first:pt-0 last:border-b-0 last:pb-0"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#C9A84C]"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path
                      d="M4 10.5l4 4 8-9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[15px] font-semibold text-[#0F2A1D] leading-snug">
                    {reason.title}
                  </span>
                  <span className="text-[13px] text-[#2C3E35]/60 leading-relaxed">
                    {reason.detail}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
