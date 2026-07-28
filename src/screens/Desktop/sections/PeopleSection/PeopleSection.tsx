import { useState } from "react";
import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface PeopleSectionProps {
  lang: Language;
}

export const PeopleSection = ({ lang }: PeopleSectionProps): JSX.Element => {
  const t = translations[lang];
  const people = t.people;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const [headerRef, headerVisible] = useScrollAnimation<HTMLElement>(0.1);
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>(0.05);

  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <section
      id="partners"
      className="flex w-full flex-col items-center bg-[#FFFFFF] px-6 py-24 sm:px-12 sm:py-28 lg:px-[152px] scroll-mt-24"
    >
      <div className="flex w-full max-w-[1180px] flex-col gap-10">

        {/* Header */}
        <header
          ref={headerRef}
          className={`flex flex-col gap-3 scroll-hidden scroll-fade-up ${headerVisible ? "scroll-visible" : ""}`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F2A1D]/50">
            {people.label}
          </span>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-[2.4rem] font-bold text-[#0F2A1D] tracking-tight leading-tight">
                {people.title}
              </h2>
              <div className="h-px w-10 bg-[#C9A84C]" aria-hidden="true" />
            </div>
            <p className="max-w-[420px] text-[1rem] text-[#2C3E35]/70 leading-relaxed md:text-right">
              {people.subtitle}
            </p>
          </div>
          <p className="mt-4 max-w-[640px] font-serif text-[1.15rem] sm:text-[1.25rem] font-medium text-[#0F2A1D] leading-snug tracking-tight">
            {people.authority}
          </p>
        </header>

        {/* 2×2 partner grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6"
        >
          {people.partners.map((partner, idx) => {
            const isOpen = openIndex === idx;
            const stagger = Math.min(idx + 1, 4);
            return (
              <PartnerCard
                key={partner.name}
                partner={partner}
                index={idx}
                isOpen={isOpen}
                onToggle={() => toggle(idx)}
                stagger={stagger}
                gridVisible={gridVisible}
                readBio={people.readBio}
                hideBio={people.hideBio}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};

interface Partner {
  name: string;
  title: string;
  specialty: string;
  bio: string;
  initials: string;
  photo: string;
}

interface PartnerCardProps {
  partner: Partner;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  stagger: number;
  gridVisible: boolean;
  readBio: string;
  hideBio: string;
}

const PartnerAvatar = ({ partner, large = false }: { partner: Partner; large?: boolean }) => {
  const [imageError, setImageError] = useState(false);
  const sizeClass = large ? "h-full w-full" : "h-[72px] w-[72px]";

  if (imageError) {
    return (
      <div
        className={`flex ${sizeClass} items-center justify-center rounded-sm bg-[#0F2A1D] text-[15px] font-bold tracking-wider text-white`}
        aria-hidden="true"
      >
        {partner.initials}
      </div>
    );
  }

  return (
    <img
      src={partner.photo}
      alt={`${partner.name}, ${partner.title}`}
      loading="lazy"
      onError={() => setImageError(true)}
      className={`${sizeClass} rounded-sm object-cover object-top`}
    />
  );
};

const PartnerCard = ({
  partner,
  index,
  isOpen,
  onToggle,
  stagger,
  gridVisible,
  readBio,
  hideBio,
}: PartnerCardProps) => (
  <article
    className={`flex flex-col overflow-hidden rounded-sm border border-[#0F2A1D]/8 border-t-2 border-t-[#C9A84C] bg-[#F9F9F6] transition-transform duration-200 hover:-translate-y-0.5 scroll-hidden scroll-fade-up stagger-${stagger} ${gridVisible ? "scroll-visible" : ""}`}
  >
    {/* Photo */}
    <div className="aspect-[4/3] w-full overflow-hidden bg-[#EDECE6]">
      <PartnerAvatar partner={partner} large />
    </div>

    {/* Content */}
    <div className="flex flex-1 flex-col gap-3 p-5">
      <div className="flex flex-col gap-2">
        <h3 className="text-[1.35rem] font-bold text-[#0F2A1D] tracking-tight leading-tight">
          {partner.name}
        </h3>
        <span className="inline-flex w-fit items-center rounded-full border border-[#0F2A1D]/20 px-3 py-1 text-[12px] font-medium text-[#0F2A1D]/70 tracking-wide">
          {partner.title}
        </span>
        <p className="text-[13px] text-[#2C3E35]/70 leading-snug">
          {partner.specialty}
        </p>
      </div>

      <button
        type="button"
        id={`partner-${index}`}
        aria-expanded={isOpen}
        aria-controls={`partner-bio-${index}`}
        onClick={onToggle}
        className="mt-auto flex w-full items-center justify-between border-t border-[#0F2A1D]/10 pt-3 text-left text-[13px] font-medium text-[#0F2A1D]/60 transition-colors hover:text-[#0F2A1D]"
      >
        <span>{isOpen ? hideBio : readBio}</span>
        <svg
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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
        id={`partner-bio-${index}`}
        role="region"
        aria-labelledby={`partner-${index}`}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: isOpen ? "200px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="text-[14px] text-[#2C3E35]/80 leading-relaxed">
          {partner.bio}
        </p>
      </div>
    </div>
  </article>
);
