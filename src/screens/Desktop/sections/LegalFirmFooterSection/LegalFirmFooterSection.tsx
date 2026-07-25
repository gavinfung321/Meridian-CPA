import { Card, CardContent } from "../../../../components/ui/card";

const contactDetails = [
  {
    type: "email",
    label: "hello@figma.com",
    href: "mailto:hello@figma.com",
  },
  {
    type: "phone",
    label: "(555) 123-4567",
  },
];

const addressLines = [
  "123 Candyland Lane",
  "Suite 123",
  "Los Angeles, CA 94117",
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/figma",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/figmadesign",
  },
  {
    label: "LinkedIn",
    href: "http://linkedin.com/company/figma",
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/figma.com",
  },
];

const paragraphThreeClassName =
  "font-paragraph-paragraph-3 text-[length:var(--paragraph-paragraph-3-font-size)] font-[number:var(--paragraph-paragraph-3-font-weight)] tracking-[var(--paragraph-paragraph-3-letter-spacing)] leading-[var(--paragraph-paragraph-3-line-height)] [font-style:var(--paragraph-paragraph-3-font-style)]";

export const LegalFirmFooterSection = (): JSX.Element => {
  return (
    <footer className="w-full self-stretch bg-backgroundbackground-1 px-6 py-[68px] sm:px-12 lg:px-[152px]">
      <Card className="border-0 bg-transparent p-0 shadow-none">
        <CardContent className="flex flex-col items-start gap-[84px] p-0">
          <img
            className="h-auto w-full"
            alt="Footer header"
            src="/footer-header.svg"
          />
          <p className="w-full font-paragraph-paragraph-2 text-[length:var(--paragraph-paragraph-2-font-size)] font-[number:var(--paragraph-paragraph-2-font-weight)] tracking-[var(--paragraph-paragraph-2-letter-spacing)] leading-[var(--paragraph-paragraph-2-line-height)] text-paragraphparagraph-1 [font-style:var(--paragraph-paragraph-2-font-style)]">
            Deep expertise, decisive courtroom presence
          </p>
          <div className="grid w-full grid-cols-1 items-start gap-8 md:grid-cols-3 md:gap-[45px]">
            <address className="not-italic">
              {contactDetails.map((detail) =>
                detail.href ? (
                  <a
                    key={detail.type}
                    className={`block text-paragraphparagraph-1 ${paragraphThreeClassName}`}
                    href={detail.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {detail.label}
                  </a>
                ) : (
                  <p
                    key={detail.type}
                    className={`text-paragraphparagraph-1 ${paragraphThreeClassName}`}
                  >
                    {detail.label}
                  </p>
                ),
              )}
            </address>
            <address
              className={`not-italic text-paragraphparagraph-1 ${paragraphThreeClassName}`}
            >
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <nav aria-label="Social media links">
              <ul className="space-y-0">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      className={`text-paragraphparagraph-1 ${paragraphThreeClassName}`}
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
          <p className={`text-paragraphparagraph-1 ${paragraphThreeClassName}`}>
            Jones &amp; Brown Legal
            <br />© 2025 All Rights Reserved
          </p>
        </CardContent>
      </Card>
    </footer>
  );
};
