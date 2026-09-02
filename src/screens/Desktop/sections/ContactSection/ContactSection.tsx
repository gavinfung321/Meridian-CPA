import { Button } from "../../../../components/ui/button";
import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface ContactSectionProps {
  lang: Language;
  onBookClick: () => void;
}

export const ContactSection = ({ lang, onBookClick }: ContactSectionProps): JSX.Element => {
  const t = translations[lang];
  const c = t.contact;

  const [headerRef, headerVisible] = useScrollAnimation<HTMLElement>(0.1);
  const [detailsRef, detailsVisible] = useScrollAnimation<HTMLDivElement>(0.1);

  return (
    <section
      id="contact"
      className="flex w-full flex-col items-center bg-[#0F2A1D] px-6 py-24 sm:px-12 sm:py-28 lg:px-[152px] scroll-mt-24"
    >
      <div className="flex w-full max-w-[1180px] flex-col gap-10 md:flex-row md:justify-between md:gap-16">
        <header
          ref={headerRef}
          className={`flex flex-col gap-4 md:max-w-[420px] scroll-hidden scroll-fade-up ${headerVisible ? "scroll-visible" : ""}`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {c.label}
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-[2.4rem] font-bold text-white tracking-tight leading-tight">
              {c.title}
            </h2>
            <div className="h-px w-10 bg-[#C9A84C]" aria-hidden="true" />
          </div>
          <p className="text-[1rem] text-white/70 leading-relaxed">
            {c.subtitle}
          </p>
          <p className="text-[13px] text-white/50 leading-relaxed">
            {c.response}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={onBookClick}
              className="h-auto rounded-full bg-white hover:bg-[#C9A84C] hover:text-[#0F2A1D] hover:scale-[1.03] text-[#0F2A1D] px-8 py-4 text-[15px] font-semibold transition-all duration-200"
            >
              {t.cta.bookACall}
            </Button>
            <a
              href="https://wa.me/85228151234"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-auto items-center rounded-full border border-white/30 px-8 py-4 text-[15px] font-semibold text-white transition-all duration-200 hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F2A1D]"
            >
              {c.whatsapp}
            </a>
          </div>
          <p className="text-[13px] text-white/50 leading-relaxed">
            {c.emailHint}{" "}
            <a href={`mailto:${c.email}`} className="text-white/70 underline hover:text-white">
              {c.email}
            </a>
          </p>
        </header>

        <div
          ref={detailsRef}
          className={`flex flex-col gap-8 sm:flex-row sm:gap-12 md:ml-auto md:shrink-0 scroll-hidden scroll-fade-up stagger-2 ${detailsVisible ? "scroll-visible" : ""}`}
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              {c.addressLabel}
            </span>
            <address className="not-italic text-[15px] text-white/85 leading-relaxed">
              {c.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                {c.emailLabel}
              </span>
              <a
                href={`mailto:${c.email}`}
                className="text-[15px] font-medium text-white hover:underline"
              >
                {c.email}
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                {c.phoneLabel}
              </span>
              <a
                href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="text-[15px] font-medium text-white hover:underline"
              >
                {c.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
