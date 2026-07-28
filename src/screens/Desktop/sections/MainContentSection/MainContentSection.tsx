import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";
import { PeopleSection } from "../PeopleSection/PeopleSection";
import { AuditTimelineSection } from "../AuditTimelineSection/AuditTimelineSection";
import { AuditMethodologySection } from "../AuditMethodologySection/AuditMethodologySection";
import { FaqSection } from "../FaqSection/FaqSection";
import { ContactSection } from "../ContactSection/ContactSection";

interface MainContentSectionProps {
  lang: Language;
  onBookClick: () => void;
}

interface ServiceListItemProps {
  name: string;
  outcome: string;
}

const ServiceListItem = ({ name, outcome }: ServiceListItemProps) => {
  const [ref, visible] = useScrollAnimation<HTMLLIElement>(0.35);

  return (
    <li
      ref={ref}
      className={`scroll-hidden scroll-fade-up ${visible ? "scroll-visible" : ""}`}
    >
      <div className="border-b border-transparent hover:border-white/20 pb-2 transition-all">
        <span className="text-[1.5rem] sm:text-[1.85rem] font-medium tracking-tight leading-none block text-white">
          {name}
        </span>
        <span className="mt-2 block text-[13px] sm:text-[14px] font-normal text-white/55 leading-snug">
          {outcome}
        </span>
      </div>
    </li>
  );
};

interface TestimonialAvatarProps {
  photo: string;
  author: string;
}

const TestimonialAvatar = ({ photo, author }: TestimonialAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0F2A1D] text-sm font-bold text-white"
        aria-hidden="true"
      >
        {author.charAt(2) || "?"}
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={author}
      loading="lazy"
      onError={() => setImageError(true)}
      className="h-16 w-16 shrink-0 rounded-full object-cover object-top"
    />
  );
};

