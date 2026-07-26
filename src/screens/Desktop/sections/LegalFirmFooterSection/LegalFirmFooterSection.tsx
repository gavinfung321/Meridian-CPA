import { Card, CardContent } from "../../../../components/ui/card";
import { Language, translations } from "../../../../lib/translations";
import { useScrollAnimation } from "../../../../hooks/useScrollAnimation";

interface LegalFirmFooterProps {
  lang: Language;
}

export const LegalFirmFooterSection = ({ lang }: LegalFirmFooterProps): JSX.Element => {
  const t = translations[lang].footer;

  const [footerRef, footerVisible] = useScrollAnimation<HTMLDivElement>(0.1);

  const contactDetails = [
    {
      type: "email",
      label: t.email,
      href: `mailto:${t.email}`,
    },
    {
      type: "phone",
      label: t.phone,
    },
  ];

  const socialLinks = [
    {
      label: "LinkedIn",
      href: "https://linkedin.com",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/85228151234",
    },
  ];

  return (
    <footer className="w-full self-stretch bg-[#F9F9F6] border-t border-black/5 px-6 py-16 sm:px-12 lg:px-[152px]">
      <Card className="border-0 bg-transparent p-0 shadow-none">
        <CardContent className="flex flex-col items-start gap-12 p-0">
          <div className="w-full flex items-center justify-between border-b border-black/5 pb-8 flex-wrap gap-4">
            <span className="text-[20px] font-bold text-[#0F2A1D]">Meridian CPA</span>
            <p className="text-[15px] font-medium text-[#2C3E35]">
              {t.tagline}
            </p>
          </div>

          {/* Three-column grid: fade-up on scroll */}
          <div
            ref={footerRef}
            className={`grid w-full grid-cols-1 items-start gap-8 md:grid-cols-3 md:gap-[45px] text-[14px] leading-relaxed text-[#2C3E35] scroll-hidden scroll-fade-up ${footerVisible ? "scroll-visible" : ""}`}
          >
            <address className="not-italic flex flex-col gap-2">
              {contactDetails.map((detail) =>
                detail.href ? (
                  <a
                    key={detail.type}
                    className="block text-[#0F2A1D] hover:underline font-medium"
                    href={detail.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {detail.label}
                  </a>
                ) : (
                  <p
                    key={detail.type}
                    className="font-medium text-[#0F2A1D]"
                  >
                    {detail.label}
                  </p>
                )
              )}
            </address>

            <address className="not-italic flex flex-col gap-1">
              {t.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <nav aria-label="Social media links">
              <ul className="space-y-2 font-medium">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      className="text-[#0F2A1D] hover:underline"
                      href={link.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-black/5 pt-8 text-[12px] text-[#2C3E35]/70">
            <p className="whitespace-pre-line">
              {t.rights}
            </p>
            <p className="font-semibold text-[#0F2A1D]/80">
              {t.license}
            </p>
          </div>
        </CardContent>
      </Card>
    </footer>
  );
};

