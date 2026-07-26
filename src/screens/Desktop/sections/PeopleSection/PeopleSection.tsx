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

  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <section className="flex w-full flex-col items-center bg-[#F9F9F6] px-6 py-24 sm:px-12 lg:px-[152px]">
      <div className="flex w-full max-w-[1180px] flex-col gap-14">

        {/* Header */}
        <header
          ref={headerRef}
          className={`flex flex-col gap-3 scroll-hidden scroll-fade-up ${headerVisible ? "scroll-visible" : ""}`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F2A1D]/50">
            {people.label}
          </span>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[2.4rem] font-bold text-[#0F2A1D] tracking-tight leading-tight">
              {people.title}
            </h2>
            <p className="max-w-[420px] text-[1rem] text-[#2C3E35]/70 leading-relaxed md:text-right">
              {people.subtitle}
            </p>
          </div>
        </header>

        {/* Roster */}
        <div className="flex flex-col">
          {people.partners.map((partner, idx) => {
            const isOpen = openIndex === idx;
            const stagger = Math.min(idx + 1, 5);
            return (
              <PartnerRow
                key={partner.name}
                partner={partner}
                index={idx}
                isOpen={isOpen}
                onToggle={() => toggle(idx)}
                stagger={stagger}
                headerVisible={headerVisible}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};

/* ── Individual Partner Row ─────────────────────────────────────────────────── */

interface Partner {
  name: string;
  title: string;
  specialty: string;
  bio: string;
  initials: string;
}

interface PartnerRowProps {
  partner: Partner;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  stagger: number;
  headerVisible: boolean;
}

const PartnerRow = ({
  partner,
  index,
  isOpen,
  onToggle,
  stagger,
  headerVisible,
}: PartnerRowProps) => {
  const [rowRef, rowVisible] = useScrollAnimation<HTMLDivElement>(0.05);

  return (
    <div
      ref={rowRef}
      className={`scroll-hidden scroll-fade-up stagger-${stagger} ${rowVisible ? "scroll-visible" : ""}`}
    >
      {/* Divider */}
      <div className="h-px w-full bg-[#0F2A1D]/10" />

      {/* Main row — clickable */}
      <button
        type="button"
        id={`partner-${index}`}
        aria-expanded={isOpen}
        aria-controls={`partner-bio-${index}`}
        onClick={onToggle}
        className={`group flex w-full items-center gap-6 py-6 text-left transition-all duration-300 ${
          isOpen ? "bg-[#EDECE6]" : "bg-transparent hover:bg-[#EDECE6]/60"
        }`}
        style={{
          paddingLeft: "0",
          paddingRight: "0",
          borderLeft: isOpen ? "3px solid #0F2A1D" : "3px solid transparent",
          paddingInlineStart: isOpen ? "20px" : "0px",
        }}
      >
        {/* Ordinal */}
        <span className="shrink-0 w-10 text-[13px] font-mono text-[#0F2A1D]/35 tracking-widest select-none">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Name */}
        <span className="flex-1 text-[1.75rem] sm:text-[2rem] font-bold text-[#0F2A1D] tracking-tight leading-none">
          {partner.name}
        </span>

        {/* Title pill — hidden on xs */}
        <span className="hidden sm:inline-flex shrink-0 items-center rounded-full border border-[#0F2A1D]/20 px-3 py-1 text-[12px] font-medium text-[#0F2A1D]/70 tracking-wide">
          {partner.title}
        </span>

        {/* Specialty — right side, medium screens+ */}
        <span className="hidden lg:block shrink-0 w-[220px] text-right text-[14px] text-[#2C3E35]/60 leading-snug">
          {partner.specialty}
        </span>

        {/* Avatar initial — animates in on open */}
        <div
          className={`hidden md:flex shrink-0 h-14 w-14 items-center justify-center rounded-sm bg-[#0F2A1D] text-white text-[15px] font-bold tracking-wider transition-all duration-300 ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          aria-hidden="true"
        >
          {partner.initials}
        </div>

        {/* Chevron */}
        <svg
          className={`shrink-0 h-5 w-5 text-[#0F2A1D]/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
        </svg>
      </button>

      {/* Bio accordion */}
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
        <div className="flex gap-6 px-0 pb-7 pt-1 pl-[58px]">
          <p className="max-w-[680px] text-[15px] text-[#2C3E35]/80 leading-relaxed">
            {partner.bio}
          </p>
        </div>
      </div>
    </div>
  );
};