export const MainContentSection = ({ lang, onBookClick }: MainContentSectionProps): JSX.Element => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const t = translations[lang];

  const welcome = t.welcome;
  const offer = t.offer;
  const clients = t.clients;

  const [welcomeRef, welcomeVisible] = useScrollAnimation<HTMLElement>(0.1);
  const [welcomeTextRef, welcomeTextVisible] = useScrollAnimation<HTMLDivElement>(0.1);
  const [welcomeBtnRef, welcomeBtnVisible] = useScrollAnimation<HTMLDivElement>(0.1);
  const [proofsRef, proofsVisible] = useScrollAnimation<HTMLUListElement>(0.1);
  const [offerHeadRef, offerHeadVisible] = useScrollAnimation<HTMLElement>(0.1);
  const [offerBtnRef, offerBtnVisible] = useScrollAnimation<HTMLDivElement>(0.1);
  const [testimonialRef, testimonialVisible] = useScrollAnimation<HTMLElement>(0.1);

  const activeClient = clients.testimonials[activeTestimonial];

  const changeTestimonial = (next: number) => {
    setQuoteVisible(false);
    window.setTimeout(() => {
      setActiveTestimonial(next);
      setQuoteVisible(true);
    }, 180);
  };

  useEffect(() => {
    setQuoteVisible(true);
  }, [lang]);

  return (
    <section className="flex w-full flex-col items-stretch">

      <section
        id="about"
        ref={welcomeRef}
        className="flex w-full flex-col items-center bg-[#F9F9F6] px-6 py-24 sm:px-12 sm:py-28 lg:px-[152px] scroll-mt-24"
      >
        <div className="flex w-full max-w-[1180px] flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-16">
          <div
            ref={welcomeTextRef}
            className={`flex w-full max-w-[720px] flex-col items-start gap-8 text-[1.05rem] leading-relaxed text-[#2C3E35] scroll-hidden scroll-fade-up ${welcomeVisible ? "scroll-visible" : ""}`}
          >
            <h2 className="font-serif text-[2.4rem] font-bold text-[#0F2A1D] tracking-tight leading-tight">
              {welcome.title}
            </h2>
            <p
              className={`scroll-hidden scroll-fade-up stagger-2 ${welcomeTextVisible ? "scroll-visible" : ""}`}
            >
              {welcome.p1}
            </p>
            <p
              className={`scroll-hidden scroll-fade-up stagger-3 ${welcomeTextVisible ? "scroll-visible" : ""}`}
            >
              {welcome.p2}
            </p>
            <div
              ref={welcomeBtnRef}
              className={`scroll-hidden scroll-fade-up stagger-4 ${welcomeBtnVisible ? "scroll-visible" : ""}`}
            >
              <Link to="/about">
                <Button
                  type="button"
                  className="h-auto rounded-full bg-[#0F2A1D] hover:bg-[#C9A84C] hover:text-[#0F2A1D] hover:scale-[1.03] text-white px-8 py-4 text-[15px] font-semibold transition-all duration-200"
                >
                  {welcome.btn}
                </Button>
              </Link>
            </div>
          </div>

          <ul
            ref={proofsRef}
            className={`flex w-full md:max-w-[320px] flex-col gap-0 border-t border-[#0F2A1D]/10 scroll-hidden scroll-fade-up stagger-2 ${proofsVisible ? "scroll-visible" : ""}`}
          >
            {welcome.proofs.map((proof) => (
              <li
                key={proof.label}
                className="border-b border-[#0F2A1D]/10 py-5"
              >
                <p className="text-[14px] font-semibold text-[#0F2A1D] tracking-tight">
                  {proof.label}
                </p>
                <p className="mt-1.5 text-[13px] text-[#2C3E35]/70 leading-relaxed">
                  {proof.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div
        role="img"
        aria-label="Meridian CPA office with Hong Kong skyline view"
        className="static-banner relative h-[320px] sm:h-[380px] lg:h-[420px] w-full"
        style={{ backgroundImage: "url('/images/office.jpg')" }}
      />

      <section
        id="services"
        className="flex w-full bg-[#0F2A1D] text-white py-24 sm:py-28 px-6 sm:px-12 lg:px-[152px] scroll-mt-24"
      >
        <div className="flex w-full max-w-[1180px] flex-col md:flex-row md:items-start justify-between gap-10 md:gap-12">
          <header
            ref={offerHeadRef}
            className={`shrink-0 md:w-1/3 scroll-hidden scroll-fade-up ${offerHeadVisible ? "scroll-visible" : ""}`}
          >
            <h2 className="font-serif text-[2.4rem] font-bold text-white tracking-tight leading-tight">
              {offer.title}
            </h2>
          </header>

          <nav
            aria-label="CPA Services"
            className="flex-1 flex flex-col items-start gap-10"
          >
            <ul className="flex flex-col items-start gap-6">
              {offer.services.map((service) => (
                <ServiceListItem
                  key={service.name}
                  name={service.name}
                  outcome={service.outcome}
                />
              ))}
            </ul>
            <div
              ref={offerBtnRef}
              className={`scroll-hidden scroll-fade-up ${offerBtnVisible ? "scroll-visible" : ""}`}
            >
              <Button
                type="button"
                onClick={onBookClick}
                className="h-auto rounded-full bg-white text-[#0F2A1D] px-8 py-4 text-[15px] font-semibold transition-all duration-200 hover:bg-[#C9A84C] hover:text-[#0F2A1D] hover:scale-[1.03] hover:shadow-lg"
              >
                {offer.btn}
              </Button>
            </div>
          </nav>
        </div>
      </section>

      <AuditTimelineSection lang={lang} />
      <AuditMethodologySection lang={lang} />
      <PeopleSection lang={lang} />

      <section
        id="clients"
        ref={testimonialRef}
        className="flex w-full flex-col items-center bg-[#EDECE6] px-6 py-24 sm:px-12 sm:py-28 lg:px-[152px] scroll-mt-24"
      >
        <div className="flex w-full max-w-[800px] flex-col items-center gap-10">
          <header className="flex w-full flex-col items-center gap-4 text-center">
            <h2
              className={`font-serif text-[2.4rem] font-bold text-[#0F2A1D] tracking-tight scroll-hidden scroll-fade-up ${testimonialVisible ? "scroll-visible" : ""}`}
            >
              {clients.title}
            </h2>
            <p
              className={`max-w-[600px] text-[1.05rem] text-[#2C3E35] leading-relaxed scroll-hidden scroll-fade-up stagger-2 ${testimonialVisible ? "scroll-visible" : ""}`}
            >
              {clients.subtitle}
            </p>
          </header>

          <div
            className={`flex w-full flex-col items-center gap-10 scroll-hidden scroll-scale ${testimonialVisible ? "scroll-visible" : ""}`}
          >
            <blockquote
              className={`flex w-full flex-col items-center gap-6 text-center transition-opacity duration-300 ${
                quoteVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <TestimonialAvatar photo={activeClient.photo} author={activeClient.author} />
              <p className="font-serif text-[1.5rem] sm:text-[1.75rem] font-medium text-[#0F2A1D] leading-relaxed italic">
                {activeClient.quote}
              </p>
              <footer className="text-[14px] font-semibold text-[#2C3E35]/80 tracking-wide uppercase">
                {activeClient.author}
              </footer>
            </blockquote>

            <div className="flex items-center justify-center gap-6" aria-label="Testimonial navigation">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous testimonial"
                onClick={() =>
                  changeTestimonial(
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
                    onClick={() => changeTestimonial(dot)}
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
                  changeTestimonial((activeTestimonial + 1) % clients.testimonials.length)
                }
                className="h-8 w-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center"
              >
                <span className="text-[14px]">→</span>
              </Button>
            </div>
          </div>

          <p
            className={`w-full text-center text-[1rem] text-[#2C3E35] max-w-[650px] leading-relaxed scroll-hidden scroll-fade-up stagger-3 ${testimonialVisible ? "scroll-visible" : ""}`}
          >
            {clients.callout}
          </p>
        </div>
      </section>

      <FaqSection lang={lang} />
      <ContactSection lang={lang} onBookClick={onBookClick} />

      <div
        role="img"
        aria-label="Audited financial statements with Hong Kong harbour view"
        className="static-banner relative h-[320px] sm:h-[380px] lg:h-[420px] w-full"
        style={{ backgroundImage: "url('/images/documents.jpg')" }}
      />
    </section>
  );
};
