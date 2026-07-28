import { useState } from "react";
import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection = ({ lang }: FaqSectionProps): JSX.Element => {
  const faq = translations[lang].faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const [headerRef, headerVisible] = useScrollAnimation<HTMLElement>(0.1);
  const [listRef, listVisible] = useScrollAnimation<HTMLDivElement>(0.05);

  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <section
      id="faq"
      className="flex w-full flex-col items-center bg-[#F9F9F6] px-6 py-24 sm:px-12 sm:py-28 lg:px-[152px] scroll-mt-24"
    >
      <div className="flex w-full max-w-[1180px] flex-col gap-10">
        <header
          ref={headerRef}
          className={`flex flex-col gap-3 scroll-hidden scroll-fade-up ${headerVisible ? "scroll-visible" : ""}`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F2A1D]/50">
            {faq.label}
          </span>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-[2.4rem] font-bold text-[#0F2A1D] tracking-tight leading-tight">
                {faq.title}
              </h2>
              <div className="h-px w-10 bg-[#C9A84C]" aria-hidden="true" />
            </div>
            <p className="max-w-[420px] text-[1rem] text-[#2C3E35]/70 leading-relaxed md:text-right">
              {faq.subtitle}
            </p>
          </div>
        </header>

        <div
          ref={listRef}
          className={`flex flex-col border-t border-[#0F2A1D]/10 scroll-hidden scroll-fade-up ${listVisible ? "scroll-visible" : ""}`}
        >
          {faq.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.question} className="border-b border-[#0F2A1D]/10">
                <button
                  type="button"
                  id={`faq-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-[1.05rem] font-semibold text-[#0F2A1D] leading-snug">
                    {item.question}
                  </span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-[#0F2A1D]/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
                  </svg>
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-${idx}`}
                  className="overflow-hidden transition-all duration-400 ease-in-out"
                  style={{
                    maxHeight: isOpen ? "220px" : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p className="pb-5 pr-10 text-[15px] text-[#2C3E35]/80 leading-relaxed max-w-[780px]">
                    {item.answer}
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
