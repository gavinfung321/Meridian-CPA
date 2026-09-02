import { useState } from "react";
import { ContactModal } from "../../components/ContactModal";
import { useCalendlyBooking } from "../../hooks/useCalendlyBooking";
import { Language } from "../../lib/translations";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeroSection } from "./sections/HeroSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { TopNavigationSection } from "./sections/TopNavigationSection/TopNavigationSection";

interface DesktopProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Desktop = ({ lang, setLang }: DesktopProps): JSX.Element => {
  const [contactOpen, setContactOpen] = useState(false);
  const openContactFallback = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  const { openCalendlyPopup } = useCalendlyBooking({
    onFallback: openContactFallback,
  });

  return (
    <main
      id="main"
      className="flex min-h-screen w-full flex-col overflow-x-hidden bg-displaydisplay-2"
    >
      <TopNavigationSection
        lang={lang}
        setLang={setLang}
        onContactClick={() => void openCalendlyPopup("header-contact")}
      />
      <HeroSection
        lang={lang}
        onBookNowClick={() => void openCalendlyPopup("hero-book-now")}
      />
      <MainContentSection
        lang={lang}
        onServicesClick={() => void openCalendlyPopup("services-cta")}
        onBookingContactClick={() => void openCalendlyPopup("booking-banner")}
        onContactSectionClick={() => void openCalendlyPopup("contact-section")}
      />
      <FooterSection lang={lang} />
      <ContactModal lang={lang} open={contactOpen} onClose={closeContact} />
    </main>
  );
};
