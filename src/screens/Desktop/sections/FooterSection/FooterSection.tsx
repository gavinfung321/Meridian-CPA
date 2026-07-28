import { MeridianLogo } from "../../../../components/MeridianLogo";
import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface FooterSectionProps {
  lang: Language;
}

export const FooterSection = ({ lang }: FooterSectionProps): JSX.Element => {
  const t = translations[lang].footer;

  const [footerRef, footerVisible] = useScrollAnimation<HTMLDivElement>(0.1);

  const socialLinks = [
    { label: t.linkedin, href: "https://linkedin.com" },
    { label: t.facebook, href: "https://facebook.com" },
    { label: t.instagram, href: "https://instagram.com" },
    { label: t.x, href: "https://x.com" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full self-stretch bg-[#F9F9F6] border-t border-black/5 px-6 py-16 sm:px-12 lg:px-[152px]">
      <div className="flex flex-col items-start gap-10">
        <div className="w-full flex items-center justify-between border-b border-black/5 pb-8 flex-wrap gap-4">
          <MeridianLogo variant="dark" />
          <p className="text-[15px] font-medium text-[#2C3E35]">
            {t.tagline}
          </p>
        </div>

        <nav
          ref={footerRef}
          aria-label="Social media links"
          className={`w-full flex items-center gap-6 border-b border-black/5 pb-8 scroll-hidden scroll-fade-up ${footerVisible ? "scroll-visible" : ""}`}
        >
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-medium text-[#0F2A1D] hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-[12px] text-[#2C3E35]/70">
            <p className="whitespace-pre-line">{t.rights}</p>
            <p className="font-semibold text-[#0F2A1D]/80">{t.license}</p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-full border border-[#0F2A1D]/20 px-5 py-2.5 text-[13px] font-semibold text-[#0F2A1D] transition-colors duration-200 hover:border-[#0F2A1D] hover:bg-[#0F2A1D] hover:text-white"
          >
            {t.backToTop}
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 15V5M6 9l4-4 4 4" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};
