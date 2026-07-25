import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

const introductionParagraphs = [
  "Meridian CPA & Advisory is a trusted Hong Kong accounting firm delivering expert audit, tax, and business advisory services. Beyond basic compliance, we serve as strategic partners dedicated to protecting your financial integrity and driving sustainable growth.",
  "We pair deep local regulatory knowledge with international accounting standards to support businesses of all sizes. Our team of certified accountants offers clear, actionable insights to help you navigate complex financial landscapes with confidence.",
];

const services = [
  "Business Formation",
  "Contract Drafting",
  "Mergers And Acquisitions",
  "Property Protection",
  "Employment Law",
  "Corporate Governance",
  "Shareholder Disputes",
  "+more",
];

const testimonialDots = [0, 1, 2, 3];

const buttonTextClassName =
  "font-button font-[number:var(--button-font-weight)] text-[length:var(--button-font-size)] tracking-[var(--button-letter-spacing)] leading-[var(--button-line-height)] [font-style:var(--button-font-style)]";

export const LegalServicesContentSection = (): JSX.Element => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <section className="flex w-full flex-col items-stretch">
      <section className="flex w-full flex-col items-center bg-backgroundbackground-1 px-[152px] pb-[178px] pt-[135px]">
        <div className="flex w-full max-w-[1180px] flex-col items-center gap-[60px]">
          <header className="w-full">
            <h2 className="font-header-header-1 text-[length:var(--header-header-1-font-size)] font-[number:var(--header-header-1-font-weight)] leading-[var(--header-header-1-line-height)] tracking-[var(--header-header-1-letter-spacing)] text-paragraphparagraph-1 [font-style:var(--header-header-1-font-style)]">
              Welcome to Meridian CPA &amp; Advisory
            </h2>
          </header>
          <div className="flex w-full flex-col items-start gap-[50px]">
            <div className="grid w-full max-w-[942px] grid-cols-2 gap-12">
              {introductionParagraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="font-paragraph-paragraph-2 text-[length:var(--paragraph-paragraph-2-font-size)] font-[number:var(--paragraph-paragraph-2-font-weight)] leading-[var(--paragraph-paragraph-2-line-height)] tracking-[var(--paragraph-paragraph-2-letter-spacing)] text-paragraphparagraph-1 [font-style:var(--paragraph-paragraph-2-font-style)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <Button
              type="button"
              className={`h-auto rounded-[500px] bg-app-accent px-6 py-[18px] text-paragraphparagraph-2 hover:bg-app-accent ${buttonTextClassName}`}
            >
              Book a Consultation
            </Button>
          </div>
        </div>
      </section>
      <div
        role="img"
        aria-label="Legal library interior"
        className="h-[625px] w-full bg-cover bg-center [background-image:url(..//image-breaker-section.png)]"
      />
      <section className="flex min-h-[917px] w-full bg-backgroundbackground-2 pb-[126px] pl-[152px] pr-0 pt-[93px]">
        <div className="flex w-full items-start justify-between">
          <header className="shrink-0 pr-[74px]">
            <h2 className="font-header-header-1 text-[length:var(--header-header-1-font-size)] font-[number:var(--header-header-1-font-weight)] leading-[var(--header-header-1-line-height)] tracking-[var(--header-header-1-letter-spacing)] text-displaydisplay-3 [font-style:var(--header-header-1-font-style)]">
              What We Offer
            </h2>
          </header>
          <div className="flex flex-1 flex-col items-start gap-16">
            <nav aria-label="Legal services">
              <ul className="flex flex-col items-start">
                {services.map((service, index) => (
                  <li key={service}>
                    <button
                      type="button"
                      className={`font-display-display-3 text-left text-[length:var(--display-display-3-font-size)] font-[number:var(--display-display-3-font-weight)] leading-[var(--display-display-3-line-height)] tracking-[var(--display-display-3-letter-spacing)] [font-style:var(--display-display-3-font-style)] ${
                        index === services.length - 1
                          ? "text-[#fff0c480]"
                          : "text-displaydisplay-3"
                      }`}
                    >
                      {service}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <Button
              type="button"
              className={`h-auto rounded-[500px] bg-paragraphparagraph-2 px-6 py-[18px] text-paragraphparagraph-1 hover:bg-paragraphparagraph-2 ${buttonTextClassName}`}
            >
              Services
            </Button>
          </div>
        </div>
      </section>
      <section className="flex w-full flex-col items-center gap-[74px] bg-displaydisplay-2 px-[271px] py-[116px]">
        <div className="flex w-full max-w-[942px] flex-col items-center gap-14">
          <header className="flex w-full flex-col items-center gap-8">
            <h2 className="w-full font-header-header-1 text-center text-[length:var(--header-header-1-font-size)] font-[number:var(--header-header-1-font-weight)] leading-[var(--header-header-1-line-height)] tracking-[var(--header-header-1-letter-spacing)] text-paragraphparagraph-1 [font-style:var(--header-header-1-font-style)]">
              Hear From Our Clients
            </h2>
            <p className="w-[480px] font-paragraph-paragraph-2 text-center text-[length:var(--paragraph-paragraph-2-font-size)] font-[number:var(--paragraph-paragraph-2-font-weight)] leading-[var(--paragraph-paragraph-2-line-height)] tracking-[var(--paragraph-paragraph-2-letter-spacing)] text-paragraphparagraph-1 [font-style:var(--paragraph-paragraph-2-font-style)]">
              We believe that our clients&apos; experiences speak volumes about
              the quality of our legal services. Here&apos;s what some of them
              have to say:
            </p>
          </header>
          <Card className="flex min-h-[445px] w-full max-w-[738px] flex-col items-center justify-center gap-20 rounded-none border-0 bg-[#f6f6f6] px-[50px] py-[30px] shadow-none">
            <CardContent className="flex w-full flex-1 flex-col items-center justify-center gap-8 p-0">
              <blockquote className="w-full text-center">
                <p className="font-header-header-1 text-[length:var(--header-header-1-font-size)] font-[number:var(--header-header-1-font-weight)] leading-[var(--header-header-1-line-height)] tracking-[var(--header-header-1-letter-spacing)] text-paragraphparagraph-1 [font-style:var(--header-header-1-font-style)]">
                  &quot;Jones &amp; Brown Legal handled my estate planning with
                  such care and professionalism. They listened to my concerns
                  and made the process clear and straightforward. I now have
                  complete peace of mind knowing my family&apos;s future is
                  secure.&quot;
                </p>
                <footer className="mt-8 font-header-header-1 text-[length:var(--header-header-1-font-size)] font-[number:var(--header-header-1-font-weight)] leading-[var(--header-header-1-line-height)] tracking-[var(--header-header-1-letter-spacing)] text-paragraphparagraph-1 [font-style:var(--header-header-1-font-style)]">
                  — David L., Business Owner
                </footer>
              </blockquote>
            </CardContent>
            <div
              className="flex items-center justify-center gap-5"
              aria-label="Testimonial navigation"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous testimonial"
                onClick={() =>
                  setActiveTestimonial(
                    (activeTestimonial - 1 + testimonialDots.length) %
                      testimonialDots.length,
                  )
                }
                className="h-6 w-6 rounded-none p-0 hover:bg-transparent"
              >
                <img className="h-6 w-6" alt="" src="/left-arrow.svg" />
              </Button>
              <div
                className="flex items-center gap-2.5"
                role="tablist"
                aria-label="Testimonials"
              >
                {testimonialDots.map((dot) => (
                  <button
                    key={dot}
                    type="button"
                    role="tab"
                    aria-selected={activeTestimonial === dot}
                    aria-label={`Show testimonial ${dot + 1}`}
                    onClick={() => setActiveTestimonial(dot)}
                    className={`h-[10.22px] w-[10.22px] rounded-full ${
                      activeTestimonial === dot
                        ? "bg-[#31110f]"
                        : "bg-[#00000040]"
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
                  setActiveTestimonial(
                    (activeTestimonial + 1) % testimonialDots.length,
                  )
                }
                className="h-6 w-6 rounded-none p-0 hover:bg-transparent"
              >
                <img className="h-6 w-6" alt="" src="/right-arrow.svg" />
              </Button>
            </div>
          </Card>
          <p className="w-full font-paragraph-paragraph-2 text-center text-[length:var(--paragraph-paragraph-2-font-size)] font-[number:var(--paragraph-paragraph-2-font-weight)] leading-[var(--paragraph-paragraph-2-line-height)] tracking-[var(--paragraph-paragraph-2-letter-spacing)] text-paragraphparagraph-1 [font-style:var(--paragraph-paragraph-2-font-style)]">
            Let us help you navigate your legal journey with confidence and
            peace of mind. Contact Jones &amp; Brown Legal today.
          </p>
        </div>
        <Button
          type="button"
          className={`h-auto rounded-[500px] bg-app-accent px-6 py-[18px] text-paragraphparagraph-2 hover:bg-app-accent ${buttonTextClassName}`}
        >
          Schedule a Consult
        </Button>
      </section>
      <div
        role="img"
        aria-label="Law office interior"
        className="h-[625px] w-full bg-cover bg-center [background-image:linear-gradient(0deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.05)_100%),url(..//image-divider-section-2.png)]"
      />
    </section>
  );
};
