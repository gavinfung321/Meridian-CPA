import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface AuditTimelineSectionProps {
  lang: Language;
}

export const AuditTimelineSection = ({ lang }: AuditTimelineSectionProps): JSX.Element => {
  const t = translations[lang];
  const tl = t.timeline;

  const [headerRef, headerVisible] = useScrollAnimation<HTMLElement>(0.1);
  const [lineRef, lineVisible] = useScrollAnimation<HTMLDivElement>(0.2);
  const [stepsRef, stepsVisible] = useScrollAnimation<HTMLDivElement>(0.1);

  return (
    <section className="flex w-full flex-col items-center bg-[#0F2A1D] px-6 py-24 sm:px-12 lg:px-[152px] overflow-hidden">
      <div className="flex w-full max-w-[1180px] flex-col gap-16">

        {/* Header */}
        <header
          ref={headerRef}
          className={`flex flex-col gap-3 scroll-hidden scroll-fade-up ${headerVisible ? "scroll-visible" : ""}`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
            {tl.label}
          </span>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[2.4rem] font-bold text-white tracking-tight leading-tight">
              {tl.title}
            </h2>
            <p className="max-w-[360px] text-[1rem] text-white/55 leading-relaxed md:text-right">
              {tl.subtitle}
            </p>
          </div>
        </header>

        {/* Desktop: horizontal layout with connector line */}
        <div className="hidden lg:block relative">

          {/* Animated connector line */}
          <div
            ref={lineRef}
            className="absolute top-[38px] left-0 right-0 h-px bg-white/15 mx-0"
            aria-hidden="true"
          >
            <div
              className={`absolute inset-y-0 left-0 right-0 bg-[#C9A84C]/60 timeline-line-hidden ${lineVisible ? "timeline-line-visible" : ""}`}
            />
          </div>

          {/* Steps grid */}
          <div
            ref={stepsRef}
            className="relative grid grid-cols-6 gap-8"
          >
            {tl.steps.map((step, idx) => {
              const stagger = Math.min(idx + 1, 6);
              return (
                <div
                  key={step.number}
                  className={`flex flex-col gap-4 scroll-hidden scroll-fade-up stagger-${stagger} ${stepsVisible ? "scroll-visible" : ""}`}
                >
                  {/* Node dot */}
                  <div className="relative flex items-center justify-center">
                    <div className="h-[14px] w-[14px] rounded-full border-2 border-[#C9A84C] bg-[#0F2A1D] relative z-10" />
                  </div>

                  {/* Step number */}
                  <span
                    className="text-[2rem] font-bold leading-none"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {step.number}
                  </span>

                  {/* Title */}
                  <h3 className="text-[15px] font-semibold text-white leading-snug">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[13px] text-white/55 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile / tablet: vertical stepper */}
        <div className="flex lg:hidden flex-col gap-0">
          {tl.steps.map((step, idx) => {
            const isLast = idx === tl.steps.length - 1;
            return (
              <div key={step.number} className="flex gap-6">
                {/* Left: node + vertical line */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="mt-1 h-[14px] w-[14px] rounded-full border-2 border-[#C9A84C] bg-[#0F2A1D] shrink-0" />
                  {!isLast && (
                    <div className="flex-1 w-px bg-white/15 my-2 min-h-[40px]" />
                  )}
                </div>

                {/* Right: content */}
                <div className={`flex flex-col gap-2 ${isLast ? "pb-0" : "pb-10"}`}>
                  <span
                    className="text-[1.5rem] font-bold leading-none"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-[15px] font-semibold text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-white/55 leading-relaxed">
                    {step.description}
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
