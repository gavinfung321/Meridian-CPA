import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";
import { PeopleSection } from "../PeopleSection/PeopleSection";
import { AuditTimelineSection } from "../AuditTimelineSection/AuditTimelineSection";
import { AuditMethodologySection } from "../AuditMethodologySection/AuditMethodologySection";


interface LegalServicesContentProps {
  lang: Language;
}

export const LegalServicesContentSection = ({ lang }: LegalServicesContentProps): JSX.Element => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const t = translations[lang];

  const welcome = t.welcome;
  const offer = t.offer;
  const clients = t.clients;

  // Scroll animation refs
  const [welcomeRef, welcomeVisible]     = useScrollAnimation<HTMLElement>(0.1);
  const [welcomeTextRef, welcomeTextVisible] = useScrollAnimation<HTMLDivElement>(0.1);
  const [welcomeBtnRef, welcomeBtnVisible]   = useScrollAnimation<HTMLDivElement>(0.1);
  const [offerHeadRef, offerHeadVisible]     = useScrollAnimation<HTMLElement>(0.1);
  const [offerListRef, offerListVisible]     = useScrollAnimation<HTMLElement>(0.1);
  const [testimonialRef, testimonialVisible] = useScrollAnimation<HTMLElement>(0.1);
  const [testimonialBtnRef, testimonialBtnVisible] = useScrollAnimation<HTMLDivElement>(0.1);

  return (
    <section className="flex w-full flex-col items-stretch">

      {/* ── Welcome Section ───────────────────────────────────────────────── */}
      <section
        ref={welcomeRef}
        className="flex w-full flex-col items-center bg-[#F9F9F6] px-6 py-20 sm:px-12 lg:px-[152px]"
      >
        <div className="flex w-full max-w-[1180px] flex-col gap-12">
          <header
            className={`w-full scroll-hidden scroll-fade-up ${welcomeVisible ? "scroll-visible" : ""}`}
          >
            <h2 className="text-[2.2rem] font-bold text-[#0F2A1D] tracking-tight leading-tight">
              {welcome.title}
            </h2>
          </header>

          <div className="flex w-full flex-col items-start gap-8">
            {/* Two-column slide-in paragraphs */}
            <div
              ref={welcomeTextRef}
              className="grid w-full grid-cols-1 md:grid-cols-2 gap-8 text-[1.05rem] leading-relaxed text-[#2C3E35]"
            >
              <p
                className={`scroll-hidden scroll-slide-left ${welcomeTextVisible ? "scroll-visible" : ""}`}
              >
                {welcome.p1}
              </p>
              <p
                className={`scroll-hidden scroll-slide-right stagger-2 ${welcomeTextVisible ? "scroll-visible" : ""}`}
              >
                {welcome.p2}
              </p>
            </div>

            {/* CTA button fade-up */}
            <div
              ref={welcomeBtnRef}
              className={`scroll-hidden scroll-fade-up stagger-3 ${welcomeBtnVisible ? "scroll-visible" : ""}`}
            >
              <a href="#contact">
                <Button
                  type="button"
                  className="h-auto rounded-full bg-[#0F2A1D] hover:bg-[#1a402e] text-white px-8 py-4 text-[15px] font-semibold transition-colors duration-200"
                >
                  {welcome.btn}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mid-page Parallax Banner — CPA Office ─────────────────────────── */}
      <div
        role="img"
        aria-label="Meridian CPA office with Hong Kong skyline view"
        className="parallax-banner relative h-[500px] w-full overflow-hidden"
        style={{ backgroundImage: "url('/image-office.jpg')" }}
      >
        {/* brand-tinted overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(15,42,29,0.45) 0%, rgba(15,42,29,0.1) 60%, rgba(15,42,29,0.0) 100%)",
          }}
        />
      </div>

      {/* ── What We Offer Section ─────────────────────────────────────────── */}
      <section className="flex w-full bg-[#0F2A1D] text-white py-24 px-6 sm:px-12 lg:px-[152px]">
        <div className="flex w-full max-w-[1180px] flex-col md:flex-row justify-between gap-12">

          {/* Sticky heading fade-in */}
          <header
            ref={offerHeadRef}
            className={`shrink-0 md:w-1/3 scroll-hidden scroll-fade-up ${offerHeadVisible ? "scroll-visible" : ""}`}
          >
            <h2 className="text-[2.5rem] font-bold text-white tracking-tight leading-tight sticky top-24">
              {offer.title}
            </h2>
          </header>

          {/* Service list staggered fade-up */}
          <nav
            ref={offerListRef}
            aria-label="CPA Services"
            className="flex-1 flex flex-col items-start gap-12"
          >
            <ul className="flex flex-col items-start gap-6">
              {offer.services.map((service, index) => {
                const stagger = Math.min(index + 1, 5);
                return (
                  <li
                    key={service}
                    className={`scroll-hidden scroll-fade-up stagger-${stagger} ${offerListVisible ? "scroll-visible" : ""}`}
                  >
                    <span
                      className={`text-[2rem] sm:text-[2.8rem] font-medium tracking-tight leading-none block border-b border-transparent hover:border-white/20 pb-2 transition-all ${
                        index === offer.services.length - 1
                          ? "text-white/40"
                          : "text-white"
                      }`}
                    >
                      {service}
                    </span>
                  </li>
                );
              })}
            </ul>
            <a href="#contact">
              <Button
                type="button"
                className="h-auto rounded-full bg-white hover:bg-white/90 text-[#0F2A1D] px-8 py-4 text-[15px] font-semibold transition-colors duration-200"
              >
                {offer.btn}
              </Button>
            </a>
          </nav>
        </div>
      </section>

      {/* ── Audit Timeline Section ─────────────────────────────────────────── */}
      <AuditTimelineSection lang={lang} />

      {/* ── Audit Methodology Section ──────────────────────────────────────── */}
      <AuditMethodologySection lang={lang} />

      {/* ── People / Partners Section ──────────────────────────────────────── */}
      <PeopleSection lang={lang} />

      {/* ── Testimonials Section ──────────────────────────────────────────── */}

      <section
        ref={testimonialRef}
        className="flex w-full flex-col items-center bg-[#F9F9F6] px-6 py-24 sm:px-12 lg:px-[152px]"
      >
        <div className="flex w-full max-w-[942px] flex-col items-center gap-12">
          <header className="flex w-full flex-col items-center gap-4 text-center">
            <h2
              className={`text-[2.2rem] font-bold text-[#0F2A1D] tracking-tight scroll-hidden scroll-fade-up ${testimonialVisible ? "scroll-visible" : ""}`}
            >
              {clients.title}
            </h2>
            <p
              className={`max-w-[600px] text-[1.05rem] text-[#2C3E35] leading-relaxed scroll-hidden scroll-fade-up stagger-2 ${testimonialVisible ? "scroll-visible" : ""}`}
            >
              {clients.subtitle}
            </p>
          </header>

          {/* Testimonial card — scale + fade */}
          <Card
            className={`flex min-h-[300px] w-full max-w-[800px] flex-col items-center justify-between gap-8 rounded-none border border-black/5 bg-[#F0EFEA] p-10 shadow-none scroll-hidden scroll-scale ${testimonialVisible ? "scroll-visible" : ""}`}
          >
            <CardContent className="flex w-full flex-1 flex-col items-center justify-center text-center p-0">
              <blockquote className="w-full">
                <p className="text-[1.35rem] font-medium text-[#0F2A1D] leading-relaxed italic">
                  {clients.testimonials[activeTestimonial].quote}
                </p>
                <footer className="mt-6 text-[15px] font-bold text-[#2C3E35] tracking-wide uppercase">
                  {clients.testimonials[activeTestimonial].author}
                </footer>
              </blockquote>
            </CardContent>

            <div className="flex items-center justify-center gap-6" aria-label="Testimonial navigation">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous testimonial"
                onClick={() =>
                  setActiveTestimonial(
                    (activeTestimonial - 1 + clients.testimonials.length) %
                      clients.testimonials.length,
                  )
                }
                className="h-8 w-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center"
              >
                <span className="text-[14px]">←</span>
              </Button>
              <div className="flex items-center gap-2" role="tablist" aria-label="Testimonials">
                {clients.testimonials.map((_, dot) => (
                  <button
                    key={dot}
                    type="button"
                    role="tab"
                    aria-selected={activeTestimonial === dot}
                    aria-label={`Show testimonial ${dot + 1}`}
                    onClick={() => setActiveTestimonial(dot)}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-255 ${
                      activeTestimonial === dot ? "bg-[#0F2A1D] scale-110" : "bg-black/20"
                    }`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Next testimonial"
                onClick={() =>
                  setActiveTestimonial((activeTestimonial + 1) % clients.testimonials.length)
                }
                className="h-8 w-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center"
              >
                <span className="text-[14px]">→</span>
              </Button>
            </div>
          </Card>

          <p
            className={`w-full text-center text-[1rem] text-[#2C3E35] max-w-[650px] leading-relaxed scroll-hidden scroll-fade-up stagger-3 ${testimonialVisible ? "scroll-visible" : ""}`}
          >
            {clients.callout}
          </p>

          {/* CTA button fade-up */}
          <div
            ref={testimonialBtnRef}
            className={`scroll-hidden scroll-fade-up stagger-4 ${testimonialBtnVisible ? "scroll-visible" : ""}`}
          >
            <a href="#contact" id="contact">
              <Button
                type="button"
                className="h-auto rounded-full bg-[#0F2A1D] hover:bg-[#1a402e] text-white px-8 py-4 text-[15px] font-semibold transition-colors duration-200"
              >
                {clients.btn}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Bottom Parallax Banner — Annual Reports / HK Harbour ─────────── */}
      <div
        role="img"
        aria-label="Audited financial statements with Hong Kong harbour view"
        className="parallax-banner relative h-[500px] w-full overflow-hidden"
        style={{ backgroundImage: "url('/image-documents.jpg')" }}
      >
        {/* darker overlay so footer transition is smooth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,42,29,0.05) 0%, rgba(15,42,29,0.45) 100%)",
          }}
        />
      </div>

    </section>
  );
};
